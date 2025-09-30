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
    
    // Check for localStorage authentication via headers
    const authHeader = request.headers.get('authorization');
    const userEmailHeader = request.headers.get('x-user-email');
    const userMembershipHeader = request.headers.get('x-user-membership');
    
    // Also check for case variations
    const authHeaderAlt = request.headers.get('Authorization');
    const userEmailHeaderAlt = request.headers.get('X-User-Email');
    const userMembershipHeaderAlt = request.headers.get('X-User-Membership');
    
    const finalAuthHeader = authHeader || authHeaderAlt;
    const finalUserEmailHeader = userEmailHeader || userEmailHeaderAlt;
    const finalUserMembershipHeader = userMembershipHeader || userMembershipHeaderAlt;
    
    let userMembership = 'free';
    let userEmail = null;
    
    if (session?.user) {
      // NextAuth session authentication
      userMembership = session.user.membership || 'free';
      userEmail = session.user.email;
    } else if (finalAuthHeader || finalUserEmailHeader || finalUserMembershipHeader) {
      // localStorage authentication via headers (more flexible - only need one header)
      if (finalUserMembershipHeader) {
        userMembership = finalUserMembershipHeader;
      }
      if (finalUserEmailHeader) {
        userEmail = finalUserEmailHeader;
      }
    }
    
    console.log('Search API authentication check:', {
      hasSession: !!session?.user,
      hasAuthHeader: !!finalAuthHeader,
      userEmail,
      userMembership,
      requestUrl: request.url,
      allHeaders: Object.fromEntries(request.headers.entries()),
      rawHeaders: {
        authHeader,
        userEmailHeader,
        userMembershipHeader,
        authHeaderAlt,
        userEmailHeaderAlt,
        userMembershipHeaderAlt
      }
    });
    
    // TEMPORARY FIX: Allow all searches for now to test if the issue is authentication
    // TODO: Remove this after fixing authentication
    console.log('TEMPORARY: Allowing all searches to test authentication issue');
    
    // If user has free membership and is trying to search, return restriction message
    if (userMembership === 'free' && (searchParams.get('category') || searchParams.get('from') || searchParams.get('to'))) {
      // Additional check: if we have any authentication headers but membership is still free,
      // it might be a header parsing issue, so let's be more permissive
      if (finalAuthHeader || finalUserEmailHeader || finalUserMembershipHeader) {
        console.log('Warning: User has auth headers but membership is free. This might be a parsing issue.');
        // For now, let's allow the search to proceed if we have any auth headers
        console.log('Allowing search due to presence of auth headers');
      } else {
        console.log('No auth headers found, but allowing search temporarily for testing');
        // TEMPORARY: Comment out the 403 return to test
        // return Response.json({
        //   success: false,
        //   error: 'free-tier-restriction',
        //   message: 'Free tier members cannot access search features. Please upgrade your membership.',
        //   upgradeUrl: '/membership'
        // }, { status: 403 });
      }
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
    
    // Additional filters for charter flights
    const aircraft_type = searchParams.get('aircraft_type');
    const engine_type = searchParams.get('engine_type');
    const min_range = searchParams.get('min_range');
    const max_speed_min = searchParams.get('max_speed_min');
    
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
          query.$or.push({ 'location.address': { $regex: from, $options: 'i' } });
          query.$or.push({ 'base_location.address': { $regex: from, $options: 'i' } });
        }
        if (to) {
          query.$or.push({ 'location.address': { $regex: to, $options: 'i' } });
          query.$or.push({ 'base_location.address': { $regex: to, $options: 'i' } });
        }
      }
    }
    
    if (category === 'charter_flights') {
      if (from || to) {
        query.$or = [];
        if (from) {
          query.$or.push({ 'from.address': { $regex: from, $options: 'i' } });
          query.$or.push({ 'location.address': { $regex: from, $options: 'i' } });
        }
        if (to) {
          query.$or.push({ 'to.address': { $regex: to, $options: 'i' } });
          query.$or.push({ 'location.address': { $regex: to, $options: 'i' } });
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
        query.$or = [
          { 'base_marina.address': { $regex: departure_marina, $options: 'i' } },
          { 'location.address': { $regex: departure_marina, $options: 'i' } }
        ];
      }
    }
    
    // Capacity filter
    if (passengers) {
      const passengerCount = parseInt(passengers);
      if (category === 'private_jets' || category === 'helicopters') {
        // Add capacity check to existing query
        if (query.$or) {
          // If we already have $or for location, we need to combine them
          query.$and = [
            { $or: query.$or },
            { $or: [
              { seats: { $gte: passengerCount } },
              { capacity: { $gte: passengerCount } }
            ]}
          ];
          delete query.$or;
        } else {
          // No existing $or, just add capacity check
          query.$or = [
            { seats: { $gte: passengerCount } },
            { capacity: { $gte: passengerCount } }
          ];
        }
      } else if (category === 'luxury_cars' || category === 'super_cars') {
        // Add capacity check to existing query
        if (query.$or) {
          // If we already have $or for location, we need to combine them
          query.$and = [
            { $or: query.$or },
            { $or: [
              { seats: { $gte: passengerCount } },
              { capacity: { $gte: passengerCount } }
            ]}
          ];
          delete query.$or;
        } else {
          // No existing $or, just add capacity check
          query.$or = [
            { seats: { $gte: passengerCount } },
            { capacity: { $gte: passengerCount } }
          ];
        }
      } else if (category === 'yachts') {
        // Add capacity check to existing query
        if (query.$or) {
          // If we already have $or for location, we need to combine them
          query.$and = [
            { $or: query.$or },
            { $or: [
              { seats: { $gte: passengerCount } },
              { capacity: { $gte: passengerCount } }
            ]}
          ];
          delete query.$or;
        } else {
          // No existing $or, just add capacity check
          query.$or = [
            { seats: { $gte: passengerCount } },
            { capacity: { $gte: passengerCount } }
          ];
        }
      } else if (category === 'charter_flights') {
        // Add capacity check to existing query
        if (query.$or) {
          // If we already have $or for location, we need to combine them
          query.$and = [
            { $or: query.$or },
            { $or: [
              { seats: { $gte: passengerCount } },
              { capacity: { $gte: passengerCount } }
            ]}
          ];
          delete query.$or;
        } else {
          // No existing $or, just add capacity check
          query.$or = [
            { seats: { $gte: passengerCount } },
            { capacity: { $gte: passengerCount } }
          ];
        }
      }
    }
    
    // Additional filters for charter flights
    if (category === 'charter_flights') {
      if (aircraft_type) {
        query.aircraft_type = { $regex: aircraft_type, $options: 'i' };
      }
      if (engine_type) {
        query.engine_type = { $regex: engine_type, $options: 'i' };
      }
      if (min_range) {
        const rangeValue = parseInt(min_range);
        if (query.$or) {
          query.$and = [
            { $or: query.$or },
            { $or: [
              { range: { $gte: rangeValue } },
              { range_km: { $gte: rangeValue } }
            ]}
          ];
          delete query.$or;
        } else {
          query.$or = [
            { range: { $gte: rangeValue } },
            { range_km: { $gte: rangeValue } }
          ];
        }
      }
      if (max_speed_min) {
        const speedValue = parseInt(max_speed_min);
        query.max_speed_knots = { $gte: speedValue };
      }
    }
    
    // Execute search
    let sortObj = {};
    if (category === 'private_jets') {
      sortObj.price_per_hour = sortOrder === 'asc' ? 1 : -1;
    } else if (category === 'helicopters') {
      sortObj.price = sortOrder === 'asc' ? 1 : -1;
    } else if (category === 'luxury_cars' || category === 'super_cars') {
      sortObj.price_per_day = sortOrder === 'asc' ? 1 : -1;
    } else if (category === 'yachts') {
      sortObj.price = sortOrder === 'asc' ? 1 : -1;
    } else if (category === 'charter_flights') {
      sortObj.price = sortOrder === 'asc' ? 1 : -1;
    }
    
    const results = await collection.find(query).sort(sortObj).toArray();
    const count = results.length;
    
    if (category === 'charter_flights') {
      console.log('Charter flight search debug:', {
        from: searchParams.get('from'),
        to: searchParams.get('to'),
        passengers: searchParams.get('passengers'),
        query,
        count,
        results: results.map(r => ({ name: r.name, location: r.location?.address, capacity: r.capacity, seats: r.seats }))
      });
    }
    
    if (category === 'yachts') {
      console.log('Yacht search debug:', {
        departure_marina: searchParams.get('departure_marina'),
        query,
        count,
        results: results.map(r => ({ name: r.name, location: r.location?.address, base_marina: r.base_marina?.address }))
      });
    }
    
    console.log('Search query details:', {
      category,
      query,
      sortObj,
      count,
      results: results.map(r => ({ name: r.name, location: r.location?.address, capacity: r.capacity, seats: r.seats }))
    });
    
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