import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Payment from '../../../../models/Payment';
import { sendMembershipConfirmationEmail } from '../../../../lib/sendEmail';

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { paymentRecordId, sessionId } = body;

    if (!paymentRecordId && !sessionId) {
      return NextResponse.json({ error: 'Payment record ID or Session ID is required' }, { status: 400 });
    }

    // Find the payment record by either paymentRecordId or sessionId
    const query = paymentRecordId ? { _id: paymentRecordId } : { sessionId: sessionId };
    const paymentRecord = await Payment.findOne(query);

    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Debug logging
    console.log('Complete upgrade - Payment record:', {
      id: paymentRecord._id,
      email: paymentRecord.email,
      membershipType: paymentRecord.membershipType,
      status: paymentRecord.status,
      tempUserPayload: paymentRecord.tempUserPayload
    });

    // Verify payment was successful
    if (paymentRecord.status !== 'succeeded') {
      return NextResponse.json({ 
        error: 'Payment not completed or failed',
        status: paymentRecord.status 
      }, { status: 400 });
    }

    // Verify this is an upgrade (not a new user registration)
    // Multiple ways to detect if this is an upgrade
    const isUpgrade = paymentRecord.tempUserPayload?.isUpgrade || 
                     paymentRecord.tempUserPayload?.userId || 
                     paymentRecord.tempUserPayload?.isOAuthUser ||
                     // If tempUserPayload is missing, check if user exists by email
                     (paymentRecord.email && await User.findOne({ email: paymentRecord.email }));
    
    console.log('Complete upgrade - Detection:', {
      tempUserPayloadIsUpgrade: paymentRecord.tempUserPayload?.isUpgrade,
      tempUserPayloadUserId: paymentRecord.tempUserPayload?.userId,
      tempUserPayloadIsOAuthUser: paymentRecord.tempUserPayload?.isOAuthUser,
      emailExists: paymentRecord.email && await User.findOne({ email: paymentRecord.email }),
      finalIsUpgrade: isUpgrade
    });
    
    if (!isUpgrade) {
      return NextResponse.json({ error: 'This is not an upgrade payment' }, { status: 400 });
    }

    // Find the user to upgrade - try multiple methods
    let user;
    if (paymentRecord.tempUserPayload?.userId && paymentRecord.tempUserPayload.userId !== 'oauth-user') {
      // Method 1: Use userId from tempUserPayload (for existing database users)
      user = await User.findById(paymentRecord.tempUserPayload.userId);
    } else if (paymentRecord.email) {
      // Method 2: Find user by email (fallback when tempUserPayload is missing)
      user = await User.findOne({ email: paymentRecord.email });
    }
    
    // If user not found and this is an OAuth user, create the user
    if (!user && paymentRecord.tempUserPayload?.isOAuthUser) {
      console.log('Creating new OAuth user in database:', paymentRecord.email);
      
      // Import bcrypt for password hashing
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("oauth-user", salt);
      
      user = new User({
        email: paymentRecord.email,
        firstName: paymentRecord.tempUserPayload.firstName || 'Unknown',
        lastName: paymentRecord.tempUserPayload.lastName || 'Unknown',
        password: hashedPassword,
        receiveUpdates: false,
        membership: 'free', // Will be updated below
        membershipStatus: 'active'
      });
      
      await user.save();
      console.log('✅ OAuth user created in database:', user.email);
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found and could not be created' }, { status: 404 });
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
