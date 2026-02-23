import CustomerLayout from "../CustomerLayout";
import { motion } from "framer-motion";
import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaCamera,
  FaSave,
} from "react-icons/fa";
import { useState } from "react";

export default function Profile() {
  const [avatar, setAvatar] = useState(null);

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  return (
    <CustomerLayout>
      {/* HEADER */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6
        bg-gradient-to-r from-indigo-600 to-sky-500
        bg-clip-text text-transparent"
      >
        My Profile
      </motion.h2>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-3xl bg-white rounded-2xl p-4 sm:p-6 lg:p-8
        border border-slate-200 shadow-lg"
      >
        {/* AVATAR SECTION */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-indigo-200">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-3xl sm:text-4xl">
                  <FaUser />
                </div>
              )}
            </div>

            <label className="absolute -bottom-2 -right-2 cursor-pointer
              bg-indigo-600 text-white p-2 rounded-full shadow-lg">
              <FaCamera className="text-sm sm:text-base" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
              />
            </label>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-slate-700">Bhanu Asati</h3>
            <p className="text-slate-500 text-sm">
              Customer Account
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <InputField
            icon={<FaUser />}
            label="Full Name"
            placeholder="Enter your name"
          />
          <InputField
            icon={<FaPhoneAlt />}
            label="Phone Number"
            placeholder="Enter phone number"
          />
          <InputField
            icon={<FaEnvelope />}
            label="Email Address"
            placeholder="Enter email"
          />
        </div>

        {/* SAVE BUTTON */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 rounded-xl text-white font-bold text-sm sm:text-base
          bg-gradient-to-r from-indigo-600 to-sky-500
          shadow-lg flex items-center gap-2"
        >
          <FaSave />
          Save Changes
        </motion.button>
      </motion.div>
    </CustomerLayout>
  );
}

/* 🔹 REUSABLE INPUT */
function InputField({ icon, label, placeholder }) {
  return (
    <div className="relative">
      <label className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 block">
        {label}
      </label>
      <div className="flex items-center gap-3 bg-slate-100 border border-slate-200
        rounded-xl p-3 focus-within:ring-2 focus-within:ring-indigo-400">
        <span className="text-indigo-500 text-sm sm:text-base">{icon}</span>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-slate-700 text-sm sm:text-base"
        />
      </div>
    </div>
  );
}
