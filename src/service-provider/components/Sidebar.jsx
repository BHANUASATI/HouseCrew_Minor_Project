import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaCalendarAlt,
  FaWallet,
  FaUser,
  FaSignOutAlt,
  FaTimes,
  FaClipboardList,
  FaStar,
} from "react-icons/fa";
import HouseCrewLogo from "../../assets/HouseCrewLogo.png";

const menu = [
  { name: "Dashboard", path: "/service-provider/dashboard", icon: FaHome },
  { name: "Bookings", path: "/service-provider/bookings", icon: FaCalendarAlt },
  { name: "Earnings", path: "/service-provider/earnings", icon: FaWallet },
  { name: "Reviews", path: "/service-provider/reviews", icon: FaStar },
  { name: "Profile", path: "/service-provider/profile", icon: FaUser },
];

export default function Sidebar({ isOpen, setIsOpen, darkMode, isMobile }) {
  const handleLogout = () => {
    // Clear any auth tokens or user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/auth';
  };

  return (
    <>
      {/* 🧊 MOBILE SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 🌫️ BACKDROP (mobile) */}
            <motion.div
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed left-0 top-0 h-full z-50 w-72 text-white shadow-2xl overflow-hidden ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black border-r border-gray-800/50' 
                  : 'bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 border-r border-purple-800/50'
              }`} md:hidden
            >
              {/* 🔮 Enhanced Glow Effects */}
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-r from-purple-600/40 to-blue-600/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-full blur-2xl animate-pulse" />

              {/* LOGO WITH IMAGE */}
              <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative z-10 flex flex-col items-center py-8"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-16 h-16 mb-3 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 p-1 shadow-2xl"
                >
                  <div className="w-full h-full bg-gray-950 rounded-xl flex items-center justify-center">
                    <img 
                      src={HouseCrewLogo} 
                      alt="HouseCrew" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                </motion.div>
                <motion.h1
                  whileHover={{ scale: 1.05 }}
                  className="text-2xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent"
                >
                  HouseCrew
                </motion.h1>
                <p className="text-xs text-gray-400 mt-1">Provider Portal</p>
              </motion.div>

              {/* MENU */}
              <nav className="relative z-10 mt-6 flex flex-col gap-2 px-6">
                {menu.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      {({ isActive }) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                            isActive
                              ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/25"
                              : "hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20"
                          }`}
                        >
                          {/* Hover Background Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                          
                          {/* Icon */}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`relative z-10 text-xl ${
                              isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                            }`}
                          >
                            <Icon />
                          </motion.div>
                          
                          {/* Text */}
                          <span className={`relative z-10 font-medium truncate ${
                            isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                          }`}>
                            {item.name}
                          </span>
                          
                          {/* Active Indicator */}
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute right-2 w-2 h-2 bg-white rounded-full"
                            />
                          )}
                        </motion.div>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* LOGOUT */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 mt-8 px-6"
              >
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="group relative flex items-center gap-4 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all duration-300 cursor-pointer w-full"
                >
                  {/* Hover Background Effect */}
                  <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative z-10 text-xl text-red-300 group-hover:text-white"
                  >
                    <FaSignOutAlt />
                  </motion.div>
                  
                  {/* Text */}
                  <span className="relative z-10 font-medium text-red-300 group-hover:text-white">
                    Logout
                  </span>
                </motion.button>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR - Always visible on md+ screens */}
      <aside className={`hidden md:block w-72 h-screen sticky top-0 text-white shadow-2xl overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black border-r border-gray-800/50' 
          : 'bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 border-r border-purple-800/50'
      }`}>
        {/* Enhanced Glow Effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-r from-purple-600/40 to-blue-600/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-full blur-2xl animate-pulse" />

        {/* LOGO WITH IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative z-10 flex flex-col items-center py-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 mb-3 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 p-1 shadow-2xl"
          >
            <div className="w-full h-full bg-gray-950 rounded-xl flex items-center justify-center">
              <img 
                src={HouseCrewLogo} 
                alt="HouseCrew" 
                className="w-12 h-12 object-contain"
              />
            </div>
          </motion.div>
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent"
          >
            HouseCrew
          </motion.h1>
          <p className="text-xs text-gray-400 mt-1">Provider Portal</p>
        </motion.div>

        {/* MENU */}
        <nav className="relative z-10 mt-8 flex flex-col gap-2 px-6">
          {menu.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end
                className="block"
              >
                {({ isActive }) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/25"
                        : "hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20"
                    }`}
                  >
                    {/* Hover Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`relative z-10 text-xl ${
                        isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                      }`}
                    >
                      <Icon />
                    </motion.div>
                    
                    {/* Text */}
                    <span className={`relative z-10 font-medium truncate ${
                      isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                    }`}>
                      {item.name}
                    </span>
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2 w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mt-8 px-6"
        >
          <motion.button
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="group relative flex items-center gap-4 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all duration-300 cursor-pointer w-full"
          >
            {/* Hover Background Effect */}
            <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            
            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative z-10 text-xl text-red-300 group-hover:text-white"
            >
              <FaSignOutAlt />
            </motion.div>
            
            {/* Text */}
            <span className="relative z-10 font-medium text-red-300 group-hover:text-white">
              Logout
            </span>
          </motion.button>
        </motion.div>
      </aside>
    </>
  );
}
