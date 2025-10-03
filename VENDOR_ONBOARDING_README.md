# Vendor Onboarding System

## Overview
This document describes the vendor onboarding system that allows service providers to register and upload their services across different categories (Private Jets, Luxury Cars, Super Cars, Helicopters, Yachts, and Charter Flights).

## System Components

### 1. Vendor Model (`models/Vendor.js`)
Complete vendor data model with the following features:
- **Personal Information**: Name, email, phone, password
- **Business Information**: Business name, type, registration number, tax ID
- **Address Information**: Full address with street, city, state, country, ZIP
- **Service Categories**: Multiple categories with description, experience level, years, certifications
- **Verification System**: Pending → Under Review → Approved/Rejected workflow
- **Account Status**: Active, Suspended, or Inactive
- **Document Management**: Business license, insurance, tax certificates, identity documents
- **Notification Preferences**: Email, SMS, push notifications
- **Analytics**: Listings count, bookings, revenue, ratings, reviews
- **Security**: Password hashing with bcrypt, public profile methods

### 2. Registration API (`app/api/vendor/register/route.js`)
RESTful API endpoints for vendor management:

#### POST `/api/vendor/register`
Register a new vendor with complete validation:
- Validates all required fields
- Checks for existing vendors
- Validates service categories
- Hashes passwords automatically
- Sends welcome email
- Returns vendor ID and verification status

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "vendor@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "phone": "+1234567890",
  "businessName": "Elite Aviation Services",
  "businessType": "company",
  "businessRegistrationNumber": "BRN123456",
  "taxId": "TAX789012",
  "address": {
    "street": "123 Aviation Blvd",
    "city": "Miami",
    "state": "Florida",
    "country": "USA",
    "zipCode": "33132"
  },
  "serviceCategories": [
    {
      "category": "private_jets",
      "description": "Luxury private jet charter services",
      "experience": "expert",
      "yearsOfExperience": 15
    }
  ],
  "receiveUpdates": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Vendor registration successful! Your application is under review.",
  "vendor": {
    "id": "507f1f77bcf86cd799439011",
    "email": "vendor@example.com",
    "businessName": "Elite Aviation Services",
    "verificationStatus": "pending"
  }
}
```

#### GET `/api/vendor/register?email=vendor@example.com`
Check if a vendor exists and get their public profile (excludes sensitive data).

### 3. Vendor Onboarding Form (`app/components/VendorOnboardingForm.jsx`)
Beautiful 4-step wizard interface:

**Step 1: Personal Information**
- First name, last name
- Email address
- Phone number
- Password with show/hide toggle
- Password confirmation

**Step 2: Business Information**
- Business name
- Business type (Individual/Company/Agency)
- Business registration number (optional)
- Tax ID (optional)

**Step 3: Address Information**
- Street address
- City, state
- Country, ZIP code

**Step 4: Service Categories**
- Category selection (multiple supported)
- Service description
- Experience level (Beginner/Intermediate/Expert)
- Years of experience
- Add/remove categories dynamically

**Features:**
- Real-time validation with error messages
- Step indicator progress bar
- Previous/Next navigation
- Loading states with spinner
- Toast notifications
- Responsive design (mobile-friendly)
- Password strength validation

### 4. Landing Page (`app/vendor/onboarding/page.jsx`)
Professional onboarding landing page featuring:
- Hero section with value proposition
- Benefits showcase (3 key benefits)
- Service categories display
- How it works (4-step process)
- Call-to-action button
- Link to vendor signin
- Modal-based registration form

### 5. Email Notifications (`lib/sendEmail.js`)
Automated email system with `sendVendorOnboardingEmail()` function:
- Welcome message
- Application status notification
- Next steps instructions
- Required documents list
- Contact information
- HTML and plain text versions
- Professional styling

## Service Categories

The system supports 6 luxury service categories:
1. **Private Jets** - Charter private aircraft
2. **Luxury Cars** - Premium vehicle rentals
3. **Super Cars** - High-performance vehicles
4. **Helicopters** - Helicopter charter services
5. **Yachts** - Luxury yacht rentals
6. **Charter Flights** - Commercial charter flights

## Business Types

Vendors can register as:
- **Individual/Freelancer** - Solo operators
- **Company/Corporation** - Registered businesses
- **Agency/Broker** - Service brokers and agencies

## Experience Levels

For each service category, vendors specify their expertise:
- **Beginner** (0-2 years) - New to the category
- **Intermediate** (3-5 years) - Established experience
- **Expert** (5+ years) - Industry veteran

## Verification Workflow

```
Registration → Pending → Under Review → Approved/Rejected
                                     ↓
                              Vendor Dashboard
                              (Upload Services)
