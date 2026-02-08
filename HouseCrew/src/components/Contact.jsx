import React, { useState } from "react";
import { FaPaperPlane, FaEnvelope, FaUser, FaBriefcase } from "react-icons/fa";

const Contact = () => {
  const [focused, setFocused] = useState(null);

  return (
    <section className="py-28 bg-gradient-to-b from-black via-slate-900 to-black font-[Inter]">
      <div className="max-w-6xl mx-auto px-4">

        {/* ================= HEADING ================= */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Let’s Start a{" "}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
              Conversation
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-300 text-lg">
            Whether you need a service, want to join as a professional, or explore partnerships —  
            the HouseCrew team is here to help.
          </p>
        </div>

        {/* ================= MAIN ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ================= LEFT INFO ================= */}
          <div className="space-y-10">
            <h3 className="text-2xl font-bold text-white">
              We’d Love to Hear From You
            </h3>

            <p className="text-slate-300 leading-relaxed">
              HouseCrew connects households with trusted service professionals.
              If you have questions about bookings, services, joining as a worker,
              or business collaborations — reach out and our team will respond quickly.
            </p>

            <div className="space-y-6">

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <FaEnvelope className="text-white" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold">Email Support</p>
                  <p className="text-slate-400 text-sm">support@housecrew.com</p>
                </div>
              </div>

              {/* Customer Support */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <FaUser className="text-white" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold">Customer & Service Help</p>
                  <p className="text-slate-400 text-sm">Booking issues, service questions, feedback</p>
                </div>
              </div>

              {/* Partner / Professional */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <FaBriefcase className="text-white" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold">Work With HouseCrew</p>
                  <p className="text-slate-400 text-sm">Join as a professional or explore partnerships</p>
                </div>
              </div>

            </div>
          </div>

          {/* ================= RIGHT FORM ================= */}
          <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            <form className="space-y-8">

              {/* NAME */}
              <div className="relative">
                <label className={`absolute left-4 top-3 text-sm transition-all ${focused === "name" ? "text-orange-400 -top-3 bg-black px-1" : "text-slate-400"}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  className="w-full px-4 pt-5 pb-2 rounded-xl bg-transparent border border-white/20 text-white focus:border-orange-400 focus:outline-none transition"
                />
              </div>

              {/* EMAIL */}
              <div className="relative">
                <label className={`absolute left-4 top-3 text-sm transition-all ${focused === "email" ? "text-orange-400 -top-3 bg-black px-1" : "text-slate-400"}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="w-full px-4 pt-5 pb-2 rounded-xl bg-transparent border border-white/20 text-white focus:border-orange-400 focus:outline-none transition"
                />
              </div>

              {/* MESSAGE */}
              <div className="relative">
                <label className={`absolute left-4 top-3 text-sm transition-all ${focused === "message" ? "text-orange-400 -top-3 bg-black px-1" : "text-slate-400"}`}>
                  How can we help you?
                </label>
                <textarea
                  rows="4"
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  className="w-full px-4 pt-5 pb-2 rounded-xl bg-transparent border border-white/20 text-white focus:border-orange-400 focus:outline-none transition resize-none"
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-orange-500/40 hover:scale-[1.03]"
              >
                <FaPaperPlane />
                Send Message
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                We usually reply within 24 hours.
              </p>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
