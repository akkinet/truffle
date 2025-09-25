"use client";

import React from 'react';
import { FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function MembershipCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Cancel Icon */}
          <div className="mb-8">
            <FaTimesCircle className="text-red-400 text-6xl mx-auto mb-4" />
            <h1 className="text-4xl font-maleh font-light mb-4">
              Payment Cancelled
            </h1>
            <p className="text-white/60 text-lg">
              Your payment was cancelled. No charges have been made.
            </p>
          </div>

          {/* Information */}
          <div className="bg-[#110400]/50 backdrop-blur-sm rounded-xl border border-white/20 p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">What Happened?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Payment Cancelled</h3>
                  <p className="text-white/60 text-sm">
                    You cancelled the payment process before completing the transaction.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">No Charges Made</h3>
                  <p className="text-white/60 text-sm">
                    Your payment method was not charged. You can try again anytime.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">?</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Need Help?</h3>
                  <p className="text-white/60 text-sm">
                    If you experienced any issues, please contact our support team.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/membership')}
              className="bg-white text-[#110400] py-3 px-8 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-white/10 border border-white/30 text-white py-3 px-8 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200"
            >
              Return Home
            </button>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mt-8 mx-auto"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
