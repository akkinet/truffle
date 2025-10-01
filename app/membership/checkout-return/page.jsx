"use client";
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState(null);
  const pollCountRef = useRef(0);

  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId');
  const paymentRecordId = searchParams.get('paymentRecordId');
  const cancelled = searchParams.get('cancelled');

  const maxPollAttempts = 8;
  const pollInterval = 2000; // 2 seconds

  const checkPaymentStatus = useCallback(async () => {
    try {
      console.log('🔍 Checking payment status...', { sessionId, paymentRecordId, pollCount: pollCountRef.current });
      
      const params = new URLSearchParams();
      if (paymentRecordId) params.append('paymentRecordId', paymentRecordId);
      if (sessionId) params.append('sessionId', sessionId);

      const response = await fetch(`/api/payments/status?${params.toString()}`);
      const data = await response.json();

      console.log('📊 API Response:', { 
        status: response.status, 
        ok: response.ok, 
        data: data,
        pollAttempt: pollCountRef.current + 1 
      });

      if (!response.ok) {
        if (response.status === 404 && data.error === 'Payment record not found') {
          console.log('⚠️  Payment record not found, trying Stripe direct check...');
          // Try to check Stripe directly as fallback
          if (sessionId) {
            try {
              const stripeResponse = await fetch(`/api/payments/check-stripe?sessionId=${sessionId}`);
              const stripeData = await stripeResponse.json();
              
              if (stripeResponse.ok && stripeData.success) {
                console.log('✅ Stripe confirms payment succeeded!');
                // Create a mock payment data for OAuth users
                const mockPaymentData = {
                  status: 'succeeded',
                  sessionId: sessionId,
                  membershipType: 'platinum', // Default to platinum for OAuth users
                  email: 'oauth-user@example.com', // Default
                  tempUserPayload: {
                    isUpgrade: true,
                    isOAuthUser: true,
                    userId: 'oauth-user'
                  }
                };
                
                // Update localStorage immediately for OAuth users
                console.log('🔄 Updating localStorage for OAuth user...');
                const currentUser = JSON.parse(localStorage.getItem('userLoggedIn') || '{}');
                currentUser.membership = 'platinum';
                currentUser.membershipStatus = 'active';
                currentUser.membershipStartedAt = new Date();
                localStorage.setItem('userLoggedIn', JSON.stringify(currentUser));
                
                // Dispatch custom event to notify components
                window.dispatchEvent(new CustomEvent('membershipUpdated', { 
                  detail: { 
                    membership: 'platinum',
                    membershipStatus: 'active' 
                  } 
                }));
                
                setPaymentData(mockPaymentData);
                setStatus('success');
                
                // Redirect to upgrade success for OAuth users
                const isUpgrade = true; // Assume upgrade for OAuth users
                if (isUpgrade) {
                  router.push(`/membership/upgrade-success?session_id=${sessionId}`);
                } else {
                  router.push(`/payment/confirm?session_id=${sessionId}`);
                }
                return;
              }
            } catch (stripeErr) {
              console.error('Stripe fallback check failed:', stripeErr);
            }
          }
        }
        throw new Error(data.error || 'Failed to check payment status');
      }

      setPaymentData(data);

      // Handle different statuses
      if (data.status === 'succeeded') {
        console.log('✅ Payment succeeded! Redirecting...');
        setStatus('success');
        
        // Check if this is an upgrade or new registration
        // Be EXTREMELY aggressive in detecting upgrades to avoid OAuth users going to payment/confirm
        const isUpgrade = data.tempUserPayload?.isUpgrade || 
                         data.tempUserPayload?.isOAuthUser ||
                         data.tempUserPayload?.userId === 'oauth-user' ||
                         (data.tempUserPayload?.userId && data.tempUserPayload.userId !== 'oauth-user') ||
                         // If user exists in localStorage, it's likely an upgrade
                         (typeof window !== 'undefined' && localStorage.getItem('userLoggedIn')) ||
                         // If no tempUserPayload but user is logged in, treat as upgrade
                         (!data.tempUserPayload && typeof window !== 'undefined' && localStorage.getItem('userLoggedIn')) ||
                         // If user is logged in via OAuth (check session), treat as upgrade
                         (typeof window !== 'undefined' && localStorage.getItem('userLoggedIn') && 
                          JSON.parse(localStorage.getItem('userLoggedIn') || '{}').provider !== 'credentials');
        console.log('🔍 Is upgrade?', isUpgrade, {
          tempUserPayload: data.tempUserPayload,
          isUpgrade: data.tempUserPayload?.isUpgrade,
          isOAuthUser: data.tempUserPayload?.isOAuthUser,
          userId: data.tempUserPayload?.userId,
          localStorage: typeof window !== 'undefined' && localStorage.getItem('userLoggedIn'),
          userProvider: typeof window !== 'undefined' && JSON.parse(localStorage.getItem('userLoggedIn') || '{}').provider
        });
        
        if (isUpgrade) {
          // For upgrades, redirect to upgrade success page
          router.push(`/membership/upgrade-success?session_id=${sessionId}&paymentRecordId=${paymentRecordId}`);
        } else {
          // For new registrations, redirect to payment confirm page
          router.push(`/payment/confirm?session_id=${sessionId}`);
        }
        return;
      }

      if (data.status === 'failed') {
        console.log('❌ Payment failed');
        setStatus('failed');
        return;
      }

      if (data.status === 'pending') {
        console.log('⏳ Payment still pending, checking Stripe directly...');
        
        // If we have a sessionId, check Stripe directly as fallback
        if (sessionId && pollCountRef.current >= 2) {
          try {
            const stripeResponse = await fetch(`/api/payments/check-stripe?sessionId=${sessionId}`);
            const stripeData = await stripeResponse.json();
            
            console.log('🔍 Stripe direct check:', stripeData);
            
            if (stripeData.success && stripeData.status === 'complete') {
              console.log('✅ Stripe confirms payment succeeded! Updating database...');
              // Update the database status
              const updateResponse = await fetch('/api/payments/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  sessionId, 
                  status: 'succeeded',
                  stripeData: stripeData.sessionData 
                })
              });
              
              if (updateResponse.ok) {
                setStatus('success');
                
                // Check if this is an upgrade or new registration
                // Be EXTREMELY aggressive in detecting upgrades to avoid OAuth users going to payment/confirm
                const isUpgrade = data.tempUserPayload?.isUpgrade || 
                                 data.tempUserPayload?.isOAuthUser ||
                                 data.tempUserPayload?.userId === 'oauth-user' ||
                                 (data.tempUserPayload?.userId && data.tempUserPayload.userId !== 'oauth-user') ||
                                 // If user exists in localStorage, it's likely an upgrade
                                 (typeof window !== 'undefined' && localStorage.getItem('userLoggedIn')) ||
                                 // If no tempUserPayload but user is logged in, treat as upgrade
                                 (!data.tempUserPayload && typeof window !== 'undefined' && localStorage.getItem('userLoggedIn')) ||
                                 // If user is logged in via OAuth (check session), treat as upgrade
                                 (typeof window !== 'undefined' && localStorage.getItem('userLoggedIn') && 
                                  JSON.parse(localStorage.getItem('userLoggedIn') || '{}').provider !== 'credentials');
                console.log('🔍 Stripe fallback - Is upgrade?', isUpgrade);
                
                if (isUpgrade) {
                  // For upgrades, redirect to upgrade success page
                  router.push(`/membership/upgrade-success?session_id=${sessionId}&paymentRecordId=${paymentRecordId}`);
                } else {
                  // For new registrations, redirect to payment confirm page
                  router.push(`/payment/confirm?session_id=${sessionId}`);
                }
                return;
              }
            }
          } catch (stripeErr) {
            console.error('Stripe fallback check failed:', stripeErr);
          }
        }
        
        // Continue polling if still pending
        if (pollCountRef.current < maxPollAttempts - 1) {
          pollCountRef.current += 1;
          setPollCount(pollCountRef.current);
          console.log(`🔄 Polling again in ${pollInterval}ms (attempt ${pollCountRef.current}/${maxPollAttempts})`);
          setTimeout(checkPaymentStatus, pollInterval);
        } else {
          console.log('⏰ Max polling attempts reached, showing processing message');
          setStatus('processing');
        }
      }
    } catch (err) {
      console.error('❌ Error checking payment status:', err);
      setError(err.message);
      setStatus('error');
    }
  }, [paymentRecordId, sessionId, maxPollAttempts, pollInterval, router]);

  useEffect(() => {
    if (cancelled === 'true') {
      setStatus('cancelled');
      return;
    }

    if (!sessionId && !paymentRecordId) {
      setError('Missing session or payment record ID');
      setStatus('error');
      return;
    }

    checkPaymentStatus();
  }, [sessionId, paymentRecordId, cancelled, checkPaymentStatus]);

  const handleManualCheck = async () => {
    console.log('🔍 Manual check triggered');
    pollCountRef.current = 0;
    setPollCount(0);
    
    // If we have a sessionId, try Stripe direct check first
    if (sessionId) {
      try {
        console.log('🔍 Checking Stripe directly for manual check...');
        const stripeResponse = await fetch(`/api/payments/check-stripe?sessionId=${sessionId}`);
        const stripeData = await stripeResponse.json();
        
        console.log('🔍 Manual Stripe check result:', stripeData);
        
        if (stripeData.success && stripeData.status === 'complete') {
          console.log('✅ Manual check: Stripe confirms payment succeeded!');
          // Update the database status
          const updateResponse = await fetch('/api/payments/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              sessionId, 
              status: 'succeeded',
              stripeData: stripeData.sessionData 
            })
          });
          
          if (updateResponse.ok) {
            setStatus('success');
            
            // Check if this is an upgrade or new registration
            // Be EXTREMELY aggressive in detecting upgrades to avoid OAuth users going to payment/confirm
            const isUpgrade = paymentData?.tempUserPayload?.isUpgrade || 
                             paymentData?.tempUserPayload?.isOAuthUser ||
                             paymentData?.tempUserPayload?.userId === 'oauth-user' ||
                             (paymentData?.tempUserPayload?.userId && paymentData.tempUserPayload.userId !== 'oauth-user') ||
                             // If user exists in localStorage, it's likely an upgrade
                             (typeof window !== 'undefined' && localStorage.getItem('userLoggedIn')) ||
                             // If no tempUserPayload but user is logged in, treat as upgrade
                             (!paymentData?.tempUserPayload && typeof window !== 'undefined' && localStorage.getItem('userLoggedIn')) ||
                             // If user is logged in via OAuth (check session), treat as upgrade
                             (typeof window !== 'undefined' && localStorage.getItem('userLoggedIn') && 
                              JSON.parse(localStorage.getItem('userLoggedIn') || '{}').provider !== 'credentials');
            console.log('🔍 Manual check - Is upgrade?', isUpgrade);
            
            if (isUpgrade) {
              // For upgrades, redirect to upgrade success page
              router.push(`/membership/upgrade-success?session_id=${sessionId}&paymentRecordId=${paymentRecordId}`);
            } else {
              // For new registrations, redirect to payment confirm page
              router.push(`/payment/confirm?session_id=${sessionId}`);
            }
            return;
          }
        }
      } catch (stripeErr) {
        console.error('Manual Stripe check failed:', stripeErr);
      }
    }
    
    // Fallback to regular check
    checkPaymentStatus();
  };

  const handleTryAgain = () => {
    router.push('/membership');
  };

  const handleBackToForm = () => {
    router.push('/');
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
          <p className="text-gray-300">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-semibold mb-2">Payment Successful!</h2>
          <p className="text-gray-300 mb-4">Redirecting you to complete your membership setup...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">✗</div>
          <h2 className="text-2xl font-semibold mb-4">Payment Failed</h2>
          <p className="text-gray-300 mb-6">
            Your payment could not be processed. This could be due to insufficient funds, 
            card issues, or the payment was cancelled.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToForm}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Membership Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="text-orange-500 text-6xl mb-4">⚠</div>
          <h2 className="text-2xl font-semibold mb-4">Payment Cancelled</h2>
          <p className="text-gray-300 mb-6">
            You cancelled the payment process. No charges have been made to your account.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToForm}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Membership Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="text-blue-500 text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-semibold mb-4">Payment Verification</h2>
          <p className="text-gray-300 mb-4">
            We're verifying your payment with Stripe. This usually takes a few moments.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            If your payment was successful on Stripe but this page is still showing, 
            click "Check Status Now" to verify directly with Stripe.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleManualCheck}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Check Status Now
            </button>
            <button
              onClick={handleBackToForm}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Close Window
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <div>Session ID: {sessionId?.substring(0, 20)}...</div>
            <div>Payment Record ID: {paymentRecordId?.substring(0, 20)}...</div>
            <div>Poll Attempts: {pollCount}/{maxPollAttempts}</div>
            {paymentData && (
              <div className="mt-2 p-2 bg-gray-800 rounded text-left">
                <div className="text-green-400 font-semibold mb-1">Debug Info:</div>
                <div>Status: {paymentData.status}</div>
                <div>Membership: {paymentData.membershipType}</div>
                <div>Amount: ${(paymentData.amount / 100).toFixed(2)}</div>
                <div>Email: {paymentData.email}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠</div>
          <h2 className="text-2xl font-semibold mb-4">Error</h2>
          <p className="text-gray-300 mb-6">
            {error || 'An unexpected error occurred while processing your payment.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleManualCheck}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToForm}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Membership Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <CheckoutReturnContent />
    </Suspense>
  );
}
