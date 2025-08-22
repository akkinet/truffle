"use client";
import Image from "next/image";
import { useState } from "react";
import NewMemberModal from "./NewMemberModal";
import LoginPage from "./LoginModal";
import { signOut, useSession } from "next-auth/react";

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { data: session } = useSession();
  let isLoggedIn = null;
  if (typeof window !== 'undefined') {
  isLoggedIn = JSON.parse(window.localStorage.getItem("userLoggedIn"));
  }
  const userLogOut = () => {
    window.localStorage.removeItem("userLoggedIn");
    signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <div className="px-4 md:px-[10%] flex flex-col md:flex-row justify-between items-center pt-[20px] md:pt-[40px] pb-[20px] md:pb-[30px] font-garet bg-gradient-to-b from-[#110400] to-[#0C0300] gap-4">
        <div className="flex flex-wrap justify-center md:w-[20%] text-[14px] gap-4 text-white">
          <p className="cursor-pointer">Home</p>
          <p>Services</p>
          <p>Experiences</p>
          <p>About</p>
        </div>

        <Image
          src="/Logo.svg"
          height={40}
          width={150}
          alt="Logo"
          className="w-[120px] md:w-[190px] h-auto"
        />

        <div className="flex flex-wrap justify-center md:w-[20%] text-[14px] gap-4 text-white">
          <p
            className="cursor-pointer hover:underline"
            onClick={() => setIsModalOpen(true)}
          >
            Membership
          </p>
          {session || isLoggedIn ?
            <p
              onClick={userLogOut}
              className="cursor-pointer hover:underline"
            >
              Sign Out
            </p> :
            <p
              onClick={() => setIsLoginModalOpen(true)}
              className="cursor-pointer hover:underline"
            >
              Members Login
            </p>
          }
        </div>
      </div>
      {isModalOpen && <NewMemberModal onClose={() => setIsModalOpen(false)} />}
      {isLoginModalOpen && (
        <LoginPage onClose={() => setIsLoginModalOpen(false)} />
      )}
    </>
  );
};

export default Header;
