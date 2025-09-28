"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import MembershipModal from "./MembershipModal";

export default function MembershipButton({ label, user = null }) {
  const [open, setOpen] = useState(false);
  const { data: session, update } = useSession();

  // Don't show the button if user has a paid membership
  const hasPaidMembership = session?.user?.membership && session.user.membership !== 'free';
  
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
