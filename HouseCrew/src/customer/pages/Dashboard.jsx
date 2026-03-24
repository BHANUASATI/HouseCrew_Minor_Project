import CustomerLayout from "../CustomerLayout";
import StatCard from "../components/StatCard";
import QuickAction from "../components/QuickAction";
import ServiceTable from "../components/ServiceTable";
import {
  FaPlus,
  FaMapMarkedAlt,
  FaWallet,
  FaUser,
  FaBell,
  FaTools,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaMoneyBillWave,
  FaSpinner,
  FaExclamationTriangle,
  FaChartLine,
  FaHistory,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import ApiService from "../../services/apiService";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      if (!user?.id) return;
      
      setLoading(true);
      setError("");
      
      const data = await ApiService.getCustomerDashboard(user.id);
      setDashboardData(data);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, user?.id]);

  // Force re-render when user data changes (including profile picture)
  useEffect(() => {
    if (user?.profile_picture) {
      console.log('User profile picture updated in dashboard:', user.profile_picture);
    }
  }, [user?.profile_picture]);

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

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      'accepted': 'bg-blue-100 text-blue-700 border border-blue-200',
      'in_progress': 'bg-orange-100 text-orange-700 border border-orange-200',
      'completed': 'bg-green-100 text-green-700 border border-green-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <FaClock />,
      'accepted': <FaCheckCircle />,
      'in_progress': <FaTools />,
      'completed': <FaCheckCircle />,
    };
    return icons[status] || <FaClock />;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  if (loading && !dashboardData) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-64">
          <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      {/* HEADER - Personalized Welcome with Live Status */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-extrabold mb-2
            bg-gradient-to-r from-indigo-600 to-sky-500
            bg-clip-text text-transparent"
          >
            Welcome back, {user?.name || 'Customer'}! 👋
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-600 mb-2"
          >
            Manage your service requests and track progress from your personal dashboard.
          </motion.p>

          {/* Live Status Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-green-600"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live data</span>
            {lastUpdate && (
              <span className="text-gray-500">
                • Updated {formatTimeAgo(lastUpdate.toISOString())}
              </span>
            )}
          </motion.div>
        </div>

        {/* Auto-refresh Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            autoRefresh 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
        </motion.button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            <div className="flex items-center gap-2">
              <FaExclamationTriangle />
              <span>{error}</span>
              <button
                onClick={fetchDashboardData}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10
        border border-slate-200 shadow-lg"
      >
        {/* REAL-TIME STATS GRID */}
        <div className="flex flex-col gap-4 max-sm:grid max-sm:grid-cols-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-sm:gap-4 sm:gap-4 lg:gap-6 xl:gap-8 mb-6 sm:mb-8">
          <div className="w-full sm:w-full">
            <StatCard 
              title="Total Requests" 
              value={dashboardData?.statistics?.total_requests || 0} 
              color="bg-indigo-600" 
              icon={<FaHistory />}
            />
          </div>
          <div className="w-full sm:w-full">
            <StatCard 
              title="In Progress" 
              value={dashboardData?.statistics?.in_progress_requests || 0} 
              color="bg-orange-500" 
              icon={<FaTools />}
            />
          </div>
          <div className="w-full sm:w-full">
            <StatCard 
              title="Completed" 
              value={dashboardData?.statistics?.completed_requests || 0} 
              color="bg-green-600" 
              icon={<FaCheckCircle />}
            />
          </div>
          <div className="w-full sm:w-full">
            <StatCard 
              title="Wallet Balance" 
              value={`₹${dashboardData?.statistics?.wallet_balance || 0}`} 
              color="bg-purple-600" 
              icon={<FaWallet />}
            />
          </div>
        </div>

        {/* PENDING PAYMENTS ALERT */}
        {dashboardData?.statistics?.pending_payments > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaMoneyBillWave className="text-red-600 text-xl" />
                <div>
                  <p className="font-semibold text-red-800">Pending Payments</p>
                  <p className="text-sm text-red-600">
                    You have ₹{dashboardData.statistics.pending_payments} in pending payments
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleQuickAction('make-payment')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Pay Now
              </button>
            </div>
          </motion.div>
        )}

        {/* QUICK ACTIONS GRID */}
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

        {/* RECENT ACTIVITIES & SERVICES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RECENT ACTIVITIES */}
          <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaBell className="text-indigo-600" />
                Recent Activities
              </h3>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-3">
              {dashboardData?.recent_activities?.length > 0 ? (
                dashboardData.recent_activities.map((activity, index) => (
                  <motion.div
                    key={`${activity.reference_id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      activity.type === 'payment' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {activity.type === 'payment' ? <FaMoneyBillWave /> : <FaTools />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaHistory className="text-4xl mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* RECENT SERVICES TABLE */}
          <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaChartLine className="text-indigo-600" />
                Recent Services
              </h3>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="relative rounded-xl overflow-hidden bg-white border border-gray-200">
                <table className="w-full text-xs min-w-[300px]">
                  <thead>
                    <tr className="text-gray-600 font-semibold border-b border-gray-300 bg-gray-50">
                      <th className="text-left py-2 px-3 font-bold text-xs">Service</th>
                      <th className="text-center font-bold text-xs">Status</th>
                      <th className="text-center font-bold text-xs">Date</th>
                      <th className="text-center font-bold text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.recent_services?.slice(0, 5).map((service, index) => (
                      <tr
                        key={service.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-3 font-medium text-gray-800 text-xs">
                          {service.service_name}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}
                          >
                            {getStatusIcon(service.status)}
                            {service.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center text-gray-600 text-xs">
                          {new Date(service.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/customer/track-service')}
                            className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            <FaEye className="text-xs" />
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {(!dashboardData?.recent_services || dashboardData.recent_services.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <FaTools className="text-4xl mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No service requests yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </CustomerLayout>
  );
}
