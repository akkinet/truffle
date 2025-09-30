"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function PaymentConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    checkPaymentStatus();
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/status?sessionId=${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        setPaymentStatus(data);
        if (data.status === 'succeeded') {
          // Payment succeeded, show success state
          setLoading(false);
        } else if (data.status === 'pending') {
          // Still pending, poll again
          setTimeout(checkPaymentStatus, 2000);
        } else {
          setError('Payment failed or expired');
          setLoading(false);
        }
      } else {
        setError(data.error || 'Failed to check payment status');
        setLoading(false);
      }
    } catch (error) {
      setError('Network error checking payment status');
      setLoading(false);
    }
  };

  const handleCompleteMembership = async () => {
    if (!paymentStatus) return;

    // Get password from session storage
    const tempPassword = sessionStorage.getItem('tempPassword');
    const paymentRecordId = sessionStorage.getItem('paymentRecordId');

    if (!tempPassword) {
      toast.error('Session expired. Please try again.');
      router.push('/');
      return;
    }

    try {
      const response = await fetch('/api/auth/complete-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentRecordId: paymentRecordId || sessionId,
          password: tempPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear session storage
        sessionStorage.removeItem('tempPassword');
        sessionStorage.removeItem('paymentRecordId');
        
        // Store user data and token for authentication
        localStorage.setItem('userLoggedIn', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token);
        
        toast.success('Membership created successfully! Welcome to Truffle!');
        
        // Redirect to home page as logged-in user
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to complete membership');
      }
    } catch (error) {
      toast.error('Network error completing membership');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08] flex items-center justify-center">
        <div className="text-center text-white">
          <FaSpinner className="text-4xl animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing Payment...</h2>
          <p className="text-white/60">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08] flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <FaTimes className="text-4xl text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => router.push('/membership')}
            className="bg-white text-[#110400] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus && paymentStatus.status === 'succeeded') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08] flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-6" />
          
          <h1 className="text-3xl font-maleh font-light mb-4">
            Payment Confirmed!
          </h1>
          
          <div className="bg-[#110400]/50 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-white/60">Status:</span>
                <span className="text-green-400 font-semibold">Confirmed</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Membership Type:</span>
                <span className="text-white font-semibold">
                  {paymentStatus.membershipType?.charAt(0).toUpperCase() + paymentStatus.membershipType?.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Amount Paid:</span>
                <span className="text-white font-semibold">
                  ${(paymentStatus.amount / 100).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Transaction ID:</span>
                <span className="text-white/80 text-sm font-mono">
                  {paymentStatus.sessionId?.slice(-8)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-white/60">
              Your payment has been successfully processed. Click below to complete your membership setup.
            </p>
            
            <button
              onClick={handleCompleteMembership}
              className="bg-white text-[#110400] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Membership
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
