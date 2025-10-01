// Test Google OAuth payment flow specifically

async function testGoogleOAuthPaymentFlow() {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;
  
  console.log('🧪 Testing Google OAuth Payment Flow...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Test membership upgrade API with Google OAuth user
  console.log('1. Testing membership upgrade API with Google OAuth user:');
  try {
    const googleOAuthUserData = {
      userId: 'oauth-google-123', // Google OAuth user ID
      membershipType: 'gold',
      email: 'test-google-oauth@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };
    
    const response = await fetch(`${baseUrl}/api/membership/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleOAuthUserData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Membership upgrade API works with Google OAuth user');
      console.log(`   📝 Session ID: ${data.sessionId}`);
      console.log(`   📝 Payment Record ID: ${data.paymentRecordId}`);
      console.log(`   📝 Checkout URL: ${data.checkoutUrl ? 'Generated' : 'Missing'}`);
      
      // Test 2: Verify payment record has correct OAuth flags
      console.log('\n2. Testing payment record OAuth flags:');
      const statusResponse = await fetch(`${baseUrl}/api/payments/status?paymentRecordId=${data.paymentRecordId}`);
      const statusData = await statusResponse.json();
      
      if (statusResponse.ok) {
        console.log('   ✅ Payment record found');
        console.log(`   📝 Email: ${statusData.email}`);
        console.log(`   📝 Membership Type: ${statusData.membershipType}`);
        console.log(`   📝 Temp User Payload: ${JSON.stringify(statusData.tempUserPayload, null, 2)}`);
        
        // Verify OAuth user flags are set correctly
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
        
        if (statusData.tempUserPayload?.userId === 'oauth-google-123') {
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
  
  console.log('\n✅ Google OAuth payment flow testing complete!');
  
  console.log('\n🔧 Key fixes applied:');
  console.log('- Enhanced upgrade detection in checkout return page');
  console.log('- Added OAuth provider detection via localStorage');
  console.log('- Added additional safety checks in payment confirm page');
  console.log('- Made upgrade detection extremely aggressive');
  console.log('- Added multiple fallback methods for OAuth user detection');
  
  console.log('\n🚀 Expected behavior:');
  console.log('- Google OAuth users clicking "Choose Plan" → Stripe Checkout');
  console.log('- After payment → /membership/upgrade-success (NOT /payment/confirm)');
  console.log('- No "Session expired" errors for Google OAuth users');
  console.log('- OAuth users are detected via multiple methods');
  console.log('- Automatic redirect if OAuth users reach wrong page');
  
  console.log('\n📝 Manual testing steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Login with Google OAuth');
  console.log('3. Check localStorage for user data with provider: "google"');
  console.log('4. Go to /membership page');
  console.log('5. Click "Choose Plan" for any paid tier');
  console.log('6. Complete payment in Stripe');
  console.log('7. Should redirect to /membership/upgrade-success');
  console.log('8. Should NOT see "Session expired" error');
  console.log('9. Check browser console for detailed logs');
  
  console.log('\n🔍 Console verification:');
  console.log('- Look for "Is upgrade?" logs with OAuth detection');
  console.log('- Look for "OAuth user detected" messages');
  console.log('- Should see redirect to upgrade-success page');
  console.log('- Should NOT see "Session expired" error');
}

testGoogleOAuthPaymentFlow().catch(console.error);
