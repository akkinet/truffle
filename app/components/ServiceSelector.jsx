import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaTimes, FaCheck, FaStar, FaUsers, FaClock } from "react-icons/fa";
import Service1 from "@/public/Service1.png";
import Service2 from "@/public/Service2.png";
import Service3 from "@/public/Service3.png";
import Service4 from "@/public/Service4.png";
import Features1 from "@/public/Features1.png";
import Features2 from "@/public/Features2.png";
import Features3 from "@/public/Features3.png";
import Features4 from "@/public/Features4.png";

const services = [
  {
    id: 1,
    image: Service1,
    title: "Experiences",
    description: "Curated luxury experiences tailored to your preferences and lifestyle.",
    modalContent: {
      heroTitle: "Luxury Experiences",
      heroTagline: "Curated moments that define your lifestyle",
      description: "Our luxury experiences are carefully crafted to provide unforgettable moments that align with your sophisticated taste. From exclusive events to personalized adventures, we create memories that last a lifetime.",
      benefits: [
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
    }
  },
  {
    id: 2,
    image: Service2,
    title: "Private Jets",
    description: "Access to premium private aircraft for seamless luxury travel.",
    modalContent: {
      heroTitle: "Private Jet Charter",
      heroTagline: "Ultimate luxury in the skies",
      description: "Experience the pinnacle of air travel with our private jet charter services. From business jets to ultra-long-range aircraft, we provide access to the world's most prestigious fleet with unmatched service and comfort.",
      benefits: [
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
    }
  },
  {
    id: 3,
    image: Service3,
    title: "Luxury Yachts",
    description: "Premium yacht charters for unforgettable maritime experiences.",
    modalContent: {
      heroTitle: "Luxury Yacht Charter",
      heroTagline: "Sail the seas in ultimate luxury",
      description: "Discover the world's most beautiful destinations aboard our fleet of luxury yachts. From intimate sailing yachts to superyachts, we provide unparalleled maritime experiences with world-class service and amenities.",
      benefits: [
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
    }
  },
  {
    id: 4,
    image: Service4,
    title: "Luxury Villas",
    description: "Exclusive villa rentals in the world's most desirable destinations.",
    modalContent: {
      heroTitle: "Luxury Villa Rentals",
      heroTagline: "Home away from home, redefined",
      description: "Experience the ultimate in luxury accommodation with our curated selection of premium villas. From beachfront estates to mountain retreats, each property offers unparalleled comfort, privacy, and world-class amenities.",
      benefits: [
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
    }
  },
];

const features = [
  {
    id: 1,
    image: Features1,
    title: "Apres Ski in South of France",
    description: "Experience the ultimate winter luxury in the French Alps with world-class skiing, gourmet dining, and exclusive après-ski entertainment.",
  },
  {
    id: 2,
    image: Features2,
    title: "Grand Prix in Monaco",
    description: "Witness the pinnacle of motorsport in the glamorous setting of Monaco, with VIP access, luxury accommodations, and exclusive events.",
  },
  {
    id: 3,
    image: Features3,
    title: "Romantic Getaway in Santorini",
    description: "Discover the magic of Santorini with breathtaking sunsets, luxury accommodations, and intimate dining experiences in this iconic Greek destination.",
  },
  {
    id: 4,
    image: Features4,
    title: "Bora Bora Island Experience",
    description: "Escape to paradise in Bora Bora with overwater bungalows, crystal-clear waters, and unparalleled tropical luxury in the South Pacific.",
  },
];

const ServiceSelector = ({ type }) => {
  const [selectedService, setSelectedService] = useState(null);

  const openModal = (service) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedService) {
        closeModal();
      }
    };

    if (selectedService) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedService]);

  const renderService = ({
    id,
    image,
    title,
    description,
    modalContent,
  }) => (
    <div
      key={id}
      className="h-auto w-full max-w-[270px] relative mx-auto transform transition-transform duration-300 hover:scale-[1.05] group"
    >
      <div className="relative">
        <Image
          src={image}
          height={type === "Services" ? 450 : 298}
          width={270}
          alt={title}
          className={`w-full h-auto object-cover ${
            type === "Experiences" ? "max-h-[285px]" : ""
          }`}
        />
        <div className="absolute inset-0 bg-[rgba(17,4,0,0.38)] pointer-events-none" />
        {type === "Experiences" && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
          </div>
        )}
      </div>

      {type === "Experiences" && <div className="h-4" />}

      <div
        className={`${type === "Services" ? "absolute bottom-10" : ""} w-full`}
      >
        <h3
          className={`text-center font-maleh text-[20px] md:text-[${
            type === "Services" ? "24" : "13"
          }px]`}
        >
          {title}
        </h3>
        {type === "Services" && (
          <p className="text-center font-nexa text-[12px] md:text-[14px] font-extralight px-[5%] md:px-[10%]">
            {description}
          </p>
        )}
        <div 
          onClick={() => type === "Services" && modalContent ? openModal({ id, image, title, description, modalContent }) : null}
          className="self-center bg-[#ECECEC] w-[165px] h-[37px] text-center font-nexa font-semibold text-[14px] items-center justify-center flex mx-auto mt-[20px] md:mt-[30px] text-[#110400] cursor-pointer hover:bg-[#261612] hover:text-[#ECECEC] transition-all duration-300"
        >
          <p>Explore More</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-center md:justify-between gap-6">
        {type === "Services"
          ? services.map((item) => renderService(item))
          : features.map((item) => renderService(item))}
      </div>

      {/* Service Modal */}
      {selectedService && selectedService.modalContent && (
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
                <h2 className="text-3xl font-maleh font-light mb-2">
                  {selectedService.modalContent.heroTitle}
                </h2>
                <p className="text-white/80 text-lg">
                  {selectedService.modalContent.heroTagline}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-8">
                <p className="text-white/80 text-lg leading-relaxed">
                  {selectedService.modalContent.description}
                </p>
              </div>

              {/* Benefits */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Key Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedService.modalContent.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <FaCheck className="text-green-400 flex-shrink-0" />
                      <span className="text-white/80">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Services */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Related Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedService.modalContent.relatedServices.map((service, index) => (
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceSelector;
