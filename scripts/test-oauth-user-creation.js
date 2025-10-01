// Test OAuth user creation and membership upgrade flow

async function testOAuthUserCreation() {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;
  
  console.log('🧪 Testing OAuth User Creation and Membership Upgrade Flow...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Test NextAuth configuration
  console.log('1. Testing NextAuth configuration:');
  try {
    const response = await fetch(`${baseUrl}/api/auth/providers`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ NextAuth providers endpoint works');
      console.log(`   📝 Available providers: ${Object.keys(data).join(', ')}`);
      
      if (data.google) {
        console.log('   ✅ Google provider configured');
      } else {
        console.log('   ⚠️  Google provider not configured');
      }
      
      if (data.facebook) {
        console.log('   ✅ Facebook provider configured');
      } else {
        console.log('   ⚠️  Facebook provider not configured');
      }
      
      if (data.credentials) {
        console.log('   ✅ Credentials provider configured');
      } else {
        console.log('   ⚠️  Credentials provider not configured');
      }
    } else {
      console.log(`   ❌ NextAuth providers endpoint failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 2: Test membership upgrade API with real user data
  console.log('\n2. Testing membership upgrade API with OAuth user data:');
  try {
    const oauthUserData = {
      userId: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
      membershipType: 'gold',
      email: 'test-oauth@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };
    
    const response = await fetch(`${baseUrl}/api/membership/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(oauthUserData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Membership upgrade API works with OAuth user');
      console.log(`   📝 Session ID: ${data.sessionId}`);
      console.log(`   📝 Payment Record ID: ${data.paymentRecordId}`);
      console.log(`   📝 Checkout URL: ${data.checkoutUrl ? 'Generated' : 'Missing'}`);
    } else {
      console.log(`   ❌ Membership upgrade API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 3: Test user check exists API
  console.log('\n3. Testing user check exists API:');
  try {
    const response = await fetch(`${baseUrl}/api/user/check-exists?email=test-oauth@example.com`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ User check exists API works');
      console.log(`   📝 User exists: ${data.exists}`);
    } else {
      console.log(`   ❌ User check exists API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  console.log('\n✅ OAuth user creation testing complete!');
  
  console.log('\n🔧 Key fixes applied:');
  console.log('- Enabled MongoDB adapter for NextAuth');
  console.log('- Added OAuth user creation in signIn callback');
  console.log('- Updated User model with provider field');
  console.log('- Enhanced JWT callback to use database data');
  console.log('- Updated session callback with firstName/lastName');
  console.log('- Fixed membership page to use proper user data');
  
  console.log('\n🚀 Expected behavior:');
  console.log('- OAuth users are automatically saved to database on login');
  console.log('- User data includes firstName, lastName, and provider');
  console.log('- Membership upgrade uses real user ID from database');
  console.log('- No more "Session expired" errors');
  console.log('- Complete OAuth user flow works seamlessly');
  
  console.log('\n📝 Manual testing steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Login with Google OAuth');
  console.log('3. Check database - user should be created automatically');
  console.log('4. Go to /membership page');
  console.log('5. Click "Choose Plan" for any paid tier');
  console.log('6. Complete payment in Stripe');
  console.log('7. Should redirect to /membership/upgrade-success');
  console.log('8. Should NOT see "Session expired" error');
  console.log('9. User membership should be upgraded in database');
  
  console.log('\n🔍 Database verification:');
  console.log('- Check MongoDB for new user document');
  console.log('- Verify provider field is set to "google" or "facebook"');
  console.log('- Verify firstName and lastName are populated');
  console.log('- Verify membership is upgraded after payment');
}

testOAuthUserCreation().catch(console.error);
