import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Vendor from '../../../../models/Vendor';
import { sendVendorOnboardingEmail } from '../../../../lib/sendEmail';

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      // Personal Information
      firstName,
      lastName,
      email,
      phone,
      
      // Business Information
      businessName,
      businessType,
      businessRegistrationNumber,
      taxId,
      
      // Address Information
      address,
      
      // Service Categories
      serviceCategories,
      
      // Settings
      receiveUpdates,
      notificationPreferences
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ 
        error: 'Personal information fields are required' 
      }, { status: 400 });
    }

    if (!businessName || !businessType || !address) {
      return NextResponse.json({ 
        error: 'Business information fields are required' 
      }, { status: 400 });
    }

    if (!serviceCategories || serviceCategories.length === 0) {
      return NextResponse.json({ 
        error: 'At least one service category is required' 
      }, { status: 400 });
    }


    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return NextResponse.json({ 
        error: 'Vendor with this email already exists' 
      }, { status: 400 });
    }

    // Validate service categories
    const validCategories = ['private_jets', 'luxury_cars', 'super_cars', 'helicopters', 'yachts', 'charter_flights'];
    for (const category of serviceCategories) {
      if (!validCategories.includes(category.category)) {
        return NextResponse.json({ 
          error: `Invalid service category: ${category.category}` 
        }, { status: 400 });
      }
      
      if (!category.description || !category.experience || !category.yearsOfExperience) {
        return NextResponse.json({ 
          error: 'All service category fields are required' 
        }, { status: 400 });
      }
    }

    // Create vendor
    const vendor = new Vendor({
      firstName,
      lastName,
      email,
      phone,
      businessName,
      businessType,
      businessRegistrationNumber,
      taxId,
      address,
      serviceCategories,
      receiveUpdates: !!receiveUpdates,
      notificationPreferences: notificationPreferences || {
        email: true,
        sms: false,
        push: true
      }
    });

    await vendor.save();

    // Send welcome email
    try {
      await sendVendorOnboardingEmail({
        email: vendor.email,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        businessName: vendor.businessName
      });
    } catch (emailError) {
      console.error('Failed to send vendor onboarding email:', emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Vendor registration successful! Your application is under review.',
      vendor: {
        id: vendor._id,
        email: vendor.email,
        businessName: vendor.businessName,
        verificationStatus: vendor.verificationStatus,
        adminPanelAccess: vendor.adminPanelAccess
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Vendor registration error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    const vendor = await Vendor.findOne({ email }).select('-password');
    
    if (!vendor) {
      return NextResponse.json({ 
        error: 'Vendor not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      vendor: vendor.getPublicProfile()
    }, { status: 200 });

  } catch (error) {
    console.error('Vendor lookup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
