import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await dbConnect();
    
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    console.log(`Testing database connection for email: ${email}`);
    
    // Test database connection
    const connection = await dbConnect();
    const dbName = connection.connection.db.databaseName;
    console.log(`Connected to database: ${dbName}`);
    
    // Find user in database
    const user = await User.findOne({ email: email }).lean();
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'User not found',
        database: dbName,
        email: email
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User found in database',
      database: dbName,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membership: user.membership,
        membershipStatus: user.membershipStatus,
        membershipPaidAmount: user.membershipPaidAmount,
        membershipStartedAt: user.membershipStartedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: 'Database test failed',
      details: error.message 
    }, { status: 500 });
  }
}

