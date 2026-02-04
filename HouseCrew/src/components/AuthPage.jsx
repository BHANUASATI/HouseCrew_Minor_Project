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
  const { login } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    skill: "",
    city: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // BASIC VALIDATION
    if (!form.role) {
      alert("Please select your role");
      return;
    }

    if (isSignup && form.role === "service") {
      if (!form.phone || !form.skill || !form.city) {
        alert("Please fill all Service Provider details");
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      if (
        !isSignup &&
        form.email === "bhanu@gmail.com" &&
        form.password === "12345"
      ) {
        login({
          name: "Bhanu",
          email: form.email,
          role: form.role,
          token: "demo",
        });

        navigate(form.role === "service" ? "/provider" : "/customer");
      } else if (!isSignup) {
        alert("❌ Invalid email or password");
      } else {
        alert(
          `🎉 Account Created as ${
            form.role === "service" ? "Service Provider" : "Customer"
          } (Demo)`
        );
        setIsSignup(false);
      }
    }, 1200);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden
      ${
        darkMode
          ? "bg-black"
          : "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
      }`}
    >
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

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 w-full max-w-4xl mt-24 rounded-3xl shadow-2xl
        backdrop-blur-xl border overflow-hidden
        ${
          darkMode
            ? "bg-gray-900/80 text-white border-white/10"
            : "bg-white/80 border-white/40"
        }`}
      >
        {/* LOGIN / SIGNUP */}
        <div className="flex justify-center mt-8">
          <div className="relative flex w-72 bg-white rounded-full p-1 shadow-md">
            <motion.div
              className="absolute top-1 bottom-1 w-1/2 rounded-full
              bg-gradient-to-r from-orange-500 to-pink-500"
              animate={{ x: isSignup ? "100%" : "0%" }}
            />
            <button
              onClick={() => setIsSignup(false)}
              className={`relative z-10 w-1/2 py-2 font-semibold ${
                !isSignup ? "text-white" : "text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`relative z-10 w-1/2 py-2 font-semibold ${
                isSignup ? "text-white" : "text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-center">
          {/* IMAGE */}
          <div className="flex flex-col items-center p-6 text-center">
            <img src={Auth3D} alt="Auth" className="w-44 md:w-56 mb-4" />
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm opacity-80 mt-2">
              Login as Customer or Service Provider
            </p>
          </div>

          {/* FORM */}
          <div className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.form
                key={isSignup ? "signup" : "login"}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {isSignup && (
                  <Input
                    icon={<FaUser />}
                    placeholder="Full Name"
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
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                    <Input
                      icon={<FaTools />}
                      placeholder="Skill (e.g. Electrician)"
                      onChange={(e) =>
                        setForm({ ...form, skill: e.target.value })
                      }
                    />
                    <Input
                      icon={<FaCity />}
                      placeholder="City"
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </>
                )}

                <Input
                  icon={<FaEnvelope />}
                  placeholder="Email"
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />

                <div className="flex items-center border rounded-xl px-4 py-3">
                  <FaLock className="mr-3 opacity-70" />
                  <input
                    type={showPass ? "text" : "password"}
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
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg"
                >
                  {loading
                    ? "Processing..."
                    : isSignup
                    ? "Create Account"
                    : "Login"}
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
function Input({ icon, ...props }) {
  return (
    <div className="flex items-center border rounded-xl px-4 py-3">
      <span className="mr-3 opacity-70">{icon}</span>
      <input className="w-full bg-transparent outline-none" {...props} />
    </div>
  );
}

/* SELECT */
function Select({ icon, children, ...props }) {
  return (
    <div className="flex items-center border rounded-xl px-4 py-3">
      <span className="mr-3 opacity-70">{icon}</span>
      <select className="w-full bg-transparent outline-none" {...props}>
        {children}
      </select>
    </div>
  );
}
