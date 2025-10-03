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

export async function sendVendorOnboardingEmail({ email, firstName, lastName, businessName }) {
    try {
        const transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT,
            secure: process.env.EMAIL_SERVER_SECURE === "true",
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Vendor Onboarding Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #110400; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .status-card { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 8px; }
                    .next-steps { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .step-list { list-style: none; padding: 0; }
                    .step-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
                    .step-list li:before { content: counter(step-counter) ". "; counter-increment: step-counter; color: #110400; font-weight: bold; }
                    .step-list { counter-reset: step-counter; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                    .btn { display: inline-block; padding: 12px 24px; background: #110400; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Trufle Vendor Network!</h1>
                        <p>Your vendor application has been received</p>
                    </div>
                    
                    <div class="content">
                        <h2>Dear ${firstName} ${lastName},</h2>
                        
                        <p>Thank you for your interest in joining the Trufle vendor network! We're excited to have <strong>${businessName}</strong> as part of our luxury service provider community.</p>
                        
                        <div class="status-card">
                            <h3>📋 Application Status: Under Review</h3>
                            <p>Your vendor application has been successfully submitted and is currently under review by our team. This process typically takes 2-3 business days.</p>
                        </div>
                        
                        <div class="next-steps">
                            <h3>What happens next?</h3>
                            <ol class="step-list">
                                <li><strong>Application Review:</strong> Our team will review your business information and service categories</li>
                                <li><strong>Verification:</strong> We may contact you for additional documentation or clarification</li>
                                <li><strong>Approval:</strong> Once approved, you'll receive access to your vendor dashboard</li>
                                <li><strong>Onboarding:</strong> We'll guide you through setting up your service listings</li>
                            </ol>
                        </div>
                        
                        <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
                        
                        <p>During the review process, please ensure you have the following documents ready:</p>
                        <ul>
                            <li>Business license or registration certificate</li>
                            <li>Insurance certificates</li>
                            <li>Tax identification documents</li>
                            <li>Professional certifications (if applicable)</li>
                        </ul>
                        
                        <p>If you have any questions about your application or need to provide additional information, please don't hesitate to contact our vendor support team.</p>
                        
                        <p>We look forward to welcoming you to the Trufle family!</p>
                        
                        <p>Best regards,<br>The Trufle Vendor Team</p>
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
            
            Thank you for your interest in joining the Trufle vendor network! We're excited to have ${businessName} as part of our luxury service provider community.
            
            Application Status: Under Review
            Your vendor application has been successfully submitted and is currently under review by our team. This process typically takes 2-3 business days.
            
            What happens next?
            1. Application Review: Our team will review your business information and service categories
            2. Verification: We may contact you for additional documentation or clarification
            3. Approval: Once approved, you'll receive access to your vendor dashboard
            4. Onboarding: We'll guide you through setting up your service listings
            
            Application Date: ${new Date().toLocaleDateString()}
            
            During the review process, please ensure you have the following documents ready:
            • Business license or registration certificate
            • Insurance certificates
            • Tax identification documents
            • Professional certifications (if applicable)
            
            If you have any questions about your application or need to provide additional information, please don't hesitate to contact our vendor support team.
            
            We look forward to welcoming you to the Trufle family!
            
            Best regards,
            The Trufle Vendor Team
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Vendor Application Received — ${businessName}`,
            text: plainText,
            html: html,
        });

        console.log(`Vendor onboarding email sent to ${email}`);
    } catch (error) {
        console.error('Error sending vendor onboarding email:', error);
        throw error;
    }
}