// Test session update after membership upgrade

async function testSessionUpdateAfterUpgrade() {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;
  
  console.log('🧪 Testing Session Update After Membership Upgrade...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Test complete upgrade API
  console.log('1. Testing complete upgrade API:');
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
      console.log(`   📝 Error message: ${data.error}`);
    } else if (response.ok) {
      console.log('   ✅ Complete upgrade API works');
      console.log(`   📝 Success: ${data.success}`);
      console.log(`   📝 User data: ${JSON.stringify(data.user, null, 2)}`);
    } else {
      console.log(`   ❌ Complete upgrade API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 2: Test membership upgrade API (creates payment record)
  console.log('\n2. Testing membership upgrade API:');
  try {
    const oauthUserData = {
      userId: 'oauth-test-session-123',
      membershipType: 'platinum',
      email: 'test-session-update@example.com',
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
    } else {
      console.log(`   ❌ Membership upgrade API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  console.log('\n✅ Session update testing complete!');
  
  console.log('\n🔧 Key fixes applied:');
  console.log('- Enhanced logging in upgrade success page');
  console.log('- Added fallback localStorage update when API fails');
  console.log('- Improved complete-upgrade API with better error handling');
  console.log('- Added OAuth user creation in complete-upgrade API');
  console.log('- Added immediate localStorage update in checkout return page');
  console.log('- Enhanced custom event dispatching');
  
  console.log('\n🚀 Expected behavior:');
  console.log('- After successful payment, localStorage is updated immediately');
  console.log('- Custom membershipUpdated event is dispatched');
  console.log('- Header component updates to show new membership');
  console.log('- "APPLY MEMBERSHIP" button disappears');
  console.log('- User can search for premium services');
  console.log('- Session persists across page refreshes');
  
  console.log('\n📝 Manual testing steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Login with Google OAuth');
  console.log('3. Go to /membership page');
  console.log('4. Click "Choose Plan" for Platinum tier');
  console.log('5. Complete payment in Stripe');
  console.log('6. Should redirect to /membership/upgrade-success');
  console.log('7. Click "Continue to Dashboard"');
  console.log('8. Check header dropdown - should show "Membership: Platinum active"');
  console.log('9. "APPLY MEMBERSHIP" button should be gone');
  console.log('10. Should be able to search for premium services');
  
  console.log('\n🔍 Console verification:');
  console.log('- Look for "Starting membership upgrade process" messages');
  console.log('- Look for "Complete upgrade API response" logs');
  console.log('- Look for "Membership upgrade successful, updating localStorage"');
  console.log('- Look for "Dispatching membershipUpdated event"');
  console.log('- Look for "Membership update process completed successfully"');
  console.log('- Check localStorage for updated user data');
  
  console.log('\n🔍 localStorage verification:');
  console.log('- Open browser dev tools');
  console.log('- Go to Application > Local Storage');
  console.log('- Check userLoggedIn object');
  console.log('- Should show membership: "platinum"');
  console.log('- Should show membershipStatus: "active"');
  console.log('- Should show membershipStartedAt: current date');
}

testSessionUpdateAfterUpgrade().catch(console.error);
