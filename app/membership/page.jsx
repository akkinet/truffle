"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MembershipModal from "../components/MembershipModal";
import MembershipUpgradeModal from "../components/MembershipUpgradeModal";

export default function MembershipPage() {
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userLoggedIn = JSON.parse(window.localStorage.getItem("userLoggedIn") || 'null');
      if (userLoggedIn) {
        setIsLoggedIn(true);
        setUserData(userLoggedIn);
      }
    }
  }, []);

  const membershipTiers = [
    {
      name: "Free",
      price: 0,
      description: "Basic access to our platform",
      features: [
        "Browse available services",
        "View basic service information",
        "Contact support",
        "Newsletter subscription"
      ],
      color: "gray",
      popular: false
    },
    {
      name: "Gold",
      price: 100,
      description: "Standard search and booking access",
      features: [
        "Full search functionality",
        "Detailed service information",
        "Priority customer support",
        "Booking management",
        "Email notifications",
        "Basic concierge services"
      ],
      color: "yellow",
      popular: true
    },
    {
      name: "Diamond",
      price: 500,
      description: "Unlimited access with premium features",
      features: [
        "Everything in Gold",
        "Unlimited searches",
        "Advanced filtering options",
        "Personal concierge",
        "Exclusive member events",
        "Priority booking",
        "Custom service requests"
      ],
      color: "blue",
      popular: false
    },
    {
      name: "Platinum",
      price: 800,
      description: "Ultimate luxury experience",
      features: [
        "Everything in Diamond",
        "24/7 dedicated support",
        "White-glove service",
        "Exclusive partnerships",
        "VIP event access",
        "Custom experience design",
        "Personal account manager"
      ],
      color: "purple",
      popular: false
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case "yellow":
        return {
          bg: "bg-yellow-600",
          hover: "hover:bg-yellow-700",
          border: "border-yellow-500",
          text: "text-yellow-600",
          badge: "bg-yellow-100 text-yellow-800"
        };
      case "blue":
        return {
          bg: "bg-blue-600",
          hover: "hover:bg-blue-700",
          border: "border-blue-500",
          text: "text-blue-600",
          badge: "bg-blue-100 text-blue-800"
        };
      case "purple":
        return {
          bg: "bg-purple-600",
          hover: "hover:bg-purple-700",
          border: "border-purple-500",
          text: "text-purple-600",
          badge: "bg-purple-100 text-purple-800"
        };
      default:
        return {
          bg: "bg-gray-600",
          hover: "hover:bg-gray-700",
          border: "border-gray-500",
          text: "text-gray-600",
          badge: "bg-gray-100 text-gray-800"
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300]">
      <Header />
      
      <div className="px-4 md:px-[10%] py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-4xl md:text-6xl font-maleh font-light text-white mb-6">
            {isLoggedIn ? 'Upgrade Your Membership' : 'Choose Your Membership'}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {isLoggedIn 
              ? `Welcome back, ${userData?.firstName || 'Member'}! Upgrade your membership to unlock premium features and exclusive services.`
              : 'Unlock exclusive access to the world\'s finest luxury services. Select the membership tier that matches your lifestyle and preferences.'
            }
          </p>
        </div>

        {/* Membership Tiers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
          {membershipTiers.map((tier, index) => {
            const colors = getColorClasses(tier.color);
            return (
              <div
                key={tier.name}
                className={`relative bg-white/5 border ${
                  tier.popular ? colors.border : 'border-white/20'
                } rounded-lg p-6 md:p-8 ${
                  tier.popular ? 'ring-2 ring-yellow-500/50' : ''
                }`}
              >
                {tier.popular && (
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${colors.badge} px-4 py-1 rounded-full text-sm font-semibold`}>
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-white mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${tier.price}</span>
                    {tier.price > 0 && <span className="text-gray-400 ml-1">/year</span>}
                  </div>
                  <p className="text-gray-300 text-sm">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <span className="text-green-500 mt-1 text-sm">✓</span>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    setSelectedPlan(tier.name.toLowerCase());
                    if (isLoggedIn) {
                      if (tier.price === 0) {
                        // Free tier - no action needed for logged-in users
                        return;
                      } else if (userData?.membership === 'free') {
                        // Logged-in but free membership: open apply membership modal with prefilled fields
                        setShowMembershipModal(true);
                      } else {
                        // Already paid member upgrading: open upgrade modal (Stripe)
                        setShowUpgradeModal(true);
                      }
                    } else {
                      // Guest: open membership modal with prefilled membershipType
                      setShowMembershipModal(true);
                    }
                  }}
                  disabled={isLoggedIn && tier.price === 0}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    tier.price === 0
                      ? isLoggedIn 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-white/10 border border-white/30 text-white hover:bg-white/20'
                      : `${colors.bg} ${colors.hover} text-white`
                  }`}
                >
                  {isLoggedIn 
                    ? (tier.price === 0 ? 'Current Plan' : 'Upgrade')
                    : (tier.price === 0 ? 'Get Started' : 'Choose Plan')
                  }
                </button>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-maleh font-light text-white text-center mb-12">
            Compare Features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white/5 border border-white/20 rounded-lg">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 text-white font-semibold">Features</th>
                  {membershipTiers.map((tier) => (
                    <th key={tier.name} className="text-center p-4 text-white font-semibold">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "Search Functionality",
                  "Detailed Service Info",
                  "Booking Management",
                  "Priority Support",
                  "Personal Concierge",
                  "Exclusive Events",
                  "24/7 Support",
                  "Custom Requests"
                ].map((feature, index) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="p-4 text-gray-300">{feature}</td>
                    {membershipTiers.map((tier) => (
                      <td key={tier.name} className="text-center p-4">
                        {index < (tier.name === "Free" ? 1 : tier.name === "Gold" ? 4 : tier.name === "Diamond" ? 6 : 8) ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-maleh font-light text-white text-center mb-12">
            Why Choose Truffle?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Secure & Private</h3>
              <p className="text-gray-300 leading-relaxed">
                Your personal information and transactions are protected with 
                enterprise-grade security and complete discretion.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Verified Partners</h3>
              <p className="text-gray-300 leading-relaxed">
                All our service providers are thoroughly vetted to ensure 
                the highest standards of quality and professionalism.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Global Network</h3>
              <p className="text-gray-300 leading-relaxed">
                Access luxury services worldwide with our extensive network 
                of premium partners in major cities and destinations.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-yellow-600/10 to-yellow-800/10 border border-yellow-500/20 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-maleh font-light text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of discerning clients who trust Truffle for their luxury needs. 
            Start your journey to exclusive experiences today.
          </p>
          <button
            onClick={() => {
              if (isLoggedIn) {
                setShowUpgradeModal(true);
              } else {
                setShowMembershipModal(true);
              }
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            {isLoggedIn ? 'Upgrade Membership' : 'Apply for Membership'}
          </button>
        </div>
      </div>

      <Footer />

      {/* Membership Modal */}
      {showMembershipModal && (
        <MembershipModal
          isOpen={showMembershipModal}
          onClose={() => setShowMembershipModal(false)}
          user={isLoggedIn ? userData : null}
          initialMembershipType={selectedPlan}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <MembershipUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          userEmail={userData?.email}
          userId={userData?.id}
        />
      )}
    </div>
  );
}