const dbConnect = require('../lib/mongodb-cjs.js');
const mongoose = require('mongoose');

async function diagnoseAndFix() {
  console.log('🔍 Diagnosing application issues...\n');
  
  // 1. Check environment variables
  console.log('1. Checking environment variables:');
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_URL', 
    'NEXTAUTH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY'
  ];
  
  let envIssues = 0;
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar}: Set`);
    } else {
      console.log(`   ❌ ${envVar}: Missing`);
      envIssues++;
    }
  }
  
  if (envIssues > 0) {
    console.log('\n⚠️  Environment variables missing. Please create .env.local file with:');
    console.log('MONGODB_URI=mongodb://localhost:27017/truffle');
    console.log('MONGODB_DB=truffle');
    console.log('NEXTAUTH_URL=http://localhost:3000');
    console.log('NEXTAUTH_SECRET=your-secret-key-here');
    console.log('STRIPE_SECRET_KEY=your-stripe-secret-key');
    console.log('STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key');
    console.log('STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret');
  }
  
  // 2. Test database connection
  console.log('\n2. Testing database connection:');
  try {
    if (!process.env.MONGODB_URI) {
      console.log('   ❌ Cannot test database - MONGODB_URI not set');
    } else {
      await dbConnect();
      const db = mongoose.connection.db;
      console.log(`   ✅ Connected to database: ${db.databaseName}`);
      
      // 3. Check collections
      console.log('\n3. Checking database collections:');
      const collections = [
        'private_jets',
        'luxury_cars', 
        'super_cars',
        'helicopters',
        'yachts',
        'charter_flights',
        'users',
        'payments'
      ];
      
      for (const collectionName of collections) {
        try {
          const collection = db.collection(collectionName);
          const count = await collection.countDocuments();
          console.log(`   ✅ ${collectionName}: ${count} documents`);
        } catch (error) {
          console.log(`   ⚠️  ${collectionName}: Collection does not exist yet`);
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}`);
  }
  
  // 4. Test API endpoints
  console.log('\n4. Testing API endpoints:');
  const endpoints = [
    '/api/inventory/search',
    '/api/test-db',
    '/api/user/check-exists'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      if (response.ok) {
        console.log(`   ✅ ${endpoint}: Working`);
      } else {
        console.log(`   ❌ ${endpoint}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Diagnosis complete!');
  
  if (envIssues > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Create .env.local file with required environment variables');
    console.log('2. Restart the development server');
    console.log('3. Run this script again to verify fixes');
  }
}

diagnoseAndFix().catch(console.error);
