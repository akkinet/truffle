import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('🔍 Checking Stripe session directly:', sessionId);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    console.log('📊 Stripe session data:', {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent?.id,
      amount_total: session.amount_total
    });

    return NextResponse.json({
      success: true,
      status: session.status,
      payment_status: session.payment_status,
      sessionData: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        payment_intent: session.payment_intent?.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_email,
        metadata: session.metadata
      }
    });

  } catch (error) {
    console.error('❌ Error checking Stripe session:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to check Stripe session',
      details: error.message 
    }, { status: 500 });
  }
}
