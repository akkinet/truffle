"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import MembershipModal from "./MembershipModal";

export default function MembershipButton({ label, user = null }) {
  const [open, setOpen] = useState(false);
  const { data: session, update } = useSession();

  // Check membership from both session and localStorage
  const getMembershipStatus = () => {
    // Check NextAuth session first
    if (session?.user?.membership) {
      return session.user.membership;
    }
    
    // Check localStorage for non-OAuth users
    if (typeof window !== 'undefined') {
      const userLoggedIn = localStorage.getItem('userLoggedIn');
      if (userLoggedIn) {
        try {
          const userData = JSON.parse(userLoggedIn);
          return userData.membership || 'free';
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    
    return 'free';
  };

  const userMembership = getMembershipStatus();
  
  // Don't show the button if user has a paid membership
  const hasPaidMembership = userMembership && userMembership !== 'free';
  
  console.log('MembershipButton check:', {
    sessionMembership: session?.user?.membership,
    localStorageMembership: userMembership,
    hasPaidMembership,
    shouldShowButton: !hasPaidMembership
  });
  
  if (hasPaidMembership) {
    return null; // Hide the button for paid members
  }

  return (
    <>
      <button
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
