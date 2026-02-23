import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaBell, FaUser, FaSun, FaMoon, FaChevronDown, FaSignOutAlt, FaCog } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ onMenuClick, isMobile, darkMode, toggleTheme }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleProfile = () => {
    navigate('/customer/profile');
    setProfileOpen(false);
  };

  const handleSettings = () => {
    // Navigate to settings or implement settings modal
    setProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
    setProfileOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800/90 border-gray-700 text-white' 
        : 'bg-white/90 border-gray-200 text-gray-800'
    }`}>
      <div className="flex items-center justify-between px-2 sm:px-2 lg:px-8 py-3 sm:py-2 lg:py-4 min-h-[60px] sm:min-h-[60px] lg:min-h-[80px]">
        {/* LEFT: MENU BUTTON + TITLE */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
          {/* HAMBURGER MENU - MOBILE ONLY */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className={`p-2 sm:p-1.5 lg:p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-white' 
                : 'hover:bg-gray-100 text-gray-800'
            } md:hidden`}
          >
            <FaBars className="text-lg sm:text-base lg:text-xl" />
          </motion.button>

          {/* TITLE */}
          <div className="flex items-center gap-1">
            <h1 className="text-sm sm:text-sm lg:text-lg xl:text-2xl font-bold truncate">
              Customer Dashboard
            </h1>
          </div>
        </div>

        {/* RIGHT: NOTIFICATIONS + THEME TOGGLE + USER */}
        <div className="flex items-center gap-1 sm:gap-1 lg:gap-4">
          {/* THEME TOGGLE */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`p-2 sm:p-1.5 lg:p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-yellow-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Toggle theme"
          >
            {darkMode ? <FaSun className="text-sm sm:text-sm lg:text-xl" /> : <FaMoon className="text-sm sm:text-sm lg:text-xl" />}
          </motion.button>

          {/* NOTIFICATIONS */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-2 sm:p-1.5 lg:p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-white' 
                : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <FaBell className="text-sm sm:text-sm lg:text-xl" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:top-0.5 sm:right-0.5 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* USER PROFILE - ALWAYS VISIBLE */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className={`flex items-center gap-1 sm:gap-1 lg:gap-3 pl-1 sm:pl-1 lg:pl-4 border-l rounded-lg transition-colors ${
                darkMode 
                  ? 'border-gray-700 hover:bg-gray-700' 
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              {/* USER AVATAR - ALWAYS VISIBLE */}
              <div className={`w-6 h-6 sm:w-6 sm:h-6 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
              }`}>
                <FaUser className="text-sm sm:text-xs lg:text-base" />
              </div>
              
              {/* USER INFO - HIDDEN ON MOBILE */}
              <div className="hidden sm:block text-left">
                <p className={`text-[8px] sm:text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {user?.name || 'Guest'}
                </p>
                <p className={`text-[8px] sm:text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customer
                </p>
              </div>
              
              {/* CHEVRON - ALWAYS VISIBLE */}
              <FaChevronDown className={`text-sm sm:text-xs transition-transform ${
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
                  className={`absolute right-0 top-full mt-0.5 sm:mt-1 lg:mt-2 w-32 sm:w-40 lg:w-48 rounded-lg shadow-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                <button
                  onClick={handleProfile}
                  className={`w-full text-left px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 flex items-center gap-1 sm:gap-2 lg:gap-3 transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-white' 
                      : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <FaUser className="text-[8px] sm:text-xs" />
                  <span className="text-[8px] sm:text-xs">Profile</span>
                </button>
                <button
                  onClick={handleSettings}
                  className={`w-full text-left px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 flex items-center gap-1 sm:gap-2 lg:gap-3 transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-white' 
                      : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <FaCog className="text-[8px] sm:text-xs" />
                  <span className="text-[8px] sm:text-xs">Settings</span>
                </button>
                <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 flex items-center gap-1 sm:gap-2 lg:gap-3 transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FaSignOutAlt className="text-[8px] sm:text-xs" />
                  <span className="text-[8px] sm:text-xs">Logout</span>
                </button>
              </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