```

### Status Descriptions:
- **Pending**: Initial status after registration
- **Under Review**: Admin is reviewing the application
- **Approved**: Vendor can access dashboard and upload services
- **Rejected**: Application denied (with notes)

## Security Features

1. **Password Hashing**: bcrypt with salt rounds (10)
2. **Unique Email**: Email must be unique across all vendors
3. **Input Validation**: All fields validated before submission
4. **Password Confirmation**: Must match password
5. **Minimum Password Length**: 8 characters required
6. **Public Profile Method**: Excludes sensitive data from API responses

## Validation Rules

### Personal Information:
- First name: Required, non-empty
- Last name: Required, non-empty
- Email: Required, valid email format, unique
- Password: Required, minimum 8 characters
- Confirm Password: Required, must match password
- Phone: Required, non-empty

### Business Information:
- Business Name: Required, non-empty
- Business Type: Required, one of (individual/company/agency)
- Registration Number: Optional
- Tax ID: Optional

### Address Information:
- Street: Required, non-empty
- City: Required, non-empty
- State: Required, non-empty
- Country: Required, non-empty
- ZIP Code: Required, non-empty

### Service Categories:
- At least one category: Required
- Category: Required, valid category name
- Description: Required, non-empty
- Experience: Required, one of (beginner/intermediate/expert)
- Years of Experience: Required, numeric value

## User Experience Flow

1. **Visit Landing Page** → `/vendor/onboarding`
2. **Click "Start Your Application"** → Opens modal form
3. **Fill Step 1** (Personal Info) → Click "Next"
4. **Fill Step 2** (Business Info) → Click "Next"
5. **Fill Step 3** (Address Info) → Click "Next"
6. **Fill Step 4** (Service Categories) → Click "Submit Application"
7. **Receive Confirmation** → Email sent, modal closes
8. **Wait for Review** → 2-3 business days
9. **Receive Approval** → Email notification
10. **Access Dashboard** → Start uploading services

## API Testing

### Using cURL:

**Register a Vendor:**
```bash
curl -X POST http://localhost:3000/api/vendor/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@luxuryjets.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "phone": "+1234567890",
    "businessName": "Elite Aviation Services",
    "businessType": "company",
    "address": {
      "street": "123 Aviation Blvd",
      "city": "Miami",
      "state": "Florida",
      "country": "USA",
      "zipCode": "33132"
    },
    "serviceCategories": [{
      "category": "private_jets",
      "description": "Luxury private jet services",
      "experience": "expert",
      "yearsOfExperience": 15
    }],
    "receiveUpdates": true
  }'
```

**Check Vendor Existence:**
```bash
curl http://localhost:3000/api/vendor/register?email=john@luxuryjets.com
```

### Using JavaScript (fetch):

```javascript
// Register vendor
const response = await fetch('/api/vendor/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@luxuryjets.com',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    phone: '+1234567890',
    businessName: 'Elite Aviation Services',
    businessType: 'company',
    address: {
      street: '123 Aviation Blvd',
      city: 'Miami',
      state: 'Florida',
      country: 'USA',
      zipCode: '33132'
    },
    serviceCategories: [{
      category: 'private_jets',
      description: 'Luxury private jet services',
      experience: 'expert',
      yearsOfExperience: 15
    }],
    receiveUpdates: true
  })
});

const data = await response.json();
console.log(data);
```

## Database Schema

The Vendor model creates the following MongoDB collection:

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  businessName: String,
  businessType: String (enum),
  businessRegistrationNumber: String,
  taxId: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  serviceCategories: [{
    category: String (enum),
    description: String,
    experience: String (enum),
    yearsOfExperience: Number,
    certifications: [{
      name: String,
      issuer: String,
      dateIssued: Date,
      expiryDate: Date
    }]
  }],
  verificationStatus: String (enum),
  verificationNotes: String,
  verifiedAt: Date,
  verifiedBy: ObjectId (ref: User),
  accountStatus: String (enum),
  documents: {
    businessLicense: { url: String, uploadedAt: Date },
    insuranceCertificate: { url: String, uploadedAt: Date },
    taxCertificate: { url: String, uploadedAt: Date },
    identityDocument: { url: String, uploadedAt: Date }
  },
  receiveUpdates: Boolean,
  notificationPreferences: {
    email: Boolean,
    sms: Boolean,
    push: Boolean
  },
  stats: {
    totalListings: Number,
    totalBookings: Number,
    totalRevenue: Number,
    rating: Number,
    reviewCount: Number
  },
  lastLoginAt: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Next Steps (To Be Implemented)

### 1. Admin Panel
- [ ] Admin authentication system
- [ ] Vendor list with search/filter
- [ ] Vendor approval/rejection workflow
- [ ] Document verification system
- [ ] Vendor status management
- [ ] Bulk actions (approve/reject multiple)

### 2. Vendor Dashboard
- [ ] Vendor authentication (login/logout)
- [ ] Dashboard overview (stats, recent bookings)
- [ ] Service listing management
- [ ] Category upload functionality
- [ ] Booking management
- [ ] Revenue tracking and reports
- [ ] Profile settings and updates

### 3. Service Upload System
- [ ] Add new service listing form
- [ ] Image upload with optimization
- [ ] Pricing management (hourly/daily/custom)
- [ ] Availability calendar integration
- [ ] Service categories mapping
- [ ] Draft/publish workflow
- [ ] Bulk upload functionality

### 4. Integration
- [ ] Connect vendor services to search API
- [ ] Booking system integration
- [ ] Payment processing (vendor payouts)
- [ ] Review and rating system
- [ ] Analytics and reporting
- [ ] Notification system (new bookings, etc.)

## Testing Checklist

- [x] Vendor model created and validated
- [x] Registration API endpoint functional
- [x] Onboarding form with 4 steps
- [x] Form validation working
- [x] Email notifications setup
- [x] Landing page responsive
- [x] No linter errors
- [ ] Manual testing (register a vendor)
- [ ] Database record verification
- [ ] Email delivery confirmation
- [ ] Error handling verification
- [ ] Mobile responsiveness testing

## Access Points

- **Landing Page**: http://localhost:3000/vendor/onboarding
- **API Register**: POST http://localhost:3000/api/vendor/register
- **API Check**: GET http://localhost:3000/api/vendor/register?email=...

## Environment Variables Required

Ensure these are set in your `.env.local`:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_SECURE=false
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourapp.com

# NextAuth
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## Support

For questions or issues with the vendor onboarding system, please contact:
- Email: support@trufle.com
- Documentation: See this README
- Admin Panel: (To be implemented)

---

**Created**: October 2025  
**Last Updated**: October 2025  
**Version**: 1.0.0
