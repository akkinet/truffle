import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Payment from '../../../../models/Payment';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId') || url.searchParams.get('session_id');
    const paymentRecordId = url.searchParams.get('paymentRecordId');

    if (!sessionId && !paymentRecordId) {
      return NextResponse.json({ error: 'Session ID or Payment Record ID is required' }, { status: 400 });
    }

    // Find payment record by either sessionId or paymentRecordId
    const query = sessionId ? { sessionId } : { _id: paymentRecordId };
    const paymentRecord = await Payment.findOne(query);

    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    return NextResponse.json({
      paymentRecordId: paymentRecord._id,
      sessionId: paymentRecord.sessionId,
      status: paymentRecord.status,
      membershipType: paymentRecord.membershipType,
      amount: paymentRecord.amount,
      email: paymentRecord.email,
      createdAt: paymentRecord.createdAt,
      expiresAt: paymentRecord.expiresAt,
      stripeData: paymentRecord.stripeData,
      tempUserPayload: paymentRecord.tempUserPayload
    }, { status: 200 });
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
  }
}
