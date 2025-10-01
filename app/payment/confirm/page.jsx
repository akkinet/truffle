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
          // Payment succeeded, automatically complete membership
          await handleCompleteMembership(data);
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

  const handleCompleteMembership = async (paymentData = null) => {
    const data = paymentData || paymentStatus;
    if (!data) return;

    // Debug logging
    console.log('Payment confirm - received data:', data);
    console.log('Payment confirm - tempUserPayload:', data.tempUserPayload);
    console.log('Payment confirm - metadata:', data.metadata);

    // Get password from session storage (only for new user registrations)
    const tempPassword = sessionStorage.getItem('tempPassword');
    const paymentRecordId = sessionStorage.getItem('paymentRecordId');

    // Check if this is an upgrade (existing user) or new registration
    // Multiple detection methods for robustness
    const isUpgrade = data.tempUserPayload?.isUpgrade || 
                     data.tempUserPayload?.isOAuthUser ||
                     data.tempUserPayload?.userId === 'oauth-user' ||
                     data.isUpgrade || 
                     data.metadata?.isUpgrade === 'true' ||
                     data.metadata?.isUpgrade === true ||
                     // Additional detection: check if user exists in localStorage
                     (typeof window !== 'undefined' && localStorage.getItem('userLoggedIn'));
    
    console.log('Payment confirm - isUpgrade:', isUpgrade);
    console.log('Payment confirm - tempPassword exists:', !!tempPassword);
    console.log('Payment confirm - localStorage user exists:', typeof window !== 'undefined' && !!localStorage.getItem('userLoggedIn'));
    
    // If we can't determine if it's an upgrade, try to detect by checking if user exists
    let finalIsUpgrade = isUpgrade;
    if (!finalIsUpgrade && data.email) {
      try {
        // Check if user exists in database by email
        const userCheckResponse = await fetch(`/api/user/check-exists?email=${encodeURIComponent(data.email)}`);
        if (userCheckResponse.ok) {
          const userExists = await userCheckResponse.json();
          finalIsUpgrade = userExists.exists;
          console.log('Payment confirm - User exists check:', userExists.exists);
        }
      } catch (error) {
        console.log('Payment confirm - User exists check failed:', error);
      }
    }
    
    // OAuth users and upgrades should never reach this page
    // If they do, redirect them to the correct page
    if (finalIsUpgrade || data.tempUserPayload?.isOAuthUser || data.tempUserPayload?.userId) {
      console.log('Payment confirm - OAuth user or upgrade detected, redirecting to upgrade success');
      router.push(`/membership/upgrade-success?session_id=${sessionId}&paymentRecordId=${paymentRecordId}`);
      return;
    }
    
    // Additional check: if user is logged in via OAuth, redirect to upgrade success
    if (typeof window !== 'undefined' && localStorage.getItem('userLoggedIn')) {
      const userData = JSON.parse(localStorage.getItem('userLoggedIn') || '{}');
      if (userData.provider && userData.provider !== 'credentials') {
        console.log('Payment confirm - OAuth user detected via localStorage, redirecting to upgrade success');
        router.push(`/membership/upgrade-success?session_id=${sessionId}&paymentRecordId=${paymentRecordId}`);
        return;
      }
    }
    
    // For new user registrations, we need tempPassword
    if (!tempPassword) {
      console.log('Payment confirm - Session expired error triggered');
      toast.error('Session expired. Please try again.');
      router.push('/');
      return;
    }

    try {
      let response;
      
      if (finalIsUpgrade) {
        // Handle membership upgrade for existing users
        response = await fetch('/api/membership/complete-upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentRecordId: data.paymentRecordId || paymentRecordId,
            sessionId: sessionId
          }),
        });
      } else {
        // Handle new user registration
        response = await fetch('/api/auth/complete-membership', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentRecordId: paymentRecordId || sessionId,
            password: tempPassword
          }),
        });
      }

      const result = await response.json();

      if (response.ok && result.success) {
        // Clear session storage
        sessionStorage.removeItem('tempPassword');
        sessionStorage.removeItem('paymentRecordId');
        
        if (isUpgrade) {
          // Update localStorage with new membership info for upgrades
          const currentUser = JSON.parse(localStorage.getItem('userLoggedIn') || '{}');
          currentUser.membership = result.user.membership;
          currentUser.membershipStatus = result.user.membershipStatus;
          currentUser.membershipStartedAt = result.user.membershipStartedAt;
          currentUser.membershipPaidAmount = result.user.membershipPaidAmount;
          localStorage.setItem('userLoggedIn', JSON.stringify(currentUser));
          
          // Dispatch custom event to notify components of membership update
          window.dispatchEvent(new CustomEvent('membershipUpdated', { 
            detail: { 
              membership: result.user.membership,
              membershipStatus: result.user.membershipStatus 
            } 
          }));
          
          toast.success('Membership upgraded successfully! Welcome to your new tier!');
        } else {
          // Store user data and token for new registrations
          console.log('Storing user data in localStorage:', result.user);
          localStorage.setItem('userLoggedIn', JSON.stringify(result.user));
          localStorage.setItem('authToken', result.token);
          
          // Dispatch custom event to notify components of membership update
          window.dispatchEvent(new CustomEvent('membershipUpdated', { 
            detail: { 
              membership: result.user.membership,
              membershipStatus: result.user.membershipStatus 
            } 
          }));
          
          toast.success('Membership created successfully! Welcome to Truffle!');
        }
        
        // Redirect to home page
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to complete membership');
        setError('Failed to complete membership');
        setLoading(false);
      }
    } catch (error) {
      toast.error('Network error completing membership');
      setError('Network error completing membership');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08] flex items-center justify-center">
        <div className="text-center text-white">
          <FaSpinner className="text-4xl animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing Payment...</h2>
          <p className="text-white/60">Please wait while we confirm your payment and create your membership</p>
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
              Your payment has been successfully processed and your membership is being {(() => {
                const isUpgrade = paymentStatus?.tempUserPayload?.isUpgrade || 
                                 paymentStatus?.isUpgrade || 
                                 paymentStatus?.metadata?.isUpgrade === 'true' ||
                                 paymentStatus?.metadata?.isUpgrade === true ||
                                 (typeof window !== 'undefined' && localStorage.getItem('userLoggedIn'));
                return isUpgrade ? 'upgraded' : 'created';
              })()} automatically.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-green-400">
              <FaSpinner className="animate-spin" />
              <span>{(() => {
                const isUpgrade = paymentStatus?.tempUserPayload?.isUpgrade || 
                                 paymentStatus?.isUpgrade || 
                                 paymentStatus?.metadata?.isUpgrade === 'true' ||
                                 paymentStatus?.metadata?.isUpgrade === true ||
                                 (typeof window !== 'undefined' && localStorage.getItem('userLoggedIn'));
                return isUpgrade ? 'Upgrading your membership...' : 'Creating your membership...';
              })()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
