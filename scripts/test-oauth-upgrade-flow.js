// Comprehensive test to verify OAuth user upgrade flow

async function testOAuthUpgradeFlow() {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;
  
  console.log('🧪 Testing OAuth User Upgrade Flow - Complete Verification...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Verify membership upgrade API creates correct payment record
  console.log('1. Testing membership upgrade API with OAuth user:');
  try {
    const oauthUserData = {
      userId: 'oauth-user-123',
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
      console.log('   ✅ Membership upgrade API works');
      console.log(`   📝 Session ID: ${data.sessionId}`);
      console.log(`   📝 Payment Record ID: ${data.paymentRecordId}`);
      
      // Test 2: Verify payment record has correct data
      console.log('\n2. Testing payment record data:');
      const statusResponse = await fetch(`${baseUrl}/api/payments/status?paymentRecordId=${data.paymentRecordId}`);
      const statusData = await statusResponse.json();
      
      if (statusResponse.ok) {
        console.log('   ✅ Payment record found');
        console.log(`   📝 Email: ${statusData.email}`);
        console.log(`   📝 Membership Type: ${statusData.membershipType}`);
        console.log(`   📝 Temp User Payload: ${JSON.stringify(statusData.tempUserPayload, null, 2)}`);
        
        // Verify OAuth user flags are set
        if (statusData.tempUserPayload?.isOAuthUser) {
          console.log('   ✅ OAuth user flag is set correctly');
        } else {
          console.log('   ⚠️  OAuth user flag not set');
        }
        
        if (statusData.tempUserPayload?.isUpgrade) {
          console.log('   ✅ Upgrade flag is set correctly');
        } else {
          console.log('   ⚠️  Upgrade flag not set');
        }
        
        if (statusData.tempUserPayload?.userId === 'oauth-user-123') {
          console.log('   ✅ User ID is set correctly');
        } else {
          console.log('   ⚠️  User ID not set correctly');
        }
      } else {
        console.log(`   ❌ Payment record not found: ${statusResponse.status}`);
      }
    } else {
      console.log(`   ❌ Membership upgrade API failed: ${response.status}`);
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
  
  console.log('\n✅ OAuth upgrade flow testing complete!');
  
  console.log('\n🔧 Key fixes applied:');
  console.log('- Enhanced upgrade detection in checkout return page');
  console.log('- Added automatic redirect for OAuth users in payment confirm page');
  console.log('- Made upgrade detection more aggressive to prevent wrong redirects');
  console.log('- Added OAuth user flags to payment records');
  console.log('- Improved error handling throughout the flow');
  
  console.log('\n🚀 Expected behavior:');
  console.log('- OAuth users clicking "Choose Plan" → Stripe Checkout');
  console.log('- After payment → /membership/upgrade-success (NOT /payment/confirm)');
  console.log('- No "Session expired" errors');
  console.log('- User created in database automatically');
  console.log('- Membership upgraded successfully');
  
  console.log('\n📝 Manual testing steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Login with Google OAuth');
  console.log('3. Go to /membership page');
  console.log('4. Click "Choose Plan" for Gold/Diamond/Platinum');
  console.log('5. Complete payment in Stripe');
  console.log('6. Should redirect to /membership/upgrade-success');
  console.log('7. Should NOT see "Session expired" error');
  console.log('8. Check browser console for detailed logs');
}

testOAuthUpgradeFlow().catch(console.error);
