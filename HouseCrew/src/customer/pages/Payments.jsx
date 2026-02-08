import CustomerLayout from "../CustomerLayout";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaCreditCard,
  FaUniversity,
  FaCheckCircle,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";
import { useState } from "react";

export default function Payments() {
  const [method, setMethod] = useState("card");

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
        Payments
      </motion.h2>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <SummaryCard
          title="Pending Amount"
          value="₹1200"
          icon={<FaWallet />}
          accent="from-rose-500 to-pink-500"
        />
        <SummaryCard
          title="Paid This Month"
          value="₹3,800"
          icon={<FaCheckCircle />}
          accent="from-emerald-500 to-cyan-500"
        />
        <SummaryCard
          title="Total Transactions"
          value="12"
          icon={<FaCreditCard />}
          accent="from-indigo-500 to-sky-500"
        />
      </div>

      {/* PAYMENT BOX */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl bg-white rounded-2xl p-4 sm:p-6 lg:p-8
        border border-slate-200 shadow-lg"
      >
        {/* AMOUNT */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-slate-500 text-xs sm:text-sm">Amount to Pay</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              ₹1200
            </h3>
          </div>

          <span className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 font-semibold">
            <FaLock />
            Secured Payment
          </span>
        </div>

        {/* PAYMENT METHODS */}
        <p className="font-semibold text-slate-700 mb-3 text-sm sm:text-base">
          Select Payment Method
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <MethodCard
            active={method === "card"}
            onClick={() => setMethod("card")}
            icon={<FaCreditCard />}
            label="Card"
          />
          <MethodCard
            active={method === "upi"}
            onClick={() => setMethod("upi")}
            icon={<FaWallet />}
            label="UPI"
          />
          <MethodCard
            active={method === "netbanking"}
            onClick={() => setMethod("netbanking")}
            icon={<FaUniversity />}
            label="Net Banking"
          />
        </div>

        {/* PAY BUTTON */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 sm:py-4 rounded-xl text-white font-bold text-sm sm:text-base
          bg-gradient-to-r from-indigo-600 to-sky-500
          shadow-lg flex items-center justify-center gap-2"
        >
          Proceed to Pay
          <FaArrowRight />
        </motion.button>

        {/* FOOTER NOTE */}
        <p className="mt-4 text-xs text-slate-500 text-center">
          Payments are processed securely. We do not store your card details.
        </p>
      </motion.div>
    </CustomerLayout>
  );
}

/* 🔹 SUMMARY CARD */
function SummaryCard({ title, value, icon, accent }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="relative rounded-xl sm:rounded-2xl overflow-hidden"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${accent} opacity-20 blur-lg sm:blur-xl`}
      />
      <div className="relative bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-lg sm:rounded-xl flex items-center justify-center
          bg-gradient-to-r ${accent} text-white text-lg sm:text-xl`}
        >
          {icon}
        </div>
        <p className="text-xs sm:text-sm text-slate-500">{title}</p>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">
          {value}
        </h3>
      </div>
    </motion.div>
  );
}

/* 🔹 PAYMENT METHOD CARD */
function MethodCard({ icon, label, active, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`cursor-pointer p-4 sm:p-5 rounded-xl border transition
      ${
        active
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
          : "bg-white border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="text-xl sm:text-2xl mb-2">{icon}</div>
      <p className="font-semibold text-sm sm:text-base">{label}</p>
    </motion.div>
  );
}
