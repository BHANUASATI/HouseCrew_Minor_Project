import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import logo from "../assets/HouseCrewLogo.png";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-black via-slate-900 to-black font-[Inter] text-white">

      {/* TOP GLOW */}
      <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-r from-orange-500/20 to-pink-500/20 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative">

        {/* ================= TOP GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-14">

          {/* LOGO + ABOUT */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src={logo} alt="HouseCrew" className="w-12 h-12 rounded-lg" />
              <span className="text-2xl font-extrabold">
                House<span className="text-orange-400">Crew</span>
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
              HouseCrew is a technology-enabled home services platform delivering
              trusted, verified, and premium-quality services at your doorstep.
            </p>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="font-semibold mb-5 text-white">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {[
                "About us",
                "Investor Relations",
                "Careers",
                "ESG Impact",
                "Terms & Conditions",
                "Privacy Policy",
                "Anti-discrimination Policy",
              ].map((item, i) => (
                <li
                  key={i}
                  className="cursor-pointer transition hover:text-orange-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CUSTOMERS */}
          <div>
            <h4 className="font-semibold mb-5 text-white">For Customers</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {["Reviews", "Categories near you", "Contact us"].map((item, i) => (
                <li
                  key={i}
                  className="cursor-pointer transition hover:text-orange-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* PROFESSIONALS */}
          <div>
            <h4 className="font-semibold mb-5 text-white">
              For Professionals
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="cursor-pointer transition hover:text-orange-400">
                Register as a professional
              </li>
              <li className="cursor-pointer transition hover:text-orange-400">
                Partner App
              </li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h4 className="font-semibold mb-5 text-white">Connect with us</h4>
            <div className="flex gap-4">
              {[
                <FaFacebookF />,
                <FaInstagram />,
                <FaLinkedinIn />,
                <FaTwitter />,
                <FaYoutube />,
              ].map((icon, i) => (
                <div
                  key={i}
                  className="
                    w-11 h-11 rounded-full
                    bg-white/5 backdrop-blur
                    border border-white/10
                    flex items-center justify-center
                    text-slate-300
                    cursor-pointer
                    transition-all duration-300
                    hover:scale-110
                    hover:text-white
                    hover:bg-gradient-to-r
                    hover:from-orange-500
                    hover:to-pink-500
                    hover:shadow-[0_0_25px_rgba(236,72,153,0.6)]
                  "
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ================= DIVIDER ================= */}
        <div className="my-14 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* ================= BOTTOM ================= */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-400">
          <p>* As on December 31, 2024</p>

          <p className="text-center md:text-right">
            © {new Date().getFullYear()}{" "}
            <span className="text-white font-medium">HouseCrew</span>.  
            All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
