"use client";

import React, { useState } from "react";
import { FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoogleIcon from "../../public/GoogleIcon.svg";
import FacebookIcon from "../../public/FacebookIcon.svg";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const LoginPage = ({ onClose }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (status === "authenticated" && session?.user) {
    // setTimeout(() => router.push("/"), 500);
    return router.push("/");
    // return <p>Redirecting to dashboard...</p>; 
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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

  const handleCredentialsSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error("Invalid email or password");
        } else {
          toast.error("Login failed. Please try again");
        }
      } else if (result?.ok) {
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (error) {
      toast.error("Network error. Please check your connection");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      toast.error(`${provider} login failed. Please try again`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#110003]/90 backdrop-blur-lg z-50">
      
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
        toastClassName="!text-sm !py-1 !px-2 !min-h-[40px] !rounded-md !max-w-[280px] !text-black !font-bold"
        bodyClassName="!text-sm !p-1"
      />

      {error === "OAuthAccountNotLinked" && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
          This email is linked to another account. Please use the same provider.
        </div>
      )}

      <button
        onClick={onClose}
        className="absolute top-[2%] left-[5%] w-10 h-10 flex items-center justify-center rounded-full border border-white/40 hover:bg-white/10 transition-all duration-200 text-white text-xl"
      >
        <IoMdArrowRoundBack />
      </button>

      <div className="relative w-full max-w-md rounded-2xl px-8 py-12 z-10 text-white bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl mx-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 font-maleh">Welcome Back</h2>
          <p className="text-white/70 text-sm font-nexa">Sign in to your account</p>
        </div>

        {/* Social Login Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => handleSocialLogin("google")} 
            className="bg-white text-black text-sm font-medium w-[48%] justify-center py-3 rounded-lg flex items-center gap-2 shadow-lg hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 font-nexa"
          >
            <Image src={GoogleIcon} height={16} width={16} alt="Google" />
            Google
          </button>
          {/* <button 
            onClick={() => handleSocialLogin("facebook")} 
            className="bg-white text-black text-sm font-medium w-[48%] justify-center py-3 rounded-lg flex items-center gap-2 shadow-lg hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 font-nexa"
          >
            <Image src={FacebookIcon} height={16} width={16} alt="Facebook" />
            Facebook
          </button> */}
        </div>

        {/* Divider */}
        <div className="text-center text-sm text-white/60 mb-8 relative">
          <span className="px-4 bg-black/50 relative z-10 font-nexa">
            Or continue with Email
          </span>
          <div className="absolute left-0 top-1/2 w-full h-px bg-white/20 -z-0" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email ID*"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full bg-transparent border-2 rounded-lg py-3 px-4 pr-12 text-white placeholder-white/60 text-sm focus:outline-none transition-all duration-200 font-nexa ${
                errors.email 
                  ? 'border-red-500 focus:border-red-400' 
                  : 'border-white/40 focus:border-white hover:border-white/60'
              }`}
            />
            <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 text-lg" />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password*"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full bg-transparent border-2 rounded-lg py-3 px-4 pr-12 text-white placeholder-white/60 text-sm focus:outline-none transition-all duration-200 font-nexa ${
                errors.password 
                  ? 'border-red-500 focus:border-red-400' 
                  : 'border-white/40 focus:border-white hover:border-white/60'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-lg"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs text-white/70 mt-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="w-4 h-4 accent-white cursor-pointer transition-transform group-hover:scale-110"
              />
              <span className="group-hover:text-white transition-colors font-nexa">Remember me</span>
            </label>
            <a 
              href="/forgotPassword" 
              className="hover:underline hover:text-white transition-colors font-nexa"
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-lg text-sm font-semibold mt-6 font-nexa shadow-lg hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Logging In...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-xs text-white/70">
          Don't have an account?{" "}
          <span className="underline cursor-pointer hover:text-white transition-colors font-nexa">
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;