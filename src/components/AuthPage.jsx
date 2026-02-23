import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaSun,
  FaArrowLeft,
  FaUsers,
  FaPhone,
  FaTools,
  FaCity,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import Auth3D from "../assets/image.png";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, loading, setLoading, error, setError, clearError } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    skill: "",
    city: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // BASIC VALIDATION
    if (!form.role) {
      setError("Please select your role");
      return;
    }

    if (!form.email || !form.password) {
      setError("Please fill in all required fields");
      return;
    }

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // PASSWORD VALIDATION
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // NAME VALIDATION FOR SIGNUP
    if (isSignup && !form.name.trim()) {
      setError("Please enter your full name");
      return;
    }

    // SERVICE PROVIDER VALIDATION
    if (isSignup && form.role === "service") {
      if (!form.phone || !form.skill || !form.city) {
        setError("Please fill in all service provider fields");
        return;
      }

      // PHONE VALIDATION
      const phoneRegex = /^[+]?[\d\s\-()]+$/;
      if (!phoneRegex.test(form.phone)) {
        setError("Please enter a valid phone number");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignup) {
        // REGISTRATION
        // REGISTRATION
        const response = await register({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role === "service" ? "service_provider" : "customer",
          phone: form.phone ? form.phone.trim() : undefined,
          skill: form.skill ? form.skill.trim() : undefined,
          city: form.city ? form.city.trim() : undefined
        });

        // SUCCESS MESSAGE
        alert(
          `🎉 Account Created Successfully!\n\nWelcome ${form.name}!\n\nYour account has been created as a ${
            form.role === "service" ? "Service Provider" : "Customer"
          }.\n\nPlease login with your credentials to continue.`
        );
        
        // RESET FORM
        setForm({
          name: "",
          email: "",
          password: "",
          role: "",
          phone: "",
          skill: "",
          city: "",
        });
        
        // SWITCH TO LOGIN
        setIsSignup(false);
      } else {
        // LOGIN
        const response = await login({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role === "service" ? "service_provider" : "customer"
        });

        // SUCCESS MESSAGE
        alert(
          `🎉 Login Successful!\n\nWelcome back, ${response.user.name}!\n\nRedirecting to your dashboard...`
        );

        // REDIRECT BASED ON ROLE
        if (form.role === "service") {
          navigate("/service-provider");
        } else {
          navigate("/customer");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden
      ${
        darkMode
          ? "bg-black"
          : "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"
      }`}
    >
      {/* ANIMATED BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      {/* BACK TO HOME */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2
        px-4 py-2 rounded-full bg-white/90 backdrop-blur shadow-lg"
      >
        <FaArrowLeft /> Home
      </button>

      {/* DARK MODE */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-3 rounded-full
        bg-white shadow-lg text-orange-500"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      {/* ERROR DISPLAY */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50
          bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-4 text-white hover:text-red-200"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`relative z-10 w-full max-w-5xl mt-24 rounded-3xl shadow-2xl
        backdrop-blur-xl border overflow-hidden transform hover:scale-105 transition-transform duration-300
        ${
          darkMode
            ? "bg-gray-900/90 text-white border-white/20 shadow-black/50"
            : "bg-white/90 border-white/60 shadow-black/20"
        }`}
      >
        {/* GLOW EFFECT */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl" />
        
        {/* LOGIN / SIGNUP */}
        <div className="flex justify-center mt-8 relative z-10">
          <div className="relative flex w-80 bg-white/90 backdrop-blur rounded-full p-1 shadow-lg">
            <motion.div
              className="absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
              animate={{ x: isSignup ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setIsSignup(false)}
              className={`relative z-10 w-1/2 py-2 font-semibold transition-colors duration-300 ${
                !isSignup ? "text-white" : "text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`relative z-10 w-1/2 py-2 font-semibold transition-colors duration-300 ${
                isSignup ? "text-white" : "text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 items-center relative z-10">
          {/* IMAGE */}
          <div className="flex flex-col items-center p-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-50 animate-pulse" />
              <img src={Auth3D} alt="Auth" className="relative w-48 md:w-64 mb-6 transform hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-white/90 text-lg font-medium">
              {isSignup ? "Join our community" : "Login to continue"}
            </p>
            <p className="text-white/70 text-sm mt-2">
              Access as Customer or Service Provider
            </p>
          </div>

          {/* FORM */}
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.form
                key={isSignup ? "signup" : "login"}
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isSignup && (
                  <Input
                    icon={<FaUser />}
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                )}

                {/* ROLE DROPDOWN */}
                <Select
                  icon={<FaUsers />}
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                >
                  <option value="">Select your role</option>
                  <option value="customer">Customer</option>
                  <option value="service">Service Provider</option>
                </Select>

                {/* SERVICE PROVIDER EXTRA FIELDS */}
                {isSignup && form.role === "service" && (
                  <>
                    <Input
                      icon={<FaPhone />}
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                    <Input
                      icon={<FaTools />}
                      placeholder="Skill (e.g. Electrician)"
                      value={form.skill}
                      onChange={(e) =>
                        setForm({ ...form, skill: e.target.value })
                      }
                    />
                    <Input
                      icon={<FaCity />}
                      placeholder="City"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </>
                )}

                <Input
                  icon={<FaEnvelope />}
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />

                <div className="flex items-center border rounded-xl px-4 py-3">
                  <FaLock className="mr-3 opacity-70" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    placeholder="Password"
                    className="w-full bg-transparent outline-none"
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-white text-lg
                  bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg hover:shadow-xl
                  transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {isSignup ? (
                          <>
                            <span>Create Account</span>
                            <span className="text-xl">🎉</span>
                          </>
                        ) : (
                          <>
                            <span>Login</span>
                            <span className="text-xl">🚀</span>
                          </>
                        )}
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;

/* INPUT */
function Input({ icon, value, onChange, ...props }) {
  return (
    <div className="flex items-center border rounded-xl px-4 py-3">
      <span className="mr-3 opacity-70">{icon}</span>
      <input 
        value={value}
        onChange={onChange}
        className="w-full bg-transparent outline-none" 
        {...props} 
      />
    </div>
  );
}

/* SELECT */
function Select({ icon, children, value, onChange, ...props }) {
  return (
    <div className="flex items-center border rounded-xl px-4 py-3">
      <span className="mr-3 opacity-70">{icon}</span>
      <select 
        value={value}
        onChange={onChange}
        className="w-full bg-transparent outline-none" 
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
