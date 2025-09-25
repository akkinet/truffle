import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Payment from '../../../../models/Payment';
import { sendMembershipConfirmationEmail } from '../../../../lib/sendEmail';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { paymentRecordId, password } = body;

    if (!paymentRecordId || !password) {
      return NextResponse.json({ error: 'Payment record ID and password are required' }, { status: 400 });
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: paymentRecord.email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user account
    const user = new User({
      firstName: paymentRecord.tempUserPayload.firstName,
      lastName: paymentRecord.tempUserPayload.lastName,
      email: paymentRecord.email,
      password: hashedPassword,
      membership: paymentRecord.membershipType,
      membershipStatus: 'active',
      membershipStartedAt: paymentRecord.stripeData.paidAt || new Date(),
      membershipPaidAmount: paymentRecord.amount / 100, // Convert from cents to dollars
      membershipPaymentRef: paymentRecord.stripeData.stripePaymentId || paymentRecord.sessionId,
      stripeCustomerId: paymentRecord.stripeData.customerId,
      receiveUpdates: paymentRecord.tempUserPayload.receiveUpdates
    });

    await user.save();

    // Mark payment record as consumed (optional - you might want to keep it for records)
    paymentRecord.status = 'consumed';
    await paymentRecord.save();

    // Send confirmation email
    try {
      await sendMembershipConfirmationEmail({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membershipType: user.membership,
        paymentAmount: user.membershipPaidAmount,
        paymentRef: user.membershipPaymentRef
      });
      console.log('Membership confirmation email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        membership: user.membership,
        membershipStatus: user.membershipStatus
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Membership created successfully',
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
      },
      token: token
    }, { status: 201 });
  } catch (error) {
    console.error('Complete membership error:', error);
    return NextResponse.json({ error: 'Failed to complete membership' }, { status: 500 });
  }
}
