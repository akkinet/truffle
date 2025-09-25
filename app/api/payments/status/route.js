import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Payment from '../../../../models/Payment';

export async function GET(request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const paymentRecord = await Payment.findOne({ sessionId });

    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: paymentRecord.sessionId,
      status: paymentRecord.status,
      membershipType: paymentRecord.membershipType,
      amount: paymentRecord.amount,
      email: paymentRecord.email,
      createdAt: paymentRecord.createdAt,
      expiresAt: paymentRecord.expiresAt,
      stripeData: paymentRecord.stripeData
    }, { status: 200 });
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
  }
}
