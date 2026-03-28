import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function CustomerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on desktop, keep state on mobile
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
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
        isMobile ? 'ml-0' : 'ml-0'
      }`}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="pt-2 p-4 sm:p-5 lg:p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
