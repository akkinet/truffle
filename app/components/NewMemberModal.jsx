"use client";

import React, { useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { MdOutlineCalendarToday } from "react-icons/md";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const NewMemberModal = ({ onClose }) => {
  const dateInputRef = useRef(null);

  const openDatePicker = () => {
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#110400]/90  px-4 font-nexa">
      <div className="w-full max-w-[420px] border border-white/20 backdrop-blur-lg rounded-md relative p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-[-18px] left-[-18px] text-xl border border-white/30 bg-[#1A0D04] p-[5px] flex items-center justify-center rounded-full"
        >
          <IoMdClose className="h-[17px] w-[17px] text-white" />
        </button>

        <div className="flex flex-col items-center justify-center mt-2 mb-4">
          <button className="bg-white text-black text-[12px] w-full py-[10px] rounded-sm font-bold">
            APPLY MEMBERSHIP
          </button>
          <div className="text-center text-sm text-white/60 relative my-[15px] mb-[25px] w-full">
            <span className="px-4 bg-[#110400]/90 backdrop-blur-lg relative z-10 text-[20px]">
              Or Submit a Request
            </span>
            <div className="absolute left-0 top-1/2 w-full h-px bg-white/20 -z-0" />
          </div>
        </div>

        <form className="space-y-4 text-[12px]">
          <div className="flex gap-2">
            <div className="flex items-center border border-white/40 px-[5px] py-[2px]">
              <CiSearch className="h-[23px] w-[23px] text-white/40" />
              <input
                type="text"
                placeholder="Origin From"
                className="outline-none border-none px-2 py-1 placeholder-white/40 text-white text-[13px]"
              />
            </div>
            <div className="flex items-center border border-white/40 px-[5px] py-[2px]">
              <CiSearch className="h-[23px] w-[23px] text-white/40" />
              <input
                type="text"
                placeholder="Destination"
                className="outline-none border-none px-2 py-1 placeholder-white/40 text-white text-[13px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-white text-[11px]">
            {[
              "Private Jet",
              "Chopper",
              "Luxury Yacht",
              "Luxury Villa",
              "Luxury/Sports Car",
              "Other",
            ].map((label) => (
              <label
                key={label}
                className="flex items-center gap-2 cursor-pointer py-[5px] pl-[5%]"
              >
                <input
                  type="checkbox"
                  className="appearance-none w-[14px] h-[14px] border border-white/40 checked:bg-white checked:accent-white cursor-pointer"
                  style={{
                    backgroundColor: "transparent",
                  }}
                />
                <span className="text-white/40 text-[13px]">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block mb-1 text-white/40 text-[14px]">
                Departure Date & Time
              </label>
              <div className="flex items-center border border-white/30 px-2 py-2 rounded-sm relative">
                <button
                  type="button"
                  onClick={openDatePicker}
                  className="text-white/50 text-[15px] mr-1"
                >
                  <MdOutlineCalendarToday />
                </button>
                <input
                  type="date"
                  ref={dateInputRef}
                  className="w-full bg-transparent px-1 text-white placeholder-white/40 text-[13px] outline-none border-none appearance-none pointer-events-none"
                />
              </div>
            </div>
            <div className="w-1/2">
              <label className="block mb-1 text-white/40 text-[14px]">
                No. of Travellers
              </label>
              <div className="flex gap-2">
                {["Adult", "Kids"].map((label) => (
                  <div key={label} className="relative w-1/2 group">
                    <input
                      type="number"
                      placeholder={label}
                      className="w-full px-2 py-2 pr-6 rounded-sm border border-white/30 placeholder-white/40 text-white outline-none text-[13px] appearance-none
                      [&::-webkit-inner-spin-button]:appearance-none
                      [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <div className="absolute right-1 top-1 flex flex-col justify-between h-[calc(100%-0.5rem)] py-[3px] mr-[2px]">
                      <button
                        type="button"
                        className="text-white/50 hover:text-white text-[10px]"
                      >
                        <FaChevronUp />
                      </button>
                      <button
                        type="button"
                        className="text-white/50 hover:text-white text-[10px]"
                      >
                        <FaChevronDown />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {[
            { placeholder: "Full Name", inBoxPlaceholder: "eg. John Wick" },
            {
              placeholder: "Email Address",
              type: "email",
              inBoxPlaceholder: "eg. someone@google.com",
            },
            {
              placeholder: "Phone Number",
              type: "tel",
              inBoxPlaceholder: "+916396827140",
            },
          ].map(({ placeholder, type = "text", inBoxPlaceholder }) => (
            <div
              key={placeholder}
              className="flex items-center border border-white/30 px-2 py-2 rounded-sm relative"
            >
              <input
                type={type}
                placeholder={inBoxPlaceholder}
                className="w-full bg-transparent px-1 text-white outline-none border-none text-[13px]"
              />
              <span className="absolute left-2 top-[-8px] bg-[#1A0D04]/90 px-1 text-white/60 text-[10px]">
                {placeholder}
              </span>
            </div>
          ))}

          <button
            type="submit"
            className="mt-4 w-full bg-white text-black py-2 text-[13px] rounded-sm font-bold"
          >
            REQUEST BOOKING
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewMemberModal;
