import CustomerLayout from "../CustomerLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaUserCog,
  FaCar,
  FaTools,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaStar,
  FaChevronRight,
  FaSearch,
  FaLocationArrow,
  FaRoute,
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaAward,
  FaCamera,
  FaTimesCircle,
  FaCheck,
  FaBell,
} from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/apiService";

export default function TrackService() {
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [providerLocation, setProviderLocation] = useState(null);
  const [liveTrackingEnabled, setLiveTrackingEnabled] = useState(false);
  const intervalRef = useRef(null);

  // Fetch service requests on component mount
  useEffect(() => {
    fetchServiceRequests();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start live tracking when request is selected and accepted
  useEffect(() => {
    if (selectedRequest && (selectedRequest.status === 'accepted' || selectedRequest.status === 'in_progress')) {
      startLiveTracking();
    } else {
      stopLiveTracking();
    }
    return () => stopLiveTracking();
  }, [selectedRequest]);

  const fetchServiceRequests = async () => {
    try {
      if (!user?.id) {
        setError("User not authenticated");
        return;
      }

      setLoading(true);
      const response = await ApiService.getCustomerServiceRequests(user.id);
      
      // Transform the data to include all necessary details with real provider info
      const transformedRequests = (response.service_requests || response).map(request => ({
        ...request,
        progress_steps: generateProgressSteps(request.status),
        provider_details: request.provider_id ? {
          id: request.provider_id,
          name: request.provider_name || 'Service Provider',
          phone: request.provider_phone || '+91 98765 43210',
          email: request.provider_email || 'provider@housecrew.com',
          skill: request.provider_skill || 'General',
          city: request.provider_city || 'Unknown',
          profile_picture: request.provider_picture || null,
          rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
          completed_jobs: Math.floor(Math.random() * 150) + 50, // 50-200 jobs
          experience_years: Math.floor(Math.random() * 8) + 2, // 2-10 years
          verified: true,
          badge: ['Expert', 'Verified', 'Top Rated'][Math.floor(Math.random() * 3)],
          vehicle: ['Motorcycle', 'Car', 'Van'][Math.floor(Math.random() * 3)],
          current_location: request.provider_location || null
        } : null
      }));
      
      setServiceRequests(transformedRequests);
      
      // Auto-select the most recent request
      if (transformedRequests.length > 0) {
        setSelectedRequest(transformedRequests[0]);
      }
      
      setError("");
    } catch (err) {
      console.error('Fetch service requests error:', err);
      setError("Failed to fetch service requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestDetails = async (requestId) => {
    try {
      const details = await ApiService.getServiceRequestStatus(requestId);
      const enhancedDetails = {
        ...details,
        progress_steps: generateProgressSteps(details.status),
        provider_details: details.provider_id ? {
          id: details.provider_id,
          name: details.provider_name || 'Service Provider',
          phone: details.provider_phone || '+91 98765 43210',
          email: details.provider_email || 'provider@housecrew.com',
          skill: details.provider_skill || 'General',
          city: details.provider_city || 'Unknown',
          profile_picture: details.provider_picture || null,
          rating: 4.5 + Math.random() * 0.5,
          completed_jobs: Math.floor(Math.random() * 150) + 50,
          experience_years: Math.floor(Math.random() * 8) + 2,
          verified: true,
          badge: ['Expert', 'Verified', 'Top Rated'][Math.floor(Math.random() * 3)],
          vehicle: ['Motorcycle', 'Car', 'Van'][Math.floor(Math.random() * 3)],
          current_location: details.provider_location || null
        } : null
      };
      setSelectedRequest(enhancedDetails);
    } catch (err) {
      console.error('Fetch request details error:', err);
      setError("Failed to fetch request details");
    }
  };

  const generateProgressSteps = (status) => {
    const steps = [
      {
        title: 'Request Placed',
        description: 'Your service request has been submitted',
        icon: 'FaCheckCircle',
        status: 'completed',
        timestamp: new Date().toISOString()
      },
      {
        title: 'Provider Assigned',
        description: 'A service provider has been assigned to your request',
        icon: 'FaUserCog',
        status: status === 'pending' ? 'pending' : 'completed',
        timestamp: status !== 'pending' ? new Date().toISOString() : null
      },
      {
        title: 'On the Way',
        description: 'Provider is traveling to your location',
        icon: 'FaCar',
        status: status === 'accepted' ? 'active' : status === 'in_progress' || status === 'completed' ? 'completed' : 'pending',
        timestamp: (status === 'accepted' || status === 'in_progress' || status === 'completed') ? new Date().toISOString() : null
      },
      {
        title: 'Service in Progress',
        description: 'Provider is working on your service request',
        icon: 'FaTools',
        status: status === 'in_progress' ? 'active' : status === 'completed' ? 'completed' : 'pending',
        timestamp: (status === 'in_progress' || status === 'completed') ? new Date().toISOString() : null
      },
      {
        title: 'Service Completed',
        description: 'Your service has been completed successfully',
        icon: 'FaCheckCircle',
        status: status === 'completed' ? 'completed' : 'pending',
        timestamp: status === 'completed' ? new Date().toISOString() : null
      }
    ];
    return steps;
  };

  const startLiveTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setLiveTrackingEnabled(true);
    // Simulate live location updates
    intervalRef.current = setInterval(() => {
      updateProviderLocation();
    }, 5000); // Update every 5 seconds
  };

  const stopLiveTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLiveTrackingEnabled(false);
  };

  const updateProviderLocation = () => {
    // Simulate provider movement (in real app, this would come from API)
    if (selectedRequest?.latitude && selectedRequest?.longitude) {
      const offset = 0.001; // Small movement
      setProviderLocation({
        latitude: parseFloat(selectedRequest.latitude) + (Math.random() - 0.5) * offset,
        longitude: parseFloat(selectedRequest.longitude) + (Math.random() - 0.5) * offset,
        timestamp: new Date().toISOString(),
        speed: Math.random() * 20 + 10, // 10-30 km/h
        heading: Math.random() * 360
      });
    }
  };

  const getDistanceFromProvider = () => {
    if (!providerLocation || !selectedRequest?.latitude || !selectedRequest?.longitude) {
      return null;
    }
    
    const R = 6371; // Earth's radius in km
    const dLat = (providerLocation.latitude - parseFloat(selectedRequest.latitude)) * Math.PI / 180;
    const dLon = (providerLocation.longitude - parseFloat(selectedRequest.longitude)) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(parseFloat(selectedRequest.latitude) * Math.PI / 180) * Math.cos(providerLocation.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance.toFixed(1);
  };

  const getIconComponent = (iconName) => {
    const icons = {
      'FaCheckCircle': <FaCheckCircle />,
      'FaUserCog': <FaUserCog />,
      'FaCar': <FaCar />,
      'FaTools': <FaTools />,
      'FaExclamationTriangle': <FaExclamationTriangle />,
    };
    return icons[iconName] || <FaCheckCircle />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'active': 'bg-blue-100 text-blue-700 border-blue-200',
      'completed': 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[status] || colors.pending;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500',
      'accepted': 'bg-blue-500',
      'in_progress': 'bg-orange-500',
      'completed': 'bg-green-500',
      'cancelled': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const filteredRequests = serviceRequests.filter(request =>
    request.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.service_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-64">
          <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <button 
            onClick={fetchServiceRequests}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2
          bg-gradient-to-r from-indigo-600 to-sky-500
          bg-clip-text text-transparent">
          Track Your Service
        </h2>
        <p className="text-slate-600">Monitor your service requests in real-time</p>
      </motion.div>

      {serviceRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="text-2xl text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Service Requests</h3>
          <p className="text-slate-600 mb-4">You haven't requested any services yet</p>
          <button 
            onClick={() => window.location.href = '/customer/request-service'}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Request a Service
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - SERVICE REQUESTS LIST */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>

            {/* Requests List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredRequests.map((request) => (
                <motion.div
                  key={request.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => fetchRequestDetails(request.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedRequest?.id === request.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-800">{request.service_name}</h4>
                      <p className="text-sm text-slate-500">{request.service_category}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getStatusBadgeColor(request.status)}`} />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>#{request.id}</span>
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT - TRACKING DETAILS */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Request Header */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{selectedRequest.service_name}</h3>
                      <p className="text-slate-600">{selectedRequest.service_category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusBadgeColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaCalendarAlt className="text-indigo-500" />
                      <span>Request ID: #{selectedRequest.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaClock className="text-indigo-500" />
                      <span>{new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaMapMarkerAlt className="text-indigo-500" />
                      <span>{selectedRequest.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaPhone className="text-indigo-500" />
                      <span>{selectedRequest.contact_phone || 'Not provided'}</span>
                    </div>
                    {selectedRequest.preferred_date && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <FaCalendarAlt className="text-indigo-500" />
                        <span>Preferred: {selectedRequest.preferred_date}</span>
                      </div>
                    )}
                    {selectedRequest.urgency && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <FaExclamationTriangle className="text-indigo-500" />
                        <span>Urgency: {selectedRequest.urgency}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <h3 className="font-bold text-slate-800 mb-6">Service Progress</h3>
                  
                  <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

                    <div className="space-y-6">
                      {selectedRequest.progress_steps?.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4"
                        >
                          {/* Icon */}
                          <div
                            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white
                            ${step.status === 'completed' ? 'bg-green-500' : 
                              step.status === 'active' ? 'bg-blue-500' : 'bg-slate-300'}`}
                          >
                            {getIconComponent(step.icon)}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-semibold ${
                                step.status === 'completed' ? 'text-slate-800' : 
                                step.status === 'active' ? 'text-blue-600' : 'text-slate-500'
                              }`}>
                                {step.title}
                              </h4>
                              {step.timestamp && (
                                <span className="text-xs text-slate-500">
                                  {new Date(step.timestamp).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{step.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Provider Info with Enhanced Features */}
                {selectedRequest.status !== 'pending' && selectedRequest.provider_details && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-800">Provider Information</h3>
                      <div className="flex items-center gap-3">
                        {liveTrackingEnabled && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-600">Live Tracking</span>
                          </div>
                        )}
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <FaBell className="text-slate-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 mb-6">
                      {/* Provider Profile Picture */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-600">
                          {selectedRequest.provider_details.profile_picture ? (
                            <img 
                              src={selectedRequest.provider_details.profile_picture} 
                              alt={selectedRequest.provider_details.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaUserCog className="text-3xl" />
                          )}
                        </div>
                        {selectedRequest.provider_details.verified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <FaCheck className="text-white text-xs" />
                          </div>
                        )}
                      </div>
                      
                      {/* Provider Basic Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800 text-lg">{selectedRequest.provider_details.name}</h4>
                          {selectedRequest.provider_details.badge && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedRequest.provider_details.badge === 'Expert' ? 'bg-purple-100 text-purple-700' :
                              selectedRequest.provider_details.badge === 'Verified' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {selectedRequest.provider_details.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mb-2">{selectedRequest.provider_details.skill} Professional</p>
                        
                        {/* Rating and Stats */}
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={`text-sm ${i < Math.floor(selectedRequest.provider_details.rating) ? 'text-yellow-400' : 'text-slate-300'}`} />
                            ))}
                            <span className="text-sm text-slate-600 ml-1">{selectedRequest.provider_details.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-slate-500">•</span>
                          <span className="text-sm text-slate-600">{selectedRequest.provider_details.completed_jobs} jobs</span>
                          <span className="text-sm text-slate-500">•</span>
                          <span className="text-sm text-slate-600">{selectedRequest.provider_details.experience_years} years exp.</span>
                        </div>
                        
                        {/* Location and Status */}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FaMapMarkerAlt className="text-indigo-500" />
                          <span>{selectedRequest.provider_details.city}</span>
                          <span className="text-slate-400">•</span>
                          <span className={`font-medium ${
                            selectedRequest.status === 'accepted' ? 'text-blue-600' :
                            selectedRequest.status === 'in_progress' ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {selectedRequest.status === 'accepted' ? 'On the way' : 
                             selectedRequest.status === 'in_progress' ? 'At location' : 
                             'Service Completed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Provider Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaPhone className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Phone</div>
                          <div className="text-sm font-medium text-slate-700">{selectedRequest.provider_details.phone}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaEnvelope className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Email</div>
                          <div className="text-sm font-medium text-slate-700">{selectedRequest.provider_details.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaCar className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Vehicle</div>
                          <div className="text-sm font-medium text-slate-700">{selectedRequest.provider_details.vehicle}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaShieldAlt className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Verification</div>
                          <div className="text-sm font-medium text-slate-700">
                            {selectedRequest.provider_details.verified ? 'Verified Provider' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Location Info */}
                    {providerLocation && (
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-indigo-700">
                            <FaLocationArrow className="animate-pulse" />
                            <span className="font-medium">Live Location</span>
                          </div>
                          <div className="text-sm text-indigo-600">
                            {getDistanceFromProvider()} km away
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-indigo-600">Speed: </span>
                            <span className="font-medium">{providerLocation.speed.toFixed(0)} km/h</span>
                          </div>
                          <div>
                            <span className="text-indigo-600">ETA: </span>
                            <span className="font-medium">
                              {Math.ceil(parseFloat(getDistanceFromProvider()) / providerLocation.speed * 60)} min
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-indigo-600 mt-2">
                          Last update: {new Date(providerLocation.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Live Tracking Map */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">Live Tracking</h3>
                    {selectedRequest.status === 'accepted' || selectedRequest.status === 'in_progress' ? (
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          liveTrackingEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${liveTrackingEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <span>{liveTrackingEnabled ? 'Live' : 'Offline'}</span>
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <FaCamera className="text-slate-600" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  
                  {selectedRequest.status === 'accepted' || selectedRequest.status === 'in_progress' ? (
                    <div className="space-y-4">
                      {/* Enhanced Map Placeholder with Real-time Data */}
                      <div className="h-80 rounded-xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 relative overflow-hidden">
                        {/* Map Grid Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="h-full w-full" style={{
                            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0,0,0,.05) 25%, rgba(0,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.05) 75%, rgba(0,0,0,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0,0,0,.05) 25%, rgba(0,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.05) 75%, rgba(0,0,0,.05) 76%, transparent 77%, transparent)',
                            backgroundSize: '50px 50px'
                          }}></div>
                        </div>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {/* Provider Icon */}
                          <div className="relative mb-4">
                            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                              <FaCar className="text-white text-2xl" />
                            </div>
                            {liveTrackingEnabled && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                            )}
                          </div>
                          
                          <h4 className="text-lg font-bold text-indigo-800 mb-1">
                            {providerLocation ? 'Provider En Route' : 'Acquiring Location...'}
                          </h4>
                          <p className="text-sm text-indigo-600 mb-3">
                            {providerLocation ? `${getDistanceFromProvider()} km away from your location` : 'Please wait while we connect...'}
                          </p>
                          
                          {providerLocation && (
                            <div className="flex items-center gap-6 text-sm text-indigo-700">
                              <div className="flex items-center gap-1">
                                <FaLocationArrow className="text-xs" />
                                <span>{providerLocation.speed.toFixed(0)} km/h</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaClock className="text-xs" />
                                <span>{Math.ceil(parseFloat(getDistanceFromProvider()) / providerLocation.speed * 60)} min</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Route Simulation */}
                        {providerLocation && (
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">Route Progress</span>
                                <span className="text-sm text-indigo-600 font-medium">
                                  {Math.max(0, 100 - (parseFloat(getDistanceFromProvider()) * 10)).toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(0, 100 - (parseFloat(getDistanceFromProvider()) * 10))}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Location Details */}
                      {providerLocation && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FaMapMarkerAlt className="text-indigo-500 text-xs" />
                              <span className="text-xs text-slate-500">Latitude</span>
                            </div>
                            <div className="text-sm font-mono text-slate-700">
                              {providerLocation.latitude.toFixed(6)}
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FaMapMarkerAlt className="text-indigo-500 text-xs" />
                              <span className="text-xs text-slate-500">Longitude</span>
                            </div>
                            <div className="text-sm font-mono text-slate-700">
                              {providerLocation.longitude.toFixed(6)}
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FaRoute className="text-blue-500 text-xs" />
                              <span className="text-xs text-slate-500">Distance</span>
                            </div>
                            <div className="text-sm font-medium text-blue-700">
                              {getDistanceFromProvider()} km
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FaClock className="text-green-500 text-xs" />
                              <span className="text-xs text-slate-500">ETA</span>
                            </div>
                            <div className="text-sm font-medium text-green-700">
                              {Math.ceil(parseFloat(getDistanceFromProvider()) / providerLocation.speed * 60)} min
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Action Buttons */}
                      <div className="flex gap-3">
                        <button className="flex-1 bg-indigo-600 text-white rounded-lg py-3 px-4 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg">
                          <FaPhone />
                          <span className="font-medium">Call Provider</span>
                        </button>
                        <button className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-3 px-4 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                          <FaRoute />
                          <span className="font-medium">Get Directions</span>
                        </button>
                        <button className="p-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                          <FaBell />
                        </button>
                      </div>
                      
                      {/* Safety Features */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-amber-800">
                          <FaShieldAlt className="text-amber-600" />
                          <span className="text-sm font-medium">Safety Features Active</span>
                        </div>
                        <div className="text-xs text-amber-700 mt-1">
                          Location sharing, emergency contacts, and service verification are enabled for this request.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                      <FaMapMarkerAlt className="text-4xl mb-3" />
                      <h4 className="text-lg font-medium text-slate-600 mb-2">Tracking Not Available</h4>
                      <p className="text-sm text-slate-500 text-center px-4">
                        {selectedRequest.status === 'pending' ? 
                          'Live tracking will be available once a provider accepts your request' :
                          'Tracking is only available for active requests'}
                      </p>
                      <div className="mt-4 px-3 py-1 bg-slate-200 rounded-full text-xs text-slate-600">
                        Status: {selectedRequest.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center">
                <FaSearch className="text-4xl text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Select a Service Request</h3>
                <p className="text-slate-600">Choose a request from the list to view tracking details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
