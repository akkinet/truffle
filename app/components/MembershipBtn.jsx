"use client";

import { useState } from "react";
import MembershipModal from "./MembershipModal";

export default function MembershipButton({ label }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#ECECEC] text-[#110400] hover:bg-[#261612] hover:text-[#ECECEC] transition font-nexa font-semibold text-[14px] py-2 px-6"
      >
        {label}
      </button>

      <MembershipModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
