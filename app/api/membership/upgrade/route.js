import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Payment from '../../../../models/Payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { userId, membershipType, email, firstName, lastName } = body;

    if (!membershipType || !email) {
      return NextResponse.json({ error: 'Membership type and email are required' }, { status: 400 });
    }

    let user = null;
    let userFirstName = firstName || 'Unknown';
    let userLastName = lastName || 'Unknown';

    // Try to find user in database if userId is provided and valid
    if (userId && userId !== 'undefined' && userId !== 'null') {
      try {
        user = await User.findById(userId);
        if (user) {
          userFirstName = user.firstName;
          userLastName = user.lastName;
          console.log('✅ Found existing user in database:', user.email);
        }
      } catch (error) {
        console.log('⚠️  Invalid userId or user not found in database, proceeding with OAuth user flow');
      }
    }

    // If user not found in database, this is likely an OAuth user
    if (!user) {
      console.log('ℹ️  Processing OAuth user upgrade:', email);
      
      // Check if user exists by email
      user = await User.findOne({ email: email });
      
      if (user) {
        userFirstName = user.firstName;
        userLastName = user.lastName;
        console.log('✅ Found OAuth user by email:', user.email);
      } else {
        console.log('ℹ️  OAuth user not in database yet, will be created after payment');
      }
    }

    // Check membership status if user exists
    if (user && user.membership !== 'free') {
      return NextResponse.json({ error: 'User already has a paid membership' }, { status: 400 });
    }

    // Define membership prices
    const membershipPrices = {
      'gold': 10000, // $100 in cents
      'diamond': 50000, // $500 in cents
      'platinum': 80000 // $800 in cents
    };

    const price = membershipPrices[membershipType];
    if (price === undefined) {
      return NextResponse.json({ error: 'Invalid membership type' }, { status: 400 });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      name: `${userFirstName} ${userLastName}`,
      metadata: {
        userId: userId || 'oauth-user',
        membershipType: membershipType,
        email: email,
        firstName: userFirstName,
        lastName: userLastName
      }
    });

    // Create temporary payment record for upgrade
    const paymentRecord = new Payment({
      email: email,
      tempUserPayload: {
        userId: userId || 'oauth-user',
        firstName: userFirstName,
        lastName: userLastName,
        email: email,
        isUpgrade: true,
        isOAuthUser: !user // Flag to indicate this is an OAuth user
      },
      membershipType: membershipType,
      amount: price,
      currency: 'usd',
      status: 'pending',
      stripeData: {
        customerId: customer.id
      }
    });

    try {
      await paymentRecord.save();
      console.log('✅ Payment record saved successfully:', paymentRecord._id);
    } catch (error) {
      console.error('❌ Failed to save payment record:', error);
      return NextResponse.json({ error: 'Failed to save payment record' }, { status: 500 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Membership Upgrade`,
              description: `Upgrade to ${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} membership`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership/upgrade-success?session_id={CHECKOUT_SESSION_ID}&paymentRecordId=${paymentRecord._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership/upgrade-cancel?session_id={CHECKOUT_SESSION_ID}&paymentRecordId=${paymentRecord._id}`,
      metadata: {
        userId: userId || 'oauth-user',
        membershipType: membershipType,
        userEmail: email,
        customerId: customer.id,
        paymentRecordId: paymentRecord._id.toString(),
        isUpgrade: 'true',
        firstName: userFirstName,
        lastName: userLastName
      }
    });

    // Update payment record with sessionId
    try {
      paymentRecord.sessionId = session.id;
      await paymentRecord.save();
      console.log('✅ Payment record updated with sessionId:', session.id);
    } catch (error) {
      console.error('❌ Failed to update payment record with sessionId:', error);
      // Don't fail the request, but log the error
    }

    return NextResponse.json({ 
      sessionId: session.id,
      paymentRecordId: paymentRecord._id.toString(),
      checkoutUrl: session.url
    }, { status: 200 });

  } catch (error) {
    console.error('Membership upgrade error:', error);
    return NextResponse.json({ error: 'Failed to create upgrade session' }, { status: 500 });
  }
}
