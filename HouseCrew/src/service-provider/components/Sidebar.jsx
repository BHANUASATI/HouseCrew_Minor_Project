import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaTools,
  FaCalendarAlt,
  FaWallet,
  FaUser,
  FaSignOutAlt,
  FaTimes,
  FaClipboardList,
  FaStar,
} from "react-icons/fa";

const menu = [
  { name: "Dashboard", path: "/service-provider/dashboard", icon: FaHome },
  { name: "My Services", path: "/service-provider/my-services", icon: FaTools },
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
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className={`fixed left-0 top-0 h-full z-50 w-64 text-white shadow-2xl overflow-hidden ${
                darkMode 
                  ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-black' 
                  : 'bg-gradient-to-b from-[#4f46e5] via-[#6d28d9] to-[#7c3aed]'
              }`} md:hidden
            >
              {/* ✖️ CLOSE BUTTON */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <FaTimes />
              </motion.button>

              {/* 🔮 Glow */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

              {/* LOGO */}
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 text-2xl font-extrabold text-center py-6 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent"
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
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      {({ isActive }) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                            isActive
                              ? "bg-white/20 ring-1 ring-white/30"
                              : "hover:bg-white/10"
                          }`}
                        >
                          <Icon className="text-xl flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </motion.div>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* LOGOUT */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="relative z-10 mx-4 mt-8 flex items-center gap-4 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors"
              >
                <FaSignOutAlt className="text-xl" />
                <span>Logout</span>
              </motion.button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 🖥️ DESKTOP SIDEBAR */}
      <aside className={`fixed left-0 top-0 h-full w-64 transition-all duration-300 z-30 ${
        darkMode 
          ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-black' 
          : 'bg-gradient-to-b from-[#4f46e5] via-[#6d28d9] to-[#7c3aed]'
      } ${isMobile ? '-translate-x-full' : 'translate-x-0'}`}>
        {/* 🔮 Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

        {/* LOGO */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-2xl font-extrabold text-center py-6 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent"
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
                className="block"
              >
                {({ isActive }) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                      isActive
                        ? "bg-white/20 ring-1 ring-white/30"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <Icon className="text-xl flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="relative z-10 mx-4 mt-8 flex items-center gap-4 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors"
        >
          <FaSignOutAlt className="text-xl" />
          <span>Logout</span>
        </motion.button>
      </aside>
    </>
  );
}
