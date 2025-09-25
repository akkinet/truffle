"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import NewMemberModal from "./NewMemberModal";
import LoginPage from "./LoginModal";
import { signOut, useSession } from "next-auth/react";

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { data: session } = useSession();
  
  const userDropdownRef = useRef(null);
  
  // console.log("session:", session);
  
  let isLoggedIn = null;
  if (typeof window !== 'undefined') {
    isLoggedIn = JSON.parse(window.localStorage.getItem("userLoggedIn"));
  }

  const userLogOut = () => { window.localStorage.removeItem("userLoggedIn"); signOut({ callbackUrl: "/" }); }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    try {
      // Close dropdowns first
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
      
      // Remove localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem("userLoggedIn");
      }
      
      // Sign out with NextAuth
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const getUserEmail = () => {
    if (session?.user?.email) {
      return session.user.email;
    }
    // Fallback for localStorage user data
    if (isLoggedIn?.email) {
      return isLoggedIn.email;
    }
    return "User";
  };

  const getProviderName = () => {
    if (session?.provider) {
      return session.provider;
    }
    if (session?.user?.provider) {
      return session.user.provider;
    }
    return "Local";
  };

  return (
    <>
      <div className="px-4 md:px-[10%] flex justify-between items-center pt-[15px] md:pt-[25px] pb-[15px] md:pb-[20px] font-garet bg-gradient-to-b from-[#110400] to-[#0C0300] relative">
        
        {/* Desktop Navigation - Left */}
        <div className="hidden md:flex w-[20%] text-[14px] gap-4 text-white">
          <p className="cursor-pointer hover:underline">Home</p>
          <p className="cursor-pointer hover:underline">Services</p>
          <p className="cursor-pointer hover:underline">Experiences</p>
          <p className="cursor-pointer hover:underline">About</p>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-md p-1"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Logo - Center */}
        <div className="flex-1 md:flex-none flex justify-center">
          <Image
            src="/Logo.svg"
            height={40}
            width={150}
            alt="Logo"
            className="w-[120px] md:w-[190px] h-auto"
          />
        </div>

        {/* Desktop Right Menu */}
        <div className="hidden md:flex w-[20%] text-[14px] gap-4 text-white justify-end items-center">
          <p
            className="cursor-pointer hover:underline whitespace-nowrap"
            onClick={() => setIsModalOpen(true)}
          >
            Membership
          </p>
          
          {session || isLoggedIn ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={toggleUserDropdown}
                className="cursor-pointer hover:underline flex items-center gap-1 text-right"
                title={getUserEmail()}
              >
                <span className="truncate min-w-0 max-w-[200px]">
                  {getUserEmail()}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform flex-shrink-0 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">Email</p>
                    <p className="text-gray-500 break-all text-xs">{getUserEmail()}</p>
                  </div>
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">Provider</p>
                    <p className="text-gray-500 capitalize">{getProviderName()}</p>
                  </div>
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSignOut();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p
              onClick={() => setIsLoginModalOpen(true)}
              className="cursor-pointer hover:underline whitespace-nowrap"
            >
              Members Login
            </p>
          )}
        </div>

        {/* Mobile Right - User Menu */}
        <div className="md:hidden flex items-center">
          {session || isLoggedIn ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={toggleUserDropdown}
                className="text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-md p-1"
                title={getUserEmail()}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">Email</p>
                    <p className="text-gray-500 break-all">{getUserEmail()}</p>
                  </div>
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">Provider</p>
                    <p className="text-gray-500 capitalize">{getProviderName()}</p>
                  </div>
                  <button
                    onClick={userLogOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={toggleMobileMenu}>
        <div 
          className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#110400] to-[#0C0300] shadow-lg transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-md p-1"
              aria-label="Close mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Content */}
          <div className="flex flex-col px-4 pb-4">
            <div className="flex flex-col gap-6 text-white text-[18px]">
              <p className="cursor-pointer hover:underline transition-colors" onClick={toggleMobileMenu}>
                Home
              </p>
              <p className="cursor-pointer hover:underline transition-colors" onClick={toggleMobileMenu}>
                Services
              </p>
              <p className="cursor-pointer hover:underline transition-colors" onClick={toggleMobileMenu}>
                Experiences
              </p>
              <p className="cursor-pointer hover:underline transition-colors" onClick={toggleMobileMenu}>
                About
              </p>
              
              <hr className="border-gray-600 my-2" />
              
              <p
                className="cursor-pointer hover:underline transition-colors"
                onClick={() => {
                  setIsModalOpen(true);
                  toggleMobileMenu();
                }}
              >
                Membership
              </p>
              
              {!(session || isLoggedIn) && (
                <p
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    toggleMobileMenu();
                  }}
                  className="cursor-pointer hover:underline transition-colors"
                >
                  Members Login
                </p>
              )}

              {/* Mobile User Section */}
              {(session || isLoggedIn) && (
                <>
                  <hr className="border-gray-600 my-2" />
                  <div className="text-white">
                    <p className="font-medium text-[16px] mb-2">Logged in as:</p>
                    <p className="text-[14px] text-gray-300 break-all mb-3">{getUserEmail()}</p>
                    <p className="text-[14px] text-gray-400 mb-4">Provider: <span className="capitalize">{getProviderName()}</span></p>
                    <div
                      onClick={handleSignOut}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-[14px] transition-colors cursor-pointer text-center"
                    >
                      Sign Out
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && <NewMemberModal onClose={() => setIsModalOpen(false)} />}
      {isLoginModalOpen && (
        <LoginPage onClose={() => setIsLoginModalOpen(false)} />
      )}
    </>
  );
};

export default Header;