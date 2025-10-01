// Test script to verify API endpoint improvements
const fetch = require('node-fetch');

async function testAPIEndpoints() {
  console.log('🧪 Testing API endpoint improvements...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Inventory search without environment variables
  console.log('1. Testing /api/inventory/search (should return helpful error message):');
  try {
    const response = await fetch(`${baseUrl}/api/inventory/search`);
    const data = await response.json();
    
    if (response.status === 500 && data.error === 'Database configuration missing') {
      console.log('   ✅ Correctly returns helpful error message for missing MONGODB_URI');
      console.log(`   📝 Message: ${data.message}`);
    } else {
      console.log(`   ❌ Unexpected response: ${response.status} - ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  // Test 2: Test database endpoint
  console.log('\n2. Testing /api/test-db:');
  try {
    const response = await fetch(`${baseUrl}/api/test-db?email=test@example.com`);
    const data = await response.json();
    
    if (response.status === 500 && data.error) {
      console.log('   ✅ Correctly handles database connection errors');
      console.log(`   📝 Error: ${data.error}`);
    } else {
      console.log(`   ❌ Unexpected response: ${response.status} - ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Server not running or connection failed: ${error.message}`);
  }
  
  console.log('\n✅ API endpoint testing complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Create .env.local file with MONGODB_URI');
  console.log('2. Start MongoDB if using local installation');
  console.log('3. Run "npm run dev" to start the server');
  console.log('4. Test the endpoints again');
}

testAPIEndpoints().catch(console.error);
