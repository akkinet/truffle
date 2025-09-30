"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaFilter, FaSort, FaStar, FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaEye, FaChevronDown, FaChevronUp, FaTimes, FaChevronLeft, FaChevronRight, FaClock, FaWifi, FaCoffee, FaMusic, FaUtensils, FaSwimmingPool, FaCar, FaPlane, FaShip, FaHome, FaHelicopter } from "react-icons/fa";

export default function SearchResults({ results, loading, onItemClick }) {
  const [filteredResults, setFilteredResults] = useState(results);
  const [sortBy, setSortBy] = useState('pricing');
  const [sortOrder, setSortOrder] = useState('asc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    price: true,
    amenities: false,
    location: false
  });

  useEffect(() => {
    setFilteredResults(results);
    if (results.length > 0) {
      const prices = results.map(r => r.price_per_hour || r.price_per_day || r.price || 0);
      setPriceRange({
        min: Math.min(...prices),
        max: Math.max(...prices)
      });
    }
  }, [results]);

  const categories = [...new Set(results.map(r => r.category).filter(Boolean))];
  const locations = [...new Set(results.map(r => r.location?.address || r.base_airport || r.base_location?.address || r.base_marina?.address || r.from?.address).filter(Boolean))];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const applyFilters = () => {
    let filtered = [...results];

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => selectedCategories.includes(item.category));
    }

    // Price filter
    filtered = filtered.filter(item => {
      const price = item.price_per_hour || item.price_per_day || item.price || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'pricing' || sortBy === 'price_per_hour' || sortBy === 'price_per_day' || sortBy === 'price') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    setFilteredResults(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedCategories, priceRange, sortBy, sortOrder, results]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category]
    );
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'private_jets': return FaPlane;
      case 'yachts': return FaShip;
      case 'luxury_cars': return FaCar;
      case 'super_cars': return FaCar;
      case 'helicopters': return FaHelicopter;
      case 'charter_flights': return FaPlane;
      default: return FaStar;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'private_jets': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'yachts': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'luxury_cars': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'super_cars': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'helicopters': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'charter_flights': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getAmenityIcon = (amenity) => {
    if (amenity.includes('WiFi') || amenity.includes('Wi-Fi')) return FaWifi;
    if (amenity.includes('Coffee') || amenity.includes('Catering')) return FaCoffee;
    if (amenity.includes('Music') || amenity.includes('Entertainment')) return FaMusic;
    if (amenity.includes('Pool') || amenity.includes('Jacuzzi')) return FaSwimmingPool;
    if (amenity.includes('Chef') || amenity.includes('Food')) return FaUtensils;
    return FaStar;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <span className="ml-4 text-white">Searching luxury options...</span>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-[10%] py-8 bg-gradient-to-b from-[#110400] to-[#0C0300] min-h-screen">
      {/* Results Header */}
      <div className="bg-[#110003]/[0.44] border border-white/25 backdrop-blur-[8.9px] rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-maleh font-light text-white mb-1">
              Luxury Options ({filteredResults.length})
            </h2>
            <p className="text-white/60 text-sm">Refine your search to find the perfect luxury experience</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition text-sm"
            >
              <FaFilter />
              Filters
            </button>
            <div className="flex items-center gap-2">
              <FaSort className="text-white/60 text-sm" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="bg-white/10 border border-white/25 text-white px-3 py-2 rounded text-sm outline-none focus:ring-2 focus:ring-white/25"
              >
                <option value="pricing-asc">Price: Low to High</option>
                <option value="pricing-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Enhanced Filters Sidebar */}
        <div className={`w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-[#110003]/[0.44] border border-white/25 backdrop-blur-[8.9px] rounded-lg p-6 sticky top-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">Filters</h3>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange({ min: 0, max: 10000 });
                }}
                className="text-white/60 hover:text-white text-sm px-3 py-1 rounded-md hover:bg-white/10 transition"
              >
                Clear All
              </button>
            </div>
            
            {/* Enhanced Category Filter */}
            <div className="mb-6">
              <button
                onClick={() => toggleFilterSection('category')}
                className="flex justify-between items-center w-full text-left text-base font-medium text-white mb-3 p-2 rounded-md hover:bg-white/5 transition"
              >
                <span>Service Type</span>
                {expandedFilters.category ? <FaChevronUp className="text-white/60 text-sm" /> : <FaChevronDown className="text-white/60 text-sm" />}
              </button>
              {expandedFilters.category && (
                <div className="space-y-2">
                  {categories.map(category => {
                    const IconComponent = getCategoryIcon(category);
                    return (
                      <label key={category} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-white/5 transition">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="rounded border-white/25 bg-transparent text-white focus:ring-white/25 w-4 h-4"
                        />
                        <IconComponent className="text-white/60 text-sm" />
                        <span className="text-white/80 text-sm">
                          {category ? category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Category'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Enhanced Price Range Filter */}
            <div className="mb-6">
              <button
                onClick={() => toggleFilterSection('price')}
                className="flex justify-between items-center w-full text-left text-base font-medium text-white mb-3 p-2 rounded-md hover:bg-white/5 transition"
              >
                <span>Price Range</span>
                {expandedFilters.price ? <FaChevronUp className="text-white/60 text-sm" /> : <FaChevronDown className="text-white/60 text-sm" />}
              </button>
              {expandedFilters.price && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-white/60 mb-1">Min Price</label>
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-white/25 rounded-md text-sm bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/25 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-white/60 mb-1">Max Price</label>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
                        className="w-full px-3 py-2 border border-white/25 rounded-md text-sm bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/25 outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-white/70 bg-white/5 px-3 py-2 rounded-md">
                    {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Location Filter */}
            <div className="mb-6">
              <button
                onClick={() => toggleFilterSection('location')}
                className="flex justify-between items-center w-full text-left text-base font-medium text-white mb-3 p-2 rounded-md hover:bg-white/5 transition"
              >
                <span>Location</span>
                {expandedFilters.location ? <FaChevronUp className="text-white/60 text-sm" /> : <FaChevronDown className="text-white/60 text-sm" />}
              </button>
              {expandedFilters.location && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {locations.map(location => (
                    <div key={location} className="flex items-center gap-2 text-white/70 text-sm p-2 rounded-md hover:bg-white/5 transition">
                      <FaMapMarkerAlt className="text-white/50 text-sm" />
                      <span className="truncate">{location}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1">
          {filteredResults.length === 0 ? (
            <div className="bg-[#110003]/[0.44] border border-white/25 backdrop-blur-[8.9px] rounded-lg p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
              <p className="text-white/60 mb-4 text-sm">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange({ min: 0, max: 10000 });
                }}
                className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 transition text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredResults.map((item) => (
                <ItemCard key={item._id || item.id} item={item} onItemClick={onItemClick} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Item Card Component with Detailed Information
function ItemCard({ item, onItemClick }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const getAllImages = (item) => {
    const images = [];
    if (item.images && Array.isArray(item.images)) {
      // Filter out problematic URLs
      const validImages = item.images.filter(url => {
        // Skip grok.com URLs that are known to fail
        if (url.includes('assets.grok.com')) {
          console.log('Skipping problematic grok.com URL:', url);
          return false;
        }
        return true;
      });
      images.push(...validImages);
    }
    if (item.image && !item.image.includes('assets.grok.com')) {
      images.push(item.image);
    }
    if (item.aircraftGallery?.exterior) {
      Object.values(item.aircraftGallery.exterior).forEach(url => {
        if (!url.includes('assets.grok.com')) {
          images.push(url);
        }
      });
    }
    if (item.aircraftGallery?.interior) {
      Object.values(item.aircraftGallery.interior).forEach(url => {
        if (!url.includes('assets.grok.com')) {
          images.push(url);
        }
      });
    }
    return images.length > 0 ? images : ['/Hero1.png'];
  };

  const images = getAllImages(item);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getLocationDisplay = (item) => {
    return item.location?.address || 
           item.base_airport || 
           item.base_location?.address || 
           item.base_marina?.address || 
           item.from?.address || 
           'Location not specified';
  };

  const getCapacityDisplay = (item) => {
    return item.capacity || item.seats || item.fleetDetails?.seatCapacity || 'N/A';
  };

  const getPriceDisplay = (item) => {
    const price = item.price_per_hour || item.price_per_day || item.price || 0;
    const unit = item.price_per_hour ? 'per hour' : item.price_per_day ? 'per day' : 'per trip';
    return { price, unit };
  };

  const getCategorySpecificDetails = (item) => {
    const details = [];
    
    if (item.category === 'private_jets' || item.category === 'charter_flights') {
      if (item.range_km) details.push({ label: 'Range', value: `${item.range_km.toLocaleString()} km` });
      if (item.model) details.push({ label: 'Model', value: item.model });
      if (item.manufacturer) details.push({ label: 'Manufacturer', value: item.manufacturer });
    }
    
    if (item.category === 'luxury_cars' || item.category === 'super_cars') {
      if (item.make) details.push({ label: 'Make', value: item.make });
      if (item.model) details.push({ label: 'Model', value: item.model });
      if (item.transmission) details.push({ label: 'Transmission', value: item.transmission });
      if (item.horsepower) details.push({ label: 'Horsepower', value: `${item.horsepower} HP` });
      if (item.capacity) details.push({ label: 'Capacity', value: `${item.capacity} passengers` });
      if (item.features && item.features.length > 0) {
        details.push({ label: 'Key Features', value: item.features.slice(0, 2).join(', ') });
      }
    }
    
    if (item.category === 'helicopters') {
      if (item.range_km) details.push({ label: 'Range', value: `${item.range_km} km` });
      if (item.model) details.push({ label: 'Model', value: item.model });
    }
    
    if (item.category === 'yachts') {
      if (item.length_m) details.push({ label: 'Length', value: `${item.length_m}m` });
      if (item.cabins) details.push({ label: 'Cabins', value: item.cabins });
    }
    
    if (item.category === 'charter_flights') {
      if (item.aircraft_type) details.push({ label: 'Aircraft Type', value: item.aircraft_type });
      if (item.flight_number) details.push({ label: 'Flight Number', value: item.flight_number });
    }
    
    return details;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'private_jets': return FaPlane;
      case 'yachts': return FaShip;
      case 'luxury_cars': return FaCar;
      case 'super_cars': return FaCar;
      case 'helicopters': return FaHelicopter;
      case 'charter_flights': return FaPlane;
      default: return FaStar;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'private_jets': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'yachts': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'luxury_cars': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'super_cars': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'helicopters': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'charter_flights': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getAmenityIcon = (amenity) => {
    if (amenity.includes('WiFi') || amenity.includes('Wi-Fi')) return FaWifi;
    if (amenity.includes('Coffee') || amenity.includes('Catering')) return FaCoffee;
    if (amenity.includes('Music') || amenity.includes('Entertainment')) return FaMusic;
    if (amenity.includes('Pool') || amenity.includes('Jacuzzi')) return FaSwimmingPool;
    if (amenity.includes('Chef') || amenity.includes('Food')) return FaUtensils;
    return FaStar;
  };

  const CategoryIcon = getCategoryIcon(item.category);

  const categoryDetails = getCategorySpecificDetails(item);
  const priceInfo = getPriceDisplay(item);

  return (
    <div className="bg-[#110003]/[0.44] border border-white/25 backdrop-blur-[8.9px] rounded-lg overflow-hidden hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl">
      {/* Image Slider */}
      <div className="relative h-64 w-full">
        <Image
          src={images[currentImageIndex]}
          alt={item.name}
          fill
          className="object-cover"
          unoptimized={images[currentImageIndex]?.includes('assets.grok.com')}
          onError={(e) => {
            console.log('Image failed to load:', images[currentImageIndex]);
            e.target.src = '/Hero1.png';
          }}
        />
        
        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition text-xs"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition text-xs"
            >
              <FaChevronRight />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentImageIndex + 1}/{images.length}
            </div>
          </>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getCategoryColor(item.category)}`}>
            <CategoryIcon className="text-xs" />
            {item.category ? item.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Category'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {item.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="font-maleh text-xl font-light text-white mb-2">{item.name}</h3>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{item.description}</p>
        </div>
        
        {/* Key Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <FaMapMarkerAlt className="text-xs text-white/60" />
            <span className="truncate">{getLocationDisplay(item)}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <FaUsers className="text-xs text-white/60" />
            <span>{getCapacityDisplay(item)} passengers</span>
          </div>
          
          {/* Category-specific details */}
          {categoryDetails.slice(0, 2).map((detail, index) => (
            <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
              <span className="text-xs text-white/60">📋</span>
              <span>{detail.label}: {detail.value}</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 4).map((tag, index) => (
                <span key={index} className="bg-white/10 px-2 py-1 rounded text-xs text-white/70">
                  {tag}
                </span>
              ))}
              {item.tags.length > 4 && (
                <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/70">
                  +{item.tags.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Features/Amenities Preview */}
        {(item.features && item.features.length > 0) || (item.additionalAmenities && Object.keys(item.additionalAmenities).length > 0) ? (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-white/80 mb-2">Key Features</h4>
            <div className="flex flex-wrap gap-2">
              {/* Show features for luxury cars */}
              {item.features && item.features.slice(0, 3).map((feature, index) => {
                const AmenityIcon = getAmenityIcon(feature);
                return (
                  <div key={index} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs text-white/70">
                    <AmenityIcon className="text-xs" />
                    <span>{feature}</span>
                  </div>
                );
              })}
              {/* Show additional amenities for other categories */}
              {!item.features && item.additionalAmenities && Object.keys(item.additionalAmenities).slice(0, 3).map((amenity, index) => {
                const AmenityIcon = getAmenityIcon(amenity);
                return (
                  <div key={index} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs text-white/70">
                    <AmenityIcon className="text-xs" />
                    <span>{amenity}</span>
                  </div>
                );
              })}
              {/* Show more count */}
              {((item.features && item.features.length > 3) || (!item.features && item.additionalAmenities && Object.keys(item.additionalAmenities).length > 3)) && (
                <div className="bg-white/10 px-2 py-1 rounded text-xs text-white/70">
                  +{(item.features ? item.features.length : Object.keys(item.additionalAmenities).length) - 3} more
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Price and Action */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div>
            <p className="text-white font-semibold text-2xl">{formatPrice(priceInfo.price)}</p>
            <p className="text-white/60 text-sm">{priceInfo.unit}</p>
          </div>
          <button 
            onClick={() => onItemClick(item)}
            className="bg-white/10 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/20 transition flex items-center gap-2"
          >
            <FaEye className="text-xs" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}