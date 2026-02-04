import { motion } from "framer-motion";
import {
  FaTools,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaMoneyBillWave,
} from "react-icons/fa";

/* 🔹 STATUS CONFIG */
const statusConfig = {
  "In Progress": {
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    icon: <FaClock />,
  },
  Completed: {
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    icon: <FaCheckCircle />,
  },
};

export default function ServiceTable() {
  const services = [
    {
      service: "Plumbing",
      status: "In Progress",
      date: "20 Jan 2026",
      amount: "₹500",
    },
    {
      service: "Electrician",
      status: "Completed",
      date: "15 Jan 2026",
      amount: "₹800",
    },
    {
      service: "Home Cleaning",
      status: "Completed",
      date: "10 Jan 2026",
      amount: "₹1200",
    },
  ];

  return (
    <div
      className="relative rounded-2xl overflow-hidden
      bg-white/80 dark:bg-slate-900/80
      backdrop-blur-xl border border-white/30 dark:border-slate-700
      shadow-[0_20px_40px_rgba(0,0,0,0.08)]
      dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
    >
      {/* 🌈 GLOW BACKGROUND */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400/20 blur-3xl" />

      <table className="relative z-10 w-full text-sm">
        <thead>
          <tr className="text-slate-500 dark:text-slate-400 border-b border-white/20">
            <th className="text-left py-4 px-4">Service</th>
            <th className="text-center">Status</th>
            <th className="text-center">Date</th>
            <th className="text-center">Amount</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {services.map((item, i) => (
            <TableRow key={i} item={item} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* 🔹 ROW COMPONENT */
function TableRow({ item, index }) {
  const status = statusConfig[item.status];

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.01 }}
      className="group border-b border-white/10
      hover:bg-white/40 dark:hover:bg-slate-800/40 transition"
    >
      {/* SERVICE */}
      <td className="py-4 px-4 flex items-center gap-3 font-medium text-slate-700 dark:text-slate-200">
        <span className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
          <FaTools />
        </span>
        {item.service}
      </td>

      {/* STATUS */}
      <td className="text-center">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${status.color}`}
        >
          {status.icon}
          {item.status}
        </span>
      </td>

      {/* DATE */}
      <td className="text-center text-slate-600 dark:text-slate-300">
        {item.date}
      </td>

      {/* AMOUNT */}
      <td className="text-center font-semibold text-slate-800 dark:text-white">
        {item.amount}
      </td>

      {/* ACTION */}
      <td className="text-center">
        <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition">
          <ActionBtn icon={<FaEye />} label="View" />
          {item.status !== "Completed" && (
            <ActionBtn
              icon={<FaMoneyBillWave />}
              label="Pay"
              accent
            />
          )}
        </div>
      </td>
    </motion.tr>
  );
}

/* 🔹 ACTION BUTTON */
function ActionBtn({ icon, label, accent }) {
  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      className={`p-2 rounded-lg shadow
      ${
        accent
          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
      }`}
    >
      {icon}
    </motion.button>
  );
}
