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

export async function sendMembershipConfirmationEmail({ email, firstName, lastName, membershipType }) {
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

        const membershipDetails = {
            'free': {
                name: 'Free Membership',
                features: ['Basic access', 'Community features', 'Limited support']
            },
            'gold': {
                name: 'Gold Membership',
                features: ['Standard search', 'Up to 50 searches per month', 'Priority email support']
            },
            'diamond': {
                name: 'Diamond Membership',
                features: ['Unlimited search', 'Priority phone support', 'Discounts on bookings']
            },
            'platinum': {
                name: 'Platinum Membership',
                features: ['All Diamond features', 'Dedicated account manager', 'Extra perks']
            }
        };

        const membership = membershipDetails[membershipType] || membershipDetails['free'];

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Membership Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #110400; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .membership-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .feature-list { list-style: none; padding: 0; }
                    .feature-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
                    .feature-list li:before { content: "✓ "; color: #4CAF50; font-weight: bold; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                    .btn { display: inline-block; padding: 12px 24px; background: #110400; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Trufle!</h1>
                        <p>Your ${membership.name} is now active</p>
                    </div>
                    
                    <div class="content">
                        <h2>Dear ${firstName} ${lastName},</h2>
                        
                        <p>Congratulations! Your ${membership.name} has been successfully activated.</p>
                        
                        <div class="membership-card">
                            <h3>${membership.name} Benefits</h3>
                            <ul class="feature-list">
                                ${membership.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <p><strong>Membership Start Date:</strong> ${new Date().toLocaleDateString()}</p>
                        
                        <p>You can now enjoy all the benefits of your membership. Visit our <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership">membership page</a> to learn more about your benefits.</p>
                        
                        <p>If you have any questions, please don't hesitate to contact our support team.</p>
                        
                        <p>Thank you for choosing Trufle!</p>
                        
                        <p>Best regards,<br>The Trufle Team</p>
                    </div>
                    
                    <div class="footer">
                        <p>This email was sent to ${email}</p>
                        <p>Trufle - Your Luxury Experience Partner</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const plainText = `
            Dear ${firstName} ${lastName},
            
            Congratulations! Your ${membership.name} has been successfully activated.
            
            Membership Benefits:
            ${membership.features.map(feature => `• ${feature}`).join('\n')}
            
            Membership Start Date: ${new Date().toLocaleDateString()}
            
            You can now enjoy all the benefits of your membership. Visit our membership page to learn more about your benefits.
            
            If you have any questions, please don't hesitate to contact our support team.
            
            Thank you for choosing Trufle!
            
            Best regards,
            The Trufle Team
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Membership Created — ${membership.name}`,
            text: plainText,
            html: html,
        });

        console.log(`Membership confirmation email sent to ${email}`);
    } catch (error) {
        console.error('Error sending membership confirmation email:', error);
        throw error;
    }
}