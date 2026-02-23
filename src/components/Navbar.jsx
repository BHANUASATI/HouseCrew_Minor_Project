import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUserCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/HouseCrewLogo.png";

const searchTexts = [
  "Search home cleaning",
  "Search electricians",
  "Search plumbing services",
  "Search professionals near you",
];

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  /* TYPEWRITER SEARCH */
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    const current = searchTexts[textIndex];

    if (charIndex <= current.length) {
      const t = setTimeout(() => {
        setPlaceholder(current.slice(0, charIndex));
        setCharIndex((p) => p + 1);
      }, 80);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCharIndex(0);
        setTextIndex((p) => (p + 1) % searchTexts.length);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [charIndex, textIndex]);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav
        className="
          fixed top-4 left-1/2 -translate-x-1/2 z-50
          w-[94%] max-w-7xl
          rounded-2xl
          bg-black/70 backdrop-blur-2xl
          border border-white/10
          shadow-[0_20px_60px_rgba(0,0,0,0.7)]
        "
      >
        <div className="px-6">
          <div className="h-16 flex items-center justify-between">

            {/* LOGO */}
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img src={logo} alt="HouseCrew" className="w-10 h-10 rounded-lg" />
              <span
                className="
                  text-xl font-extrabold
                  bg-gradient-to-r from-orange-500 to-pink-500
                  text-transparent bg-clip-text
                "
              >
                HouseCrew
              </span>
            </div>

            {/* DESKTOP LINKS */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative text-sm font-medium tracking-wide transition
                    ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                    }
                    after:absolute after:left-0 after:-bottom-2
                    after:h-[2px]
                    after:bg-gradient-to-r after:from-orange-500 after:to-pink-500
                    after:transition-all
                    ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* SEARCH */}
            <div className="hidden md:block relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={placeholder}
                className="
                  pl-11 pr-4 py-2 w-64 rounded-full
                  bg-white/5 backdrop-blur
                  border border-white/10
                  text-sm text-white placeholder-slate-400
                  focus:outline-none
                  focus:border-orange-500
                  focus:ring-2 focus:ring-orange-500/30
                "
              />
            </div>

            {/* SIGN IN */}
            <div className="hidden md:block">
              <button
                onClick={() => navigate("/auth")}
                className="
                  px-5 py-2 rounded-full font-semibold
                  bg-gradient-to-r from-orange-500 to-pink-500
                  text-white
                  shadow-lg shadow-orange-500/30
                  hover:scale-105 transition
                "
              >
                Sign In
              </button>
            </div>

            {/* MOBILE ICON */}
            <div className="md:hidden text-white">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE MENU (FIXED) ================= */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden bg-black/80 backdrop-blur-xl"
          >
            {/* CENTER GLASS CARD */}
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              transition={{ duration: 0.35 }}
              className="
                absolute top-1/2 left-1/2
                -translate-x-1/2 -translate-y-1/2
                w-[85%] max-w-sm
                rounded-3xl
                bg-white/10 backdrop-blur-2xl
                border border-white/20
                shadow-[0_30px_80px_rgba(0,0,0,0.8)]
                px-8 py-10
                flex flex-col items-center gap-8
              "
            >
              {navLinks.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="
                    text-xl font-bold
                    bg-gradient-to-r from-orange-500 to-pink-500
                    text-transparent bg-clip-text
                    hover:scale-110 transition
                  "
                >
                  {item.name}
                </NavLink>
              ))}

              {/* SIGN IN */}
              <button
                onClick={() => {
                  navigate("/auth");
                  setMenuOpen(false);
                }}
                className="
                  mt-4 w-full py-3 rounded-full
                  font-bold text-white
                  bg-gradient-to-r from-orange-500 to-pink-500
                  shadow-xl shadow-orange-500/40
                  hover:scale-105 transition
                "
              >
                <FaUserCircle className="inline mr-2" />
                Sign In
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
