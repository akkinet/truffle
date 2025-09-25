"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { FaCheck, FaTimes, FaArrowLeft, FaStar, FaUsers, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import Features1 from "@/public/Features1.png";
import Features2 from "@/public/Features2.png";
import Features3 from "@/public/Features3.png";
import Features4 from "@/public/Features4.png";

const experiences = [
  {
    id: 1,
    image: Features1,
    title: "Apres Ski in South of France",
    description: "Experience the ultimate winter luxury in the French Alps with world-class skiing, gourmet dining, and exclusive après-ski entertainment.",
    location: "French Alps, France",
    duration: "3-7 days",
    groupSize: "2-12 people",
    price: "From $2,500",
    rating: 4.9,
    features: [
      "World-class ski resorts",
      "Gourmet mountain dining",
      "Exclusive après-ski venues",
      "Private ski instructors",
      "Luxury chalet accommodation",
      "Helicopter transfers"
    ],
    relatedExperiences: [
      {
        title: "Swiss Alps Ski Experience",
        description: "Premium skiing in the Swiss Alps",
        image: Features1,
        location: "Switzerland"
      },
      {
        title: "Austrian Ski Adventure",
        description: "Traditional Austrian ski culture",
        image: Features2,
        location: "Austria"
      },
      {
        title: "Italian Dolomites",
        description: "Stunning Italian mountain scenery",
        image: Features3,
        location: "Italy"
      },
      {
        title: "Canadian Rockies",
        description: "North American luxury skiing",
        image: Features4,
        location: "Canada"
      }
    ]
  },
  {
    id: 2,
    image: Features2,
    title: "Grand Prix in Monaco",
    description: "Witness the pinnacle of motorsport in the glamorous setting of Monaco, with VIP access, luxury accommodations, and exclusive events.",
    location: "Monaco",
    duration: "3-5 days",
    groupSize: "2-8 people",
    price: "From $5,000",
    rating: 4.8,
    features: [
      "VIP Grand Prix access",
      "Luxury yacht accommodation",
      "Exclusive parties and events",
      "Private helicopter transfers",
      "Fine dining experiences",
      "Casino and entertainment"
    ],
    relatedExperiences: [
      {
        title: "Formula 1 Singapore",
        description: "Night race in Singapore",
        image: Features2,
        location: "Singapore"
      },
      {
        title: "Le Mans 24 Hours",
        description: "Endurance racing in France",
        image: Features1,
        location: "France"
      },
      {
        title: "Goodwood Festival",
        description: "Classic car festival in UK",
        image: Features3,
        location: "United Kingdom"
      },
      {
        title: "Pebble Beach Concours",
        description: "Classic car show in California",
        image: Features4,
        location: "California, USA"
      }
    ]
  },
  {
    id: 3,
    image: Features3,
    title: "Romantic Getaway in Santorini",
    description: "Discover the magic of Santorini with breathtaking sunsets, luxury accommodations, and intimate dining experiences in this iconic Greek destination.",
    location: "Santorini, Greece",
    duration: "4-7 days",
    groupSize: "2 people",
    price: "From $1,800",
    rating: 4.9,
    features: [
      "Private villa with caldera views",
      "Sunset sailing experiences",
      "Private wine tastings",
      "Romantic dining venues",
      "Spa and wellness treatments",
      "Photography sessions"
    ],
    relatedExperiences: [
      {
        title: "Mykonos Luxury Escape",
        description: "Party island luxury experience",
        image: Features3,
        location: "Greece"
      },
      {
        title: "Amalfi Coast Romance",
        description: "Italian coastal luxury",
        image: Features1,
        location: "Italy"
      },
      {
        title: "French Riviera Retreat",
        description: "Mediterranean luxury",
        image: Features2,
        location: "France"
      },
      {
        title: "Croatian Islands",
        description: "Adriatic luxury experience",
        image: Features4,
        location: "Croatia"
      }
    ]
  },
  {
    id: 4,
    image: Features4,
    title: "Bora Bora Island Experience",
    description: "Escape to paradise in Bora Bora with overwater bungalows, crystal-clear waters, and unparalleled tropical luxury in the South Pacific.",
    location: "Bora Bora, French Polynesia",
    duration: "5-10 days",
    groupSize: "2-6 people",
    price: "From $3,500",
    rating: 4.9,
    features: [
      "Overwater bungalow accommodation",
      "Private island experiences",
      "Snorkeling and diving",
      "Traditional Polynesian culture",
      "Luxury spa treatments",
      "Private boat excursions"
    ],
    relatedExperiences: [
      {
        title: "Maldives Overwater",
        description: "Indian Ocean luxury",
        image: Features4,
        location: "Maldives"
      },
      {
        title: "Seychelles Paradise",
        description: "African island luxury",
        image: Features1,
        location: "Seychelles"
      },
      {
        title: "Fiji Island Hopping",
        description: "South Pacific adventure",
        image: Features2,
        location: "Fiji"
      },
      {
        title: "Caribbean Luxury",
        description: "Caribbean island escape",
        image: Features3,
        location: "Caribbean"
      }
    ]
  },
  {
    id: 5,
    image: Features1,
    title: "Safari Adventure in Kenya",
    description: "Experience the ultimate African safari with luxury tented camps, wildlife encounters, and exclusive game drives in Kenya's premier reserves.",
    location: "Masai Mara, Kenya",
    duration: "7-10 days",
    groupSize: "2-8 people",
    price: "From $4,200",
    rating: 4.8,
    features: [
      "Luxury tented camps",
      "Private game drives",
      "Hot air balloon safaris",
      "Cultural experiences",
      "Professional guides",
      "Photography workshops"
    ],
    relatedExperiences: [
      {
        title: "Tanzania Safari",
        description: "Serengeti wildlife experience",
        image: Features1,
        location: "Tanzania"
      },
      {
        title: "Botswana Delta",
        description: "Okavango Delta luxury",
        image: Features2,
        location: "Botswana"
      },
      {
        title: "South Africa Safari",
        description: "Kruger National Park",
        image: Features3,
        location: "South Africa"
      },
      {
        title: "Namibia Adventure",
        description: "Desert and wildlife",
        image: Features4,
        location: "Namibia"
      }
    ]
  },
  {
    id: 6,
    image: Features2,
    title: "Japanese Cultural Immersion",
    description: "Immerse yourself in traditional Japanese culture with tea ceremonies, temple visits, and authentic experiences in Kyoto and Tokyo.",
    location: "Kyoto & Tokyo, Japan",
    duration: "8-12 days",
    groupSize: "2-6 people",
    price: "From $3,800",
    rating: 4.9,
    features: [
      "Traditional ryokan stays",
      "Tea ceremony experiences",
      "Temple and shrine visits",
      "Kaiseki dining",
      "Cultural workshops",
      "Private guided tours"
    ],
    relatedExperiences: [
      {
        title: "South Korea Culture",
        description: "Traditional Korean experiences",
        image: Features2,
        location: "South Korea"
      },
      {
        title: "Thailand Cultural",
        description: "Thai temple and culture",
        image: Features1,
        location: "Thailand"
      },
      {
        title: "Vietnam Heritage",
        description: "Vietnamese cultural sites",
        image: Features3,
        location: "Vietnam"
      },
      {
        title: "Cambodia Temples",
        description: "Angkor Wat exploration",
        image: Features4,
        location: "Cambodia"
      }
    ]
  }
];

