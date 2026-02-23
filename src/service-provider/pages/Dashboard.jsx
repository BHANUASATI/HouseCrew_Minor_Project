import ServiceProviderLayout from "../ServiceProviderLayout";
import StatCard from "../components/StatCard";
import QuickAction from "../components/QuickAction";
import ServiceTable from "../components/ServiceTable";
import { FaPlus, FaMapMarkedAlt, FaWallet, FaStar, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleQuickAction = (action) => {
    switch(action) {
      case 'new-service':
        navigate('/service-provider/my-services');
        break;
      case 'view-bookings':
        navigate('/service-provider/bookings');
        break;
      case 'view-earnings':
        navigate('/service-provider/earnings');
        break;
      case 'manage-reviews':
        navigate('/service-provider/reviews');
        break;
      case 'view-profile':
        navigate('/service-provider/profile');
        break;
      default:
        break;
    }
  };

  return (
    <ServiceProviderLayout>
      {/* HEADER - Same as Customer Dashboard */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6
        bg-gradient-to-r from-purple-600 to-pink-500
        bg-clip-text text-transparent"
      >
        Service Provider Dashboard
      </motion.h2>

      {/* MAIN CONTENT CONTAINER - BIG SCREEN LARGER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10
        border border-slate-200 shadow-lg"
      >
        {/* STATS GRID - BIG SCREEN LARGER CARDS */}
        <div className="flex flex-col gap-4 max-sm:grid max-sm:grid-cols-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-sm:gap-4 sm:gap-4 lg:gap-6 xl:gap-8 mb-6 sm:mb-8">
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
          <QuickAction icon={<FaPlus />} label="My Services" onClick={() => handleQuickAction('new-service')} />
        </div>
        <div className="w-full sm:w-full">
          <QuickAction icon={<FaMapMarkedAlt />} label="View Bookings" onClick={() => handleQuickAction('view-bookings')} />
        </div>
        <div className="w-full sm:w-full">
          <QuickAction icon={<FaWallet />} label="View Earnings" onClick={() => handleQuickAction('view-earnings')} />
        </div>
        <div className="w-full sm:w-full">
          <QuickAction icon={<FaStar />} label="Manage Reviews" onClick={() => handleQuickAction('manage-reviews')} />
        </div>
        <div className="w-full sm:w-full">
          <QuickAction icon={<FaUser />} label="View Profile" onClick={() => handleQuickAction('view-profile')} />
        </div>
      </div>

        {/* RECENT BOOKINGS TABLE */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 sm:p-5 lg:p-6">
            <h3 className="text-sm sm:text-base lg:text-xl font-bold mb-3 sm:mb-4 lg:mb-6 text-gray-800 dark:text-white flex items-center gap-3">
              <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span>
              Recent Bookings
            </h3>
            <div className="overflow-x-auto">
              <ServiceTable />
            </div>
          </div>
        </div>
      </motion.div>
    </ServiceProviderLayout>
  );
}
