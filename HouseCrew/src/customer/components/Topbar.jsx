import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaUser, FaSun, FaMoon, FaChevronDown, FaSignOutAlt, FaCog } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Notifications from "./Notifications";

export default function Topbar({ onMenuClick, isMobile, darkMode, toggleTheme }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Log when user profile picture changes
  useEffect(() => {
    if (user?.profile_picture) {
      console.log('Topbar: User profile picture updated');
    }
  }, [user?.profile_picture]);

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
          <Notifications />

          {/* USER PROFILE SECTION - EXPANDED */}
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
              <div className={`w-6 h-6 sm:w-6 sm:h-6 lg:w-10 lg:h-10 rounded-full flex items-center justify-center overflow-hidden ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
              }`}>
                {user?.profile_picture ? (
                  <img 
                    key={user.profile_picture} // Force re-render when profile picture changes
                    src={user.profile_picture} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <FaUser className="text-sm sm:text-xs lg:text-base" />
                )}
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

            {/* PROFILE DROPDOWN - EXPANDED WITH DETAILS */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 top-full mt-0.5 sm:mt-1 lg:mt-2 w-64 sm:w-72 lg:w-80 rounded-lg shadow-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* PROFILE HEADER */}
                  <div className={`p-3 sm:p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {user?.profile_picture ? (
                          <img 
                            src={user.profile_picture} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <FaUser className="text-lg sm:text-xl" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {user?.name || 'Guest'}
                        </h4>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Customer Dashboard
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* PROFILE DETAILS */}
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</p>
                      <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.name || 'N/A'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</p>
                      <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>{user?.email || 'N/A'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</p>
                      <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.phone || 'Not provided'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>City</p>
                      <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.city || 'Not provided'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Member Since</p>
                      <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'Today'}
                      </p>
                    </div>
                  </div>
                  
                  {/* ACTIONS */}
                  <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={handleProfile}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 transition-colors ${
                        darkMode 
                          ? 'hover:bg-gray-700 text-white' 
                          : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <FaUser className="text-xs sm:text-sm" />
                      <span className="text-xs sm:text-sm">View Profile</span>
                    </button>
                    <button
                      onClick={handleSettings}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 transition-colors ${
                        darkMode 
                          ? 'hover:bg-gray-700 text-white' 
                          : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <FaCog className="text-xs sm:text-sm" />
                      <span className="text-xs sm:text-sm">Settings</span>
                    </button>
                    <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FaSignOutAlt className="text-xs sm:text-sm" />
                      <span className="text-xs sm:text-sm">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
