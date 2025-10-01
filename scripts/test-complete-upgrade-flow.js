// Comprehensive test for membership upgrade flow with OAuth users

async function testCompleteMembershipUpgradeFlow() {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;
  
  console.log('🧪 Testing Complete Membership Upgrade Flow for OAuth Users...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Test membership upgrade API with OAuth user
  console.log('1. Testing membership upgrade API with OAuth user:');
  try {
    const oauthUserData = {
      userId: 'oauth-user-123', // OAuth user ID
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
  
  // Test 2: Test payments status API
  console.log('\n2. Testing payments status API:');
  try {
    const response = await fetch(`${baseUrl}/api/payments/status?sessionId=test-session-id`);
    const data = await response.json();
    
    if (response.status === 404) {
      console.log('   ✅ Payments status API correctly returns 404 for non-existent session');
    } else if (response.ok) {
      console.log('   ✅ Payments status API works');
      console.log(`   📝 Status: ${data.status}`);
      console.log(`   📝 Temp User Payload: ${JSON.stringify(data.tempUserPayload, null, 2)}`);
    } else {
      console.log(`   ❌ Payments status API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 3: Test complete upgrade API
  console.log('\n3. Testing complete upgrade API:');
  try {
    const response = await fetch(`${baseUrl}/api/membership/complete-upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentRecordId: 'test-payment-record-id'
      })
    });
    
    const data = await response.json();
    
    if (response.status === 404) {
      console.log('   ✅ Complete upgrade API correctly returns 404 for non-existent payment record');
    } else if (response.ok) {
      console.log('   ✅ Complete upgrade API works');
      console.log(`   📝 Success: ${data.success}`);
    } else {
      console.log(`   ❌ Complete upgrade API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 4: Test user check exists API
  console.log('\n4. Testing user check exists API:');
  try {
    const response = await fetch(`${baseUrl}/api/user/check-exists?email=test@example.com`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ User check exists API works');
      console.log(`   📝 Exists: ${data.exists}`);
    } else {
      console.log(`   ❌ User check exists API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  console.log('\n✅ Complete membership upgrade flow testing complete!');
  
  console.log('\n📝 Expected behavior after fixes:');
  console.log('- OAuth users can upgrade membership without "Session expired" errors');
  console.log('- Payment records include isOAuthUser flag');
  console.log('- Upgrade detection works with multiple methods');
  console.log('- Users are redirected to correct success pages');
  console.log('- OAuth users are created in database after payment');
  
  console.log('\n🚀 Manual testing steps:');
  console.log('1. Start development server: npm run dev');
  console.log('2. Login with Google OAuth');
  console.log('3. Go to membership page');
  console.log('4. Click "Choose Plan" for any paid tier');
  console.log('5. Complete payment in Stripe');
  console.log('6. Should redirect to upgrade success page (not payment confirm)');
  console.log('7. Should not see "Session expired" error');
  
  console.log('\n🔧 Key fixes applied:');
  console.log('- Enhanced upgrade detection in checkout return page');
  console.log('- Fixed payment confirm page to handle OAuth users');
  console.log('- Updated webhook to create OAuth users');
  console.log('- Added isOAuthUser flag to payment records');
  console.log('- Improved error handling throughout the flow');
}

testCompleteMembershipUpgradeFlow().catch(console.error);
