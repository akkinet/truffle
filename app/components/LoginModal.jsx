"use client";

import React from "react";
import { FiMail, FiEyeOff } from "react-icons/fi";
import { IoMdArrowRoundBack } from "react-icons/io";
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

  if (status === "authenticated" && session?.user) {
    setTimeout(() => router.push("/"), 500);
    return <p>Redirecting to dashboard...</p>;
  }

  const handleCredentialsSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
    });

    console.log("Sign-in result:", result);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-[#110003]/90 backdrop-blur-lg z-50">
      {error === "OAuthAccountNotLinked" && (
        <p className="text-red-500 mb-4">
          This email is linked to another account. Please use the same provider or contact support to link accounts.
        </p>
      )}
      {error === "CredentialsSignin" && (
        <p className="text-red-500 mb-4">Invalid email or password.</p>
      )}
      <button
        onClick={onClose}
        className="absolute top-[2%] left-[5%] w-8 h-8 flex items-center justify-center rounded-full border border-white/40 hover:bg-white/10"
      >
        <IoMdArrowRoundBack />
      </button>
      <div className="relative w-full max-w-md rounded-xl px-6 py-10 z-10 text-white ">
        <div className="flex justify-center gap-4 mb-6">
          <button onClick={() => signIn("google", { callbackUrl: "/" })} className="bg-white text-black text-sm font-medium w-[50%] justify-center py-2 rounded-md flex items-center gap-2 shadow-sm font-nexa">
            <Image src={GoogleIcon} height={12} width={12} alt="Google" />{" "}
            Google
          </button>
          <button onClick={() => signIn("facebook", { callbackUrl: "/" })} className="bg-white text-black text-sm font-medium w-[50%] justify-center py-2 rounded-md flex items-center gap-2 shadow-sm font-nexa">
            <Image src={FacebookIcon} height={12} width={12} alt="Google" />{" "}
            Facebook
          </button>
        </div>

        <div className="text-center text-sm text-white/60 mb-6 relative ">
          <span className="px-4 bg-[#1A0D04]/90 relative z-10 font-nexa">
            Or continue with Email
          </span>
          <div className="absolute left-0 top-1/2 w-full h-px bg-white/20 -z-0" />
        </div>

        <div className="space-y-4">
          <form onSubmit={handleCredentialsSubmit} className="mb-4">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email ID*"
                className="w-full bg-transparent border border-white/30 rounded-md py-3 px-4 pr-10 text-white placeholder-white/60 text-sm focus:outline-none font-nexa"
              />
              <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-lg" />
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password*"
                className="w-full bg-transparent border border-white/30 rounded-md py-3 px-4 pr-10 text-white placeholder-white/60 text-sm focus:outline-none font-nexa"
              />
              <FiEyeOff className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-lg" />
            </div>

            <div className="flex items-center justify-between text-xs text-white/60 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="appearance-none w-[14px] h-[14px] border border-white/40 checked:bg-white checked:accent-white cursor-pointer"
                  style={{
                    backgroundColor: "transparent",
                  }}
                />
                <span className="text-white/40">Remember me</span>
              </label>
              <a href="#" className="hover:underline font-nexa">
                Forgot Password ?
              </a>
            </div>

            <button type="submit" className="w-full bg-white text-black py-3 rounded-md text-sm font-semibold mt-4 font-nexa">
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
