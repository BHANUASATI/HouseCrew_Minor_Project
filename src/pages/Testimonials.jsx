import React, { useEffect, useState } from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

/* === TESTIMONIAL IMAGES === */
import User1 from "../assets/images/AC.jpg";
import User2 from "../assets/images/AC.jpg";
import User3 from "../assets/images/AC.jpg";

const testimonials = [
  {
    name: "Amit Sharma",
    role: "Home Owner",
    img: User1,
    review:
      "HouseCrew made booking home services extremely easy. The professional arrived on time and the quality was top-notch.",
    rating: 5,
  },
  {
    name: "Priya Verma",
    role: "Working Professional",
    img: User2,
    review:
      "I really liked the transparency and professionalism. No hidden charges and a very smooth experience overall.",
    rating: 4,
  },
  {
    name: "Rahul Mehta",
    role: "Apartment Resident",
    img: User3,
    review:
      "Finding reliable service providers was always difficult earlier. HouseCrew solved that problem perfectly.",
    rating: 5,
  },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto Slide
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <section className="relative py-28 bg-gradient-to-b from-black via-slate-900 to-black font-[Inter] overflow-hidden">

      {/* Glow Background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">

        {/* HEADING */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
              Customers
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-300 text-lg">
            Thousands trust HouseCrew for reliable, verified, and premium home services.
          </p>
        </div>

        {/* SLIDER */}
        <div
          className="relative h-[460px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {testimonials.map((item, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                i === index
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.7)]">

                <FaQuoteLeft className="text-orange-500/30 text-5xl mb-6" />

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(item.rating)].map((_, i) => (
                    <FaStar key={i} className="text-orange-400 text-sm" />
                  ))}
                </div>

                {/* Review */}
                <p className="text-slate-300 leading-relaxed mb-10 italic text-lg">
                  “{item.review}”
                </p>

                {/* User Info */}
                <div className="flex items-center gap-6">
                  {/* BIGGER IMAGE */}
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-400 shadow-xl">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-white text-xl">
                      {item.name}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CLICKABLE DOTS */}
        <div className="flex justify-center gap-3 mt-10">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-3 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-8 bg-gradient-to-r from-orange-500 to-pink-500"
                  : "w-3 bg-white/30 hover:bg-white/50"
              }`}
            ></button>
          ))}
        </div>

        {/* Trust Line */}
        <div className="text-center mt-16 text-slate-400 text-sm">
          ⭐ Rated 4.8/5 by 2,000+ happy customers across multiple cities
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
