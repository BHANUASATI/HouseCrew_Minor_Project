// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import Navbar from './components/Navbar.jsx'
// import Home from './pages/Home.jsx'
// import About from './pages/About.jsx'
// import Testimonials from './pages/Testimonials.jsx'
// import Spotlight from './pages/Spotlight.jsx'
// import Contact from './components/Contact.jsx'
// import Footer from './components/Footer.jsx'
// import AuthPage from './components/AuthPage.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Navbar />
//     <Home />
//     <About />
//     <Spotlight/>
//     <Testimonials />
//     <Contact />
//     <Footer />
//    <AuthPage />
//   </StrictMode>
// )
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext"; // ✅ ADD THIS

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
