import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaTools,
  FaMapMarkedAlt,
  FaWallet,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const menu = [
  { name: "Dashboard", path: "", icon: FaHome },
  { name: "Request Service", path: "request", icon: FaTools },
  { name: "Track Service", path: "track", icon: FaMapMarkedAlt },
  { name: "Payments", path: "payments", icon: FaWallet },
  { name: "Profile", path: "profile", icon: FaUser },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 🔘 MOBILE TOGGLE BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50
        bg-indigo-600 text-white p-3 rounded-xl shadow-lg"
      >
        <FaBars />
      </button>

      {/* 🌫️ BACKDROP (mobile) */}
      <AnimatePresence>
        {open && (
          <motion.div
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 🧊 SIDEBAR */}
      <AnimatePresence>
        {(open || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="w-64 fixed h-full z-50
            bg-gradient-to-b from-[#4f46e5] via-[#6d28d9] to-[#7c3aed]
            text-white shadow-2xl overflow-hidden"
          >
            {/* ❌ CLOSE (mobile) */}
            <button
              onClick={() => setOpen(false)}
              className="md:hidden absolute top-4 right-4 text-xl"
            >
              <FaTimes />
            </button>

            {/* 🔮 Glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

            {/* LOGO */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 text-2xl font-extrabold text-center py-6
              bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent"
            >
              HouseCrew
            </motion.h1>

            {/* MENU */}
            <nav className="relative z-10 mt-6 flex flex-col gap-3 px-4">
              {menu.map((item, index) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end
                    onClick={() => setOpen(false)}
                  >
                    {({ isActive }) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl
                        ${
                          isActive
                            ? "bg-white/20 ring-1 ring-white/30"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <Icon className="text-xl" />
                        <span>{item.name}</span>
                      </motion.div>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
