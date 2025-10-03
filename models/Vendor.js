import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vendorSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  
  // Business Information
  businessName: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    enum: ['individual', 'company', 'agency'],
    required: true,
  },
  businessRegistrationNumber: {
    type: String,
    required: false,
  },
  taxId: {
    type: String,
    required: false,
  },
  
  // Address Information
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  
  // Service Categories
  serviceCategories: [{
    category: {
      type: String,
      enum: ['private_jets', 'luxury_cars', 'super_cars', 'helicopters', 'yachts', 'charter_flights'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
    },
    certifications: [{
      name: String,
      issuer: String,
      dateIssued: Date,
      expiryDate: Date,
    }],
  }],
  
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
  },
  verificationNotes: {
    type: String,
    default: '',
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  
  // Account Status
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active',
  },
  
  // Admin Panel Access
  adminPanelAccess: {
    type: Boolean,
    default: false,
  },
  
  // Documents
  documents: {
    businessLicense: {
      url: String,
      uploadedAt: Date,
    },
    insuranceCertificate: {
      url: String,
      uploadedAt: Date,
    },
    taxCertificate: {
      url: String,
      uploadedAt: Date,
    },
    identityDocument: {
      url: String,
      uploadedAt: Date,
    },
  },
  
  // Settings
  receiveUpdates: {
    type: Boolean,
    default: true,
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
  },
  
  // Analytics
  stats: {
    totalListings: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  
  // Timestamps
  lastLoginAt: {
    type: Date,
    default: null,
  },
}, { 
  timestamps: true 
});

// Pre-save middleware to hash password
vendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
vendorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile (without sensitive data)
vendorSchema.methods.getPublicProfile = function () {
  const { password, documents, ...publicProfile } = this.toObject();
  return publicProfile;
};

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);

export default Vendor;
