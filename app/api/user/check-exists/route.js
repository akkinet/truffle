import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists in database
    const user = await User.findOne({ email: email.toLowerCase() });
    
    return NextResponse.json({ 
      exists: !!user,
      userId: user?._id,
      membership: user?.membership
    }, { status: 200 });

  } catch (error) {
    console.error('User exists check error:', error);
    return NextResponse.json({ error: 'Failed to check user existence' }, { status: 500 });
  }
}
