import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '../../../../lib/mongodb';
import Payment from '../../../../models/Payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email, membershipType, name, signupPayload, userId } = body;

    if (!email || !membershipType) {
      return NextResponse.json({ error: 'Email and membership type are required' }, { status: 400 });
    }

    // Define membership prices
    const membershipPrices = {
      'free': 0,
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
      name: name || `${signupPayload?.firstName || ''} ${signupPayload?.lastName || ''}`.trim(),
      metadata: {
        membershipType: membershipType,
        email: email
      }
    });

    // Create checkout session first
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Membership`,
              description: `Upgrade to ${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} membership`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership/checkout-return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership/checkout-return?session_id={CHECKOUT_SESSION_ID}&cancelled=true`,
      metadata: {
        membershipType: membershipType,
        userEmail: email,
        customerId: customer.id
      }
    });

    // Create payment record with sessionId from Stripe
    const paymentRecord = new Payment({
      sessionId: session.id,
      email: email,
      tempUserPayload: userId ? {
        userId: userId,
        isUpgrade: true
      } : {
        firstName: signupPayload?.firstName || '',
        lastName: signupPayload?.lastName || '',
        email: email,
        receiveUpdates: signupPayload?.receiveUpdates || false
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

    return NextResponse.json({ 
      sessionId: session.id,
      paymentRecordId: paymentRecord._id.toString(),
      checkoutUrl: session.url
    }, { status: 200 });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
