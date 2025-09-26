import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Payment from '../../../../models/Payment';
import { sendMembershipConfirmationEmail } from '../../../../lib/sendEmail';

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { paymentRecordId } = body;

    if (!paymentRecordId) {
      return NextResponse.json({ error: 'Payment record ID is required' }, { status: 400 });
    }

    // Find the payment record
    const paymentRecord = await Payment.findById(paymentRecordId);

    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Verify payment was successful
    if (paymentRecord.status !== 'succeeded') {
      return NextResponse.json({ 
        error: 'Payment not completed or failed',
        status: paymentRecord.status 
      }, { status: 400 });
    }

    // Verify this is an upgrade (not a new user registration)
    if (!paymentRecord.tempUserPayload.isUpgrade) {
      return NextResponse.json({ error: 'This is not an upgrade payment' }, { status: 400 });
    }

    // Find the user to upgrade
    const user = await User.findById(paymentRecord.tempUserPayload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user membership
    user.membership = paymentRecord.membershipType;
    user.membershipStatus = 'active';
    user.membershipStartedAt = paymentRecord.stripeData.paidAt || new Date();
    user.membershipPaidAmount = paymentRecord.amount / 100; // Convert from cents to dollars
    user.membershipPaymentRef = paymentRecord.stripeData.stripePaymentId || paymentRecord.sessionId;
    user.stripeCustomerId = paymentRecord.stripeData.customerId;

    await user.save();

    // Mark payment record as processed
    paymentRecord.processed = true;
    await paymentRecord.save();

    // Send confirmation email
    try {
      await sendMembershipConfirmationEmail({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membershipType: user.membership
      });
      console.log('Membership upgrade confirmation email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Membership upgraded successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membership: user.membership,
        membershipStatus: user.membershipStatus,
        membershipStartedAt: user.membershipStartedAt,
        membershipPaidAmount: user.membershipPaidAmount,
        membershipPaymentRef: user.membershipPaymentRef
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Complete upgrade error:', error);
    return NextResponse.json({ error: 'Failed to complete upgrade' }, { status: 500 });
  }
}
