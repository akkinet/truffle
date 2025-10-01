// Test MongoDB connection and provide solutions
const mongoose = require('mongoose');

async function testMongoConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.log('❌ MONGODB_URI environment variable is not set');
    console.log('\n📝 Solutions:');
    console.log('1. Create .env.local file with:');
    console.log('   MONGODB_URI=mongodb://localhost:27017/truffle');
    console.log('2. Or use MongoDB Atlas with proper connection string');
    return;
  }
  
  console.log('🔗 Testing connection to:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
  
  try {
    // Test with shorter timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name).join(', ') || 'None');
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    
    console.log('\n🔧 Troubleshooting steps:');
    
    if (error.message.includes('ETIMEOUT')) {
      console.log('1. Network timeout detected:');
      console.log('   - Check your internet connection');
      console.log('   - Verify MongoDB Atlas cluster is running');
      console.log('   - Check if your IP is whitelisted in MongoDB Atlas');
      console.log('   - Try using a different network/VPN');
    }
    
    if (error.message.includes('authentication')) {
      console.log('2. Authentication error:');
      console.log('   - Check username and password in connection string');
      console.log('   - Verify database user permissions');
    }
    
    if (error.message.includes('cluster')) {
      console.log('3. Cluster connection issue:');
      console.log('   - Verify cluster URL is correct');
      console.log('   - Check if cluster is paused or deleted');
      console.log('   - Try connecting from MongoDB Compass first');
    }
    
    console.log('\n💡 Alternative solutions:');
    console.log('1. Use local MongoDB:');
    console.log('   MONGODB_URI=mongodb://localhost:27017/truffle');
    console.log('2. Use MongoDB Atlas with retryWrites=false:');
    console.log('   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/truffle?retryWrites=false');
    console.log('3. Disable MongoDB adapter temporarily:');
    console.log('   - Comment out the adapter line in NextAuth config');
    console.log('   - Authentication will work with JWT only');
  }
}

testMongoConnection().catch(console.error);
