# Error Fixes and Troubleshooting Guide

## Issues Fixed

### 1. 500 Error on `/api/inventory/search` Endpoint

**Problem**: The inventory search API was returning 500 errors, likely due to missing environment variables or database connection issues.

**Fixes Applied**:
- Added environment variable validation before attempting database connection
- Added database connection validation
- Added collection existence checks
- Improved error messages with specific guidance
- Added graceful handling for missing collections

### 2. MongoDB Connection Issues

**Problem**: Missing `MONGODB_URI` environment variable causing connection failures.

**Fixes Applied**:
- Enhanced error messages in `lib/mongodb.js` with specific instructions
- Added environment variable validation in API endpoints
- Created diagnostic scripts to help identify configuration issues

### 3. Missing Database Collections

**Problem**: API endpoints trying to access collections that don't exist yet.

**Fixes Applied**:
- Added collection existence checks before querying
- Return empty results with informative messages for missing collections
- Collections will be created automatically when first documents are inserted

## New Diagnostic Tools

### 1. Database Initialization Script
```bash
npm run init-db
```
This script checks database connectivity and verifies collection existence.

### 2. Comprehensive Diagnosis Script
```bash
npm run diagnose
```
This script checks:
- Environment variables
- Database connectivity
- Collection existence
- API endpoint availability

## Required Environment Variables

Create a `.env.local` file in the project root with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/truffle
MONGODB_DB=truffle

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (if using Google authentication)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Email Configuration (if using email)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## Troubleshooting Steps

### 1. Check Environment Variables
Run the diagnosis script to see what's missing:
```bash
npm run diagnose
```

### 2. Verify Database Connection
Make sure MongoDB is running and accessible:
```bash
npm run init-db
```

### 3. Test API Endpoints
The diagnosis script will test all API endpoints and report their status.

### 4. Check Console Logs
Look for specific error messages in the browser console and server logs.

## Common Error Messages and Solutions

### "MONGODB_URI environment variable is not set"
**Solution**: Create `.env.local` file with MongoDB connection string

### "Database connection failed"
**Solution**: 
- Verify MongoDB is running
- Check connection string format
- Ensure network connectivity

### "Collection does not exist yet"
**Solution**: This is normal for new installations. Collections will be created when first documents are inserted.

### "500 Internal Server Error"
**Solution**: 
- Check server logs for specific error details
- Run diagnosis script to identify configuration issues
- Verify all required environment variables are set

## API Endpoint Status

All API endpoints now have improved error handling:

- ✅ `/api/inventory/search` - Fixed with environment validation and collection checks
- ✅ `/api/test-db` - Already had good error handling
- ✅ `/api/user/check-exists` - Simple endpoint, should work if database is connected
- ✅ `/api/membership/*` - Payment-related endpoints with Stripe integration
- ✅ `/api/webhook/stripe` - Webhook handling for payment processing

## Next Steps

1. **Set up environment variables** by creating `.env.local` file
2. **Start MongoDB** if using local installation
3. **Run diagnosis script** to verify everything is working
4. **Test the application** by starting the development server

If you continue to see errors after following these steps, please share:
- The specific error message
- Output from `npm run diagnose`
- Any console logs from browser or server
