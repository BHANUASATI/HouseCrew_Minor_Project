import CustomerLayout from "../CustomerLayout";
import StatCard from "../components/StatCard";
import QuickAction from "../components/QuickAction";
import ServiceTable from "../components/ServiceTable";
import { FaPlus, FaMapMarkedAlt, FaWallet } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    // Check if user is customer
    if (user && user.role !== 'customer') {
      navigate('/auth');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const handleQuickAction = (action) => {
    switch(action) {
      case 'new-service':
        navigate('/customer/request-service');
        break;
      case 'track-service':
        navigate('/customer/track-service');
        break;
      case 'make-payment':
        navigate('/customer/payments');
        break;
      default:
        break;
    }
  };

  return (
    <CustomerLayout>
      {/* HEADER - Personalized Welcome */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6
        bg-gradient-to-r from-indigo-600 to-sky-500
        bg-clip-text text-transparent"
      >
        Welcome back, {user?.name || 'Customer'}! 👋
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-600 mb-6 sm:mb-8"
      >
        Manage your service requests and track progress from your personal dashboard.
      </motion.p>

      {/* MAIN CONTENT CONTAINER - BIG SCREEN LARGER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10
        border border-slate-200 shadow-lg"
      >
        {/* STATS GRID - BIG SCREEN LARGER CARDS */}
        <div className="flex flex-col gap-4 max-sm:grid max-sm:grid-cols-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-sm:gap-4 sm:gap-4 lg:gap-6 xl:gap-8 mb-6 sm:mb-8">
        {/* USER PROFILE CARD */}
        <div className="w-full sm:w-full">
          <div className="bg-gradient-to-r from-indigo-500 to-sky-500 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Profile Info</h3>
            <div className="space-y-2 text-sm">
              <p><span className="opacity-80">Name:</span> {user?.name || 'N/A'}</p>
              <p><span className="opacity-80">Email:</span> {user?.email || 'N/A'}</p>
              <p><span className="opacity-80">Role:</span> Customer</p>
              <p><span className="opacity-80">Member Since:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</p>
            </div>
          </div>
        </div>
        
        <div className="w-full sm:w-full">
          <StatCard title="Total Requests" value="12" color="bg-indigo-600" />
        </div>
        <div className="w-full sm:w-full">
          <StatCard title="Ongoing" value="2" color="bg-orange-500" />
        </div>
        <div className="w-full sm:w-full">
          <StatCard title="Completed" value="8" color="bg-green-600" />
        </div>
        <div className="w-full sm:w-full">
          <StatCard title="Pending" value="₹1200" color="bg-red-500" />
        </div>
      </div>

        {/* QUICK ACTIONS GRID - BIG SCREEN LARGER CARDS */}
        <div className="flex flex-col gap-4 max-sm:grid max-sm:grid-cols-1 sm:grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 max-sm:gap-4 sm:gap-4 lg:gap-6 xl:gap-8 mb-6 sm:mb-8">
        <div className="w-full sm:w-full">
          <QuickAction icon={<FaPlus />} label="New Service" onClick={() => handleQuickAction('new-service')} />
        </div>
        <div className="w-full sm:w-full">
          <QuickAction icon={<FaMapMarkedAlt />} label="Track Service" onClick={() => handleQuickAction('track-service')} />
        </div>
        <div className="w-full sm:w-full">
          <QuickAction icon={<FaWallet />} label="Make Payment" onClick={() => handleQuickAction('make-payment')} />
        </div>
      </div>

        {/* RECENT SERVICES TABLE */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 sm:p-5 lg:p-6">
            <h3 className="text-sm sm:text-base lg:text-xl font-bold mb-3 sm:mb-4 lg:mb-6 text-gray-800 dark:text-white flex items-center gap-3">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
              Recent Services
            </h3>
            <div className="overflow-x-auto">
              <ServiceTable />
            </div>
          </div>
        </div>
      </motion.div>
    </CustomerLayout>
  );
}
