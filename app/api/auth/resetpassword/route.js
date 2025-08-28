import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import bcrypt from "bcryptjs";
import User from '@/models/User'
import dbConnect from '@/lib/mongodb'

export const PUT = async (req) => {
    try {
        const authHeader = req.headers.get('Authorization')
        const token = authHeader.split(' ')[1]
        const { email } = jwt.verify(token, process.env.NEXTAUTH_SECRET)
        const { password } = await req.json()

        const hashPass = await bcrypt.hash(password, 10)
        await dbConnect();
        await User.updateOne({
            email
        }, {
            $set: {
                password: hashPass
            }
        });
        return new Response('Password updated', { status: 200 })
    } catch (err) {
        return NextResponse.json({ err: err.message }, { status: 400 })
    }
}