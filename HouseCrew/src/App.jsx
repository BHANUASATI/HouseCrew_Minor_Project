// import { Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Home from "./pages/Home";
// import Auth from "./components/AuthPage";

// export default function App() {
//   return (
//     <>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/auth" element={<Auth />} />
//         <Route path="/services" element={<h1>Services</h1>} />
//         <Route path="/projects" element={<h1>Projects</h1>} />
//         <Route path="/contact" element={<h1>Contact</h1>} />
//       </Routes>
//     </>
//   );
// }
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Testimonials from "./pages/Testimonials";
import Spotlight from "./pages/Spotlight";
import Contact from "./components/Contact";

import AuthPage from "./components/AuthPage";
import CustomerRoutes from "./customer/routes/CustomerRoutes";

export default function App() {
  return (
    <Routes>
      {/* 🌐 WEBSITE ROUTES (Navbar + Footer) */}
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Home />
            <About />
            <Spotlight />
            <Testimonials />
            <Contact />
            <Footer />
          </>
        }
      />

      {/* 🔐 AUTH PAGE */}
      <Route path="/auth" element={<AuthPage />} />

      {/* 👤 CUSTOMER DASHBOARD (NO Navbar / Footer) */}
      <Route path="/customer/*" element={<CustomerRoutes />} />
    </Routes>
  );
}
