import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '../../../../lib/mongodb';
import Payment from '../../../../models/Payment';
import User from '../../../../models/User';
import { sendMembershipConfirmationEmail } from '../../../../lib/sendEmail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session) {
  try {
    await dbConnect();

    const sessionId = session.id;
    const { membershipType, userEmail, customerId, isUpgrade } = session.metadata;

    if (!sessionId || !membershipType) {
      console.error('Missing required data in checkout session:', session.metadata);
      return;
    }

    // Find the payment record
    const paymentRecord = await Payment.findOne({ sessionId });

    if (!paymentRecord) {
      console.error('Payment record not found for session:', sessionId);
      return;
    }

    // Update payment record with success details
    paymentRecord.status = 'succeeded';
    paymentRecord.paymentIntentId = session.payment_intent;
    paymentRecord.stripeData = {
      ...paymentRecord.stripeData,
      customerId: customerId,
      paymentMethod: session.payment_method_types?.[0] || 'card',
      amountPaid: session.amount_total,
      currency: session.currency,
      stripePaymentId: session.payment_intent,
      paidAt: new Date()
    };

    await paymentRecord.save();

    console.log(`Payment succeeded for session ${sessionId}: ${membershipType} ${isUpgrade === 'true' ? '(upgrade)' : '(new user)'}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    await dbConnect();

    const paymentIntentId = paymentIntent.id;

    // Find payment record by payment intent ID
    const paymentRecord = await Payment.findOne({ 
      $or: [
        { paymentIntentId: paymentIntentId },
        { 'stripeData.stripePaymentId': paymentIntentId }
      ]
    });

    if (!paymentRecord) {
      console.error('Payment record not found for payment intent:', paymentIntentId);
      return;
    }

    // Update payment record if not already succeeded
    if (paymentRecord.status !== 'succeeded') {
      paymentRecord.status = 'succeeded';
      paymentRecord.paymentIntentId = paymentIntentId;
      paymentRecord.stripeData = {
        ...paymentRecord.stripeData,
        paymentMethod: paymentIntent.payment_method,
        amountPaid: paymentIntent.amount,
        currency: paymentIntent.currency,
        stripePaymentId: paymentIntentId,
        paidAt: new Date()
      };

      await paymentRecord.save();
    }

    // Handle user upgrade if this is for an existing user
    if (paymentRecord.tempUserPayload?.isUpgrade) {
      let user = null;
      
      // Try to find user by userId if it's valid
      if (paymentRecord.tempUserPayload?.userId && paymentRecord.tempUserPayload.userId !== 'oauth-user') {
        user = await User.findById(paymentRecord.tempUserPayload.userId);
      }
      
      // If user not found, try to find by email
      if (!user && paymentRecord.email) {
        user = await User.findOne({ email: paymentRecord.email });
      }
      
      // If user still not found and this is an OAuth user, create the user
      if (!user && paymentRecord.tempUserPayload?.isOAuthUser) {
        console.log('Creating OAuth user in webhook:', paymentRecord.email);
        
        try {
          const bcrypt = require('bcryptjs');
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash("oauth-user", salt);
          
          user = new User({
            email: paymentRecord.email,
            firstName: paymentRecord.tempUserPayload.firstName || 'Unknown',
            lastName: paymentRecord.tempUserPayload.lastName || 'Unknown',
            password: hashedPassword,
            receiveUpdates: false,
            membership: 'free', // Will be updated below
            membershipStatus: 'active'
          });
          
          await user.save();
          console.log('✅ OAuth user created in webhook:', user.email);
        } catch (createError) {
          if (createError.code === 11000) {
            console.log('User already exists, fetching existing user:', paymentRecord.email);
            user = await User.findOne({ email: paymentRecord.email });
          } else {
            console.error('Error creating OAuth user in webhook:', createError);
            return;
          }
        }
      }
      
      if (user) {
        user.membership = paymentRecord.membershipType;
        user.membershipStatus = 'active';
        user.membershipStartedAt = new Date();
        user.membershipPaidAmount = paymentRecord.amount / 100;
        user.membershipPaymentRef = paymentIntentId;
        user.stripeCustomerId = paymentRecord.stripeData.customerId;
        await user.save();

        // Mark payment record as processed to prevent duplicate processing
        paymentRecord.processed = true;
        await paymentRecord.save();

        console.log(`User ${user.email} membership upgraded to ${paymentRecord.membershipType}`);

        // Send confirmation email for upgrade
        try {
          await sendMembershipConfirmationEmail({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            membershipType: user.membership
          });
          console.log('Upgrade confirmation email sent to:', user.email);
        } catch (emailError) {
          console.error('Failed to send upgrade confirmation email:', emailError);
        }
      }
    } else {
      // For new users, don't automatically create membership
      // Let them complete the "Create Membership" step manually
      console.log(`Payment succeeded for new user ${paymentRecord.email}. Waiting for manual membership creation.`);
    }

    console.log(`Payment intent succeeded for ${paymentIntentId}`);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}
