"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { FaCheck, FaTimes, FaArrowLeft, FaStar, FaUsers, FaClock } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import Service1 from "@/public/Service1.png";
import Service2 from "@/public/Service2.png";
import Service3 from "@/public/Service3.png";
import Service4 from "@/public/Service4.png";

const services = [
  {
    id: 1,
    image: Service1,
    title: "Luxury Experiences",
    description: "Curated luxury experiences tailored to your preferences and lifestyle.",
    category: "Experiences",
    features: [
      "Personalized experience curation",
      "Access to exclusive events",
      "VIP treatment and amenities",
      "Professional event coordination"
    ],
    relatedServices: [
      {
        title: "Private Events",
        description: "Exclusive gatherings tailored to your vision",
        image: Service1
      },
      {
        title: "Cultural Tours",
        description: "Immersive cultural experiences with expert guides",
        image: Service2
      },
      {
        title: "Adventure Experiences",
        description: "Thrilling adventures in exotic locations",
        image: Service3
      },
      {
        title: "Wellness Retreats",
        description: "Luxury wellness and spa experiences",
        image: Service4
      }
    ]
  },
  {
    id: 2,
    image: Service2,
    title: "Private Jet Charter",
    description: "Access to premium private aircraft for seamless luxury travel.",
    category: "Aviation",
    features: [
      "Access to premium aircraft fleet",
      "Flexible scheduling and routing",
      "Luxury amenities and catering",
      "Professional flight crew"
    ],
    relatedServices: [
      {
        title: "Business Jets",
        description: "Efficient travel for business executives",
        image: Service2
      },
      {
        title: "Long-Range Jets",
        description: "Intercontinental luxury travel",
        image: Service1
      },
      {
        title: "Helicopter Services",
        description: "Short-haul luxury transportation",
        image: Service3
      },
      {
        title: "Aircraft Management",
        description: "Complete aircraft ownership solutions",
        image: Service4
      }
    ]
  },
  {
    id: 3,
    image: Service3,
    title: "Luxury Yacht Charter",
    description: "Premium yacht charters for unforgettable maritime experiences.",
    category: "Maritime",
    features: [
      "Access to premium yacht fleet",
      "Experienced crew and captain",
      "Custom itineraries and destinations",
      "Luxury amenities and water sports"
    ],
    relatedServices: [
      {
        title: "Sailing Yachts",
        description: "Classic sailing experiences",
        image: Service3
      },
      {
        title: "Motor Yachts",
        description: "Power and luxury combined",
        image: Service1
      },
      {
        title: "Superyachts",
        description: "Ultimate luxury on the water",
        image: Service2
      },
      {
        title: "Yacht Management",
        description: "Complete yacht ownership services",
        image: Service4
      }
    ]
  },
  {
    id: 4,
    image: Service4,
    title: "Luxury Villa Rentals",
    description: "Exclusive villa rentals in the world's most desirable destinations.",
    category: "Accommodation",
    features: [
      "Exclusive villa properties",
      "Concierge and housekeeping services",
      "Privacy and security",
      "Premium locations worldwide"
    ],
    relatedServices: [
      {
        title: "Beachfront Villas",
        description: "Oceanfront luxury accommodations",
        image: Service4
      },
      {
        title: "Mountain Retreats",
        description: "Alpine luxury and tranquility",
        image: Service1
      },
      {
        title: "Urban Residences",
        description: "City-center luxury living",
        image: Service2
      },
      {
        title: "Villa Management",
        description: "Complete property management services",
        image: Service3
      }
    ]
  },
  {
    id: 5,
    image: Service1,
    title: "Luxury Car Services",
    description: "Premium chauffeur-driven vehicles for elegant transportation.",
    category: "Transportation",
    features: [
      "Professional chauffeur service",
      "Luxury vehicle fleet",
      "Airport transfers",
      "City tours and excursions"
    ],
    relatedServices: [
      {
        title: "Sedan Services",
        description: "Executive sedan transportation",
        image: Service1
      },
      {
        title: "SUV Services",
        description: "Luxury SUV for groups",
        image: Service2
      },
      {
        title: "Limousine Services",
        description: "Stretch limousine experiences",
        image: Service3
      },
      {
        title: "Classic Cars",
        description: "Vintage luxury car rentals",
        image: Service4
      }
    ]
  },
  {
    id: 6,
    image: Service2,
    title: "Concierge Services",
    description: "Personal concierge services for all your luxury needs.",
    category: "Services",
    features: [
      "24/7 personal assistance",
      "Restaurant reservations",
      "Event planning",
      "Travel arrangements"
    ],
    relatedServices: [
      {
        title: "Personal Shopping",
        description: "Luxury shopping assistance",
        image: Service2
      },
      {
        title: "Event Planning",
        description: "Exclusive event coordination",
        image: Service1
      },
      {
        title: "Travel Planning",
        description: "Custom travel itineraries",
        image: Service3
      },
      {
        title: "Lifestyle Management",
        description: "Complete lifestyle services",
        image: Service4
      }
    ]
  },
  {
    id: 7,
    image: Service3,
    title: "Fine Dining Experiences",
    description: "Exclusive access to the world's finest restaurants and culinary experiences.",
    category: "Dining",
    features: [
      "Michelin-starred restaurants",
      "Private chef services",
      "Wine tastings",
      "Culinary tours"
    ],
    relatedServices: [
      {
        title: "Private Chef",
        description: "Personal chef services",
        image: Service3
      },
      {
        title: "Wine Experiences",
        description: "Exclusive wine tastings",
        image: Service1
      },
      {
        title: "Cooking Classes",
        description: "Master chef instruction",
        image: Service2
      },
      {
        title: "Food Tours",
        description: "Culinary destination tours",
        image: Service4
      }
    ]
  },
  {
    id: 8,
    image: Service4,
    title: "Wellness & Spa Services",
    description: "Luxury wellness and spa experiences for ultimate relaxation.",
    category: "Wellness",
    features: [
      "World-class spa treatments",
      "Personal wellness programs",
      "Meditation and yoga",
      "Holistic health services"
    ],
    relatedServices: [
      {
        title: "Spa Retreats",
        description: "Luxury spa destinations",
        image: Service4
      },
      {
        title: "Wellness Programs",
        description: "Personalized wellness plans",
        image: Service1
      },
      {
        title: "Fitness Training",
        description: "Personal fitness coaching",
        image: Service2
      },
      {
        title: "Mental Wellness",
        description: "Mindfulness and meditation",
        image: Service3
      }
    ]
  }
];

