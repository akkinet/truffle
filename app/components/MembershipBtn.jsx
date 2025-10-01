"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import MembershipModal from "./MembershipModal";

export default function MembershipButton({ label, user = null }) {
  const [open, setOpen] = useState(false);
  const [userMembership, setUserMembership] = useState('free');
  const [isClient, setIsClient] = useState(false);
  const { data: session, update } = useSession();

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check membership from both session and localStorage
  useEffect(() => {
    if (!isClient) return;
    
    // Check NextAuth session first
    if (session?.user?.membership) {
      setUserMembership(session.user.membership);
      return;
    }
    
    // Check localStorage for non-OAuth users
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    if (userLoggedIn) {
      try {
        const userData = JSON.parse(userLoggedIn);
        setUserMembership(userData.membership || 'free');
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserMembership('free');
      }
    } else {
      setUserMembership('free');
    }
  }, [session, isClient]);

  // Listen for membership updates
  useEffect(() => {
    if (!isClient) return;
    
    const handleMembershipUpdate = () => {
      // Check session first
      if (session?.user?.membership) {
        setUserMembership(session.user.membership);
        return;
      }
      
      // Check localStorage
      const userLoggedIn = localStorage.getItem('userLoggedIn');
      if (userLoggedIn) {
        try {
          const userData = JSON.parse(userLoggedIn);
          setUserMembership(userData.membership || 'free');
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUserMembership('free');
        }
      }
    };

    window.addEventListener('membershipUpdated', handleMembershipUpdate);
    window.addEventListener('storage', handleMembershipUpdate);
    
    return () => {
      window.removeEventListener('membershipUpdated', handleMembershipUpdate);
      window.removeEventListener('storage', handleMembershipUpdate);
    };
  }, [session, isClient]);
  
  // Don't show the button if user has a paid membership
  const hasPaidMembership = userMembership && userMembership !== 'free';
  
  console.log('MembershipButton check:', {
    sessionMembership: session?.user?.membership,
    localStorageMembership: userMembership,
    hasPaidMembership,
    shouldShowButton: !hasPaidMembership,
    isClient
  });
  
  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return null;
  }
  
  if (hasPaidMembership) {
    return null; // Hide the button for paid members
  }

  return (
    <>
      <button
        data-membership-btn
        onClick={() => setOpen(true)}
        data-membership-btn
        className="bg-[#ECECEC] text-[#110400] hover:bg-[#261612] hover:text-[#ECECEC] transition font-nexa font-semibold text-[14px] py-2 px-6"
      >
        {label}
      </button>

      <MembershipModal 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        user={user} 
        onSessionUpdate={update}
      />
    </>
  );
}
