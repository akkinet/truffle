"use client";

import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300]">
      <Header />
      
      <div className="px-4 md:px-[10%] py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-4xl md:text-6xl font-maleh font-light text-white mb-6">
            About Truffle
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your gateway to the world's most exclusive luxury experiences, 
            connecting discerning clients with premium services across the globe.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16 md:mb-24">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-maleh font-light text-white mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  At Truffle, we believe that luxury is not just about possessions���it's about 
                  experiences that elevate your lifestyle and create lasting memories. Our mission 
                  is to curate and deliver the world's most exclusive services, from private jets 
                  and luxury yachts to bespoke experiences that define sophistication.
                </p>
                <p>
                  We understand that our clients value discretion, quality, and seamless service. 
                  That's why we've built a platform that connects you directly with verified 
                  luxury service providers, ensuring every interaction meets the highest standards 
                  of excellence and professionalism.
                </p>
                <p>
                  Whether you're planning a once-in-a-lifetime journey or seeking regular access 
                  to premium services, Truffle is your trusted partner in the world of luxury.
                </p>
              </div>
            </div>
            <div className="relative">
              {/* Auto-rotating premium flight images */}
              <div className="relative overflow-hidden rounded-lg">
                <div className="w-full h-64 md:h-80 lg:h-96 relative">
                  <img
                    src="https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1600&auto=format&fit=crop"
                    alt="Private jet interior"
                    className="absolute inset-0 w-full h-full object-cover animate-[fadeSlide_18s_infinite]"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1517872006492-2f23f0b1d4c3?q=80&w=1600&auto=format&fit=crop"
                    alt="Runway takeoff"
                    className="absolute inset-0 w-full h-full object-cover animate-[fadeSlide2_18s_infinite]"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1527871064652-1a5cc1b8cf71?q=80&w=1600&auto=format&fit=crop"
                    alt="Cabin luxury"
                    className="absolute inset-0 w-full h-full object-cover animate-[fadeSlide3_18s_infinite]"
                  />
                </div>
              </div>

              <style jsx>{`
                @keyframes fadeSlide {
                  0% { opacity: 1; }
                  30% { opacity: 1; }
                  33% { opacity: 0; }
                  97% { opacity: 0; }
                  100% { opacity: 1; }
                }
                @keyframes fadeSlide2 {
                  0% { opacity: 0; }
                  30% { opacity: 0; }
                  33% { opacity: 1; }
                  63% { opacity: 1; }
                  66% { opacity: 0; }
                  100% { opacity: 0; }
                }
                @keyframes fadeSlide3 {
                  0% { opacity: 0; }
                  63% { opacity: 0; }
                  66% { opacity: 1; }
                  97% { opacity: 1; }
                  100% { opacity: 0; }
                }
              `}</style>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-maleh font-light text-white text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Discretion</h3>
              <p className="text-gray-300 leading-relaxed">
                Your privacy is paramount. We ensure all transactions and communications 
                are handled with the utmost confidentiality and security.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Excellence</h3>
              <p className="text-gray-300 leading-relaxed">
                We partner only with the finest service providers, ensuring every experience 
                meets our rigorous standards for quality and professionalism.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Trust</h3>
              <p className="text-gray-300 leading-relaxed">
                Building lasting relationships through transparent communication, 
                reliable service, and consistent delivery of exceptional experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-maleh font-light text-white text-center mb-12">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-3xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold text-white mb-3">Private Aviation</h3>
              <p className="text-gray-300 leading-relaxed">
                Access to private jets, helicopters, and charter flights for seamless 
                travel experiences tailored to your schedule and preferences.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-3xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-white mb-3">Luxury Transportation</h3>
              <p className="text-gray-300 leading-relaxed">
                Premium vehicles including luxury cars, supercars, and chauffeur services 
                for elegant ground transportation solutions.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-3xl mb-4">🛥️</div>
              <h3 className="text-xl font-semibold text-white mb-3">Marine Services</h3>
              <p className="text-gray-300 leading-relaxed">
                Exclusive yacht charters and marine experiences for unforgettable 
                moments on the water in the world's most beautiful destinations.
              </p>
            </div>
          </div>
        </div>

        {/* Membership Benefits */}
        <div className="mb-16 md:mb-24">
          <div className="bg-gradient-to-r from-yellow-600/10 to-yellow-800/10 border border-yellow-500/20 rounded-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-maleh font-light text-white text-center mb-8">
              Join the Truffle Club
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-6">Exclusive Member Benefits</h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>Priority access to exclusive experiences and events</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>Personalized concierge services for all your luxury needs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>Special rates and exclusive offers from our partner network</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>24/7 support and assistance for all your bookings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>Access to members-only events and networking opportunities</span>
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-8">
                  <h4 className="text-xl font-semibold text-white mb-4">Ready to Elevate Your Experience?</h4>
                  <p className="text-gray-300 mb-6">
                    Join thousands of discerning clients who trust Truffle for their luxury needs.
                  </p>
                  <a
                    href="/membership"
                    className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    View Membership Options
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-maleh font-light text-white mb-8">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Ready to experience luxury like never before? Our team is here to help you 
            discover and book the perfect luxury experience.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="/membership"
              className="bg-white text-[#110400] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Become a Member
            </a>
            <a
              href="/services"
              className="bg-white/10 border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Explore Services
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
