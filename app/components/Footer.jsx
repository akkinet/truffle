import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#0C0300] z-20 text-white font-garet border-t border-white relative -mt-[40px] md:-mt-[55px]">
      <div className="max-w-[95%] md:max-w-[85%] mx-auto px-4 md:px-6 py-[8%] md:py-[5%] flex flex-col items-center md:grid md:grid-cols-6 gap-y-8 gap-x-6 text-sm">
        <div className="md:col-span-1 space-y-1 leading-relaxed text-center md:text-left">
          <p>2261 MARKET STREET</p>
          <p>#5039</p>
          <p>SAN FRANCISCO, CA</p>
          <p>94114</p>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-nexa font-semibold mb-4 text-[14px]">SERVICES</h4>
          <ul className="space-y-2 text-[#b4b4b4]">
            <li>Private Jets</li>
            <li>Luxury Yachts</li>
            <li>Luxury Villa</li>
            <li>Concierge</li>
          </ul>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-nexa font-semibold mb-4 text-[14px]">
            MEMBERSHIP
          </h4>
          <ul className="space-y-2 text-[#b4b4b4]">
            <li>Individual Membership</li>
            <li>Corporate Membership</li>
            <li>Benefits</li>
            <li>Membership FAQ</li>
          </ul>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-nexa font-semibold mb-4 text-[14px]">
            EXPERIENCES
          </h4>
          <ul className="space-y-2 text-[#b4b4b4]">
            <li>Destination Packages</li>
            <li>Corporate Retreats</li>
            <li>Curated Itineraries</li>
            <li>Private Islands</li>
          </ul>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-nexa font-semibold mb-4 text-[14px]">
            MEDIA & RELATIONS
          </h4>
          <ul className="space-y-2 text-[#b4b4b4]">
            <li>Privacy Policy</li>
            <li>Cookies Policy</li>
            <li>News & Media</li>
            <li>FAQs</li>
          </ul>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-nexa font-semibold mb-4 text-[14px]">SOURCES</h4>
          <ul className="space-y-2 text-[#b4b4b4]">
            <li>Media Relations</li>
            <li>Partners</li>
            <li>Personal Relations</li>
            <li>Marketing Event</li>
          </ul>
        </div>
      </div>
      <div className="bg-[#1c0f0b] text-[#a3a3a3] text-sm flex flex-col items-center md:flex-row md:justify-between px-4 md:px-6 py-4 font-garet border-t border-[#261612] gap-3 md:gap-0">
        <span>All copyright reserved @2025</span>
        <div className="flex space-x-4 md:space-x-5 text-white text-lg">
          <FaFacebookF className="hover:text-[#ECECEC] cursor-pointer" />
          <FaInstagram className="hover:text-[#ECECEC] cursor-pointer" />
          <FaLinkedinIn className="hover:text-[#ECECEC] cursor-pointer" />
          <FaTwitter className="hover:text-[#ECECEC] cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}
