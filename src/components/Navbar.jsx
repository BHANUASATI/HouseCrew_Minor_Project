import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/HouseCrewLogo.png";
import { useAuth } from "../context/AuthContext";

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
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

  const handleProfile = () => {
    if (user?.role === 'service_provider') {
      navigate('/service-provider/profile');
    } else if (user?.role === 'customer') {
      navigate('/customer/profile');
    }
    setProfileOpen(false);
  };

  const handleDashboard = () => {
    if (user?.role === 'service_provider') {
      navigate('/service-provider/dashboard');
    } else if (user?.role === 'customer') {
      navigate('/customer/dashboard');
    }
    setProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

            {/* USER PROFILE / SIGN IN */}
            <div className="hidden md:block">
              {isAuthenticated && user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 transition-all"
                  >
                    {/* USER AVATAR */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                      {user.profile_picture ? (
                        <img 
                          src={user.profile_picture.startsWith('data:') ? user.profile_picture : `data:image/jpeg;base64,${user.profile_picture}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <FaUserCircle className="text-xl" />
                      )}
                    </div>
                    
                    {/* USER NAME */}
                    <span className="text-sm font-medium truncate max-w-[100px]">
                      {user.name}
                    </span>
                    
                    <FaChevronDown className={`text-xs transition-transform ${
                      profileOpen ? 'rotate-180' : ''
                    }`} />
                  </motion.button>

                  {/* PROFILE DROPDOWN */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white/95 backdrop-blur-xl border border-white/20 shadow-lg"
                      >
                        <button
                          onClick={handleDashboard}
                          className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors flex items-center gap-3"
                        >
                          <FaUserCircle className="text-gray-600" />
                          <span className="text-sm">Dashboard</span>
                        </button>
                        <button
                          onClick={handleProfile}
                          className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors flex items-center gap-3"
                        >
                          <FaUserCircle className="text-gray-600" />
                          <span className="text-sm">Profile</span>
                        </button>
                        <div className="border-t border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                        >
                          <FaSignOutAlt />
                          <span className="text-sm">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
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
              )}
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

              {/* USER PROFILE / SIGN IN */}
              {isAuthenticated && user ? (
                <div className="w-full space-y-3">
                  {/* USER INFO */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                      {user.profile_picture ? (
                        <img 
                          src={user.profile_picture.startsWith('data:') ? user.profile_picture : `data:image/jpeg;base64,${user.profile_picture}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <FaUserCircle className="text-2xl" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-white/70 text-sm capitalize">{user.role?.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {/* USER ACTIONS */}
                  <button
                    onClick={() => {
                      handleDashboard();
                      setMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-lg font-bold text-white bg-white/10 backdrop-blur hover:bg-white/20 transition flex items-center justify-center gap-2"
                  >
                    <FaUserCircle />
                    Dashboard
                  </button>
                  
                  <button
                    onClick={() => {
                      handleProfile();
                      setMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-lg font-bold text-white bg-white/10 backdrop-blur hover:bg-white/20 transition flex items-center justify-center gap-2"
                  >
                    <FaUserCircle />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-lg font-bold text-red-400 bg-white/10 backdrop-blur hover:bg-red-900/20 transition flex items-center justify-center gap-2"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              ) : (
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
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
