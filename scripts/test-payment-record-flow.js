// Test payment record creation and retrieval

async function testPaymentRecordFlow() {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;
  
  console.log('🧪 Testing Payment Record Creation and Retrieval...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Test membership upgrade API (creates payment record)
  console.log('1. Testing membership upgrade API (payment record creation):');
  try {
    const oauthUserData = {
      userId: 'oauth-test-123',
      membershipType: 'gold',
      email: 'test-payment-record@example.com',
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
      console.log('   ✅ Membership upgrade API works');
      console.log(`   📝 Session ID: ${data.sessionId}`);
      console.log(`   📝 Payment Record ID: ${data.paymentRecordId}`);
      console.log(`   📝 Checkout URL: ${data.checkoutUrl ? 'Generated' : 'Missing'}`);
      
      // Test 2: Test payment record retrieval by paymentRecordId
      console.log('\n2. Testing payment record retrieval by paymentRecordId:');
      const statusResponse1 = await fetch(`${baseUrl}/api/payments/status?paymentRecordId=${data.paymentRecordId}`);
      const statusData1 = await statusResponse1.json();
      
      if (statusResponse1.ok) {
        console.log('   ✅ Payment record found by paymentRecordId');
        console.log(`   📝 Status: ${statusData1.status}`);
        console.log(`   📝 Email: ${statusData1.email}`);
        console.log(`   📝 Membership Type: ${statusData1.membershipType}`);
        console.log(`   📝 Temp User Payload: ${JSON.stringify(statusData1.tempUserPayload, null, 2)}`);
      } else {
        console.log(`   ❌ Payment record not found by paymentRecordId: ${statusResponse1.status}`);
        console.log(`   📝 Error: ${JSON.stringify(statusData1, null, 2)}`);
      }
      
      // Test 3: Test payment record retrieval by sessionId
      console.log('\n3. Testing payment record retrieval by sessionId:');
      const statusResponse2 = await fetch(`${baseUrl}/api/payments/status?sessionId=${data.sessionId}`);
      const statusData2 = await statusResponse2.json();
      
      if (statusResponse2.ok) {
        console.log('   ✅ Payment record found by sessionId');
        console.log(`   📝 Status: ${statusData2.status}`);
        console.log(`   📝 Email: ${statusData2.email}`);
        console.log(`   📝 Membership Type: ${statusData2.membershipType}`);
      } else {
        console.log(`   ❌ Payment record not found by sessionId: ${statusResponse2.status}`);
        console.log(`   📝 Error: ${JSON.stringify(statusData2, null, 2)}`);
      }
      
    } else {
      console.log(`   ❌ Membership upgrade API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 4: Test payment record not found scenario
  console.log('\n4. Testing payment record not found scenario:');
  try {
    const response = await fetch(`${baseUrl}/api/payments/status?sessionId=non-existent-session-id`);
    const data = await response.json();
    
    if (response.status === 404) {
      console.log('   ✅ Payment record not found correctly returns 404');
      console.log(`   📝 Error message: ${data.error}`);
    } else {
      console.log(`   ❌ Expected 404 but got: ${response.status}`);
      console.log(`   📝 Response: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  console.log('\n✅ Payment record flow testing complete!');
  
  console.log('\n🔧 Key fixes applied:');
  console.log('- Added error handling for payment record creation');
  console.log('- Added detailed logging for payment record operations');
  console.log('- Added fallback mechanism for payment record not found');
  console.log('- Enhanced error messages and debugging information');
  console.log('- Added Stripe direct check fallback');
  
  console.log('\n🚀 Expected behavior:');
  console.log('- Payment records are created successfully');
  console.log('- Payment records can be retrieved by sessionId or paymentRecordId');
  console.log('- Proper error handling when payment records are not found');
  console.log('- Fallback to Stripe direct check when database is unavailable');
  console.log('- Detailed logging for debugging payment issues');
  
  console.log('\n📝 Manual testing steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Login with Google OAuth');
  console.log('3. Go to /membership page');
  console.log('4. Click "Choose Plan" for any paid tier');
  console.log('5. Complete payment in Stripe');
  console.log('6. Should redirect to /membership/upgrade-success');
  console.log('7. Check console for payment record creation logs');
  console.log('8. Should NOT see "Payment record not found" error');
  
  console.log('\n🔍 Console verification:');
  console.log('- Look for "Payment record saved successfully" messages');
  console.log('- Look for "Payment record updated with sessionId" messages');
  console.log('- Look for "Payment record found" messages');
  console.log('- Should NOT see "Payment record not found" errors');
}

testPaymentRecordFlow().catch(console.error);
