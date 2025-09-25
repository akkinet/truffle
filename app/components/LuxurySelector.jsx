"use client";

import React, { useState } from "react";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";

const options = [
  "Private jets",
  "Luxury Yachts",
  "Luxury Villa",
  "Luxury Cars",
];

export default function LuxurySelector() {
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    datetime: "",
    guests: "",
  });

  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleInput = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="lg:mx-[13%] bg-[#110003]/[0.44] border border-white border-opacity-25 backdrop-blur-[8.9px] text-white font-nexa mb-[5%]">
      <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-4 md:gap-[20px] pl-[2%] py-[25px]">
        {options.map((option, idx) => (
          <div
            key={`${option}-${idx}`}
            onClick={() => toggleOption(option)}
            className="flex items-center gap-[8px] cursor-pointer select-none"
          >
            <div
              className={`h-[11px] w-[11px] border-[0.5px] rounded-sm ${
                selected.includes(option)
                  ? "bg-white border-white"
                  : "border-white"
              }`}
            />
            <span className="text-[14px] font-extralight">{option}</span>
          </div>
        ))}
      </div>

      <div className="px-4 lg:px-8 mb-[25px]">
        <div
          className="md:grid md:border md:border-white md:border-opacity-25 flex flex-col gap-4"
          style={{
            gridTemplateColumns: "repeat(4, 1fr) 161px",
          }}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-white/10 md:bg-transparent rounded h-[40px] md:h-auto md:border-r md:border-white/25">
            <FaSearch className="text-white text-[12px]" />
            <input
              type="text"
              name="origin"
              placeholder="From"
              value={form.origin}
              onChange={handleInput}
              className="bg-transparent outline-none text-white placeholder-white/60 text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-white/10 md:bg-transparent rounded h-[40px] md:h-auto md:border-r md:border-white/25">
            <FaSearch className="text-white text-[12px]" />
            <input
              type="text"
              name="destination"
              placeholder="To"
              value={form.destination}
              onChange={handleInput}
              className="bg-transparent outline-none text-white placeholder-white/60 text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-white/10 md:bg-transparent rounded h-[40px] md:h-auto md:border-r md:border-white/25">
            <FaCalendarAlt className="text-white text-[12px]" />
            <input
              type="date"
              name="datetime"
              value={form.datetime}
              onChange={handleInput}
              className="bg-transparent outline-none text-white placeholder-white/60 text-sm w-full"
            />
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-3">
            <input
              type="text"
              name="guests"
              placeholder="Adults/Kids"
              value={form.guests}
              onChange={handleInput}
              className="bg-transparent outline-none text-white placeholder-white/60 text-sm w-full"
            />
          </div>

          <button className="md:bg-white md:text-black bg-[#ECECEC] text-[#110400] text-sm px-6 py-2 font-medium rounded md:rounded-none hover:opacity-90 transition whitespace-nowrap">
            <span className="md:block hidden">Submit Request</span>
            <span className="md:hidden block">Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
