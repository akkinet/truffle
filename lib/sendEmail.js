import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function sendEmail(email, subject, html) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT,
            secure: process.env.EMAIL_SERVER_SECURE === "true",
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });
        transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject,
            html,
        });
    } catch (err) {
        console.log("Error in sendEmail", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}