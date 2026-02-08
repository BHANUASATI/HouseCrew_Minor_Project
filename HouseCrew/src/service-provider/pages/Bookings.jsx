import ServiceProviderLayout from "../ServiceProviderLayout";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaCheckCircle, FaTimesCircle, FaStar } from "react-icons/fa";
import { useState } from "react";

export default function Bookings() {
  const [bookings, setBookings] = useState([
    {
      id: "BK001",
      customerName: "Rahul Sharma",
      customerPhone: "+91 9876543210",
      service: "Home Cleaning",
      date: "2024-02-08",
      time: "10:00 AM",
      status: "confirmed",
      address: "123 Main Street, Delhi",
      price: 1200,
      rating: 4.5
    },
    {
      id: "BK002",
      customerName: "Priya Patel",
      customerPhone: "+91 8765432109",
      service: "Plumbing Repair",
      date: "2024-02-08",
      time: "2:00 PM",
      status: "pending",
      address: "456 Park Avenue, Mumbai",
      price: 800,
      rating: null
    },
    {
      id: "BK003",
      customerName: "Amit Kumar",
      customerPhone: "+91 7654321098",
      service: "Electrical Work",
      date: "2024-02-07",
      time: "11:30 AM",
      status: "completed",
      address: "789 Cross Road, Bangalore",
      price: 1500,
      rating: 5.0
    },
    {
      id: "BK004",
      customerName: "Sneha Reddy",
      customerPhone: "+91 6543210987",
      service: "Gardening",
      date: "2024-02-09",
      time: "9:00 AM",
      status: "confirmed",
      address: "321 Garden City, Chennai",
      price: 600,
      rating: null
    }
  ]);

  const [filterStatus, setFilterStatus] = useState("all");

  const filteredBookings = bookings.filter(booking => {
    return filterStatus === "all" || booking.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: "bg-green-100 text-green-700 border-green-200",
        icon: <FaCheckCircle className="text-xs" />
      },
      pending: {
        bg: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <FaClock className="text-xs" />
      },
      completed: {
        bg: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <FaCheckCircle className="text-xs" />
      },
      cancelled: {
        bg: "bg-red-100 text-red-700 border-red-200",
        icon: <FaTimesCircle className="text-xs" />
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleStatusUpdate = (bookingId, newStatus) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

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
        Bookings
      </motion.h2>

      {/* MAIN CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10
        border border-slate-200 shadow-lg"
      >
        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-purple-600" />
            <span className="font-semibold text-gray-700">Filter by Status:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("confirmed")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "confirmed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* BOOKINGS LIST */}
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* BOOKING HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{booking.id}</h3>
                  <div className="flex items-center gap-2 mt-1 sm:mt-0">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-purple-600">₹{booking.price}</p>
                </div>
              </div>

              {/* BOOKING DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-800">{booking.customerName}</p>
                    <p className="text-sm text-gray-500">{booking.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-800">{booking.date}</p>
                    <p className="text-sm text-gray-500">{booking.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <p className="text-gray-700 text-sm">{booking.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 font-semibold">{booking.service}</span>
                  {booking.rating && (
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-sm" />
                      <span className="text-sm text-gray-600">{booking.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {booking.status === "pending" && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </motion.button>
                  </>
                )}
                {booking.status === "confirmed" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusUpdate(booking.id, "completed")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mark Complete
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
            <p className="text-gray-500">Try adjusting your filter or check back later</p>
          </div>
        )}
      </motion.div>
    </ServiceProviderLayout>
  );
}
