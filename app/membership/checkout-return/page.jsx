"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CheckoutReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');
  const paymentRecordId = searchParams.get('paymentRecordId');
  const cancelled = searchParams.get('cancelled');

  const maxPollAttempts = 8;
  const pollInterval = 2000; // 2 seconds

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
  }, [sessionId, paymentRecordId, cancelled]); // Remove checkPaymentStatus from dependencies

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
        // Redirect to membership modal with payment confirmed
        router.push(`/?payment_confirmed=1&paymentRecordId=${paymentRecordId}`);
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

  const handleManualCheck = () => {
    setPollCount(0);
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
          <p className="text-gray-300 mb-4">Redirecting you back to complete your membership...</p>
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
          <h2 className="text-2xl font-semibold mb-4">Payment Processing</h2>
          <p className="text-gray-300 mb-6">
            Your payment is being processed. We'll verify it server-side and you will receive 
            an email when payment is confirmed.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleManualCheck}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Check Status
            </button>
            <button
              onClick={handleBackToForm}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Close Window
            </button>
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
