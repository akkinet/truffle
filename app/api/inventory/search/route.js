import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

async function connectToDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);
  return { client, db };
}

export async function GET(request) {
  let client;
  try {
    const { db } = await connectToDatabase();
    
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Get user session to check membership
    const session = await getServerSession(authOptions);
    const userMembership = session?.user?.membership || 'free';
    const userEmail = session?.user?.email;
    
    // If user has free membership and is trying to search, return restriction message
    if (userMembership === 'free' && (searchParams.get('category') || searchParams.get('from') || searchParams.get('to'))) {
      return Response.json({
        success: false,
        error: 'free-tier-restriction',
        message: 'Free tier members cannot access search features. Please upgrade your membership.',
        upgradeUrl: '/membership'
      }, { status: 403 });
    }
    
    // Extract search parameters
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'price_per_hour';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // Dynamic parameters based on category
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const departure_date = searchParams.get('departure_date');
    const return_date = searchParams.get('return_date');
    const passengers = searchParams.get('passengers');
    const pickup_location = searchParams.get('pickup_location');
    const pickup_datetime = searchParams.get('pickup_datetime');
    const dropoff_datetime = searchParams.get('dropoff_datetime');
    const departure_marina = searchParams.get('departure_marina');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    
    // If no search parameters, return filter options
    if (!category) {
      const collections = ['private_jets', 'luxury_cars', 'super_cars', 'helicopters', 'yachts', 'charter_flights'];
      const allLocations = [];
      
      for (const collectionName of collections) {
        const collection = db.collection(collectionName);
        const items = await collection.find({}).toArray();
        
        items.forEach(item => {
          if (item.location?.address) {
            allLocations.push(item.location.address);
          }
          if (item.base_location?.address) {
            allLocations.push(item.base_location.address);
          }
          if (item.base_marina?.address) {
            allLocations.push(item.base_marina.address);
          }
          if (item.from?.address) {
            allLocations.push(item.from.address);
          }
          if (item.to?.address) {
            allLocations.push(item.to.address);
          }
        });
      }
      
      const uniqueLocations = [...new Set(allLocations)];
      
      return Response.json({
        success: true,
        data: {
          categories: collections,
          locations: uniqueLocations
        }
      });
    }
    
    // Get the appropriate collection
    let collection;
    switch (category) {
      case 'private_jets':
        collection = db.collection('private_jets');
        break;
      case 'luxury_cars':
        collection = db.collection('luxury_cars');
        break;
        case 'super_cars':
          collection = db.collection('super_cars');
        break;
      case 'helicopters':
        collection = db.collection('helicopters');
        break;
      case 'yachts':
        collection = db.collection('yachts');
        break;
      case 'charter_flights':
        collection = db.collection('charter_flights');
        break;
      default:
        return Response.json({
          success: false,
          error: 'Invalid category'
        }, { status: 400 });
    }
    
    // Build query based on category and parameters
    // let query = { available: true };
    let query = { availability: "available" };
    
    // Location-based searches
    if (category === 'private_jets') {
      if (from || to) {
        query.$or = [];
        if (from) {
          query.$or.push({ 'location.address': { $regex: from, $options: 'i' } });
          query.$or.push({ 'base_airport': { $regex: from, $options: 'i' } });
        }
        if (to) {
          query.$or.push({ 'location.address': { $regex: to, $options: 'i' } });
          query.$or.push({ 'base_airport': { $regex: to, $options: 'i' } });
        }
      }
    }
    
    if (category === 'helicopters') {
      if (from || to) {
        query.$or = [];
        if (from) {
          query.$or.push({ 'base_location.address': { $regex: from, $options: 'i' } });
        }
        if (to) {
          query.$or.push({ 'base_location.address': { $regex: to, $options: 'i' } });
        }
      }
    }
    
    if (category === 'charter_flights') {
      if (from || to) {
        query.$or = [];
        if (from) {
          query.$or.push({ 'from.address': { $regex: from, $options: 'i' } });
        }
        if (to) {
          query.$or.push({ 'to.address': { $regex: to, $options: 'i' } });
        }
      }
    }
    
    if (category === 'luxury_cars' || category === 'super_cars') {
      if (pickup_location) {
        query['location.address'] = { $regex: pickup_location, $options: 'i' };
      }
    }
    
    if (category === 'yachts') {
      if (departure_marina) {
        query['base_marina.address'] = { $regex: departure_marina, $options: 'i' };
      }
    }
    
    // Capacity filter
    if (passengers) {
      const passengerCount = parseInt(passengers);
      if (category === 'private_jets' || category === 'helicopters') {
        query.seats = { $gte: passengerCount };
      } else if (category === 'luxury_cars' || category === 'super_cars') {
        query.seats = { $gte: passengerCount };
      }
    }
    
    // Execute search
    let sortObj = {};
    if (category === 'private_jets' || category === 'helicopters') {
      sortObj.price_per_hour = sortOrder === 'asc' ? 1 : -1;
    } else if (category === 'luxury_cars' || category === 'super_cars') {
      sortObj.price_per_day = sortOrder === 'asc' ? 1 : -1;
    } else if (category === 'yachts') {
      sortObj.price_per_day = sortOrder === 'asc' ? 1 : -1;
    } else if (category === 'charter_flights') {
      sortObj.price = sortOrder === 'asc' ? 1 : -1;
    }
    
    const results = await collection.find(query).sort(sortObj).toArray();
    const count = results.length;
    
    return Response.json({
      success: true,
      count,
      data: results
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}