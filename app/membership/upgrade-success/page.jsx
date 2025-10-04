"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function UpgradeSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');
  const paymentRecordId = searchParams.get('paymentRecordId');

  const maxPollAttempts = 8;
  const pollInterval = 2000; // 2 seconds

  useEffect(() => {
    if (!sessionId && !paymentRecordId) {
      setError('Missing session or payment record ID');
      setStatus('error');
      return;
    }

    checkPaymentStatus();
  }, [sessionId, paymentRecordId]);

  const checkPaymentStatus = async () => {
    try {
      const params = new URLSearchParams();
      if (paymentRecordId) params.append('paymentRecordId', paymentRecordId);
      if (sessionId) params.append('sessionId', sessionId);

      const response = await fetch(`/api/payments/status?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check payment status');
      }

      setPaymentData(data);

      if (data.status === 'succeeded') {
        setStatus('success');
        // Auto-upgrade user membership
        await upgradeUserMembership(data);
        return;
      }

      if (data.status === 'failed') {
        setStatus('failed');
        return;
      }

      if (data.status === 'pending') {
        if (pollCount < maxPollAttempts - 1) {
          setPollCount(prev => prev + 1);
          setTimeout(checkPaymentStatus, pollInterval);
        } else {
          setStatus('processing');
        }
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  const upgradeUserMembership = async (paymentData) => {
    try {
      console.log('🔄 Starting membership upgrade process...', paymentData);
      
      const response = await fetch('/api/membership/complete-upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentRecordId: paymentData.paymentRecordId
        }),
      });

      const data = await response.json();
      console.log('📊 Complete upgrade API response:', { status: response.status, data });

      if (response.ok && data.success) {
        console.log('✅ Membership upgrade successful, updating localStorage...');
        
        // Update localStorage with new membership info
        const currentUser = JSON.parse(localStorage.getItem('userLoggedIn') || '{}');
        console.log('📝 Current user data:', currentUser);
        
        currentUser.membership = data.user.membership;
        currentUser.membershipStatus = data.user.membershipStatus;
        currentUser.membershipStartedAt = data.user.membershipStartedAt;
        currentUser.membershipPaidAmount = data.user.membershipPaidAmount;
        
        console.log('📝 Updated user data:', currentUser);
        localStorage.setItem('userLoggedIn', JSON.stringify(currentUser));
        
        // Update NextAuth session
        console.log('🔄 Updating NextAuth session...');
        try {
          await update({
            ...session?.user,
            membership: data.user.membership,
            membershipStatus: data.user.membershipStatus,
            membershipStartedAt: data.user.membershipStartedAt,
            membershipPaidAmount: data.user.membershipPaidAmount
          });
          console.log('✅ NextAuth session updated successfully');
          
          // Force session refresh by triggering a re-fetch
          setTimeout(async () => {
            try {
              await update();
              console.log('✅ NextAuth session refreshed');
            } catch (refreshError) {
              console.error('❌ Failed to refresh NextAuth session:', refreshError);
            }
          }, 1000);
        } catch (sessionError) {
          console.error('❌ Failed to update NextAuth session:', sessionError);
        }
        
        // Dispatch custom event to notify components of membership update
        console.log('📡 Dispatching membershipUpdated event...');
        window.dispatchEvent(new CustomEvent('membershipUpdated', { 
          detail: { 
            membership: data.user.membership,
            membershipStatus: data.user.membershipStatus,
            membershipStartedAt: data.user.membershipStartedAt,
            membershipPaidAmount: data.user.membershipPaidAmount
          } 
        }));
        
        console.log('✅ Membership update process completed successfully');
        
        // Logout user and redirect to login to refresh session
        console.log('🔄 Logging out user to refresh session...');
        setTimeout(async () => {
          try {
            // Clear localStorage
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('authToken');
            
            // Sign out from NextAuth
            await signOut({ 
              redirect: false,
              callbackUrl: '/auth/signin?message=membership-upgraded'
            });
            
            console.log('✅ User logged out successfully');
            
            // Redirect to login page with success message
            router.push('/auth/signin?message=membership-upgraded');
          } catch (logoutError) {
            console.error('❌ Error during logout:', logoutError);
            // Fallback: redirect to login anyway
            router.push('/auth/signin?message=membership-upgraded');
          }
        }, 2000);
      } else {
        console.error('❌ Membership upgrade failed:', data);
        // Still try to update localStorage with payment data if API fails
        const membershipType = paymentData.membershipType || 'platinum'; // Default to platinum
        console.log('🔄 Fallback: updating localStorage with payment data...');
        const currentUser = JSON.parse(localStorage.getItem('userLoggedIn') || '{}');
        currentUser.membership = membershipType;
        currentUser.membershipStatus = 'active';
        currentUser.membershipStartedAt = new Date();
        localStorage.setItem('userLoggedIn', JSON.stringify(currentUser));
        
        // Update NextAuth session
        console.log('🔄 Updating NextAuth session (fallback)...');
        try {
          await update({
            ...session?.user,
            membership: membershipType,
            membershipStatus: 'active',
            membershipStartedAt: new Date()
          });
          console.log('✅ NextAuth session updated successfully (fallback)');
        } catch (sessionError) {
          console.error('❌ Failed to update NextAuth session (fallback):', sessionError);
        }
        
        window.dispatchEvent(new CustomEvent('membershipUpdated', { 
          detail: { 
            membership: membershipType,
            membershipStatus: 'active' 
          } 
        }));
      }
    } catch (error) {
      console.error('❌ Error upgrading membership:', error);
      // Fallback: try to update localStorage with payment data
      const membershipType = paymentData.membershipType || 'platinum'; // Default to platinum
      console.log('🔄 Fallback: updating localStorage with payment data...');
      const currentUser = JSON.parse(localStorage.getItem('userLoggedIn') || '{}');
      currentUser.membership = membershipType;
      currentUser.membershipStatus = 'active';
      currentUser.membershipStartedAt = new Date();
      localStorage.setItem('userLoggedIn', JSON.stringify(currentUser));
      
      // Update NextAuth session
      console.log('🔄 Updating NextAuth session (catch fallback)...');
      try {
        await update({
          ...session?.user,
          membership: membershipType,
          membershipStatus: 'active',
          membershipStartedAt: new Date()
        });
        console.log('✅ NextAuth session updated successfully (catch fallback)');
      } catch (sessionError) {
        console.error('❌ Failed to update NextAuth session (catch fallback):', sessionError);
      }
      
      window.dispatchEvent(new CustomEvent('membershipUpdated', { 
        detail: { 
          membership: membershipType,
          membershipStatus: 'active' 
        } 
      }));
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing Upgrade...</h2>
          <p className="text-gray-300">Please wait while we confirm your membership upgrade.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300]">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center text-white max-w-md mx-auto">
            <div className="text-green-500 text-6xl mb-6">✓</div>
            <h2 className="text-3xl font-semibold mb-4">Upgrade Successful!</h2>
            <p className="text-gray-300 mb-6">
              Your membership has been successfully upgraded to{' '}
              <span className="text-yellow-500 font-semibold">
                {paymentData?.membershipType?.charAt(0).toUpperCase() + paymentData?.membershipType?.slice(1)}
              </span>
            </p>
            <p className="text-gray-300 mb-4">
              You now have access to all premium features and services.
            </p>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                🔄 Please wait while we refresh your session... You will be automatically logged out and redirected to sign in again to access your new membership benefits.
              </p>
            </div>
            <button
              onClick={handleBackToHome}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300]">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center text-white max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-6">✗</div>
            <h2 className="text-3xl font-semibold mb-4">Upgrade Failed</h2>
            <p className="text-gray-300 mb-8">
              Your membership upgrade could not be processed. Please try again or contact support.
            </p>
            <button
              onClick={() => router.push('/membership')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300]">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center text-white max-w-md mx-auto">
            <div className="text-blue-500 text-6xl mb-6">⏳</div>
            <h2 className="text-3xl font-semibold mb-4">Processing Upgrade</h2>
            <p className="text-gray-300 mb-8">
              Your upgrade is being processed. You will receive an email confirmation shortly.
            </p>
            <button
              onClick={handleBackToHome}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300]">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center text-white max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-6">⚠</div>
            <h2 className="text-3xl font-semibold mb-4">Error</h2>
            <p className="text-gray-300 mb-8">
              {error || 'An unexpected error occurred while processing your upgrade.'}
            </p>
            <button
              onClick={() => router.push('/membership')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <UpgradeSuccessContent />
    </Suspense>
  );
}
