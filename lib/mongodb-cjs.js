const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  console.error('Please create a .env.local file with your MongoDB connection string');
  console.error('Example: MONGODB_URI=mongodb://localhost:27017/truffle');
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { client: null, promise: null };
}

async function dbConnect() {
  if (cached.client) {
    console.log('Using cached MongoDB client');
    return cached.client;
  }

  if (!cached.promise) {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    console.log('Database name:', MONGODB_DB || 'truffle');
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB || 'truffle', // Fallback to 'truffle' if not set
      serverSelectionTimeoutMS: 20000,
    });
  }

  try {
    cached.client = await cached.promise;
    console.log('Mongoose connected to database:', cached.client.connection.db.databaseName);
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.client;
}

module.exports = dbConnect;
module.exports.dbConnect = dbConnect;
