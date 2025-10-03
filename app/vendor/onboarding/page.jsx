"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import VendorOnboardingForm from '../../components/VendorOnboardingForm';
import { FaBuilding, FaCheckCircle, FaUsers, FaChartLine } from 'react-icons/fa';

export default function VendorOnboardingPage() {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const handleSuccess = (vendor) => {
    // Redirect to a success page or show success message
    console.log('Vendor registered:', vendor);
    setShowForm(false);
    // You could redirect to a thank you page or dashboard
    // router.push('/vendor/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08]">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Become a <span className="text-yellow-600">Trufle Vendor</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join our elite network of luxury service providers and connect with high-value clients
            looking for premium experiences
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
            <div className="bg-yellow-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBuilding className="text-3xl text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Expand Your Reach</h3>
            <p className="text-gray-300">
              Access a curated marketplace of luxury service seekers actively looking for premium
              experiences
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
            <div className="bg-yellow-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-3xl text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Premium Clientele</h3>
            <p className="text-gray-300">
              Connect with verified members who value quality and are ready to book luxury services
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
            <div className="bg-yellow-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaChartLine className="text-3xl text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Grow Your Business</h3>
            <p className="text-gray-300">
              Manage bookings, track performance, and grow your revenue through our vendor dashboard
            </p>
          </div>
        </div>

        {/* Service Categories */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-semibold text-white mb-6 text-center">Service Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Private Jets', icon: '✈️' },
              { name: 'Luxury Cars', icon: '🚗' },
              { name: 'Super Cars', icon: '🏎️' },
              { name: 'Helicopters', icon: '🚁' },
              { name: 'Yachts', icon: '🛥️' },
              { name: 'Charter Flights', icon: '🛫' }
            ].map((category) => (
              <div key={category.name} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">{category.icon}</div>
                <p className="text-sm text-white">{category.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-white mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Apply', description: 'Fill out our vendor onboarding form' },
              { step: '2', title: 'Review', description: 'We verify your business and credentials' },
              { step: '3', title: 'Setup', description: 'Create your vendor profile and listings' },
              { step: '4', title: 'Grow', description: 'Start receiving bookings and grow' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={() => setShowForm(true)}
            className="px-12 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
          >
            Start Your Application
          </button>
          {/* <p className="text-gray-400 mt-4">
            Already a vendor?{' '}
            <a href="/vendor/signin" className="text-yellow-600 hover:text-yellow-500">
              Sign in here
            </a>
          </p> */}
        </div>
      </div>

      {/* Vendor Onboarding Form Modal */}
      {showForm && (
        <VendorOnboardingForm
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
