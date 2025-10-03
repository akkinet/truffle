import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Vendor from '../../../../models/Vendor';

export async function PUT(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { vendorId, action, notes } = body;

    if (!vendorId || !action) {
      return NextResponse.json({ 
        error: 'Vendor ID and action are required' 
      }, { status: 400 });
    }

    const validActions = ['approve', 'reject', 'suspend', 'activate'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be one of: approve, reject, suspend, activate' 
      }, { status: 400 });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ 
        error: 'Vendor not found' 
      }, { status: 404 });
    }

    // Update vendor based on action
    switch (action) {
      case 'approve':
        vendor.verificationStatus = 'approved';
        vendor.adminPanelAccess = true;
        vendor.verifiedAt = new Date();
        vendor.verificationNotes = notes || 'Vendor approved by admin';
        break;
        
      case 'reject':
        vendor.verificationStatus = 'rejected';
        vendor.adminPanelAccess = false;
        vendor.verificationNotes = notes || 'Vendor application rejected';
        break;
        
      case 'suspend':
        vendor.accountStatus = 'suspended';
        vendor.adminPanelAccess = false;
        vendor.verificationNotes = notes || 'Vendor account suspended';
        break;
        
      case 'activate':
        vendor.accountStatus = 'active';
        vendor.adminPanelAccess = true;
        vendor.verificationNotes = notes || 'Vendor account activated';
        break;
    }

    await vendor.save();

    return NextResponse.json({ 
      success: true,
      message: `Vendor ${action}d successfully`,
      vendor: {
        id: vendor._id,
        email: vendor.email,
        businessName: vendor.businessName,
        verificationStatus: vendor.verificationStatus,
        accountStatus: vendor.accountStatus,
        adminPanelAccess: vendor.adminPanelAccess,
        verificationNotes: vendor.verificationNotes
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Vendor approval error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (status) {
      query.verificationStatus = status;
    }

    // Get vendors with pagination
    const vendors = await Vendor.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Vendor.countDocuments(query);

    // Transform vendors to include only necessary fields
    const vendorList = vendors.map(vendor => ({
      id: vendor._id,
      firstName: vendor.firstName,
      lastName: vendor.lastName,
      email: vendor.email,
      phone: vendor.phone,
      businessName: vendor.businessName,
      businessType: vendor.businessType,
      verificationStatus: vendor.verificationStatus,
      accountStatus: vendor.accountStatus,
      adminPanelAccess: vendor.adminPanelAccess,
      verificationNotes: vendor.verificationNotes,
      verifiedAt: vendor.verifiedAt,
      serviceCategories: vendor.serviceCategories.map(cat => ({
        category: cat.category,
        description: cat.description,
        experience: cat.experience,
        yearsOfExperience: cat.yearsOfExperience
      })),
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt
    }));

    return NextResponse.json({ 
      success: true,
      vendors: vendorList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Vendor list error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
