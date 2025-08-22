"use client";

import Image from "next/image";
import { useEffect } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import Signup1 from "../../public/Signup1.png";
import Signup2 from "../../public/Signup2.png";
import Signup3 from "../../public/Signup3.png";
import Signup4 from "../../public/Signup4.png";

export default function MembershipModal({
  isOpen,
  onClose,
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0300] px-4 md:px-10 py-6 md:py-12 transition-opacity duration-300 ease-in-out">
      <button
        onClick={onClose}
        className="absolute top-[2%] left-[5%] text-white text-2xl hover:opacity-80 transition border-1 border-white rounded-full"
      >
        <IoMdArrowRoundBack />
      </button>
      <div className="relative w-full max-w-[1150px] bg-[#0D0300] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-xl font-garet transform transition-all duration-300 ease-in-out opacity-0 translate-y-10 animate-modal-open">
        <div className="w-full md:w-[50%] flex flex-col items-center justify-center">
          <Image
            src={Signup1}
            height={173}
            width={466}
            alt="Signup1"
            className="mb-[20px]"
          />
          <div className="flex flex-row justify-between">
            <Image
              src={Signup2}
              height={400}
              width={270}
              alt="Signup2"
              className="mr-[20px]"
            />
            <div>
              <Image
                src={Signup3}
                height={194}
                width={177}
                alt="Signup3"
                className="mb-[20px]"
              />
              <Image src={Signup4} height={185} width={177} alt="Signup4" />
            </div>
          </div>
        </div>

        <div className="md:w-1/2 px-6 py-8 md:px-10 md:py-10 text-white font-nexa">
          <h2 className="font-maleh text-[26px] md:text-[34px] mb-6">
            Get Started
          </h2>
          <form className="grid grid-cols-1 text-sm md:text-base">
            <input
              type="text"
              placeholder="First Name*"
              className="bg-transparent border border-white px-4 py-6 outline-none w-full"
            />
            <input
              type="text"
              placeholder="Last Name*"
              className="bg-transparent border border-white px-4 py-6 outline-none w-full"
            />
            <input
              type="email"
              placeholder="Email ID*"
              className="bg-transparent border border-white px-4 py-6 outline-none w-full"
            />
            <input
              type="password"
              placeholder="Create Password*"
              className="bg-transparent border border-white px-4 py-6 outline-none w-full"
            />
            <input
              type="password"
              placeholder="Re-enter Password*"
              className="bg-transparent border border-white px-4 py-6 outline-none w-full"
            />

            <div className="text-[10px] md:text-xs mt-2 leading-snug py-[5px]">
              By signing up, you agree to the Trufle{" "}
              <a className="underline" href="#">
                privacy policy
              </a>{" "}
              and{" "}
              <a className="underline" href="#">
                terms and conditions
              </a>
              . You can change the way we contact you or{" "}
              <a className="underline" href="#">
                unsubscribe
              </a>{" "}
              at any time.
            </div>
            <div className="py-2">
              <label className="flex items-center gap-2 text-xs mt-2">
                <input type="checkbox" className="accent-white" />
                <span>
                  I would like to receive updates, events and news and benefits
                  from Trufle.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-white text-[#110400] py-2 font-semibold hover:bg-[#261612] hover:text-white transition rounded"
            >
              Create Membership
            </button>

            <p className="text-center mt-3 text-xs underline cursor-pointer">
              Sign in
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
