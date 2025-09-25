import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { firstName, lastName, email, password, confirmPassword, membershipType = 'free', receiveUpdates } = body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      membership: membershipType,
      membershipStatus: membershipType === 'free' ? 'active' : 'pending',
      receiveUpdates: !!receiveUpdates,
    });

    await user.save();

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
