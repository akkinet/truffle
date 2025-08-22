import Image from "next/image";
import React from "react";
import Service1 from "@/public/Service1.png";
import Service2 from "@/public/Service2.png";
import Service3 from "@/public/Service3.png";
import Service4 from "@/public/Service4.png";
import Features1 from "@/public/Features1.png";
import Features2 from "@/public/Features2.png";
import Features3 from "@/public/Features3.png";
import Features4 from "@/public/Features4.png";

const services = [
  {
    id: 1,
    image: Service1,
    title: "Experiences",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  },
  {
    id: 2,
    image: Service2,
    title: "Private Jets",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  },
  {
    id: 3,
    image: Service3,
    title: "Luxury Yachts",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  },
  {
    id: 4,
    image: Service4,
    title: "Luxury Villas",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  },
];

const features = [
  {
    id: 1,
    image: Features1,
    title: "Apres Ski in South of France",
  },
  {
    id: 2,
    image: Features2,
    title: "Grand Prix in Monaco",
  },
  {
    id: 3,
    image: Features3,
    title: "Romantic Getaway in Santorini",
  },
  {
    id: 4,
    image: Features4,
    title: "Bora Bora Island Experience",
  },
];

const ServiceSelector = ({ type }) => {
  const renderService = ({
    id,
    image,
    title,
    description,
  }) => (
    <div
      key={id}
      className="h-auto w-full max-w-[270px] relative mx-auto transform transition-transform duration-300 hover:scale-[1.05] group"
    >
      <div className="relative">
        <Image
          src={image}
          height={type === "Services" ? 450 : 298}
          width={270}
          alt={title}
          className={`w-full h-auto object-cover ${
            type === "Experiences" ? "max-h-[285px]" : ""
          }`}
        />
        <div className="absolute inset-0 bg-[rgba(17,4,0,0.38)] pointer-events-none" />
        {type === "Experiences" && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
          </div>
        )}
      </div>

      {type === "Experiences" && <div className="h-4" />}

      <div
        className={`${type === "Services" ? "absolute bottom-10" : ""} w-full`}
      >
        <h3
          className={`text-center font-maleh text-[20px] md:text-[${
            type === "Services" ? "24" : "13"
          }px]`}
        >
          {title}
        </h3>
        {type === "Services" && (
          <p className="text-center font-nexa text-[12px] md:text-[14px] font-extralight px-[5%] md:px-[10%]">
            {description}
          </p>
        )}
        <div className="self-center bg-[#ECECEC] w-[165px] h-[37px] text-center font-nexa font-semibold text-[14px] items-center justify-center flex mx-auto mt-[20px] md:mt-[30px] text-[#110400] cursor-pointer hover:bg-[#261612] hover:text-[#ECECEC] transition-all duration-300">
          <p>Learn More</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row justify-center md:justify-between gap-6">
      {type === "Services"
        ? services.map((item) => renderService(item))
        : features.map((item) => renderService(item))}
    </div>
  );
};

export default ServiceSelector;
