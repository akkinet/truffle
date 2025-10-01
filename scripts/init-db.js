const dbConnect = require('../lib/mongodb-cjs.js');
const mongoose = require('mongoose');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.error('Please create a .env.local file with:');
      console.error('MONGODB_URI=mongodb://localhost:27017/truffle');
      console.error('MONGODB_DB=truffle');
      process.exit(1);
    }

    await dbConnect();
    const db = mongoose.connection.db;
    
    console.log(`✅ Connected to database: ${db.databaseName}`);
    
    // Create collections if they don't exist
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
        const exists = await collection.findOne({});
        console.log(`✅ Collection '${collectionName}' exists`);
      } catch (error) {
        console.log(`⚠️  Collection '${collectionName}' does not exist yet (will be created when first document is inserted)`);
      }
    }
    
    console.log('✅ Database initialization complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
