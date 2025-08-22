import Image from "next/image";
import Header from "./components/Header";
import HeadingImage from "@/public/Heading.png";
import Hero1 from "@/public/Hero1.png";
import JoinTruffle from "@/public/JoinTruffle.png";
import PartnersBG from "@/public/PartnersBG.png";
import JkareLogo from "@/public/JkareLogo.png";
import CarmellLogo from "@/public/CarmellLogo.png";
import EventCubeLogo from "@/public/EventCubeLogo.png";
import SubEmailBG from "@/public/SubEmailBG.png";
import LuxurySelector from "./components/LuxurySelector";
import ServiceSelector from "./components/ServiceSelector";
import SpotlightLogo from "./components/SpotlightLogo";
import Footer from "./components/Footer";
import MembershipButton from "./components/MembershipBtn";

export default function Home() {
  return (
    <div className="relative">
      <div className="absolute top-[30px] left-0 w-full z-[-1]">
        <Image
          src={HeadingImage}
          alt="Heading Image"
          width={2500}
          height={1054}
          className="w-full h-auto object-cover md:object-fill"
        />
        <div className="absolute bottom-0 left-0 w-full h-[120px] bg-gradient-to-b from-transparent to-[#110400]" />
      </div>
      <Header />
      <div className="mt-[60px] md:mt-[80px] text-center text-[28px] md:text-[42px] z-10 px-4 mb-[150px]">
        <h2 className="font-maleh font-thin leading-tight">
          Welcome to Trufle, a Luxury Lifestyle
          <br /> Management Compnay
        </h2>
        <h3 className="font-nexa text-[14px] md:text-[18px] font-extralight pt-[10px] z-10">
          Your life worth for living, we curated your experience with <br />
          utmost high quality and personalized touch.
        </h3>
        <div className="mt-[20px]">
          <MembershipButton label="APPLY MEMBERSHIP" />
        </div>

        <h2 className="text-left font-maleh font-normal text-[24px] md:text-[32px] ml-[5%] md:ml-[15%] mt-[10%] md:mt-[13%]">
          Book An Experience
        </h2>
        <LuxurySelector />
      </div>
      <div className="relative px-4 md:px-[10%] pt-[40px] pb-[30px] mt-[50px] bg-gradient-to-b from-[#110400] to-[#0C0300]">
        <div className="absolute -top-[100px] left-0 w-full h-[100px] bg-gradient-to-b from-transparent to-[#110400] z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between w-full gap-8">
          <div className="w-full md:w-[50%] flex flex-col justify-center">
            <h2 className="font-maleh text-[32px] md:text-[42px] font-light">
              Who We Are
            </h2>
            <p className="pr-0 md:pr-[5%] text-sm/20 font-garet md:text-base">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry&apos;s standard dummy
              text ever since the 1500s, when an unknown printer took a galley
              of type and scrambled it to make a type specimen book. <br />
              <br />
              It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged.
            </p>
          </div>
          <div className="w-full md:w-[50%] flex items-center justify-center">
            <Image
              src={Hero1}
              height={300}
              width={450}
              alt="Hero1"
              className="w-full h-auto max-w-[562px]"
            />
          </div>
        </div>
        <div>
          <h2 className="font-maleh text-[32px] md:text-[42px] font-light mt-[80px] md:mt-[127px] mb-[40px] md:mb-[60px] text-center">
            Services
          </h2>
          <ServiceSelector type="Services" />
          <div className="self-center bg-[#ECECEC] w-[135px] h-[37px] text-center font-nexa font-semibold text-[14px] items-center justify-center flex mx-auto mt-[40px] md:mt-[61px] mb-[60px] md:mb-[100px] text-[#110400] cursor-pointer hover:bg-[#261612] hover:text-[#ECECEC] transition-all duration-300">
            <p>SEE ALL</p>
          </div>
        </div>
        <div>
          <h2 className="font-maleh text-[32px] md:text-[42px] font-light mt-[80px] md:mt-[127px] mb-[40px] md:mb-[60px] text-center">
            Featured Experiences
          </h2>
          <ServiceSelector type="Experiences" />
          <div className="self-center bg-[#ECECEC] w-[135px] h-[37px] text-center font-nexa font-semibold text-[14px] items-center justify-center flex mx-auto mt-[40px] md:mt-[61px] mb-[60px] md:mb-[100px] text-[#110400] cursor-pointer hover:bg-[#261612] hover:text-[#ECECEC] transition-all duration-300">
            <p>SEE ALL</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-[60px] md:mb-[100px] gap-8">
          <div className="w-full md:w-[50%] flex items-center justify-center">
            <Image
              src={JoinTruffle}
              height={400}
              width={450}
              alt="Join Truffle"
              className="w-full h-auto max-w-[564px]"
            />
          </div>
          <ul className="w-full md:w-[40%] flex flex-col space-y-4 md:space-y-7 px-4">
            <h1 className="font-maleh text-[32px] md:text-[42px] font-light">
              Join The Truffle Club
            </h1>
            <li className="flex items-start">
              <span className="text-white mr-[10px]">✓</span>
              <span className="font-garet font-light text-[14px] md:text-[16px]">
                Lorem Ipsum is simply dummy text of the printing
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-[10px]">✓</span>
              <span className="font-garet font-light text-[14px] md:text-[16px]">
                Lorem Ipsum is simply dummy text of the printing
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-[10px]">✓</span>
              <span className="font-garet font-light text-[14px] md:text-[16px]">
                Lorem Ipsum is simply dummy text of the printing
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-[10px]">✓</span>
              <span className="font-garet font-light text-[14px] md:text-[16px]">
                Lorem Ipsum is simply dummy text of the printing
              </span>
            </li>
            <div className="mt-[20px]">
              <MembershipButton label="APPLY MEMBERSHIP" />
            </div>
            <div className="h-[20px] md:h-[30px]" />
          </ul>
        </div>
        <h1 className="font-maleh text-[32px] md:text-[42px] font-extralight text-center mb-[30px] md:mb-[46px]">
          Our Partners
        </h1>
      </div>
      <div className="relative w-full overflow-hidden">
        <img
          src={PartnersBG.src}
          alt="Blurred background"
          className="w-full h-full object-cover filter blur-[14px] absolute inset-0 z-0"
        />
        <div className="absolute inset-0 bg-[#261612]/[0.82] z-10" />

        <div className="relative z-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-5 px-4 md:px-[10%] py-8">
          <Image
            src={EventCubeLogo}
            alt="Event Cube Logo"
            className="h-[24px] md:h-[32px] w-auto"
          />
          <Image
            src={JkareLogo}
            alt="Jkare Logo"
            className="h-[24px] md:h-[32px] w-auto"
          />
          <Image
            src={JkareLogo}
            alt="Jkare Logo"
            className="h-[24px] md:h-[32px] w-auto"
          />
          <Image
            src={CarmellLogo}
            alt="Carmell Logo"
            className="h-[24px] md:h-[32px] w-auto"
          />
          <Image
            src={EventCubeLogo}
            alt="Event Cube Logo"
            className="h-[24px] md:h-[32px] w-auto"
          />
        </div>
      </div>

      <div className="h-[150px] bg-[#0C0300]"></div>
      <div className="flex justify-center items-center bg-[#110400] px-4">
        <div
          className="relative w-full max-w-[1152px] h-[250px] md:h-[314px] bg-cover bg-center flex flex-col justify-center items-center overflow-hidden"
          style={{
            backgroundImage: `url(${SubEmailBG.src})`,
          }}
        >
          <div className="absolute inset-0 bg-[#110400]/[0.36] z-0" />

          <div className="relative z-10 flex flex-col items-center w-full px-4">
            <h2 className="font-maleh text-lg sm:text-xl md:text-2xl lg:text-[32px] mb-3 sm:mb-4 text-center text-white leading-snug">
              Subscribe To The Newsletter
            </h2>
            <div className="flex w-full max-w-[670px] flex-col sm:flex-row gap-3 sm:gap-0">
              <input
                type="email"
                placeholder="Email ID"
                className="flex-1 h-[40px] px-4 bg-white/60 placeholder-white text-white font-nexa text-sm outline-none"
              />
              <button className="w-full sm:w-[150px] h-[40px] bg-[#261612] text-white text-sm font-semibold font-nexa">
                Register
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-[10%] pb-[30px] bg-[#0C0300] pt-[60px] md:pt-[100px]">
        <SpotlightLogo />
      </div>
      <Footer />
    </div>
  );
}
