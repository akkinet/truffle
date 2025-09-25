"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Signup1 from "../../public/Signup1.png";
import Signup2 from "../../public/Signup2.png";
import Signup3 from "../../public/Signup3.png";
import Signup4 from "../../public/Signup4.png";

export default function MembershipModal({
  isOpen,
  onClose,
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    receiveUpdates: false
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be 8+ chars with uppercase, lowercase & number";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          receiveUpdates: formData.receiveUpdates
        }),
      });

      const data = await response.text();

      if (response.ok) {
        toast.success(data || "Account created successfully!");
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          receiveUpdates: false
        });
        // Close modal after successful registration
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error(data || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.");
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0300] p-4 transition-opacity duration-300 ease-in-out">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 md:top-6 md:left-6 text-white text-xl md:text-2xl hover:opacity-80 transition border border-white rounded-full p-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 z-10"
      >
        <IoMdArrowRoundBack />
      </button>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="!text-sm"
        toastClassName="!text-sm !py-2 !px-3 !min-h-[50px] !rounded-lg"
        bodyClassName="!text-sm !p-2"
      />

      <div className="relative w-full max-w-[1150px] bg-[#0D0300] rounded-lg md:rounded-xl overflow-hidden flex flex-col lg:flex-row shadow-2xl font-garet transform transition-all duration-300 ease-in-out border border-white/20 max-h-[95vh] overflow-y-auto">
        
        {/* Left side - Images (Hidden on small screens, visible on large screens) */}
        <div className="hidden lg:flex lg:w-[50%] flex-col items-center justify-center p-4">
          <Image
            src={Signup1}
            height={173}
            width={466}
            alt="Signup1"
            className="mb-4 w-full max-w-[400px] h-auto"
          />
          <div className="flex flex-row justify-between w-full max-w-[400px]">
            <Image
              src={Signup2}
              height={400}
              width={270}
              alt="Signup2"
              className="mr-4 w-[60%] h-auto"
            />
            <div className="w-[35%]">
              <Image
                src={Signup3}
                height={194}
                width={177}
                alt="Signup3"
                className="mb-4 w-full h-auto"
              />
              <Image 
                src={Signup4} 
                height={185} 
                width={177} 
                alt="Signup4" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 px-4 py-6 md:px-6 md:py-8 lg:px-10 lg:py-10 text-white font-nexa bg-gradient-to-br from-[#0D0300] to-[#1a0f08]">
          
          {/* Mobile Header Image */}
          <div className="lg:hidden mb-6 flex justify-center">
            <Image
              src={Signup1}
              height={120}
              width={320}
              alt="Signup1"
              className="w-full max-w-[280px] h-auto"
            />
          </div>

          <h2 className="font-maleh text-[24px] md:text-[28px] lg:text-[34px] mb-4 md:mb-6 text-center lg:text-left">
            Get Started
          </h2>
          
          <form className="space-y-3 md:space-y-4 text-sm md:text-base" onSubmit={submitHandler}>
            
            {/* Name Fields Row - Desktop Side by Side, Mobile Stacked */}
            <div className="flex flex-col md:flex-row md:gap-4">
              {/* First Name */}
              <div className="relative flex-1 mb-3 md:mb-0">
                <input
                  type="text"
                  placeholder="First Name*"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`bg-transparent border-2 rounded-lg px-3 py-2 md:px-4 md:py-3 outline-none w-full transition-all duration-200 placeholder-gray-400 text-sm md:text-base ${
                    errors.firstName 
                      ? 'border-red-500 focus:border-red-400' 
                      : 'border-white/50 focus:border-white hover:border-white/70'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Last Name*"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`bg-transparent border-2 rounded-lg px-3 py-2 md:px-4 md:py-3 outline-none w-full transition-all duration-200 placeholder-gray-400 text-sm md:text-base ${
                    errors.lastName 
                      ? 'border-red-500 focus:border-red-400' 
                      : 'border-white/50 focus:border-white hover:border-white/70'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email ID*"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`bg-transparent border-2 rounded-lg px-3 py-2 md:px-4 md:py-3 outline-none w-full transition-all duration-200 placeholder-gray-400 text-sm md:text-base ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-white/50 focus:border-white hover:border-white/70'
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password*"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`bg-transparent border-2 rounded-lg px-3 py-2 md:px-4 md:py-3 pr-10 md:pr-12 outline-none w-full transition-all duration-200 placeholder-gray-400 text-sm md:text-base ${
                  errors.password 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-white/50 focus:border-white hover:border-white/70'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              >
                {showPassword ? <FaEyeSlash className="text-sm md:text-base" /> : <FaEye className="text-sm md:text-base" />}
              </button>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter Password*"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`bg-transparent border-2 rounded-lg px-3 py-2 md:px-4 md:py-3 pr-10 md:pr-12 outline-none w-full transition-all duration-200 placeholder-gray-400 text-sm md:text-base ${
                  errors.confirmPassword 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-white/50 focus:border-white hover:border-white/70'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash className="text-sm md:text-base" /> : <FaEye className="text-sm md:text-base" />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="text-[10px] md:text-xs mt-3 md:mt-4 leading-snug py-2 text-gray-300">
              By signing up, you agree to the Trufle{" "}
              <a className="underline hover:text-white transition-colors" href="#">
                privacy policy
              </a>{" "}
              and{" "}
              <a className="underline hover:text-white transition-colors" href="#">
                terms and conditions
              </a>
              . You can change the way we contact you or{" "}
              <a className="underline hover:text-white transition-colors" href="#">
                unsubscribe
              </a>{" "}
              at any time.
            </div>

            {/* Newsletter Checkbox */}
            <div className="py-2">
              <label className="flex items-start gap-3 text-xs md:text-sm cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.receiveUpdates}
                  onChange={(e) => handleInputChange('receiveUpdates', e.target.checked)}
                  className="accent-white mt-0.5 md:mt-1 transform scale-100 md:scale-110 transition-transform group-hover:scale-110 md:group-hover:scale-125 flex-shrink-0" 
                />
                <span className="text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                  I would like to receive updates, events, news and benefits from Trufle.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 md:mt-6 bg-white text-[#110400] py-2.5 md:py-3 px-4 md:px-6 font-semibold hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center text-sm md:text-base"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 text-sm md:text-base" />
                  Creating Membership...
                </>
              ) : (
                "Create Membership"
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center mt-3 md:mt-4 text-xs md:text-sm">
              Already have an account?{" "}
              <span className="underline cursor-pointer hover:text-gray-300 transition-colors">
                Sign in
              </span>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-open {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-modal-open {
          animation: modal-open 0.3s ease-out forwards;
        }

        /* Custom scrollbar for mobile */
        @media (max-width: 768px) {
          .overflow-y-auto::-webkit-scrollbar {
            width: 4px;
          }
          
          .overflow-y-auto::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
          }
          
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
          }
          
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
        }
      `}</style>
    </div>
  );
}