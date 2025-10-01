'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    
    switch (error) {
      case 'Configuration':
        setErrorMessage('There is a problem with the server configuration.');
        break;
      case 'AccessDenied':
        setErrorMessage('Access denied. You do not have permission to sign in.');
        break;
      case 'Verification':
        setErrorMessage('The verification token has expired or has already been used.');
        break;
      case 'Callback':
        setErrorMessage('Authentication failed. Please try again.');
        break;
      case 'OAuthSignin':
        setErrorMessage('Error occurred during OAuth sign-in process.');
        break;
      case 'OAuthCallback':
        setErrorMessage('Error occurred during OAuth callback.');
        break;
      case 'OAuthCreateAccount':
        setErrorMessage('Could not create OAuth account.');
        break;
      case 'EmailCreateAccount':
        setErrorMessage('Could not create email account.');
        break;
      case 'Callback':
        setErrorMessage('Authentication callback failed.');
        break;
      case 'OAuthAccountNotLinked':
        setErrorMessage('Email already exists with a different provider.');
        break;
      case 'EmailSignin':
        setErrorMessage('Check your email for a sign-in link.');
        break;
      case 'CredentialsSignin':
        setErrorMessage('Sign in failed. Check your credentials.');
        break;
      case 'SessionRequired':
        setErrorMessage('Please sign in to access this page.');
        break;
      default:
        setErrorMessage('An unexpected error occurred during authentication.');
    }
  }, [searchParams]);

  const handleRetry = () => {
    router.push('/auth/signin');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
          
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm">{errorMessage}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-white/10 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Go Home
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#110400] to-[#0C0300] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