export default function ServicesPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];

  const filteredServices = selectedCategory === 'All' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const openModal = (service) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
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
            Our Services
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Discover our comprehensive range of luxury services tailored to your sophisticated lifestyle
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-white text-[#110400]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-[#110400]/50 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group"
              onClick={() => openModal(service)}
            >
              <div className="relative">
                <Image
                  src={service.image}
                  alt={service.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                    {service.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                <button className="w-full bg-white/10 border border-white/30 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/20 transition-colors">
                  Explore More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-4xl bg-[#110400] rounded-xl border border-white/20 overflow-hidden max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Modal Header */}
            <div className="relative">
              <Image
                src={selectedService.image}
                alt={selectedService.title}
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
                <span className="bg-white/20 px-3 py-1 rounded text-sm font-medium mb-2 inline-block">
                  {selectedService.category}
                </span>
                <h2 className="text-3xl font-maleh font-light mb-2">
                  {selectedService.title}
                </h2>
                <p className="text-white/80 text-lg">
                  {selectedService.description}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Features */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedService.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <FaCheck className="text-green-400 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Services */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Related Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedService.relatedServices.map((service, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={200}
                        height={120}
                        className="w-full h-24 object-cover rounded mb-3"
                      />
                      <h4 className="font-semibold text-white text-sm mb-1">
                        {service.title}
                      </h4>
                      <p className="text-white/60 text-xs">
                        {service.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Now Button */}
              <div className="mt-8 text-center">
                <button className="bg-white text-[#110400] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
