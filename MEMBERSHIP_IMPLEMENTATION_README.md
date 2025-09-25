# Truffle Membership System - Implementation Guide

## Overview
This document provides a comprehensive guide to the Truffle membership system implementation, including checkout flows, environment setup, and testing procedures.

## 🚀 Quick Start

### Environment Variables Required
Create a `.env.local` file with the following variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MongoDB Databases
MONGODB_URI=mongodb+srv://hexerve:hexerve@cluster0.zy7afj9.mongodb.net/truffle
MONGODB_DB=trufle-admin

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key
```

### Installation & Setup
```bash
npm install
npm run dev
```

## 💳 Checkout Flow Architecture

### 1. Guest User Flow (New Registration)
```
1. User visits membership page
2. Clicks "Apply for Membership"
3. Fills out registration form + selects membership type
4. For paid plans:
   a. Clicks "Pay Now"
   b. POST /api/payments/create-checkout-session
   c. Redirects to Stripe Checkout
   d. After payment: webhook updates payment status
   e. User returns to payment-confirmed modal
   f. Clicks "Create Membership"
   g. POST /api/auth/complete-membership creates user
5. For free plans:
   a. Clicks "Setup Later"
   b. User created immediately with free membership
```

### 2. Logged-in User Upgrade Flow
```
1. Logged-in free user visits membership page
2. Clicks "Upgrade" on paid plan
3. Upgrade modal opens (no signup fields)
4. Clicks "Pay Now"
5. POST /api/membership/upgrade creates checkout session
6. Redirects to Stripe Checkout
7. After payment: webhook updates user membership directly
8. User returns to upgrade-success page
```

### 3. Payment Webhook Flow (Authoritative)
```
1. Stripe sends checkout.session.completed event
2. POST /api/webhook/stripe receives event
3. Verifies webhook signature
4. Updates payment record status to 'succeeded'
5. For upgrades: directly updates user membership
6. Sends confirmation email via Nodemailer
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  membership: 'free' | 'gold' | 'diamond' | 'platinum',
  membershipStatus: 'active' | 'pending' | 'cancelled',
  membershipStartedAt: Date,
  membershipPaidAmount: Number,
  membershipPaymentRef: String,
  stripeCustomerId: String,
  receiveUpdates: Boolean
}
```

### Payments Collection
```javascript
{
  sessionId: String (unique, required),
  email: String,
  tempUserPayload: Object,
  membershipType: String,
  amount: Number (cents),
  currency: String,
  status: 'pending' | 'succeeded' | 'failed' | 'expired',
  stripeData: Object,
  consumed: Boolean,
  expiresAt: Date (24h TTL)
}
```

### Inventory Collections (trufle-admin database)
- `private_jets` - Business jets with location data
- `luxury_cars` - Premium vehicles
- `super_cars` - High-performance sports cars
- `helicopters` - Executive helicopters
- `yachts` - Luxury vessels
- `charter_flights` - Charter aircraft

Each collection includes:
- GeoJSON Point coordinates for location search
- Price, capacity, features, ratings
- 2dsphere index for geospatial queries

## 🔧 API Endpoints

### Payment Endpoints
- `POST /api/payments/create-checkout-session` - Creates Stripe checkout session
- `GET /api/payments/status` - Returns payment status for polling
- `POST /api/webhook/stripe` - Handles Stripe webhook events

### Membership Endpoints
- `POST /api/auth/complete-membership` - Finalizes user creation after payment
- `POST /api/membership/upgrade` - Creates upgrade checkout session
- `POST /api/membership/complete-upgrade` - Finalizes membership upgrade

### Search Endpoints
- `GET /api/inventory/search` - Search inventory (gated by membership)
- `GET /api/inventory/categories` - Get available categories

## 🧪 Testing Procedures

### Local Testing with Stripe Test Keys
1. Use Stripe test keys in `.env.local`
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Use Stripe CLI for webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```

### Test Scenarios
1. **Guest Paid Purchase**: Full signup + payment flow
2. **Logged-in Upgrade**: Free user upgrading to paid
3. **Free Membership**: Immediate user creation
4. **Payment Failure**: Cancelled/failed payments
5. **Search Gating**: Verify membership restrictions

### Database Inspection
```javascript
// Check payments collection
db.payments.find().sort({createdAt: -1}).limit(5)

// Check users with memberships
db.users.find({membership: {$ne: 'free'}})

// Check inventory counts
db.private_jets.countDocuments()
db.luxury_cars.countDocuments()
// ... etc
```

## 🎨 UI Components

### Key Components
- `MembershipModal.jsx` - Guest registration with payment
- `MembershipUpgradeModal.jsx` - Logged-in user upgrades
- `BookingSearch.jsx` - Search interface with membership gating
- `GooglePlacesAutocomplete.jsx` - Location input with dropdown

### CSS Fixes Applied
- Input icon vertical alignment (`.input-with-icon`)
- Dropdown z-index fixes (`.dropdown-suggestions`)
- Calendar icon visibility improvements
- Search bar positioning optimization

## 🔒 Security Features

### Payment Security
- Webhook signature verification
- Payment validation before user creation
- Secure password hashing with bcrypt
- JWT token authentication

### Data Protection
- No sensitive data in client-side storage
- Encrypted password storage
- Secure session management
- CORS protection

## 📊 Demo Data

### Sample Users Created
- **Platinum User**: `demo.platinum@example.com` / `Password123!`
- **Free User**: `demo.free@example.com` / `Password123!`

### Inventory Data
- 3 Private jets (Gulfstream, Bombardier, Cessna)
- 2 Luxury cars (Rolls-Royce, Bentley)
- 2 Super cars (Ferrari, McLaren)
- 2 Helicopters (Sikorsky, AgustaWestland)
- 2 Yachts (Azimut, Sunseeker)
- 2 Charter flights (Embraer, Dassault)

## 🚨 Troubleshooting

### Common Issues
1. **sessionId validation error**: Fixed by creating Stripe session first
2. **Duplicate index warnings**: Removed redundant index declarations
3. **Mongoose deprecation warnings**: Removed deprecated connection options
4. **Dropdown clipping**: Fixed with z-index and portal positioning

### Debug Steps
1. Check MongoDB connection logs
2. Verify Stripe webhook endpoint accessibility
3. Test payment status polling
4. Validate email configuration
5. Check browser console for errors

## 📈 Performance Optimizations

### Database Indexes
- `sessionId` (unique) for payment lookups
- `email` for user queries
- `status` for payment filtering
- `expiresAt` with TTL for cleanup
- `location.coord` (2dsphere) for geospatial search

### Caching
- MongoDB connection caching
- Payment status caching
- User session caching

## 🔄 Maintenance

### Cleanup Jobs
- Payment records expire after 24 hours
- Failed payments cleaned up automatically
- User sessions managed by JWT expiration

### Monitoring
- Payment success/failure rates
- Webhook delivery status
- Database performance metrics
- User conversion rates

---

## 📞 Support

For technical issues or questions about this implementation, please refer to the code comments or contact the development team.

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
