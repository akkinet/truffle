import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Payment from '../../../../models/Payment';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const paymentRecordId = url.searchParams.get('paymentRecordId');

    // Check by payment record ID first
    if (paymentRecordId) {
      const payment = await Payment.findById(paymentRecordId);
      if (payment) {
        const user = await User.findOne({ email: payment.email });
        return NextResponse.json({ 
          exists: !!user,
          userId: user?._id,
          membership: user?.membership,
          membershipStatus: user?.membershipStatus,
          user: user ? {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            membership: user.membership,
            membershipStatus: user.membershipStatus,
            membershipStartedAt: user.membershipStartedAt,
            membershipPaidAmount: user.membershipPaidAmount
          } : null
        }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
      }
    }

    // Fallback to email check
    if (!email) {
      return NextResponse.json({ error: 'Email or paymentRecordId is required' }, { status: 400 });
    }

    // Check if user exists in database
    const user = await User.findOne({ email: email.toLowerCase() });
    
    return NextResponse.json({ 
      exists: !!user,
      userId: user?._id,
      membership: user?.membership,
      membershipStatus: user?.membershipStatus,
      user: user ? {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membership: user.membership,
        membershipStatus: user.membershipStatus,
        membershipStartedAt: user.membershipStartedAt,
        membershipPaidAmount: user.membershipPaidAmount
      } : null
    }, { status: 200 });

  } catch (error) {
    console.error('User exists check error:', error);
    return NextResponse.json({ error: 'Failed to check user existence' }, { status: 500 });
  }
}
