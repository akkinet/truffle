"use client";

import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MembershipSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // In a real app, you'd fetch session details from your backend
      setSessionData({ sessionId });
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <FaCheckCircle className="text-green-400 text-6xl mx-auto mb-4" />
            <h1 className="text-4xl font-maleh font-light mb-4">
              Payment Successful!
            </h1>
            <p className="text-white/60 text-lg">
              Your membership has been activated successfully.
            </p>
          </div>

          {/* Success Details */}
          <div className="bg-[#110400]/50 backdrop-blur-sm rounded-xl border border-white/20 p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">What's Next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Check Your Email</h3>
                  <p className="text-white/60 text-sm">
                    We've sent you a confirmation email with your membership details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Access Your Benefits</h3>
                  <p className="text-white/60 text-sm">
                    Your membership benefits are now active. You can start using premium features immediately.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Explore Premium Features</h3>
                  <p className="text-white/60 text-sm">
                    Visit our search page to experience unlimited searches and advanced features.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="bg-white text-[#110400] py-3 px-8 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Searching
            </button>
            <button
              onClick={() => router.push('/membership')}
              className="bg-white/10 border border-white/30 text-white py-3 px-8 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200"
            >
              View Membership Details
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