export default function ExperiencesPage() {
  const router = useRouter();
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('All');

  const locations = ['All', ...Array.from(new Set(experiences.map(e => e.location.split(',')[0])))];

  const filteredExperiences = selectedLocation === 'All' 
    ? experiences 
    : experiences.filter(exp => exp.location.includes(selectedLocation));

  const openModal = (experience) => {
    setSelectedExperience(experience);
  };

  const closeModal = () => {
    setSelectedExperience(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08] text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-maleh font-light mb-4">
            Featured Experiences
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Discover extraordinary experiences crafted for the most discerning travelers
          </p>
        </div>

        {/* Location Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => setSelectedLocation(location)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedLocation === location
                  ? 'bg-white text-[#110400]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {location}
            </button>
          ))}
        </div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredExperiences.map((experience) => (
            <div
              key={experience.id}
              className="bg-[#110400]/50 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group"
              onClick={() => openModal(experience)}
            >
              <div className="relative">
                <Image
                  src={experience.image}
                  alt={experience.title}
                  width={400}
                  height={250}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-4 right-4 bg-white/20 px-2 py-1 rounded text-sm font-medium">
                  <FaStar className="inline mr-1 text-yellow-400" />
                  {experience.rating}
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-white/60" />
                    <span className="text-white/80 text-sm">{experience.location}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{experience.title}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-white/60 text-sm mb-4 line-clamp-3">
                  {experience.description}
                </p>
                
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FaClock className="text-white/60" />
                      <span className="text-white/80">{experience.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUsers className="text-white/60" />
                      <span className="text-white/80">{experience.groupSize}</span>
                    </div>
                  </div>
                  <span className="text-white font-semibold">{experience.price}</span>
                </div>
                
                <button className="w-full bg-white/10 border border-white/30 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/20 transition-colors">
                  Explore More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Modal */}
      {selectedExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-4xl bg-[#110400] rounded-xl border border-white/20 overflow-hidden max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Modal Header */}
            <div className="relative">
              <Image
                src={selectedExperience.image}
                alt={selectedExperience.title}
                width={800}
                height={300}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              >
                <FaTimes size={24} />
              </button>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt className="text-white/60" />
                  <span className="text-white/80">{selectedExperience.location}</span>
                </div>
                <h2 className="text-3xl font-maleh font-light mb-2">
                  {selectedExperience.title}
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span>{selectedExperience.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock className="text-white/60" />
                    <span>{selectedExperience.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUsers className="text-white/60" />
                    <span>{selectedExperience.groupSize}</span>
                  </div>
                  <span className="text-white font-semibold">{selectedExperience.price}</span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-white/80 text-lg leading-relaxed">
                  {selectedExperience.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Experience Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedExperience.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <FaCheck className="text-green-400 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Experiences */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Similar Experiences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedExperience.relatedExperiences.map((experience, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <Image
                        src={experience.image}
                        alt={experience.title}
                        width={200}
                        height={120}
                        className="w-full h-24 object-cover rounded mb-3"
                      />
                      <h4 className="font-semibold text-white text-sm mb-1">
                        {experience.title}
                      </h4>
                      <p className="text-white/60 text-xs mb-2">
                        {experience.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <FaMapMarkerAlt />
                        <span>{experience.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Now Button */}
              <div className="mt-8 text-center">
                <button className="bg-white text-[#110400] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Book Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
