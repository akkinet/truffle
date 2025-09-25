# Truffle Luxury Booking System

## Overview
A comprehensive luxury booking system that allows users to search and book various luxury experiences including private jets, yachts, luxury cars, and more. The system features real-time search functionality with advanced filtering options.

## Features

### 🔍 Advanced Search System
- **Multi-category Selection**: Choose from Private Jets, Luxury Yachts, Luxury Villas, Luxury Cars, Helicopters, and Supercars
- **Location-based Search**: Search by specific locations with autocomplete suggestions
- **Date Range Selection**: Select from and to dates for booking
- **Passenger Capacity**: Specify adults and kids count
- **Price Range Filtering**: Set minimum and maximum price ranges
- **Real-time Results**: Instant search results with live filtering

### 🎨 Modern UI/UX Design
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Elegant dark theme with glassmorphism effects
- **Interactive Components**: Smooth animations and hover effects
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Visual feedback during search operations

### 📊 Results Display
- **Grid Layout**: Clean card-based layout for results
- **Advanced Filtering**: Sidebar filters for category, price range, and sorting
- **Sorting Options**: Sort by price (low to high, high to low) and name (A-Z, Z-A)
- **Detailed Cards**: Each result shows key information including pricing, capacity, and location

### 🔧 Detailed View Modal
- **Comprehensive Information**: Complete details about each item
- **Tabbed Interface**: Organized information in Overview, Gallery, Amenities, and Specifications tabs
- **Image Gallery**: Multiple views including interior, exterior, and cockpit images
- **Amenities List**: Detailed amenities with pricing information
- **Technical Specifications**: Complete technical details and maintenance information

## Technical Architecture

### Backend API
- **RESTful API**: Clean API endpoints for search functionality
- **MongoDB Integration**: Direct connection to MongoDB Atlas
- **Advanced Querying**: Complex queries with filtering, sorting, and pagination
- **Error Handling**: Comprehensive error handling and validation

### Frontend Components
- **React Components**: Modular, reusable components
- **State Management**: Efficient state management with React hooks
- **API Integration**: Seamless integration with backend APIs
- **Image Optimization**: Next.js Image component for optimized loading

### Database Schema
The system uses MongoDB with the following collection structure:

```javascript
{
  id: String,                    // Unique identifier
  name: String,                  // Item name
  description: String,           // Detailed description
  category: String,              // Category (PrivateJet, LuxuryYacht, etc.)
  pricing: Number,              // Hourly rate
  location: String,             // Base location
  status: String,               // Availability status
  availability: Boolean,        // Available flag
  image: String,                // Main image URL
  fleetDetails: {               // Technical specifications
    registrationNo: String,
    seatCapacity: Number,
    maxSpeed: String,
    flyingRange: String,
    // ... more technical details
  },
  aircraftGallery: {            // Image galleries
    interior: Object,
    exterior: Object,
    cockpit: Object
  },
  additionalAmenities: Object,  // Amenities and services
  travelmodes: Object,          // Travel mode configurations
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### GET /api/inventory/search
Returns filter options for the search interface:
- Available categories
- Available locations
- Price range (min/max)

### POST /api/inventory/search
Performs inventory search with the following parameters:
- `categories`: Array of selected categories
- `location`: Search location
- `fromDate`: Start date
- `toDate`: End date
- `adults`: Number of adults
- `kids`: Number of kids
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `sortBy`: Sort field (pricing, name)
- `sortOrder`: Sort direction (asc, desc)

## Components Structure

### BookingSearch.jsx
Main search component with:
- Category selection checkboxes
- Location input with autocomplete
- Date range pickers
- Passenger count inputs
- Price range inputs
- Search submission handling

### SearchResults.jsx
Results display component with:
- Results grid layout
- Sidebar filters
- Sorting options
- Individual result cards
- Loading states
- Empty state handling

### ItemDetails.jsx
Detailed view modal with:
- Tabbed interface (Overview, Gallery, Amenities, Specifications)
- Image gallery with multiple views
- Comprehensive information display
- Booking action buttons

## Usage Instructions

1. **Search Process**:
   - Select one or more categories (Private Jets, Yachts, etc.)
   - Enter a location
   - Optionally set date range and passenger count
   - Optionally set price range
   - Click "Search Now"

2. **Filtering Results**:
   - Use sidebar filters to narrow down results
   - Sort results by price or name
   - Adjust price range dynamically

3. **Viewing Details**:
   - Click "View Details" on any result card
   - Browse through different tabs for comprehensive information
   - View image galleries and amenities

4. **Booking Process**:
   - Contact vendor or proceed with booking
   - All booking actions are handled through the detailed view

## Database Connection

The system connects to MongoDB Atlas using the provided connection string:
```
mongodb+srv://hexerve:hexerve@cluster0.zy7afj9.mongodb.net/
```

Database: `truffle-admin`
Collection: `inventory`

## Sample Data

The system includes sample data for testing:
- 2 Private Jets (Dassault Falcon 8X, Gulfstream G650ER)
- 1 Luxury Yacht (Luxury Yacht Serenity)
- 1 Luxury Car (Rolls-Royce Phantom)

Each item includes complete information including technical specifications, amenities, and image galleries.

## Performance Optimizations

- **Image Optimization**: Next.js Image component with lazy loading
- **API Caching**: Efficient MongoDB queries with proper indexing
- **Component Optimization**: React.memo and useMemo for performance
- **Responsive Images**: Multiple image sizes for different screen sizes
- **Pagination**: Limited results (50 items) for better performance

## Future Enhancements

- **User Authentication**: User accounts and booking history
- **Payment Integration**: Secure payment processing
- **Real-time Availability**: Live availability updates
- **Advanced Filters**: More sophisticated filtering options
- **Booking Management**: Complete booking workflow
- **Admin Panel**: Management interface for inventory
- **Mobile App**: Native mobile application
- **Multi-language Support**: Internationalization

## Dependencies

- **Next.js 14**: React framework
- **MongoDB**: Database
- **React Icons**: Icon library
- **React Toastify**: Notifications
- **Tailwind CSS**: Styling framework

## Getting Started

1. Install dependencies: `npm install`
2. Set up MongoDB connection
3. Run development server: `npm run dev`
4. Access the application at `http://localhost:3000`

The booking system is now fully functional with real-time search, advanced filtering, and comprehensive result display.
