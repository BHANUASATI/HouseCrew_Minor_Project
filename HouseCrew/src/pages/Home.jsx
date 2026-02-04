import React from "react";

/* === LOCAL IMAGES === */
import Cleaning from "../assets/images/Cleaning.jpg";
import Plumber from "../assets/images/Plumber.jpg";
import Electrician from "../assets/images/Electrician.jpg";
import Salon from "../assets/images/Salon.jpg";
import AC from "../assets/images/AC.jpg";
import Painter from "../assets/images/Painter.jpg";
import Carpenter from "../assets/images/Carpenter.jpg";
import Massage from "../assets/images/Massage.jpg";
import PestControl from "../assets/images/Pest.jpg";

const services = [
  { name: "Cleaning", img: Cleaning },
  { name: "Plumber", img: Plumber },
  { name: "Electrician", img: Electrician },
  { name: "Salon", img: Salon },
  { name: "AC Repair", img: AC },
  { name: "Painter", img: Painter },
  { name: "Carpenter", img: Carpenter },
  { name: "Massage", img: Massage },
  { name: "Pest Control", img: PestControl },
];

const Home = () => {
  return (
    <section className="pt-28 pb-20 bg-gradient-to-b from-black via-slate-900 to-black font-[Inter]">
      <div className="max-w-7xl mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ================= LEFT ================= */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
              Home services{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                at your doorstep
              </span>
            </h1>

            {/* SERVICES BOX */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-200 mb-6">
                What are you looking for?
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className={`group cursor-pointer ${
                      index === 8
                        ? "col-span-2 sm:col-span-1 flex justify-center"
                        : ""
                    }`}
                  >
                    <div
                      className="
                        rounded-xl overflow-hidden
                        bg-white/5 backdrop-blur-lg
                        border border-white/10
                        transition-all duration-300
                        hover:-translate-y-1
                        hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]
                      "
                    >
                      {/* IMAGE */}
                      <div className="h-28 overflow-hidden relative">
                        <img
                          src={service.img}
                          alt={service.name}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      </div>

                      {/* NAME */}
                      <div
                        className="
                          py-3 text-center text-sm font-semibold text-slate-200
                          transition duration-300
                          group-hover:text-orange-400
                        "
                      >
                        {service.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STATS */}
            <div className="flex gap-14 mt-12">
              <div>
                <h3 className="text-3xl font-extrabold text-white">4.8</h3>
                <p className="text-sm text-slate-400">
                  Service Rating
                  <span className="text-orange-400">*</span>
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-extrabold text-white">12M+</h3>
                <p className="text-sm text-slate-400">
                  Customers Globally
                  <span className="text-orange-400">*</span>
                </p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="grid grid-cols-2 grid-rows-3 gap-5">

            {/* LARGE */}
            <div className="row-span-2 rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={Cleaning}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                alt=""
              />
            </div>

            {/* SMALL */}
            <div className="rounded-3xl overflow-hidden shadow-xl group">
              <img
                src={Electrician}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                alt=""
              />
            </div>

            {/* LARGE */}
            <div className="row-span-2 rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={Plumber}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                alt=""
              />
            </div>

            {/* SMALL */}
            <div className="rounded-3xl overflow-hidden shadow-xl group">
              <img
                src={Salon}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                alt=""
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
