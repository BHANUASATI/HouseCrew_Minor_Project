import ServiceProviderLayout from "../ServiceProviderLayout";
import { motion } from "framer-motion";
import { FaMoneyBillWave, FaChartLine, FaCalendarAlt, FaDownload, FaFilter, FaStar } from "react-icons/fa";
import { useState } from "react";

export default function Earnings() {
  const [earnings, setEarnings] = useState([
    {
      id: 1,
      month: "January 2024",
      totalEarnings: 15420,
      completedJobs: 23,
      averageRating: 4.8,
      topService: "Home Cleaning"
    },
    {
      id: 2,
      month: "December 2023",
      totalEarnings: 12800,
      completedJobs: 18,
      averageRating: 4.6,
      topService: "Plumbing Repair"
    },
    {
      id: 3,
      month: "November 2023",
      totalEarnings: 11200,
      completedJobs: 16,
      averageRating: 4.7,
      topService: "Electrical Work"
    },
    {
      id: 4,
      month: "October 2023",
      totalEarnings: 9800,
      completedJobs: 14,
      averageRating: 4.5,
      topService: "Gardening"
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.totalEarnings, 0);
  const totalJobs = earnings.reduce((sum, earning) => sum + earning.completedJobs, 0);
  const averageRating = (earnings.reduce((sum, earning) => sum + earning.averageRating, 0) / earnings.length).toFixed(1);

  const filteredEarnings = earnings.filter(earning => {
    if (selectedPeriod === "all") return true;
    if (selectedPeriod === "6months") {
      const date = new Date(earning.month);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return date >= sixMonthsAgo;
    }
    return true;
  });

  const sortedEarnings = [...filteredEarnings].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.month) - new Date(a.month);
    if (sortBy === "earnings") return b.totalEarnings - a.totalEarnings;
    if (sortBy === "jobs") return b.completedJobs - a.completedJobs;
    if (sortBy === "rating") return b.averageRating - a.averageRating;
    return 0;
  });

  return (
    <ServiceProviderLayout>
      {/* HEADER */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6
        bg-gradient-to-r from-purple-600 to-pink-500
        bg-clip-text text-transparent"
      >
        Earnings
      </motion.h2>

      {/* MAIN CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10
        border border-slate-200 shadow-lg"
      >
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <FaMoneyBillWave className="text-2xl" />
              <span className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</span>
            </div>
            <p className="text-purple-100">Total Earnings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <FaChartLine className="text-2xl" />
              <span className="text-2xl font-bold">{totalJobs}</span>
            </div>
            <p className="text-blue-100">Completed Jobs</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500 to-green-600 p-4 sm:p-6 rounded-xl text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <FaStar className="text-2xl" />
              <span className="text-2xl font-bold">{averageRating}</span>
            </div>
            <p className="text-green-100">Average Rating</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 sm:p-6 rounded-xl text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <FaCalendarAlt className="text-2xl" />
              <span className="text-2xl font-bold">{earnings.length}</span>
            </div>
            <p className="text-orange-100">Months Active</p>
          </motion.div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FaFilter className="text-purple-600" />
            <span className="font-semibold text-gray-700">Filter:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedPeriod("6months")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === "6months"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Last 6 Months
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="recent">Most Recent</option>
              <option value="earnings">Highest Earnings</option>
              <option value="jobs">Most Jobs</option>
              <option value="rating">Best Rating</option>
            </select>
          </div>
        </div>

        {/* EARNINGS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Earnings</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Jobs</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Top Service</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEarnings.map((earning, index) => (
                <motion.tr
                  key={earning.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{earning.month}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-green-600">₹{earning.totalEarnings.toLocaleString()}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-700">{earning.completedJobs}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-sm" />
                      <span className="text-gray-700">{earning.averageRating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-700">{earning.topService}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FaDownload className="text-xs" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {sortedEarnings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No earnings data found</h3>
            <p className="text-gray-500">Start completing jobs to see your earnings</p>
          </div>
        )}
      </motion.div>
    </ServiceProviderLayout>
  );
}
