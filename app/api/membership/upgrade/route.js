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
    const { userId, membershipType, email } = body;

    if (!userId || !membershipType || !email) {
      return NextResponse.json({ error: 'User ID, membership type, and email are required' }, { status: 400 });
    }

    // Verify user exists and has free membership
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.membership !== 'free') {
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
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: userId,
        membershipType: membershipType,
        email: email
      }
    });

    // Create temporary payment record for upgrade
    const paymentRecord = new Payment({
      email: email,
      tempUserPayload: {
        userId: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: email,
        isUpgrade: true
      },
      membershipType: membershipType,
      amount: price,
      currency: 'usd',
      status: 'pending',
      stripeData: {
        customerId: customer.id
      }
    });

    await paymentRecord.save();

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
        userId: userId,
        membershipType: membershipType,
        userEmail: email,
        customerId: customer.id,
        paymentRecordId: paymentRecord._id.toString(),
        isUpgrade: 'true'
      }
    });

    // Update payment record with sessionId
    paymentRecord.sessionId = session.id;
    await paymentRecord.save();

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
