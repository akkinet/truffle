"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

function PaymentConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [successShown, setSuccessShown] = useState(false);
  const maxPollAttempts = 15; // Increased to allow more time for webhook

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
          // Still pending, poll again but with a limit
          if (pollAttempts < maxPollAttempts) {
            setPollAttempts(prev => prev + 1);
            setTimeout(checkPaymentStatus, 3000); // Increased to 3 seconds
          } else {
            // Check if membership was created by webhook despite pending status
            await checkIfMembershipExists(data);
          }
        } else {
          // Check if membership was already created by webhook
          await checkIfMembershipExists(data);
        }
      } else {
        // Even if status check fails, check if membership exists
        await checkIfMembershipExists(data);
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      // Check if membership exists despite the error
      await checkIfMembershipExists(null);
    }
  };

  const checkIfMembershipExists = async (paymentData) => {
    try {
      // Check if user exists in database by email from payment record
      const paymentRecordId = sessionStorage.getItem('paymentRecordId');
      if (paymentRecordId) {
        const userCheckResponse = await fetch(`/api/user/check-exists?paymentRecordId=${paymentRecordId}`);
        if (userCheckResponse.ok) {
          const userData = await userCheckResponse.json();
          if (userData.exists && userData.user?.membership !== 'free') {
            // Membership was created by webhook, redirect to success
            console.log('Membership already created by webhook, redirecting...');
            setPaymentStatus({ status: 'succeeded', ...userData.user });
            setLoading(false);
            
            // Show success message only once
            if (!successShown) {
              toast.success('Membership created successfully! Welcome to Truffle!');
              setSuccessShown(true);
            }
            
            // Clear session storage
            sessionStorage.removeItem('tempPassword');
            sessionStorage.removeItem('paymentRecordId');
            
            // Redirect to home page or success page
            setTimeout(() => {
              router.push('/?membership=success');
            }, 2000);
            return;
          }
        }
      }

      // If we haven't reached max attempts yet, continue polling
      if (pollAttempts < maxPollAttempts) {
        console.log(`Webhook membership not found yet, polling attempt ${pollAttempts + 1}/${maxPollAttempts}`);
        setPollAttempts(prev => prev + 1);
        setTimeout(() => {
          checkPaymentStatus();
        }, 3000);
        return;
      }

      // If we reach here, membership doesn't exist yet or there was an error
      if (paymentData?.status === 'failed') {
        setError('Payment failed or expired');
      } else {
        setError('Failed to complete membership. Please contact support if you were charged.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking membership existence:', error);
      
      // If we haven't reached max attempts yet, continue polling
      if (pollAttempts < maxPollAttempts) {
        console.log(`Error checking membership, retrying attempt ${pollAttempts + 1}/${maxPollAttempts}`);
        setPollAttempts(prev => prev + 1);
        setTimeout(() => {
          checkPaymentStatus();
        }, 3000);
        return;
      }
      
      setError('Failed to complete membership. Please contact support if you were charged.');
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

    // First check if membership was already created by webhook
    if (paymentRecordId) {
      try {
        const userCheckResponse = await fetch(`/api/user/check-exists?paymentRecordId=${paymentRecordId}`);
        if (userCheckResponse.ok) {
          const userData = await userCheckResponse.json();
          if (userData.exists && userData.user?.membership !== 'free') {
            console.log('Membership already created by webhook, redirecting to success...');
            // Clear session storage
            sessionStorage.removeItem('tempPassword');
            sessionStorage.removeItem('paymentRecordId');
            
            // Show success and redirect
            setPaymentStatus({ status: 'succeeded', ...userData.user });
            setLoading(false);
            
            // Show success message
            toast.success('Membership created successfully! Welcome to Truffle!');
            
            setTimeout(() => {
              router.push('/?membership=success');
            }, 2000);
            return;
          }
        }
      } catch (error) {
        console.log('Error checking webhook-created membership:', error);
      }
    }

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
          
          // Show success message only once
          if (!successShown) {
            toast.success('Membership created successfully! Welcome to Truffle!');
            setSuccessShown(true);
          }
        }
        
        // Redirect to home page
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        // Check if it's a duplicate user error and handle gracefully
        if (result.error && result.error.includes('already exists')) {
          console.log('User already exists, checking for existing membership...');
          // Try to get existing user data
          try {
            const userCheckResponse = await fetch(`/api/user/check-exists?email=${encodeURIComponent(data.email)}`);
            if (userCheckResponse.ok) {
              const userData = await userCheckResponse.json();
              if (userData.exists && userData.user?.membership !== 'free') {
                // User exists with paid membership, show success
                if (!successShown) {
                  toast.success('Membership already active! Welcome to Truffle!');
                  setSuccessShown(true);
                }
                setPaymentStatus({ status: 'succeeded', ...userData.user });
                setLoading(false);
                
                setTimeout(() => {
                  router.push('/?membership=success');
                }, 2000);
                return;
              }
            }
          } catch (checkError) {
            console.log('Error checking existing user:', checkError);
          }
        }
        
        // Only show error if success hasn't been shown
        if (!successShown) {
          toast.error(result.error || 'Failed to complete membership');
          setError('Failed to complete membership');
        }
        setLoading(false);
      }
    } catch (error) {
      // Only show error if success hasn't been shown
      if (!successShown) {
        toast.error('Network error completing membership');
        setError('Network error completing membership');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08] flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <FaSpinner className="text-4xl animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing Payment...</h2>
          <p className="text-white/60 mb-4">Please wait while we confirm your payment and create your membership</p>
          {pollAttempts > 0 && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                Checking for membership creation... (Attempt {pollAttempts}/{maxPollAttempts})
              </p>
              <div className="w-full bg-blue-900/30 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(pollAttempts / maxPollAttempts) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
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
      <div className="min-h-screen bg-gradient-to-br from-[#0D0300] to-[#1a0f08] flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <FaCheckCircle className="text-4xl text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
          <p className="text-white/60 mb-6">
            Your membership has been successfully created. You can now access all premium features.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-[#110400] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function PaymentConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <PaymentConfirmContent />
    </Suspense>
  );
}
