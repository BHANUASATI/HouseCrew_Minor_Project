import { motion } from "framer-motion";
import {
  FaBell,
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";
import { useState } from "react";

export default function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 h-16
      backdrop-blur-xl bg-white/70 border-b border-white/30
      shadow-[0_8px_30px_rgba(0,0,0,0.05)]
      flex items-center justify-between px-6"
    >
      {/* LEFT */}
      <h2
        className="text-xl font-extrabold tracking-wide
        bg-gradient-to-r from-indigo-600 to-purple-600
        bg-clip-text text-transparent"
      >
        Customer Dashboard
      </h2>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* 🔔 NOTIFICATION */}
        <motion.button
          whileHover={{ scale: 1.15, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-full
          bg-gradient-to-br from-indigo-500/10 to-purple-500/10
          hover:from-indigo-500/20 hover:to-purple-500/20
          transition"
        >
          <FaBell className="text-xl text-indigo-600" />

          {/* GLOW PULSE */}
          <span className="absolute inset-0 rounded-full
            animate-ping bg-indigo-400/20" />

          {/* COUNT */}
          <span className="absolute -top-1 -right-1
            bg-gradient-to-r from-pink-500 to-red-500
            text-xs text-white px-1.5 rounded-full shadow">
            3
          </span>
        </motion.button>

        {/* 👤 PROFILE */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-gradient-to-r from-indigo-600 to-purple-600
            text-white shadow-lg"
          >
            <FaUserCircle className="text-xl" />
            <span className="text-sm font-medium">Bhanu</span>
            <FaChevronDown
              className={`text-xs transition ${
                open ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          {/* DROPDOWN (future ready) */}
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-3 w-44
              bg-white rounded-xl shadow-xl border"
            >
              <DropdownItem label="My Profile" />
              <DropdownItem label="Settings" />
              <DropdownItem label="Logout" danger />
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

/* 🔹 DROPDOWN ITEM */
function DropdownItem({ label, danger }) {
  return (
    <div
      className={`px-4 py-2 cursor-pointer text-sm
      hover:bg-slate-100 transition
      ${danger ? "text-red-600 font-medium" : ""}`}
    >
      {label}
    </div>
  );
}
