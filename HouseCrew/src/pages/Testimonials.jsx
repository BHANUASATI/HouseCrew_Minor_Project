import React from "react";
import { FaStar } from "react-icons/fa";

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
  return (
    <section className="py-28 bg-gradient-to-b from-black via-slate-900 to-black font-[Inter]">
      <div className="max-w-7xl mx-auto px-4">

        {/* ================= HEADING ================= */}
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

        {/* ================= CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="
                bg-white/5 backdrop-blur-xl
                p-8 rounded-3xl
                border border-white/10
                transition-all duration-500
                hover:-translate-y-2
                hover:shadow-[0_30px_70px_rgba(0,0,0,0.7)]
                group
              "
            >
              {/* RATING */}
              <div className="flex gap-1 mb-5">
                {[...Array(item.rating)].map((_, i) => (
                  <FaStar
                    key={i}
                    className="text-orange-400 text-sm"
                  />
                ))}
              </div>

              {/* REVIEW */}
              <p className="text-slate-300 leading-relaxed mb-8">
                “{item.review}”
              </p>

              {/* USER */}
              <div className="flex items-center gap-4">
                {/* IMAGE */}
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-400">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-white text-lg">
                    {item.name}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {item.role}
                  </p>
                </div>
              </div>

              {/* GLOW BORDER */}
              <div className="
                absolute inset-0 rounded-3xl
                opacity-0 group-hover:opacity-100
                transition duration-500
                pointer-events-none
                bg-gradient-to-r from-orange-500/10 to-pink-500/10
              "></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
