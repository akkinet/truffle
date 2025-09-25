"use client";

import React, { useState, useEffect } from "react";
import { FaSearch, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaPlane, FaShip, FaHome, FaCar, FaHelicopter } from "react-icons/fa";
import { toast } from 'react-toastify';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

const categoryOptions = [
  { value: "private_jets", label: "Private Jets", icon: FaPlane },
  { value: "luxury_cars", label: "Luxury Cars", icon: FaCar },
  { value: "super_cars", label: "Super Cars", icon: FaCar },
  { value: "helicopters", label: "Helicopters", icon: FaHelicopter },
  { value: "yachts", label: "Yachts", icon: FaShip },
  { value: "charter_flights", label: "Charter Flights", icon: FaPlane }
];


export default function BookingSearch({ onSearchResults, onLoading, userMembership = 'free', isLoggedIn = false, onShowMembershipModal }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({});
  const [availableLocations, setAvailableLocations] = useState([]);
  const [placeDetails, setPlaceDetails] = useState({});

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Reset form data when category changes
  useEffect(() => {
    setFormData({});
  }, [selectedCategory]);

  // Listen for place selection events
  useEffect(() => {
    const handlePlaceSelected = (event) => {
      const { formatted_address, place_id, lat, lng } = event.detail;
      setPlaceDetails(prev => ({
        ...prev,
        [event.target.name]: { formatted_address, place_id, lat, lng }
      }));
    };

    window.addEventListener('placeSelected', handlePlaceSelected);
    return () => window.removeEventListener('placeSelected', handlePlaceSelected);
  }, []);

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/inventory/search');
      const data = await response.json();
      
      if (data.success) {
        setAvailableLocations(data.data.locations);
      }
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    // Validate required fields based on category
    let requiredFields = [];
    if (selectedCategory === 'private_jets' || selectedCategory === 'charter_flights') {
      requiredFields = ['from', 'to', 'departure_date'];
    } else if (selectedCategory === 'luxury_cars' || selectedCategory === 'super_cars') {
      requiredFields = ['pickup_location', 'pickup_datetime'];
    } else if (selectedCategory === 'helicopters') {
      requiredFields = ['from', 'to', 'departure_date'];
    } else if (selectedCategory === 'yachts') {
      requiredFields = ['departure_marina', 'start_date'];
    }

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    onLoading(true);

    try {
      // Create URL parameters
      const params = new URLSearchParams();
      params.append('category', selectedCategory);
      
      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      // Make GET request with URL parameters
      const response = await fetch(`/api/inventory/search?${params.toString()}`);

      const data = await response.json();

      if (data.success) {
        onSearchResults(data.data);
        toast.success(`Found ${data.count} results`);
      } else {
        toast.error(data.error || 'Search failed');
        onSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      onSearchResults([]);
    } finally {
      onLoading(false);
    }
  };

  const renderInputFields = () => {
    if (!selectedCategory) return null;

    switch (selectedCategory) {
      case 'private_jets':
      case 'charter_flights':
        return (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* From */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">From</label>
              <GooglePlacesAutocomplete
                value={formData.from || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, from: value }))}
                placeholder="From Airport"
                required
              />
            </div>

            {/* To */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">To</label>
              <GooglePlacesAutocomplete
                value={formData.to || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, to: value }))}
                placeholder="To Airport"
                required
              />
            </div>

            {/* Departure Date */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">Departure Date</label>
              <div className="relative input-with-icon">
                <FaCalendarAlt className="icon" />
                <input
                  type="date"
                  name="departure_date"
                  value={formData.departure_date || ''}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/25 rounded-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Return Date */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">Return Date</label>
              <div className="relative input-with-icon">
                <FaCalendarAlt className="icon" />
                <input
                  type="date"
                  name="return_date"
                  value={formData.return_date || ''}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/25 rounded-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">Passengers</label>
              <div className="relative input-with-icon">
                <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm" />
                <input
                  type="number"
                  name="passengers"
                  placeholder="No. of Passengers"
                  value={formData.passengers || ''}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full bg-white/10 border border-white/25 rounded-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        );

      case 'luxury_cars':
      case 'super_cars':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pickup Location */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">Pickup Location</label>
              <GooglePlacesAutocomplete
                value={formData.pickup_location || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, pickup_location: value }))}
                placeholder="Pickup Address"
                required
              />
            </div>

            {/* Pickup Date & Time */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">Pickup Date & Time</label>
              <div className="relative input-with-icon">
                <FaCalendarAlt className="icon" />
                <input
                  type="datetime-local"
                  name="pickup_datetime"
                  value={formData.pickup_datetime || ''}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/25 rounded-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Dropoff Date & Time */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">Dropoff Date & Time</label>
              <div className="relative input-with-icon">
                <FaCalendarAlt className="icon" />
                <input
                  type="datetime-local"
                  name="dropoff_datetime"
                  value={formData.dropoff_datetime || ''}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/25 rounded-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        );

      case 'helicopters':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* From */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">From</label>
              <GooglePlacesAutocomplete
                value={formData.from || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, from: value }))}
                placeholder="From Heliport"
                required
              />
            </div>

            {/* To */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">To</label>
              <GooglePlacesAutocomplete
                value={formData.to || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, to: value }))}
                placeholder="To Heliport"
                required
              />
            </div>

            {/* Departure Date */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">Departure Date</label>
              <div className="relative input-with-icon">
                <FaCalendarAlt className="icon" />
                <input
                  type="date"
                  name="departure_date"
                  value={formData.departure_date || ''}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/25 rounded-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">Passengers</label>
              <div className="relative input-with-icon">
                <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm" />
                <input
                  type="number"
                  name="passengers"
                  placeholder="No. of Passengers"
                  value={formData.passengers || ''}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full bg-white/10 border border-white/25 rounded-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        );

      case 'yachts':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Departure Marina */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">Departure Marina</label>
              <GooglePlacesAutocomplete
                value={formData.departure_marina || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, departure_marina: value }))}
                placeholder="Marina Location"
                required
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">Start Date</label>
              <div className="relative input-with-icon">
                <FaCalendarAlt className="icon" />
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date || ''}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/25 rounded-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/80">End Date</label>
              <div className="relative input-with-icon">
                <FaCalendarAlt className="icon" />
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date || ''}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/25 rounded-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="lg:mx-[13%] bg-[#110003]/[0.44] border border-white border-opacity-25 backdrop-blur-[8.9px] text-white font-nexa mb-[5%] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#261612] to-[#110400] px-6 py-4 border-b border-white/25">
        <h2 className="text-xl font-maleh font-light text-white mb-1">Book Your Luxury Experience</h2>
        <p className="text-white/60 text-sm">Discover premium travel options tailored to your needs</p>
      </div>

      {/* Category Selection - Radio Style */}
      <div className="px-6 py-4 bg-[#110003]/[0.44] border-b border-white/25">
        <h3 className="text-sm font-medium text-white mb-3">Select Service Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedCategory === option.value;
            return (
              <div
                key={option.value}
                onClick={() => handleCategoryChange(option.value)}
                className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                <IconComponent className={`text-lg mb-1 ${isSelected ? 'text-white' : 'text-white/60'}`} />
                <span className="text-xs font-medium text-center">{option.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Search Form */}
      {selectedCategory && (
        <form onSubmit={handleSearch} className="px-6 py-4">
          {renderInputFields()}

          {/* Search Button or Membership Restriction */}
          <div className="flex justify-center mt-6">
            {!isLoggedIn ? (
              <button 
                type="button"
                onClick={() => {
                  // Show modal for anonymous users
                  if (onShowMembershipModal) {
                    onShowMembershipModal(true);
                  }
                }}
                className="bg-gradient-to-r from-white to-white/90 text-black px-8 py-3 rounded-lg font-semibold text-sm hover:from-white/90 hover:to-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaSearch className="inline mr-2" />
                Search Luxury Options
              </button>
            ) : userMembership === 'free' ? (
              <div className="text-center">
                <p className="text-white/60 text-sm mb-3">
                  You are a free tier member — purchase membership to unlock search features
                </p>
                <a
                  href="/membership"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-3 rounded-lg font-semibold text-sm hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Upgrade Membership
                </a>
              </div>
            ) : (
              <button 
                type="submit"
                className="bg-gradient-to-r from-white to-white/90 text-black px-8 py-3 rounded-lg font-semibold text-sm hover:from-white/90 hover:to-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaSearch className="inline mr-2" />
                Search Luxury Options
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}