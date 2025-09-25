"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

const GooglePlacesAutocomplete = ({ 
  value, 
  onChange, 
  placeholder, 
  className = "",
  required = false 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Load Google Places API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCfYSioz6pci4v1ryvRId9DniB_z4xNh-A&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        console.log('Google Places API loaded');
      };
    }
  }, []);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce API calls
    debounceRef.current = setTimeout(() => {
      searchPlaces(inputValue);
    }, 300);
  };

  const searchPlaces = async (query) => {
    if (!window.google || !window.google.maps) {
      console.log('Google Maps API not loaded yet');
      return;
    }

    setIsLoading(true);
    
    try {
      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions({
        input: query,
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'in' } // Restrict to India
      }, (predictions, status) => {
        setIsLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.slice(0, 5)); // Limit to 5 suggestions
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } catch (error) {
      console.error('Error searching places:', error);
      setIsLoading(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);

    // Get place details for lat/lng
    if (window.google && window.google.maps) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      service.getDetails({
        placeId: suggestion.place_id,
        fields: ['formatted_address', 'geometry', 'place_id']
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          // Store place details in a custom event or state
          const event = new CustomEvent('placeSelected', {
            detail: {
              formatted_address: place.formatted_address,
              place_id: place.place_id,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          });
          window.dispatchEvent(event);
        }
      });
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2 bg-white/10 border border-white/25 rounded-lg text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white/25 focus:border-transparent outline-none transition-all ${className}`}
          required={required}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/60"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="dropdown-suggestions absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-white/60 text-xs mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </div>
                  {suggestion.structured_formatting?.secondary_text && (
                    <div className="text-white/60 text-xs truncate mt-1">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;
