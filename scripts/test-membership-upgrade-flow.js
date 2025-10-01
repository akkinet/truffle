// Test membership upgrade flow for OAuth users
const fetch = require('node-fetch');

async function testMembershipUpgradeFlow() {
  console.log('🧪 Testing Membership Upgrade Flow for OAuth Users...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Test membership upgrade API with OAuth user data
  console.log('1. Testing membership upgrade API with OAuth user data:');
  try {
    const oauthUserData = {
      userId: 'oauth-user-123', // Simulated OAuth user ID
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
      console.log('   ✅ Membership upgrade API accepts OAuth user data');
      console.log(`   📝 Response: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log(`   ❌ Membership upgrade API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 2: Test with invalid userId (should still work)
  console.log('\n2. Testing membership upgrade API with invalid userId:');
  try {
    const invalidUserData = {
      userId: 'invalid-mongodb-id',
      membershipType: 'diamond',
      email: 'test-invalid@example.com',
      firstName: 'Jane',
      lastName: 'Smith'
    };
    
    const response = await fetch(`${baseUrl}/api/membership/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidUserData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Membership upgrade API handles invalid userId gracefully');
      console.log(`   📝 Response: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log(`   ❌ Membership upgrade API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 3: Test with missing userId (OAuth user without database record)
  console.log('\n3. Testing membership upgrade API with missing userId:');
  try {
    const missingUserData = {
      membershipType: 'platinum',
      email: 'test-missing@example.com',
      firstName: 'Bob',
      lastName: 'Johnson'
    };
    
    const response = await fetch(`${baseUrl}/api/membership/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(missingUserData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Membership upgrade API handles missing userId');
      console.log(`   📝 Response: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log(`   ❌ Membership upgrade API failed: ${response.status}`);
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  console.log('\n✅ Membership upgrade flow testing complete!');
  console.log('\n📝 Expected behavior:');
  console.log('- OAuth users should be able to upgrade membership');
  console.log('- Invalid userIds should not cause "Session expired" errors');
  console.log('- Missing userIds should be handled gracefully');
  console.log('- Users should be created in database after successful payment');
  
  console.log('\n🚀 Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Login with Google OAuth');
  console.log('3. Try to upgrade membership');
  console.log('4. Should work without "Session expired" errors');
}

testMembershipUpgradeFlow().catch(console.error);
