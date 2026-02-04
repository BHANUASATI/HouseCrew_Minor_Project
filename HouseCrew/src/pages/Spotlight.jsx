import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import img1 from "../assets/images/Cleaning.jpg";
import img2 from "../assets/images/Electrician.jpg";
import img3 from "../assets/images/Plumber.jpg";
import img4 from "../assets/images/Salon.jpg";
import img5 from "../assets/images/AC.jpg";
import img6 from "../assets/images/Painter.jpg";

const spotlightData = [
  { title: "Home Cleaning", img: img1 },
  { title: "Electrician", img: img2 },
  { title: "Plumbing", img: img3 },
  { title: "Salon at Home", img: img4 },
  { title: "AC Repair", img: img5 },
  { title: "Painting", img: img6 },
];

const Spotlight = () => {
  const sliderRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateButtons = () => {
    const el = sliderRef.current;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    updateButtons();
  }, []);

  const slide = (direction) => {
    const slider = sliderRef.current;
    const card = slider.querySelector(".slide-card");
    const gap = 24;
    const cardWidth = card.offsetWidth + gap;

    slider.scrollBy({
      left: direction * cardWidth * 3,
      behavior: "smooth",
    });

    setTimeout(updateButtons, 500);
  };

  return (
    <section className="py-28 bg-gradient-to-b from-black via-gray-900 to-black text-white font-[Inter]">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADING */}
        <div className="flex justify-between items-end mb-14">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold">
              In the <span className="text-orange-500">Spotlight</span>
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl">
              Premium home services delivered by verified professionals you can trust.
            </p>
          </div>
        </div>

        {/* SLIDER */}
        <div className="relative">

          {/* LEFT */}
          <button
            disabled={!canLeft}
            onClick={() => slide(-1)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-30
              w-12 h-12 rounded-full backdrop-blur-md
              border border-white/20
              flex items-center justify-center
              transition-all duration-300
              ${canLeft
                ? "hover:scale-110 hover:bg-white/20 text-white"
                : "opacity-30 cursor-not-allowed"}
            `}
          >
            <FaChevronLeft />
          </button>

          {/* RIGHT */}
          <button
            disabled={!canRight}
            onClick={() => slide(1)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-30
              w-12 h-12 rounded-full backdrop-blur-md
              border border-white/20
              flex items-center justify-center
              transition-all duration-300
              ${canRight
                ? "hover:scale-110 hover:bg-white/20 text-white"
                : "opacity-30 cursor-not-allowed"}
            `}
          >
            <FaChevronRight />
          </button>

          {/* TRACK */}
          <div
            ref={sliderRef}
            onScroll={updateButtons}
            className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-8"
          >
            {spotlightData.map((item, index) => (
              <div
                key={index}
                className="
                  slide-card snap-start
                  min-w-[85%] sm:min-w-[45%] md:min-w-[30%]
                  rounded-3xl overflow-hidden
                  bg-white/5 backdrop-blur-xl
                  border border-white/10
                  transition-all duration-500
                  hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.7)]
                  group
                "
              >
                {/* IMAGE */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                </div>

                {/* CONTENT */}
                <div className="p-7">
                  <h3 className="text-xl font-bold mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Trusted professionals · On-time service · Transparent pricing
                  </p>

                  {/* CTA */}
                  <button
                    className="
                      w-full py-3 rounded-xl font-semibold
                      bg-gradient-to-r from-orange-500 to-pink-500
                      hover:from-orange-400 hover:to-pink-400
                      transition-all duration-300
                      shadow-lg hover:shadow-orange-500/40
                      hover:scale-[1.04]
                    "
                  >
                    Book Premium Service
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Spotlight;
