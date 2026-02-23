import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function ServiceProviderLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 🌙 DARK MODE INITIALIZATION
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // 📱 MOBILE DETECTION
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 🌙 TOGGLE THEME
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} overflow-x-hidden transition-colors duration-300`}>
      {/* DESKTOP SIDEBAR - Always visible */}
      <div className="hidden md:block">
        <Sidebar isOpen={true} setIsOpen={setSidebarOpen} darkMode={darkMode} />
      </div>
      
      {/* MOBILE SIDEBAR - Conditional */}
      {sidebarOpen && (
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} darkMode={darkMode} />
      )}
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* MAIN CONTENT */}
      <div className={`flex-1 transition-all duration-300 overflow-hidden ${
        isMobile ? 'ml-0' : 'ml-64'
      }`}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="pt-2 p-4 sm:p-5 lg:p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
