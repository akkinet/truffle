import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await dbConnect();

    // Find all users with plain text "oauth-user" password
    const oauthUsers = await User.find({ password: "oauth-user" });

    console.log(`Found ${oauthUsers.length} OAuth users with plain text passwords`);

    let fixedCount = 0;
    for (const user of oauthUsers) {
      try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("oauth-user", salt);
        
        // Update the user
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        fixedCount++;
        console.log(`Fixed OAuth user: ${user.email}`);
      } catch (error) {
        console.error(`Failed to fix user ${user.email}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Fixed ${fixedCount} OAuth users`,
      totalFound: oauthUsers.length,
      fixedCount: fixedCount
    }, { status: 200 });

  } catch (error) {
    console.error('Fix OAuth passwords error:', error);
    return NextResponse.json({ error: 'Failed to fix OAuth passwords' }, { status: 500 });
  }
}
