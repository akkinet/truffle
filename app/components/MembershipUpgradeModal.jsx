"use client";

import { useState } from "react";
import { FaSpinner, FaTimes } from "react-icons/fa";
import { toast } from 'react-toastify';

export default function MembershipUpgradeModal({
  isOpen,
  onClose,
  userEmail,
  userId
}) {
  const [selectedMembership, setSelectedMembership] = useState('');
  const [loading, setLoading] = useState(false);

  const membershipOptions = [
    { type: 'gold', name: 'Gold Membership', price: '$100', description: 'Standard search and booking access' },
    { type: 'diamond', name: 'Diamond Membership', price: '$500', description: 'Unlimited access with premium features' },
    { type: 'platinum', name: 'Platinum Membership', price: '$800', description: 'Ultimate luxury experience' }
  ];

  const handleUpgrade = async () => {
    if (!selectedMembership) {
      toast.error('Please select a membership plan');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/membership/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          membershipType: selectedMembership,
          email: userEmail
        }),
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast.error(data.error || 'Failed to create upgrade session');
      }
    } catch (error) {
      console.error('Error creating upgrade session:', error);
      toast.error('An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#110400] to-[#0C0300] rounded-lg p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Upgrade Membership</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-300 mb-1">Upgrading for:</p>
          <p className="text-white font-medium">{userEmail}</p>
        </div>

        {/* Membership Options */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-white">Choose your plan:</h3>
          {membershipOptions.map((option) => (
            <label
              key={option.type}
              className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedMembership === option.type
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-white/30 hover:border-white/50'
              }`}
            >
              <input
                type="radio"
                name="membership"
                value={option.type}
                checked={selectedMembership === option.type}
                onChange={(e) => setSelectedMembership(e.target.value)}
                className="sr-only"
              />
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-white">{option.name}</div>
                  <div className="text-sm text-gray-300 mt-1">{option.description}</div>
                </div>
                <div className="text-white font-bold">{option.price}</div>
              </div>
              {selectedMembership === option.type && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#110400] rounded-full"></div>
                </div>
              )}
            </label>
          ))}
        </div>

        {/* Upgrade Button */}
        <button
          onClick={handleUpgrade}
          disabled={loading || !selectedMembership}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Processing...
            </>
          ) : (
            'Upgrade Now'
          )}
        </button>

        {/* Info */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          You will be redirected to secure payment processing. Your membership will be upgraded immediately after successful payment.
        </p>
      </div>
    </div>
  );
}
