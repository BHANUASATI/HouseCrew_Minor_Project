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
    color: "bg-amber-100 text-amber-700 border border-amber-200 font-semibold",
    icon: <FaClock />,
  },
  Completed: {
    color: "bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold",
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
    <div className="relative rounded-xl overflow-hidden
      bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700
      shadow-lg">
      {/* 🌈 SUBTLE GLOW BACKGROUND */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-100/20 blur-xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-100/20 blur-xl" />

      {/* TABLE CONTAINER - Responsive */}
      <div className="relative z-10 overflow-x-auto">
        <table className="w-full text-xs min-w-[400px] sm:min-w-[500px] lg:min-w-[600px]">
          <thead>
            <tr className="text-gray-600 font-semibold border-b border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <th className="text-left py-3 px-4 font-bold text-xs sm:text-sm">Service</th>
              <th className="text-center min-w-[80px] font-bold text-xs sm:text-sm">Status</th>
              <th className="text-center min-w-[100px] font-bold text-xs sm:text-sm">Date</th>
              <th className="text-center min-w-[80px] font-bold text-xs sm:text-sm">Amount</th>
              <th className="text-center min-w-[100px] font-bold text-xs sm:text-sm">Action</th>
            </tr>
          </thead>

          <tbody>
            {services.map((item, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                  {item.service}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
                      statusConfig[item.status].color
                    }`}
                  >
                    {statusConfig[item.status].icon}
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  {item.date}
                </td>
                <td className="py-3 px-4 text-center font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                  {item.amount}
                </td>
                <td className="py-3 px-4 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg text-xs sm:text-sm"
                  >
                    <FaEye className="text-xs sm:text-sm" />
                    <span className="hidden sm:inline ml-1">View</span>
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      className="group border-b border-gray-100
      hover:bg-blue-50/50 transition-all duration-200"
    >
      {/* SERVICE */}
      <td className="py-2 sm:py-3 px-2 sm:px-3">
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
            <FaTools className="text-xs sm:text-base" />
          </span>
          <span className="truncate text-xs sm:text-sm">{item.service}</span>
        </div>
      </td>

      {/* STATUS */}
      <td className="text-center py-2 sm:py-3">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${status.color}`}
        >
          <span className="text-xs">{status.icon}</span>
          <span className="text-xs">{item.status}</span>
        </span>
      </td>

      {/* DATE */}
      <td className="text-center py-2 sm:py-3 text-gray-600 font-medium whitespace-nowrap text-xs sm:text-sm">
        {item.date}
      </td>

      {/* AMOUNT */}
      <td className="text-center py-2 sm:py-3 font-bold text-gray-800 whitespace-nowrap text-xs sm:text-sm">
        {item.amount}
      </td>

      {/* ACTION */}
      <td className="text-center py-2 sm:py-3">
        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
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
      className={`p-1.5 sm:p-2 rounded-lg shadow-sm transition-all duration-200
      ${
        accent
          ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
      }`}
      title={label}
    >
      <span className="text-xs sm:text-sm">{icon}</span>
    </motion.button>
  );
}
