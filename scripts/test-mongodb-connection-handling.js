// Test MongoDB connection handling and OAuth fallback

async function testMongoDBConnectionHandling() {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;
  
  console.log('🧪 Testing MongoDB Connection Handling and OAuth Fallback...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Test NextAuth configuration with MongoDB issues
  console.log('1. Testing NextAuth configuration:');
  try {
    const response = await fetch(`${baseUrl}/api/auth/providers`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ NextAuth providers endpoint works');
      console.log(`   📝 Available providers: ${Object.keys(data).join(', ')}`);
    } else {
      console.log(`   ❌ NextAuth providers endpoint failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 2: Test OAuth callback handling
  console.log('\n2. Testing OAuth callback handling:');
  try {
    // This will test the OAuth callback without actually completing OAuth
    const response = await fetch(`${baseUrl}/api/auth/callback/google?error=test`);
    const data = await response.text();
    
    if (response.status === 302 || response.status === 200) {
      console.log('   ✅ OAuth callback endpoint responds correctly');
      console.log(`   📝 Response status: ${response.status}`);
    } else {
      console.log(`   ❌ OAuth callback endpoint failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 3: Test membership upgrade with OAuth user (JWT-only mode)
  console.log('\n3. Testing membership upgrade with OAuth user (JWT-only mode):');
  try {
    const oauthUserData = {
      userId: 'oauth-1234567890', // JWT-only OAuth user ID
      membershipType: 'gold',
      email: 'test-oauth-jwt@example.com',
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
      console.log('   ✅ Membership upgrade API works with JWT-only OAuth user');
      console.log(`   📝 Session ID: ${data.sessionId}`);
      console.log(`   📝 Payment Record ID: ${data.paymentRecordId}`);
    } else {
      console.log(`   ❌ Membership upgrade API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  console.log('\n✅ MongoDB connection handling testing complete!');
  
  console.log('\n🔧 Key fixes applied:');
  console.log('- Added MongoDB connection timeout handling (5 seconds)');
  console.log('- Implemented fallback to JWT-only mode when MongoDB unavailable');
  console.log('- Enhanced OAuth user handling for both DB and JWT-only modes');
  console.log('- Added proper error handling and logging');
  console.log('- Maintained backward compatibility with existing functionality');
  
  console.log('\n🚀 Expected behavior:');
  console.log('- MongoDB connection timeout errors are handled gracefully');
  console.log('- OAuth users can still login when MongoDB is unavailable');
  console.log('- JWT-only mode works seamlessly for OAuth users');
  console.log('- Membership upgrades work in both DB and JWT-only modes');
  console.log('- No more unhandled promise rejections');
  
  console.log('\n📝 Manual testing steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Check console for MongoDB connection status');
  console.log('3. If MongoDB unavailable, should see "JWT-only mode" messages');
  console.log('4. Login with Google OAuth - should work regardless of DB status');
  console.log('5. Test membership upgrade - should work in both modes');
  console.log('6. No more timeout errors in console');
  
  console.log('\n🔍 Console verification:');
  console.log('- Look for "MongoDB connection failed" messages (expected)');
  console.log('- Look for "JWT-only mode" messages (expected when DB unavailable)');
  console.log('- Should NOT see unhandled promise rejections');
  console.log('- Should NOT see timeout errors blocking OAuth');
}

testMongoDBConnectionHandling().catch(console.error);
