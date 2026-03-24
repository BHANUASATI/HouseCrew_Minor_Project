import { motion } from "framer-motion";
import { FaEye, FaEdit, FaTrash, FaCheckCircle, FaClock, FaTimesCircle, FaHandshake, FaSync } from "react-icons/fa";
import { useState, useEffect } from "react";
import ApiService from "../../services/apiService";
import DistanceDisplay from "./DistanceDisplay";

export default function ServiceTable() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Get current user from localStorage
  const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const fetchServiceRequests = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== 'service_provider') {
        setError('User not authenticated or not a service provider');
        return;
      }

      const response = await ApiService.getProviderServiceRequests(currentUser.id);
      setServiceRequests(response.service_requests || []);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching service requests:', err);
      setError(err.message || 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchServiceRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleAcceptRequest = async (requestId) => {
    try {
      setAcceptingId(requestId);
      const currentUser = getCurrentUser();
      
      const response = await ApiService.acceptServiceRequest(requestId, currentUser.id);
      
      // Remove the accepted request from the list
      setServiceRequests(prev => prev.filter(request => request.id !== requestId));
      
      console.log('Service request accepted:', response);
      
      // Show success message (you could use a toast notification here)
      alert('Service request accepted successfully!');
    } catch (err) {
      console.error('Error accepting service request:', err);
      setError(err.message || 'Failed to accept service request');
      alert('Failed to accept service request: ' + (err.message || 'Unknown error'));
    } finally {
      setAcceptingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-amber-100 dark:bg-amber-900/30", 
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-700",
        icon: <FaClock className="text-xs" />
      },
      accepted: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-700",
        icon: <FaCheckCircle className="text-xs" />
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading service requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="text-purple-600 hover:text-purple-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (serviceRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">No service requests available</div>
        <p className="text-sm text-gray-400 mb-4">New requests matching your skills will appear here</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchServiceRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          Refresh
        </motion.button>
        <p className="text-xs text-gray-400 mt-2">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Refresh controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {serviceRequests.length} pending requests
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchServiceRequests}
            disabled={loading}
            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh requests"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
          </motion.button>
        </div>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">ID</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Customer</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Service</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Location</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Distance</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Time</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Urgency</th>
            <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {serviceRequests.map((request, index) => (
            <motion.tr
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td className="py-3 px-2 sm:px-4">
                <span className="font-mono text-xs text-gray-600 dark:text-gray-400">#{request.id}</span>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{request.customer_name}</p>
                  <p className="text-xs text-gray-500">{request.customer_phone}</p>
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div>
                  <p className="text-gray-700 dark:text-gray-300">{request.service_name}</p>
                  <p className="text-xs text-gray-500">{request.service_category}</p>
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div className="max-w-xs">
                  <p className="text-gray-700 dark:text-gray-300 text-sm truncate" title={request.address}>
                    {request.address}
                  </p>
                  {request.latitude && request.longitude && (
                    <p className="text-xs text-gray-500 font-mono">
                      📍 {parseFloat(request.latitude).toFixed(4)}, {parseFloat(request.longitude).toFixed(4)}
                    </p>
                  )}
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <DistanceDisplay 
                  providerId={getCurrentUser()?.id}
                  customerLat={request.latitude}
                  customerLon={request.longitude}
                  customerAddress={request.address}
                />
              </td>
              <td className="py-3 px-2 sm:px-4">
                <p className="text-gray-700 dark:text-gray-300">{formatDate(request.preferred_date)}</p>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <p className="text-gray-700 dark:text-gray-300">{request.preferred_time || 'Not specified'}</p>
              </td>
              <td className="py-3 px-2 sm:px-4">
                {getStatusBadge(request.status)}
              </td>
              <td className="py-3 px-2 sm:px-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  request.urgency === 'high' ? 'bg-red-100 text-red-700' :
                  request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {request.urgency || 'medium'}
                </span>
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
                    onClick={() => handleAcceptRequest(request.id)}
                    disabled={acceptingId === request.id}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                      acceptingId === request.id 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                    title="Accept Request"
                  >
                    {acceptingId === request.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-emerald-600"></div>
                    ) : (
                      <FaHandshake className="text-xs sm:text-sm" />
                    )}
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
