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
    const { paymentRecordId, password, isUpgrade } = body;

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

    // Check if this is an upgrade (existing user) or new user registration
    const isUpgradeRequest = isUpgrade || paymentRecord.tempUserPayload?.isUpgrade || paymentRecord.tempUserPayload?.userId;
    const existingUser = await User.findOne({ email: paymentRecord.email });

    if (isUpgradeRequest && existingUser) {
      // Handle upgrade case - update existing user
      existingUser.membership = paymentRecord.membershipType;
      existingUser.membershipStatus = 'active';
      existingUser.membershipStartedAt = paymentRecord.stripeData.paidAt || new Date();
      existingUser.membershipPaidAmount = paymentRecord.amount / 100;
      existingUser.membershipPaymentRef = paymentRecord.stripeData.stripePaymentId || paymentRecord.sessionId;
      existingUser.stripeCustomerId = paymentRecord.stripeData.customerId;

      await existingUser.save();

      // Mark payment record as processed
      paymentRecord.processed = true;
      await paymentRecord.save();

      // Send confirmation email
      try {
        await sendMembershipConfirmationEmail({
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          membershipType: existingUser.membership
        });
      } catch (emailError) {
        console.error('Failed to send upgrade confirmation email:', emailError);
      }

      return NextResponse.json({ 
        success: true,
        message: 'Membership upgraded successfully',
        user: {
          id: existingUser._id,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          membership: existingUser.membership,
          membershipStatus: existingUser.membershipStatus,
          membershipStartedAt: existingUser.membershipStartedAt,
          membershipPaidAmount: existingUser.membershipPaidAmount,
          membershipPaymentRef: existingUser.membershipPaymentRef
        }
      }, { status: 200 });

    } else if (!existingUser) {
      // Handle new user registration case
      if (!password) {
        // Use default password for OAuth users or when password not provided
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('oauth-user', salt);

        // Create the user account
        const user = new User({
          firstName: paymentRecord.tempUserPayload.firstName,
          lastName: paymentRecord.tempUserPayload.lastName,
          email: paymentRecord.email,
          password: hashedPassword,
          membership: paymentRecord.membershipType,
          membershipStatus: 'active',
          membershipStartedAt: paymentRecord.stripeData.paidAt || new Date(),
          membershipPaidAmount: paymentRecord.amount / 100,
          membershipPaymentRef: paymentRecord.stripeData.stripePaymentId || paymentRecord.sessionId,
          stripeCustomerId: paymentRecord.stripeData.customerId,
          receiveUpdates: paymentRecord.tempUserPayload.receiveUpdates
        });

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
          console.log('Membership confirmation email sent to:', user.email);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
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

      } else {
        // Handle new user with password
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
          membershipPaidAmount: paymentRecord.amount / 100,
          membershipPaymentRef: paymentRecord.stripeData.stripePaymentId || paymentRecord.sessionId,
          stripeCustomerId: paymentRecord.stripeData.customerId,
          receiveUpdates: paymentRecord.tempUserPayload.receiveUpdates
        });

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
          console.log('Membership confirmation email sent to:', user.email);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
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
      }
    } else {
      // User already exists but this is not an upgrade request
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

  } catch (error) {
    console.error('Complete membership error:', error);
    return NextResponse.json({ error: 'Failed to complete membership' }, { status: 500 });
  }
}
