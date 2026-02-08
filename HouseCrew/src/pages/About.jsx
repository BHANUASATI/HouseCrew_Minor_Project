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
    year: "May '25",
    title: "The Real-Life Problem",
    desc: "The idea of HouseCrew was born from a real-life struggle of finding a reliable AC technician and home cleaning service after moving to a new city. Despite living in a developed area, there was no quick and trustworthy way to connect with nearby skilled professionals — a problem faced by many families during relocation.",
    icon: <FaChartLine />,
    color: "from-orange-500 to-pink-500",
  },
  {
    year: "Jul '25",
    title: "Research & Idea Validation",
    desc: "We analyzed existing home service platforms and discovered major gaps such as poor location-based prioritization, complicated booking systems, and limited opportunities for skilled workers without physical shops. This research helped shape HouseCrew into a simpler, faster, and more reliable solution.",
    icon: <FaCogs />,
    color: "from-pink-500 to-fuchsia-500",
  },
  {
    year: "Sep '25",
    title: "Platform Development",
    desc: "Development began with a focus on user-friendly design and intelligent service matching. Core features like service booking, worker profiles, service categories, and scheduling systems were built with special emphasis on location-based matching for faster connections.",
    icon: <FaRocket />,
    color: "from-orange-400 to-red-500",
  },
  {
    year: "Nov '25",
    title: "Empowering Local Workers",
    desc: "HouseCrew was designed not only for customers but also to support skilled professionals. Many talented workers cannot afford to open a shop or office. HouseCrew provides them with a digital platform to receive job requests based on their skills and location, reducing costs and increasing earning opportunities.",
    icon: <FaUsers />,
    color: "from-indigo-500 to-blue-500",
  },
  {
    year: "Jan '26",
    title: "Building Trust & Transparency",
    desc: "To ensure safety and reliability, HouseCrew introduced verified profiles, customer ratings, and reviews. This allows customers to make informed decisions while enabling professionals to build strong reputations through quality service and positive experiences.",
    icon: <FaShieldAlt />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    year: "Future",
    title: "Expansion & Future Growth",
    desc: "HouseCrew is expanding into more cities and introducing additional service categories. Our long-term vision is to make booking home services as simple as ordering food online, while creating sustainable employment opportunities and improving the overall home service experience.",
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
            <span className="text-orange-500 font-semibold">HouseCrew</span> is a modern,
            <span className="text-orange-500 font-semibold"> location-based home services platform</span> built to make everyday household tasks
            <span className="text-orange-500 font-semibold"> simple, fast, and stress-free</span>.
            We connect customers with <span className="text-orange-500 font-semibold"> nearby skilled professionals</span> for cleaning, repairs, installations, and maintenance through a
            <span className="text-orange-500 font-semibold"> smooth, secure digital experience</span>.
            Our mission is to remove the hassle of finding trusted workers and make booking home services
            <span className="text-orange-500 font-semibold"> as easy as a few clicks</span>.
          </p>
        </div>

        {/* ================= COMPANY INFO ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-28">
          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-4">Who We Are</h2>
            <p className="text-slate-300 leading-relaxed">
              HouseCrew is a <span className="text-orange-500 font-semibold">technology-driven platform</span> created to bridge the gap between households and skilled service professionals. We combine
              <span className="text-orange-500 font-semibold"> location-based matching</span>,
              <span className="text-orange-500 font-semibold"> verified worker profiles</span>, and a
              <span className="text-orange-500 font-semibold"> seamless booking system</span> to make services more accessible, organized, and trustworthy.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-slate-300 leading-relaxed">
              Our vision is to build a
              <span className="text-orange-500 font-semibold"> trusted and accessible home services ecosystem</span> where customers receive fast, dependable support and skilled professionals can grow their income based on their abilities. We aim to create a
              <span className="text-orange-500 font-semibold"> transparent digital space</span> where talent meets opportunity.
            </p>
          </div>
        </div>

        {/* ================= TIMELINE ================= */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            Our Journey
          </h2>

          <div className="relative max-w-6xl mx-auto bg-white/5 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 md:p-14 lg:p-16 border border-white/10 shadow-2xl">

            <button
              onClick={() => setActive(active > 0 ? active - 1 : active)}
              className="absolute left-4 md:left-6 top-6 md:top-1/2 md:-translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 text-white flex items-center justify-center transition-all hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:border-transparent"
            >
              ←
            </button>

            <button
              onClick={() =>
                setActive(active < timeline.length - 1 ? active + 1 : active)
              }
              className="absolute right-4 md:right-6 top-6 md:top-1/2 md:-translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 text-white flex items-center justify-center transition-all hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:border-transparent"
            >
              →
            </button>

            <div className="text-center mb-14">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={timeline[active].year}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.45 }}
                  className={`text-[72px] sm:text-[96px] md:text-[140px] lg:text-[200px] font-extrabold leading-none bg-gradient-to-r ${timeline[active].color} text-transparent bg-clip-text`}
                >
                  {timeline[active].year}
                </motion.h1>
              </AnimatePresence>

              <div className={`mx-auto mt-6 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-2xl bg-gradient-to-r ${timeline[active].color} shadow-xl`}>
                {timeline[active].icon}
              </div>

              <h3 className="text-2xl font-semibold text-white mt-5">
                {timeline[active].title}
              </h3>

              <p className="text-slate-300 mt-3 max-w-2xl mx-auto">
                {timeline[active].desc}
              </p>
            </div>

            <div className="relative mt-16">
              <div className="h-[3px] bg-white/20 rounded-full"></div>

              <div className="absolute -top-3 w-full flex justify-between">
                {timeline.map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                        i <= active
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 border-transparent scale-110 shadow-lg shadow-orange-500/40"
                          : "bg-slate-800 border-white/30"
                      }`}
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
