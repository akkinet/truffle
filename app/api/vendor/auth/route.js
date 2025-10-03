import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Vendor from '../../../../models/Vendor';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    // Find vendor by email
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Check if vendor has admin panel access
    if (!vendor.adminPanelAccess) {
      return NextResponse.json({ 
        error: 'Access denied. Vendor not approved for admin panel access.' 
      }, { status: 403 });
    }

    // Check if account is active
    if (vendor.accountStatus !== 'active') {
      return NextResponse.json({ 
        error: 'Account is not active' 
      }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = await vendor.matchPassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Update last login
    vendor.lastLoginAt = new Date();
    await vendor.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        vendorId: vendor._id,
        email: vendor.email,
        businessName: vendor.businessName,
        adminPanelAccess: vendor.adminPanelAccess
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Login successful',
      token: token,
      vendor: {
        id: vendor._id,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        email: vendor.email,
        businessName: vendor.businessName,
        businessType: vendor.businessType,
        verificationStatus: vendor.verificationStatus,
        accountStatus: vendor.accountStatus,
        adminPanelAccess: vendor.adminPanelAccess,
        serviceCategories: vendor.serviceCategories,
        stats: vendor.stats,
        lastLoginAt: vendor.lastLoginAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Vendor login error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ 
        error: 'Token is required' 
      }, { status: 400 });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      
      // Find vendor
      const vendor = await Vendor.findById(decoded.vendorId).select('-password');
      if (!vendor) {
        return NextResponse.json({ 
          error: 'Vendor not found' 
        }, { status: 404 });
      }

      // Check if vendor still has admin panel access
      if (!vendor.adminPanelAccess) {
        return NextResponse.json({ 
          error: 'Access denied. Admin panel access revoked.' 
        }, { status: 403 });
      }

      return NextResponse.json({ 
        success: true,
        vendor: {
          id: vendor._id,
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          email: vendor.email,
          businessName: vendor.businessName,
          businessType: vendor.businessType,
          verificationStatus: vendor.verificationStatus,
          accountStatus: vendor.accountStatus,
          adminPanelAccess: vendor.adminPanelAccess,
          serviceCategories: vendor.serviceCategories,
          stats: vendor.stats,
          lastLoginAt: vendor.lastLoginAt
        }
      }, { status: 200 });

    } catch (jwtError) {
      return NextResponse.json({ 
        error: 'Invalid or expired token' 
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Vendor token verification error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
