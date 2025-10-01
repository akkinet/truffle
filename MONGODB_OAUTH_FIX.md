# MongoDB Connection Fix for Google OAuth

## Issue Identified
The Google OAuth login is failing due to MongoDB connection timeout errors:
- `querySrv ETIMEOUT _mongodb._tcp.cluster0.zy7afj9.mongodb.net`
- NextAuth is trying to use MongoDB adapter but connection is timing out

## Solutions Applied

### 1. Enhanced NextAuth Configuration ✅
- Added connection timeout settings (10 seconds)
- Added graceful fallback when MongoDB is unavailable
- Enhanced error handling in signIn and JWT callbacks
- Added fallback authentication without database access

### 2. Improved Error Handling ✅
- Database connection failures no longer block authentication
- Users can still sign in with default values when DB is unavailable
- Comprehensive logging for debugging

### 3. Connection Timeout Settings ✅
```javascript
serverSelectionTimeoutMS: 10000, // 10 second timeout
connectTimeoutMS: 10000,
socketTimeoutMS: 10000,
```

## Quick Fixes

### Option 1: Fix MongoDB Connection (Recommended)
Create `.env.local` file with your MongoDB connection string:

```env
# For MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster0.zy7afj9.mongodb.net/truffle?retryWrites=false&w=majority

# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/truffle

# Other required variables
MONGODB_DB=truffle
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Option 2: Disable MongoDB Adapter (Temporary)
If you want to test authentication without MongoDB:

1. Comment out the adapter line in `app/api/auth/[...nextauth]/route.js`:
```javascript
export const authOptions = {
  // adapter: adapterAvailable ? MongoDBAdapter(clientPromise) : undefined,
  session: {
    strategy: "jwt",
  },
  // ... rest of config
};
```

2. Authentication will work with JWT tokens only (no persistent sessions)

### Option 3: Use Local MongoDB
Install MongoDB locally and use:
```env
MONGODB_URI=mongodb://localhost:27017/truffle
```

## Testing Steps

1. **Test MongoDB Connection:**
   ```bash
   npm run test-mongodb
   ```

2. **Test NextAuth Configuration:**
   ```bash
   npm run test-nextauth
   ```

3. **Run Full Diagnosis:**
   ```bash
   npm run diagnose
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Troubleshooting MongoDB Atlas

If using MongoDB Atlas and getting timeout errors:

1. **Check Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add your IP address or use `0.0.0.0/0` for testing

2. **Check Connection String:**
   - Verify username and password
   - Ensure database name is correct
   - Try adding `retryWrites=false` parameter

3. **Check Cluster Status:**
   - Ensure cluster is not paused
   - Verify cluster is in the correct region

4. **Test with MongoDB Compass:**
   - Try connecting with MongoDB Compass first
   - If Compass works, the issue is in the application

## Expected Behavior After Fix

- ✅ Google OAuth login should work
- ✅ Users will be created in database (if MongoDB is available)
- ✅ Fallback authentication works if MongoDB is unavailable
- ✅ JWT tokens are created for session management
- ✅ User data is properly stored and retrieved

## Files Modified

- `app/api/auth/[...nextauth]/route.js` - Enhanced error handling and fallbacks
- `scripts/test-mongodb-connection.js` - MongoDB connection tester
- `package.json` - Added test script

The authentication should now work even if MongoDB is temporarily unavailable, providing a much more robust user experience.
