import { motion } from "framer-motion";
import { FaEye, FaEdit, FaTrash, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

const bookings = [
  {
    id: "BK001",
    customer: "Rahul Sharma",
    service: "Home Cleaning",
    date: "2024-02-08",
    time: "10:00 AM",
    status: "confirmed",
    amount: "₹1200"
  },
  {
    id: "BK002", 
    customer: "Priya Patel",
    service: "Plumbing Repair",
    date: "2024-02-08",
    time: "2:00 PM",
    status: "pending",
    amount: "₹800"
  },
  {
    id: "BK003",
    customer: "Amit Kumar",
    service: "Electrical Work",
    date: "2024-02-07",
    time: "11:30 AM",
    status: "completed",
    amount: "₹1500"
  },
  {
    id: "BK004",
    customer: "Sneha Reddy",
    service: "Gardening",
    date: "2024-02-09",
    time: "9:00 AM",
    status: "confirmed",
    amount: "₹600"
  }
];

export default function ServiceTable() {
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-700",
        icon: <FaCheckCircle className="text-xs" />
      },
      pending: {
        bg: "bg-amber-100 dark:bg-amber-900/30", 
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-700",
        icon: <FaClock className="text-xs" />
      },
      completed: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-300", 
        border: "border-blue-200 dark:border-blue-700",
        icon: <FaCheckCircle className="text-xs" />
      },
      cancelled: {
        bg: "bg-rose-100 dark:bg-rose-900/30",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-200 dark:border-rose-700", 
        icon: <FaTimesCircle className="text-xs" />
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">ID</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Customer</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Service</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Time</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
            <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <motion.tr
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td className="py-3 px-2 sm:px-4">
                <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{booking.id}</span>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{booking.customer}</p>
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <p className="text-gray-700 dark:text-gray-300">{booking.service}</p>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <p className="text-gray-700 dark:text-gray-300">{booking.date}</p>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <p className="text-gray-700 dark:text-gray-300">{booking.time}</p>
              </td>
              <td className="py-3 px-2 sm:px-4">
                {getStatusBadge(booking.status)}
              </td>
              <td className="py-3 px-2 sm:px-4">
                <p className="font-semibold text-gray-900 dark:text-white">{booking.amount}</p>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <FaEye className="text-xs sm:text-sm" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit className="text-xs sm:text-sm" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <FaTrash className="text-xs sm:text-sm" />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
