import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRocket,
  FaUsers,
  FaShieldAlt,
  FaHandshake,
  FaChartLine,
  FaCogs,
} from "react-icons/fa";

const timeline = [
  {
    year: "2023",
    title: "Problem Discovery",
    desc: "Identified lack of trust, quality inconsistency, and safety issues in local home services.",
    icon: <FaChartLine />,
    color: "from-orange-500 to-pink-500",
  },
  {
    year: "Early 2024",
    title: "Concept & Research",
    desc: "Designed a transparent, customer-first, technology-driven service platform.",
    icon: <FaCogs />,
    color: "from-pink-500 to-fuchsia-500",
  },
  {
    year: "Mid 2024",
    title: "Platform Development",
    desc: "Built core systems including booking, verification, tracking, and service workflows.",
    icon: <FaRocket />,
    color: "from-orange-400 to-red-500",
  },
  {
    year: "Late 2024",
    title: "Professional Network",
    desc: "Onboarded skilled, verified professionals across multiple service categories.",
    icon: <FaUsers />,
    color: "from-indigo-500 to-blue-500",
  },
  {
    year: "2025",
    title: "Trust & Quality Layer",
    desc: "Introduced ratings, reviews, audits, and transparent pricing models.",
    icon: <FaShieldAlt />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    year: "2026",
    title: "Scale & Expansion",
    desc: "Expanding reach, automation, and service availability across regions.",
    icon: <FaHandshake />,
    color: "from-orange-500 to-pink-500",
  },
];

const About = () => {
  const [active, setActive] = useState(0);

  return (
    <section className="pt-24 pb-28 bg-gradient-to-b from-black via-slate-900 to-black font-[Inter]">
      <div className="max-w-7xl mx-auto px-4">

        {/* ================= HERO ================= */}
        <div className="text-center mb-24">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            About <span className="text-orange-500">HouseCrew</span>
          </h1>
          <p className="max-w-3xl mx-auto text-slate-300 text-lg leading-relaxed">
            HouseCrew is a technology-enabled home services platform delivering
            reliable, verified, and premium-quality services through a seamless
            digital experience.
          </p>
        </div>

        {/* ================= COMPANY INFO ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-28">
          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Who We Are
            </h2>
            <p className="text-slate-300 leading-relaxed">
              HouseCrew connects households with skilled, verified professionals
              using a transparent, scalable, and tech-driven platform.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Our Vision
            </h2>
            <p className="text-slate-300 leading-relaxed">
              To become the most trusted home services ecosystem by combining
              technology, skilled professionals, and customer-first design.
            </p>
          </div>
        </div>

        {/* ================= TIMELINE ================= */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            Our Journey
          </h2>

          <div className="
            relative max-w-6xl mx-auto
            bg-white/5 backdrop-blur-2xl
            rounded-3xl
            p-8 sm:p-10 md:p-14 lg:p-16
            border border-white/10
            shadow-2xl
          ">

            {/* LEFT ARROW */}
            <button
              onClick={() => setActive(active > 0 ? active - 1 : active)}
              className="
                absolute left-4 md:left-6
                top-6 md:top-1/2 md:-translate-y-1/2
                w-10 h-10 md:w-12 md:h-12
                rounded-full border border-white/20
                text-white flex items-center justify-center
                transition-all
                hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500
                hover:border-transparent
              "
            >
              ←
            </button>

            {/* RIGHT ARROW */}
            <button
              onClick={() =>
                setActive(active < timeline.length - 1 ? active + 1 : active)
              }
              className="
                absolute right-4 md:right-6
                top-6 md:top-1/2 md:-translate-y-1/2
                w-10 h-10 md:w-12 md:h-12
                rounded-full border border-white/20
                text-white flex items-center justify-center
                transition-all
                hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500
                hover:border-transparent
              "
            >
              →
            </button>

            {/* YEAR + CONTENT */}
            <div className="text-center mb-14">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={timeline[active].year}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.45 }}
                  className={`
                    text-[72px] sm:text-[96px] md:text-[140px] lg:text-[200px]
                    font-extrabold leading-none
                    bg-gradient-to-r ${timeline[active].color}
                    text-transparent bg-clip-text
                  `}
                >
                  {timeline[active].year}
                </motion.h1>
              </AnimatePresence>

              <div
                className={`
                  mx-auto mt-6
                  w-14 h-14 md:w-16 md:h-16
                  rounded-full flex items-center justify-center
                  text-white text-2xl
                  bg-gradient-to-r ${timeline[active].color}
                  shadow-xl
                `}
              >
                {timeline[active].icon}
              </div>

              <h3 className="text-2xl font-semibold text-white mt-5">
                {timeline[active].title}
              </h3>

              <p className="text-slate-300 mt-3 max-w-2xl mx-auto">
                {timeline[active].desc}
              </p>
            </div>

            {/* PROGRESS LINE */}
            <div className="relative mt-16">
              <div className="h-[3px] bg-white/20 rounded-full"></div>

              <div className="absolute -top-3 w-full flex justify-between">
                {timeline.map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-300
                        ${
                          i <= active
                            ? "bg-gradient-to-r from-orange-500 to-pink-500 border-transparent scale-110 shadow-lg shadow-orange-500/40"
                            : "bg-slate-800 border-white/30"
                        }
                      `}
                    ></div>
                    <span className="text-xs mt-2 text-slate-400">
                      {item.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
