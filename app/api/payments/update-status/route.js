import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Payment from '../../../../models/Payment';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { sessionId, status, stripeData } = body;

    if (!sessionId || !status) {
      return NextResponse.json({ error: 'Session ID and status are required' }, { status: 400 });
    }

    console.log('🔄 Updating payment status:', { sessionId, status });

    // Find the payment record
    const paymentRecord = await Payment.findOne({ sessionId });

    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Update the payment record
    paymentRecord.status = status;
    if (stripeData) {
      paymentRecord.stripeData = {
        ...paymentRecord.stripeData,
        ...stripeData,
        updatedAt: new Date()
      };
    }
    paymentRecord.updatedAt = new Date();

    await paymentRecord.save();

    console.log('✅ Payment status updated successfully:', {
      sessionId,
      oldStatus: paymentRecord.status,
      newStatus: status
    });

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      paymentRecord: {
        id: paymentRecord._id,
        sessionId: paymentRecord.sessionId,
        status: paymentRecord.status,
        membershipType: paymentRecord.membershipType,
        amount: paymentRecord.amount,
        email: paymentRecord.email
      }
    });

  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    return NextResponse.json({ 
      error: 'Failed to update payment status',
      details: error.message 
    }, { status: 500 });
  }
}
