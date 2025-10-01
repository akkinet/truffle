"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaTimes, FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaPlane, FaBed, FaCoffee, FaMusic, FaStar, FaChevronLeft, FaChevronRight, FaPhone, FaEnvelope, FaCheck } from "react-icons/fa";

export default function ItemDetails({ item, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!item) return null;

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaStar },
    { id: 'gallery', label: 'Gallery', icon: FaPlane },
    { id: 'amenities', label: 'Amenities', icon: FaCoffee },
    { id: 'specifications', label: 'Specifications', icon: FaUsers }
  ];

  const getAllImages = () => {
    const images = [];
    if (item.images && Array.isArray(item.images)) {
      // Filter out problematic URLs
      const validImages = item.images.filter(url => {
        // Skip grok.com URLs that are known to fail
        if (url.includes('assets.grok.com')) {
          console.log('Skipping problematic grok.com URL in ItemDetails:', url);
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

  const images = getAllImages();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'private_jets': return '✈️';
      case 'yachts': return '🛥️';
      case 'luxury_villas': return '🏡';
      case 'luxury_cars': return '🚗';
      case 'super_cars': return '🏎️';
      case 'helicopters': return '🚁';
      case 'charter_flights': return '✈️';
      default: return '✨';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'private_jets': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'yachts': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'luxury_villas': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'luxury_cars': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'super_cars': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'helicopters': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'charter_flights': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-maleh font-light text-white mb-3">Key Features</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                <FaMapMarkerAlt className="text-white text-xs" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Location</div>
                <div className="text-xs text-white/60">{item.location?.address || item.base_airport || item.base_location?.address || item.base_marina?.address || item.from?.address || 'Location not specified'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                <FaUsers className="text-white text-xs" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Capacity</div>
                <div className="text-xs text-white/60">{item.capacity || item.seats || item.fleetDetails?.seatCapacity || 'N/A'} passengers</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⚡</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Max Speed</div>
                <div className="text-xs text-white/60">
                  {item.max_speed || item.max_speed_knots || item.fleetDetails?.maxSpeed || 'N/A'} 
                  {item.category === 'yachts' ? ' knots' : 
                   item.category === 'luxury_cars' || item.category === 'super_cars' ? ' km/h' : ' knots'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📏</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Range</div>
                <div className="text-xs text-white/60">
                  {item.range || item.range_km || item.fleetDetails?.flyingRange || 'N/A'}
                  {item.category === 'charter_flights' || item.category === 'private_jets' || item.category === 'helicopters' || item.category === 'luxury_cars' || item.category === 'super_cars' ? ' km' : ''}
                </div>
              </div>
            </div>
            
            {/* Private Jet specific fields */}
            {(item.category === 'private_jets') && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✈️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Manufacturer & Model</div>
                    <div className="text-xs text-white/60">{item.manufacturer || 'N/A'} {item.model || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🏢</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Base Airport</div>
                    <div className="text-xs text-white/60">{item.base_airport || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🏷️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Registration</div>
                    <div className="text-xs text-white/60">{item.registration_no || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔧</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Engine Type</div>
                    <div className="text-xs text-white/60">{item.engine_type || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📐</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Cabin Height</div>
                    <div className="text-xs text-white/60">{item.cabin_height || 'N/A'} ft</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Rating</div>
                    <div className="text-xs text-white/60">{item.rating ? `${item.rating}/5 ⭐` : 'N/A'}</div>
                  </div>
                </div>
              </>
            )}
            {/* Charter Flight specific fields */}
            {item.category === 'charter_flights' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✈️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Aircraft Type</div>
                    <div className="text-xs text-white/60">{item.aircraft_type || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔢</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Flight Number</div>
                    <div className="text-xs text-white/60">{item.flight_number || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🏷️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Registration</div>
                    <div className="text-xs text-white/60">{item.registration_no || 'N/A'}</div>
                  </div>
                </div>
              </>
            )}
            {/* Helicopter specific fields */}
            {item.category === 'helicopters' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🚁</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Model</div>
                    <div className="text-xs text-white/60">{item.model || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🏷️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Registration</div>
                    <div className="text-xs text-white/60">{item.registration_no || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔧</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Engine Type</div>
                    <div className="text-xs text-white/60">{item.engine_type || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📐</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Cabin Height</div>
                    <div className="text-xs text-white/60">{item.cabin_height || 'N/A'} ft</div>
                  </div>
                </div>
              </>
            )}
            
            {/* Yacht specific fields */}
            {(item.category === 'yachts') && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🛥️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Length & Cabins</div>
                    <div className="text-xs text-white/60">{item.length_m ? `${item.length_m}m` : 'N/A'} • {item.cabins ? `${item.cabins} cabins` : 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🏢</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Base Marina</div>
                    <div className="text-xs text-white/60">{item.base_marina?.address || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🏷️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Registration</div>
                    <div className="text-xs text-white/60">{item.registration_no || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔧</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Engine Type</div>
                    <div className="text-xs text-white/60">{item.engine_type || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📐</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Cabin Height</div>
                    <div className="text-xs text-white/60">{item.cabin_height ? `${item.cabin_height} ft` : 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Rating</div>
                    <div className="text-xs text-white/60">{item.rating ? `${item.rating}/5 ⭐` : 'N/A'}</div>
                  </div>
                </div>
              </>
            )}
            
            {/* Luxury Car specific fields */}
            {(item.category === 'luxury_cars' || item.category === 'super_cars') && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🚗</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Make & Model</div>
                    <div className="text-xs text-white/60">{item.make || 'N/A'} {item.model || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⚙️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Transmission</div>
                    <div className="text-xs text-white/60">{item.transmission || 'N/A'}</div>
                  </div>
                </div>
                {item.horsepower && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">⚡</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Horsepower</div>
                      <div className="text-xs text-white/60">{item.horsepower} HP</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Rating</div>
                    <div className="text-xs text-white/60">{item.rating ? `${item.rating}/5 ⭐` : 'N/A'}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-maleh font-light text-white mb-3">Availability & Pricing</h3>
          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">
                {item.category === 'luxury_cars' || item.category === 'super_cars' ? 'Daily Rate' : 'Hourly Rate'}
              </span>
              <span className="text-xl font-bold text-white">{formatPrice(item.price_per_hour || item.price_per_day || item.price || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                (item.available !== false && item.availability !== 'unavailable') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {(item.available !== false && item.availability !== 'unavailable') ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Last Maintenance</span>
              <span className="text-white text-sm">{formatDate(item.last_maintenance || item.fleetDetails?.lastMaintenance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Insurance Expiry</span>
              <span className="text-white text-sm">{formatDate(item.insurance_expiry || item.fleetDetails?.insuranceExpiry)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-maleh font-light text-white mb-3">Description</h3>
        <p className="text-white/70 leading-relaxed text-sm">{item.description}</p>
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative">
        <div className="relative h-80 w-full rounded-lg overflow-hidden">
          <Image
            src={images[currentImageIndex] || '/Hero1.png'}
            alt={`${item.name} - Image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
            unoptimized={images[currentImageIndex]?.includes('assets.grok.com')}
            onError={(e) => {
              console.log('Image failed to load in ItemDetails:', images[currentImageIndex]);
              e.target.src = '/Hero1.png';
            }}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                <FaChevronRight />
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="text-center mt-2 text-sm text-white/60">
            {currentImageIndex + 1} of {images.length}
          </div>
        )}
      </div>
      
      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative h-16 rounded-lg overflow-hidden cursor-pointer transition-all ${
                currentImageIndex === index ? 'ring-2 ring-white/50' : 'hover:opacity-80'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                unoptimized={image?.includes('assets.grok.com')}
                onError={(e) => {
                  console.log('Thumbnail image failed to load:', image);
                  e.target.src = '/Hero1.png';
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAmenities = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Show features for luxury cars */}
        {item.features && item.features.map((feature, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✨</span>
              </div>
              <span className="font-medium text-white text-sm">{feature}</span>
            </div>
            <div className="text-xs text-white/60">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                Included
              </span>
            </div>
          </div>
        ))}
        
        {/* Show additional amenities for other categories */}
        {item.additionalAmenities && Object.entries(item.additionalAmenities).map(([amenity, details]) => (
          <div key={amenity} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                {amenity.includes('Coffee') && <FaCoffee className="text-white text-xs" />}
                {amenity.includes('Music') && <FaMusic className="text-white text-xs" />}
                {amenity.includes('Interior') && <FaStar className="text-white text-xs" />}
                {amenity.includes('Hostess') && <FaUsers className="text-white text-xs" />}
                {amenity.includes('Chef') && <span className="text-white text-xs">👨‍🍳</span>}
                {amenity.includes('WiFi') && <span className="text-white text-xs">📶</span>}
                {amenity.includes('Pool') && <span className="text-white text-xs">🏊</span>}
                {amenity.includes('Spa') && <span className="text-white text-xs">🧘</span>}
                {!amenity.includes('Coffee') && !amenity.includes('Music') && !amenity.includes('Interior') && !amenity.includes('Hostess') && !amenity.includes('Chef') && !amenity.includes('WiFi') && !amenity.includes('Pool') && !amenity.includes('Spa') && <FaStar className="text-white text-xs" />}
              </div>
              <span className="font-medium text-white text-sm">{amenity}</span>
            </div>
            <div className="space-y-1 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  details.value === 'free' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'
                }`}>
                  {details.value === 'free' ? 'Included' : 'Additional Cost'}
                </span>
              </div>
              {details.name && <div>Contact: {details.name}</div>}
              {details.phone && <div className="flex items-center gap-1"><FaPhone className="text-xs" /> {details.phone}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpecifications = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-maleh font-light text-white mb-3">Technical Specifications</h3>
          <div className="space-y-2">
            {/* Luxury Car specific fields */}
            {item.category === 'luxury_cars' || item.category === 'super_cars' ? (
              <>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Make</span>
                  <span className="font-medium text-white text-sm">{item.make || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Model</span>
                  <span className="font-medium text-white text-sm">{item.model || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Transmission</span>
                  <span className="font-medium text-white text-sm">{item.transmission || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Seats</span>
                  <span className="font-medium text-white text-sm">{item.seats || item.capacity || 'N/A'} passengers</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Max Speed</span>
                  <span className="font-medium text-white text-sm">{item.max_speed ? `${item.max_speed} km/h` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Range</span>
                  <span className="font-medium text-white text-sm">{item.range ? `${item.range} km` : 'N/A'}</span>
                </div>
                {item.horsepower && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-white/60 text-sm">Horsepower</span>
                    <span className="font-medium text-white text-sm">{item.horsepower} HP</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Price per Day</span>
                  <span className="font-medium text-white text-sm">{item.price_per_day ? formatPrice(item.price_per_day) : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Rating</span>
                  <span className="font-medium text-white text-sm">{item.rating ? `${item.rating}/5 ⭐` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Availability</span>
                  <span className={`font-medium text-sm ${(item.available !== false && item.availability !== 'unavailable') ? 'text-green-300' : 'text-red-300'}`}>
                    {(item.available !== false && item.availability !== 'unavailable') ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Currency</span>
                  <span className="font-medium text-white text-sm">{item.currency || 'USD'}</span>
                </div>
              </>
            ) : item.category === 'private_jets' ? (
              <>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Manufacturer</span>
                  <span className="font-medium text-white text-sm">{item.manufacturer || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Model</span>
                  <span className="font-medium text-white text-sm">{item.model || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Registration</span>
                  <span className="font-medium text-white text-sm">{item.registration_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Seats</span>
                  <span className="font-medium text-white text-sm">{item.seats || item.capacity || 'N/A'} passengers</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Max Speed</span>
                  <span className="font-medium text-white text-sm">{item.max_speed ? `${item.max_speed} knots` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Range</span>
                  <span className="font-medium text-white text-sm">{item.range || item.range_km ? `${(item.range || item.range_km).toLocaleString()} km` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Base Airport</span>
                  <span className="font-medium text-white text-sm">{item.base_airport || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Engine Type</span>
                  <span className="font-medium text-white text-sm">{item.engine_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Cabin Height</span>
                  <span className="font-medium text-white text-sm">{item.cabin_height ? `${item.cabin_height} ft` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Price per Hour</span>
                  <span className="font-medium text-white text-sm">{item.price_per_hour ? formatPrice(item.price_per_hour) : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Rating</span>
                  <span className="font-medium text-white text-sm">{item.rating ? `${item.rating}/5 ⭐` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Availability</span>
                  <span className={`font-medium text-sm ${(item.available !== false && item.availability !== 'unavailable') ? 'text-green-300' : 'text-red-300'}`}>
                    {(item.available !== false && item.availability !== 'unavailable') ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Currency</span>
                  <span className="font-medium text-white text-sm">{item.currency || 'USD'}</span>
                </div>
              </>
            ) : item.category === 'yachts' ? (
              <>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Length</span>
                  <span className="font-medium text-white text-sm">{item.length_m ? `${item.length_m}m` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Cabins</span>
                  <span className="font-medium text-white text-sm">{item.cabins ? `${item.cabins} cabins` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Max Speed</span>
                  <span className="font-medium text-white text-sm">{item.max_speed ? `${item.max_speed} knots` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Range</span>
                  <span className="font-medium text-white text-sm">{item.range ? `${item.range} km` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Base Marina</span>
                  <span className="font-medium text-white text-sm">{item.base_marina?.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Registration</span>
                  <span className="font-medium text-white text-sm">{item.registration_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Engine Type</span>
                  <span className="font-medium text-white text-sm">{item.engine_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Cabin Height</span>
                  <span className="font-medium text-white text-sm">{item.cabin_height ? `${item.cabin_height} ft` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Price per Day</span>
                  <span className="font-medium text-white text-sm">{item.price_per_day ? formatPrice(item.price_per_day) : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Rating</span>
                  <span className="font-medium text-white text-sm">{item.rating ? `${item.rating}/5 ⭐` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Availability</span>
                  <span className={`font-medium text-sm ${(item.available !== false && item.availability !== 'unavailable') ? 'text-green-300' : 'text-red-300'}`}>
                    {(item.available !== false && item.availability !== 'unavailable') ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Currency</span>
                  <span className="font-medium text-white text-sm">{item.currency || 'USD'}</span>
                </div>
              </>
            ) : item.category === 'charter_flights' ? (
              <>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Aircraft Type</span>
                  <span className="font-medium text-white text-sm">{item.aircraft_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Flight Number</span>
                  <span className="font-medium text-white text-sm">{item.flight_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Registration</span>
                  <span className="font-medium text-white text-sm">{item.registration_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Capacity</span>
                  <span className="font-medium text-white text-sm">{item.capacity || item.seats || 'N/A'} passengers</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Max Speed</span>
                  <span className="font-medium text-white text-sm">{item.max_speed_knots || 'N/A'} knots</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Range</span>
                  <span className="font-medium text-white text-sm">{item.range || item.range_km || 'N/A'} km</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Engine Type</span>
                  <span className="font-medium text-white text-sm">{item.engine_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Cabin Height</span>
                  <span className="font-medium text-white text-sm">{item.cabin_height || 'N/A'} ft</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Availability</span>
                  <span className={`font-medium text-sm ${item.available ? 'text-green-300' : 'text-red-300'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </>
            ) : item.category === 'helicopters' ? (
              <>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Model</span>
                  <span className="font-medium text-white text-sm">{item.model || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Registration</span>
                  <span className="font-medium text-white text-sm">{item.registration_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Capacity</span>
                  <span className="font-medium text-white text-sm">{item.capacity || item.seats || 'N/A'} passengers</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Max Speed</span>
                  <span className="font-medium text-white text-sm">{item.max_speed_knots || 'N/A'} knots</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Range</span>
                  <span className="font-medium text-white text-sm">{item.range || item.range_km || 'N/A'} km</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Engine Type</span>
                  <span className="font-medium text-white text-sm">{item.engine_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Cabin Height</span>
                  <span className="font-medium text-white text-sm">{item.cabin_height || 'N/A'} ft</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Availability</span>
                  <span className={`font-medium text-sm ${item.available ? 'text-green-300' : 'text-red-300'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Price per Hour</span>
                  <span className="font-medium text-white text-sm">{item.price_per_hour ? `$${item.price_per_hour}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Rating</span>
                  <span className="font-medium text-white text-sm">{item.rating ? `${item.rating}/5 ⭐` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Currency</span>
                  <span className="font-medium text-white text-sm">{item.currency || 'USD'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Registration No</span>
                  <span className="font-medium text-white text-sm">{item.fleetDetails?.registrationNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Capacity</span>
                  <span className="font-medium text-white text-sm">{item.fleetDetails?.seatCapacity || 'N/A'} passengers</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Max Speed</span>
                  <span className="font-medium text-white text-sm">{item.fleetDetails?.maxSpeed || 'N/A'} {item.category === 'yachts' ? 'knots' : item.category === 'luxury_cars' || item.category === 'super_cars' ? 'km/h' : 'knots'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Range</span>
                  <span className="font-medium text-white text-sm">{item.fleetDetails?.flyingRange || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Cabin Height</span>
                  <span className="font-medium text-white text-sm">{item.fleetDetails?.cabinHeight || 'N/A'} ft</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Engine Type</span>
                  <span className="font-medium text-white text-sm">{item.fleetDetails?.engineType || 'N/A'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-maleh font-light text-white mb-3">Additional Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Created</span>
              <span className="font-medium text-white text-sm">{formatDate(item.createdAt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Last Updated</span>
              <span className="font-medium text-white text-sm">{formatDate(item.updatedAt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Currency</span>
              <span className="font-medium text-white text-sm">{item.currency || 'USD'}</span>
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60 text-sm">Tags</span>
                <span className="font-medium text-white text-sm">{item.tags.join(', ')}</span>
              </div>
            )}
            {(item.fleetDetails?.lastMaintenance || item.last_maintenance) && (
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60 text-sm">Last Maintenance</span>
                <span className="font-medium text-white text-sm">{formatDate(item.fleetDetails?.lastMaintenance || item.last_maintenance)}</span>
              </div>
            )}
            {(item.fleetDetails?.insuranceExpiry || item.insurance_expiry) && (
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60 text-sm">Insurance Expiry</span>
                <span className="font-medium text-white text-sm">{formatDate(item.fleetDetails?.insuranceExpiry || item.insurance_expiry)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#110400] border border-white/25 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#261612] to-[#110400] px-6 py-4 text-white border-b border-white/25">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{getCategoryIcon(item.category)}</span>
                <h2 className="text-xl font-maleh font-light">{item.name}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                  {item.category ? item.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Category'}
                </span>
              </div>
              <p className="text-white/60 text-sm">{item.location?.address || item.base_airport || item.base_location?.address || item.base_marina?.address || item.from?.address || 'Location not specified'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition p-1 hover:bg-white/10 rounded"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/25 bg-[#110003]/[0.44]">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-white bg-[#110400]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent className="text-xs" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'gallery' && renderGallery()}
          {activeTab === 'amenities' && renderAmenities()}
          {activeTab === 'specifications' && renderSpecifications()}
        </div>

        {/* Footer */}
        <div className="bg-[#110003]/[0.44] px-6 py-4 border-t border-white/25">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-white">{formatPrice(item.price_per_hour || item.price_per_day || item.price || 0)}</div>
              <div className="text-white/60 text-sm">
                {item.category === 'luxury_cars' || item.category === 'super_cars' ? 'per day' : 'per hour'}
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-white/25 text-white rounded hover:bg-white/10 transition text-sm">
                <FaEnvelope />
                Contact Vendor
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded hover:bg-white/90 transition font-medium text-sm">
                <FaCheck />
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}