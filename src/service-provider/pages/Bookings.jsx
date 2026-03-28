import ServiceProviderLayout from "../ServiceProviderLayout";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaCheckCircle, FaTimesCircle, FaStar, FaFilter, FaRoute, FaEye, FaCompass, FaGoogle, FaTools, FaHome, FaClipboardList, FaChevronDown } from "react-icons/fa";
import { useState, useEffect } from "react";
import ApiService from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import GoogleMapRoute from "../../components/GoogleMapRoute";
import ModernMap from "../../components/ModernMap";

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all"); // "all", "same_city", "nearby"
  const [maxDistance, setMaxDistance] = useState(10); // Default 10km for nearby
  const [selectedBooking, setSelectedBooking] = useState(null); // For location details modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showGoogleMaps, setShowGoogleMaps] = useState(false); // For Google Maps modal
  const [dailyStatus, setDailyStatus] = useState(null); // Daily acceptance status
  const [expandedBookings, setExpandedBookings] = useState({}); // Track which bookings are expanded

  // Load service requests for the provider
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        console.log('Loading bookings for user:', user);
        
        // First test connectivity
        try {
          console.log('Testing API connectivity...');
          const healthResponse = await fetch('http://localhost:8003/api/health');
          console.log('Health check status:', healthResponse.status);
        } catch (connectError) {
          console.error('API connectivity test failed:', connectError);
          throw new Error('Cannot connect to backend server. Please ensure the backend is running on http://localhost:8003');
        }
        
        if (user?.id) {
          console.log('Fetching service requests for provider ID:', user.id);
          
          // Get provider's real-time GPS location and update in database
          console.log('🔍 Checking for geolocation support...');
          if (navigator.geolocation) {
            console.log('✅ Geolocation is supported');
            try {
              console.log('📡 Requesting GPS location...');
              const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                });
              });
              
              const { latitude, longitude, accuracy } = position.coords;
              console.log('📍 Provider real-time GPS location:', { 
                latitude, 
                longitude, 
                accuracy: `${accuracy.toFixed(2)}m`,
                timestamp: new Date(position.timestamp).toLocaleTimeString()
              });
              
              // Update provider's location in database
              console.log('💾 Updating provider location in database...');
              const updateResult = await ApiService.updateUserLocation(user.id, {
                latitude,
                longitude,
                location_type: 'real_time'
              });
              
              console.log('✅ Provider location updated in database:', updateResult);
            } catch (gpsError) {
              console.error('❌ GPS Error:', gpsError);
              console.warn('⚠️ Could not get real-time GPS location:', gpsError.message);
              console.log('📍 Will use city center as fallback');
            }
          } else {
            console.warn('❌ Geolocation is not supported by this browser');
          }
          
          // Load daily status
          try {
            const statusData = await ApiService.getProviderDailyStatus(user.id);
            setDailyStatus(statusData);
            console.log('Daily status:', statusData);
            
            // If provider doesn't exist, show error and stop
            if (statusData.error) {
              console.log('Provider not found in daily status');
              setBookings([]);
              setError(statusData.error);
              return;
            }
          } catch (statusError) {
            console.error('Failed to load daily status:', statusError);
            // Set default status on error
            setDailyStatus({
              today_accepted: 0,
              max_daily: 3,
              remaining: 3,
              can_accept: true
            });
          }
          
          // Determine location filter parameters
          let locationParam = null;
          let distanceParam = null;
          
          if (locationFilter === "same_city") {
            locationParam = "same_city";
          } else if (locationFilter === "nearby") {
            locationParam = "nearby";
            distanceParam = maxDistance;
          }
          
          const data = await ApiService.getProviderServiceRequests(
            user.id, 
            locationParam, 
            distanceParam
          );
          console.log('=== BOOKINGS DEBUG ===');
          console.log('Raw data received:', data);
          console.log('Service requests count:', data.service_requests?.length || 0);
          console.log('User skill:', user.skill);
          
          if (data.service_requests && data.service_requests.length > 0) {
            console.log('First request sample:', JSON.stringify(data.service_requests[0], null, 2));
            data.service_requests.forEach((req, idx) => {
              console.log(`Request ${idx + 1} FULL:`, JSON.stringify({
                id: req.id,
                category: req.service_category,
                status: req.status,
                provider_id: req.provider_id,
                customer: req.customer_name,
                service_name: req.service_name,
                distance_km: req.distance_km,
                location_type: req.location_type,
                latitude: req.latitude,
                longitude: req.longitude,
                address: req.address,
                address_details: req.address_details
              }, null, 2));
            });
          }
          
          // Handle case where provider doesn't exist
          if (data.error) {
            console.log('Provider not found, showing empty bookings');
            setBookings([]);
            setError(data.error);
            return;
          }
          
          // Transform service requests to booking format
          const transformedBookings = (data.service_requests || []).map(request => {
            const booking = {
              id: `SR${request.id}`,
              customerName: request.customer_name,
              customerPhone: request.customer_phone || "Not provided",
              customerEmail: request.customer_email,
              customerCity: request.customer_city || "Not specified",
              customerAddress: "Not specified", // Address is in service_requests.address
              customerPincode: "Not specified", // Pincode not available in users table
              service: request.service_name,
              date: request.preferred_date,
              time: request.preferred_time || "Not specified",
              status: request.status || "pending",
              address: request.address,
              description: request.description,
              urgency: request.urgency,
              propertyType: request.property_type,
              price: 1000, // Default price, can be calculated based on service
              rating: null,
              createdAt: request.created_at,
              distance: request.distance_km, // Add distance information
              locationType: request.location_type, // Add location type
              providerCity: request.provider_city, // Add provider city for comparison
              providerCoordinates: request.provider_coordinates, // Add provider coordinates
              addressDetails: request.address_details, // Add detailed address information
              latitude: request.latitude,
              longitude: request.longitude
            };
            
            console.log(`📍 Booking ${booking.id} coordinates:`, {
              customer_lat: booking.latitude,
              customer_lng: booking.longitude,
              provider_lat: booking.providerCoordinates?.latitude,
              provider_lng: booking.providerCoordinates?.longitude,
              distance_km: booking.distance,
              location_type: booking.locationType,
              provider_source: booking.providerCoordinates?.source
            });
            
            return booking;
          });
          
          console.log('Transformed bookings:', transformedBookings);
          setBookings(transformedBookings);
          setError(null);
        } else {
          console.log('No user found, setting empty bookings');
          setBookings([]);
          setError("Please log in to view bookings");
        }
      } catch (err) {
        console.error('Failed to load bookings:', err);
        setError(err.message || "Failed to load bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user?.id, locationFilter, maxDistance]);

  const filteredBookings = bookings.filter(booking => {
    // Filter by status only - backend already filters by skill
    const statusMatch = filterStatus === "all" || booking.status === filterStatus;
    
    console.log(`Filtering booking ${booking.id}: status=${booking.status}, filterStatus=${filterStatus}, match=${statusMatch}`);
    
    // Note: Backend already filters by provider's skill, so we don't need to filter again
    // Location filtering is also handled by backend based on location_filter parameter
    
    return statusMatch;
  });
  
  console.log('=== FILTER RESULTS ===');
  console.log('Total bookings:', bookings.length);
  console.log('Filter status:', filterStatus);
  console.log('Filtered bookings:', filteredBookings.length);
  console.log('Filtered booking IDs:', filteredBookings.map(b => ({ id: b.id, status: b.status })));

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <FaClock className="text-xs" />
      },
      accepted: {
        bg: "bg-green-100 text-green-700 border-green-200",
        icon: <FaCheckCircle className="text-xs" />
      },
      confirmed: {
        bg: "bg-green-100 text-green-700 border-green-200",
        icon: <FaCheckCircle className="text-xs" />
      },
      in_progress: {
        bg: "bg-blue-100 text-blue-700 border-blue-200",
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
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const handleViewLocationDetails = (booking) => {
    setSelectedBooking(booking);
    setShowLocationModal(true);
  };

  const handleViewGoogleMaps = (booking) => {
    setSelectedBooking(booking);
    setShowGoogleMaps(true);
  };

  const toggleBookingExpanded = (bookingId) => {
    setExpandedBookings(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const getProviderCoordinates = (booking) => {
    if (booking.providerCoordinates?.latitude && booking.providerCoordinates?.longitude) {
      return {
        lat: booking.providerCoordinates.latitude,
        lng: booking.providerCoordinates.longitude
      };
    }
    return null;
  };

  const getCustomerCoordinates = (booking) => {
    // First priority: Use actual GPS coordinates from the service request
    if (booking.latitude && booking.longitude) {
      return {
        lat: parseFloat(booking.latitude),
        lng: parseFloat(booking.longitude)
      };
    }
    // Fallback: Check if we have coordinates from address details
    if (booking.addressDetails?.coordinates?.latitude && booking.addressDetails?.coordinates?.longitude) {
      return {
        lat: booking.addressDetails.coordinates.latitude,
        lng: booking.addressDetails.coordinates.longitude
      };
    }
    return null;
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // Extract the actual request ID from booking ID (SR123 -> 123)
      const requestId = bookingId.replace('SR', '');
      
      if (newStatus === "accepted") {
        // Check daily limit before accepting
        if (dailyStatus && !dailyStatus.can_accept) {
          alert(`Daily limit reached! You have accepted ${dailyStatus.today_accepted}/${dailyStatus.max_daily} requests today. Try again tomorrow.`);
          return;
        }
        
        // Use the accept service request endpoint
        await ApiService.acceptServiceRequest(requestId, user.id);
        
        // Update daily status after successful acceptance
        if (dailyStatus) {
          setDailyStatus({
            ...dailyStatus,
            today_accepted: dailyStatus.today_accepted + 1,
            remaining: dailyStatus.remaining - 1,
            can_accept: dailyStatus.remaining - 1 > 0
          });
        }
        
        // Update local state
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        ));
        
        alert('Service request accepted successfully!');
      } else if (newStatus === "rejected") {
        // Use the reject service request endpoint
        await ApiService.rejectServiceRequest(requestId, user.id, 'Not interested');
        
        // Remove the booking from current provider's view
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        
        alert('Service request rejected. It will not appear in your dashboard anymore.');
      } else {
        // For other status updates, use the regular endpoint
        await ApiService.updateServiceRequestStatus(requestId, newStatus);
        
        // Update local state
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        ));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  // Helper functions for location display
  const getDistanceBadge = (distance, locationType, providerCity, providerCoordinates) => {
    const isRealTime = providerCoordinates?.source === 'real_time';
    const locationIcon = isRealTime ? '�' : '🏙️';
    
    // GPS to GPS - most accurate real-time distance
    if (locationType === 'gps_to_gps' && distance !== null) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200 flex items-center gap-1 font-semibold">
          <span>🔴</span>
          {distance.toFixed(2)} km (Live GPS)
        </span>
      );
    }
    // GPS to city or city to GPS
    else if ((locationType === 'gps_to_city' || locationType === 'city_to_gps') && distance !== null) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200 flex items-center gap-1">
          <span>{locationIcon}</span>
          {distance.toFixed(2)} km {isRealTime && '(Live)'}
        </span>
      );
    }
    // City to city
    else if (locationType === 'city_to_city' && distance !== null) {
      return (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-200 flex items-center gap-1">
          <span>🏙️</span>
          {distance.toFixed(1)} km (Approx)
        </span>
      );
    }
    // Legacy 'auto' type
    else if (locationType === 'auto' && distance !== null) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200 flex items-center gap-1">
          <span>{locationIcon}</span>
          {distance.toFixed(2)} km {isRealTime && '(Live)'}
        </span>
      );
    }
    // Same city (no distance calculated)
    else if (locationType === 'same_city') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200 flex items-center gap-1">
          <span>{locationIcon}</span>
          Same City {isRealTime && '(Live)'}
        </span>
      );
    }
    // Different city
    else if (locationType === 'different_city') {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200 flex items-center gap-1">
          <span>🏙️</span>
          Different City
        </span>
      );
    }
    // Manual entry with distance calculated
    else if (locationType === 'manual' && distance !== null) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200 flex items-center gap-1">
          <span>{locationIcon}</span>
          {distance.toFixed(2)} km {isRealTime && '(Live GPS)'}
        </span>
      );
    }
    // Unknown or no location data
    else {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200 flex items-center gap-1">
          <span>📍</span>
          Location Unknown
        </span>
      );
    }
  };

  const getLocationComparisonText = (booking) => {
    const { locationType, distance, providerCity, providerCoordinates, addressDetails } = booking;
    const isRealTime = providerCoordinates?.source === 'real_time';
    
    let comparisonText = "";
    
    // GPS to GPS - most accurate
    if (locationType === 'gps_to_gps' && distance !== null) {
      comparisonText = `🔴 Real-time GPS distance: ${distance.toFixed(2)} km from your current location`;
    }
    // GPS to city or city to GPS
    else if ((locationType === 'gps_to_city' || locationType === 'city_to_gps') && distance !== null) {
      if (isRealTime) {
        comparisonText = `Customer is ${distance.toFixed(2)} km from your current location`;
      } else {
        comparisonText = `Customer is ${distance.toFixed(2)} km from ${providerCity}`;
      }
    }
    // City to city
    else if (locationType === 'city_to_city' && distance !== null) {
      comparisonText = `Approx. ${distance.toFixed(1)} km (city center to city center)`;
    }
    // Legacy auto type
    else if (locationType === 'auto' && distance !== null) {
      comparisonText = `Customer is ${distance.toFixed(2)} km away`;
    }
    // Same city
    else if (locationType === 'same_city') {
      comparisonText = `Customer is in the same city (${providerCity})`;
    }
    // Different city
    else if (locationType === 'different_city') {
      comparisonText = `Customer is in a different city from ${providerCity}`;
    }
    // Manual entry with distance
    else if (locationType === 'manual' && distance !== null) {
      if (isRealTime) {
        comparisonText = `🔴 Real-time GPS distance: ${distance.toFixed(2)} km from your current location`;
      } else {
        comparisonText = `Customer is ${distance.toFixed(2)} km from ${providerCity}`;
      }
    }
    // Unknown
    else {
      comparisonText = 'Location comparison not available';
    }
    
    // Add detection method info
    if (addressDetails?.detection_method) {
      const method = addressDetails.detection_method.includes('GPS') ? 'GPS detected' : 'Manual entry';
      comparisonText += ` • ${method}`;
    }
    
    // Add real-time indicator
    if (isRealTime && locationType !== 'gps_to_gps') {
      comparisonText += ' • Using your live GPS';
    }
    
    return comparisonText;
  };

  const getDetailedAddressText = (addressDetails) => {
    if (!addressDetails) return 'Address details not available';
    
    const parts = [];
    
    if (addressDetails.full_address && addressDetails.full_address !== 'Not specified') {
      parts.push(addressDetails.full_address);
    }
    
    if (addressDetails.city && addressDetails.city !== 'Unknown') {
      parts.push(addressDetails.city);
    }
    
    if (addressDetails.pincode && addressDetails.pincode !== 'Unknown') {
      parts.push(`Pin: ${addressDetails.pincode}`);
    }
    
    if (addressDetails.state && addressDetails.state !== 'Unknown') {
      parts.push(addressDetails.state);
    }
    
    if (addressDetails.country && addressDetails.country !== 'Unknown') {
      parts.push(addressDetails.country);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Address not specified';
  };

  return (
    <ServiceProviderLayout>
      {/* HEADER */}
      <div className="mb-4 sm:mb-6">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-extrabold
          bg-gradient-to-r from-purple-600 to-pink-500
          bg-clip-text text-transparent"
        >
          Bookings
        </motion.h2>
        {user?.skill && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mt-1"
          >
            Showing {user.skill} requests in your area (same city & nearby locations only)
          </motion.p>
        )}
        
        {/* Daily Status Indicator */}
        {dailyStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mt-3 p-3 rounded-lg border ${
              dailyStatus.can_accept 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  dailyStatus.can_accept ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-sm font-medium ${
                  dailyStatus.can_accept ? 'text-green-700' : 'text-red-700'
                }`}>
                  Daily Acceptances: {dailyStatus.today_accepted}/{dailyStatus.max_daily}
                </span>
              </div>
              <span className={`text-xs ${
                dailyStatus.can_accept ? 'text-green-600' : 'text-red-600'
              }`}>
                {dailyStatus.can_accept 
                  ? `${dailyStatus.remaining} remaining today` 
                  : 'Daily limit reached'
                }
              </span>
            </div>
          </motion.div>
        )}
        
        {/* Debug info */}
        <div className="text-xs text-gray-500 mt-2">
          Debug: User ID: {user?.id}, Name: {user?.name}, Role: {user?.role}
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Error</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:8003/');
                    alert(`Backend connectivity test: ${response.status} - ${response.statusText}`);
                  } catch (err) {
                    alert(`Backend connectivity failed: ${err.message}`);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-2"
              >
                Test Backend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      {!loading && !error && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10
        border border-slate-200 shadow-lg"
      >
        {/* FILTER BAR */}
        <div className="space-y-4 mb-6">
          {/* Status Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-purple-600" />
              <span className="font-semibold text-gray-700">Filter by Status:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
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
                onClick={() => setFilterStatus("accepted")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === "accepted"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => setFilterStatus("in_progress")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === "in_progress"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                In Progress
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

          {/* Location Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-purple-600" />
              <span className="font-semibold text-gray-700">Filter by Location:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setLocationFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  locationFilter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaFilter className="inline mr-1" />
                All Locations
              </button>
              <button
                onClick={() => setLocationFilter("same_city")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  locationFilter === "same_city"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaMapMarkerAlt className="inline mr-1" />
                Same City Only
              </button>
              <button
                onClick={() => setLocationFilter("nearby")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  locationFilter === "nearby"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaRoute className="inline mr-1" />
                Nearby ({maxDistance}km)
              </button>
            </div>
            
            {/* Distance Slider for Nearby Filter */}
            {locationFilter === "nearby" && (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-gray-600">Max distance:</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm font-medium text-purple-600">{maxDistance} km</span>
              </div>
            )}
          </div>
        </div>

        {/* Location Info */}
        {user?.city && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              📍 Your service area: <span className="font-semibold">{user.city}</span>
              {locationFilter === "same_city" && (
                <span className="ml-2">• Showing requests from your city only</span>
              )}
              {locationFilter === "nearby" && (
                <span className="ml-2">• Showing requests within {maxDistance}km</span>
              )}
            </p>
          </div>
        )}

        {/* BOOKINGS LIST */}
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-2xl p-6 hover:shadow-2xl hover:border-purple-400 transition-all duration-300 relative overflow-hidden"
            >
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 opacity-10 rounded-bl-full"></div>
              {/* BOOKING HEADER - COMPACT SUMMARY */}
              <div 
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between relative z-10 cursor-pointer"
                onClick={() => toggleBookingExpanded(booking.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-3 shadow-lg">
                    <FaClipboardList className="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-gray-800">#{booking.id}</h3>
                      {getStatusBadge(booking.status)}
                      <span className="text-sm text-gray-600 truncate">• {booking.service}</span>
                      <span className="text-sm text-gray-600 truncate">• {booking.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-xs" />
                        <span className="truncate">{booking.date || 'Not specified'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs" />
                        {getDistanceBadge(booking.distance, booking.locationType, booking.providerCity, booking.providerCoordinates)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-4 py-2 shadow-lg">
                    <p className="text-xs font-medium">Fee</p>
                    <p className="font-bold text-lg">₹{booking.price}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedBookings[booking.id] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-purple-600"
                  >
                    <FaChevronDown className="text-xl" />
                  </motion.div>
                </div>
              </div>

              {/* BOOKING DETAILS - EXPANDABLE */}
              {expandedBookings[booking.id] && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 mb-4 mt-6"
              >
                {/* Customer Information */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-purple-100">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                      <FaUser className="text-white" />
                    </div>
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="ml-2 text-gray-800">{booking.customerName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <span className="ml-2 text-gray-800">{booking.customerPhone}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-800">{booking.customerEmail}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">City:</span>
                      <span className="ml-2 text-gray-800">{booking.customerCity}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium text-gray-600">Service Address:</span>
                      <p className="text-gray-800 mt-1 break-words">{booking.address}</p>
                      {booking.addressDetails?.coordinates && (
                        <p className="text-xs text-blue-600 mt-1">
                          📍 GPS: {booking.addressDetails.coordinates.latitude.toFixed(6)}, {booking.addressDetails.coordinates.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Pincode:</span>
                      <span className="ml-2 text-gray-800">{booking.customerPincode}</span>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                      <FaCalendarAlt className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{booking.date || 'Not specified'}</p>
                      <p className="text-sm text-gray-500">{booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg">
                      <FaMapMarkerAlt className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-sm font-medium break-words">{booking.address}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {getDistanceBadge(booking.distance, booking.locationType, booking.providerCity, booking.providerCoordinates)}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewLocationDetails(booking); }}
                          className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 whitespace-nowrap"
                        >
                          <FaEye className="text-xs" />
                          Compare
                        </button>
                        {(getCustomerCoordinates(booking) && getProviderCoordinates(booking)) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewGoogleMaps(booking); }}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 whitespace-nowrap"
                          >
                            <FaGoogle className="text-xs" />
                            Route
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-2 break-words">
                        {getLocationComparisonText(booking)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                        <FaTools className="text-white" />
                      </div>
                      <span className="text-purple-600 font-bold">{booking.service}</span>
                    </div>
                    {booking.urgency && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.urgency === 'high' ? 'bg-red-100 text-red-700' :
                        booking.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {booking.urgency}
                      </span>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    {booking.propertyType && (
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                          <FaHome className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Property Type</p>
                          <p className="font-semibold text-gray-800 capitalize">{booking.propertyType}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Description */}
                {booking.description && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                        <FaClipboardList className="text-white" />
                      </div>
                      Service Description
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{booking.description}</p>
                  </div>
                )}
              </motion.div>
              )}

              {/* ACTIONS */}
              {expandedBookings[booking.id] && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {booking.status === "pending" && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(booking.id, "accepted")}
                      disabled={dailyStatus && !dailyStatus.can_accept}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        dailyStatus && !dailyStatus.can_accept
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {dailyStatus && !dailyStatus.can_accept ? 'Limit Reached' : 'Accept'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(booking.id, "rejected")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </motion.button>
                  </>
                )}
                {booking.status === "accepted" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusUpdate(booking.id, "in_progress")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Work
                  </motion.button>
                )}
                {booking.status === "in_progress" && (
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
            )}
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
      )}

      {/* LOCATION DETAILS MODAL */}
      {showLocationModal && selectedBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLocationModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaCompass className="text-purple-600" />
                Location Comparison Details
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Booking Summary */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-purple-800">{selectedBooking.id}</p>
                  <p className="text-sm text-purple-600">{selectedBooking.service} • {selectedBooking.customerName}</p>
                </div>
                <div className="text-right">
                  {getDistanceBadge(selectedBooking.distance, selectedBooking.locationType, selectedBooking.providerCity, selectedBooking.providerCoordinates)}
                </div>
              </div>
            </div>

            {/* Location Comparison Details */}
            {selectedBooking && (
              <div className="space-y-6">
                {/* Provider Location */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500" />
                    Your Location (Service Provider)
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">City:</span> {selectedBooking.providerCity}
                    </p>
                    {selectedBooking.providerCoordinates && (
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Coordinates:</span> {selectedBooking.providerCoordinates.latitude.toFixed(4)}, {selectedBooking.providerCoordinates.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Location */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-500" />
                    Customer Location
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Address:</span> {selectedBooking.address}
                    </p>
                    {selectedBooking.latitude && selectedBooking.longitude && (
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Coordinates:</span> {parseFloat(selectedBooking.latitude).toFixed(6)}, {parseFloat(selectedBooking.longitude).toFixed(6)}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Location Type:</span> {selectedBooking.locationType === 'auto' ? '📍 Automatically detected' : '✍️ Manually entered'}
                    </p>
                  </div>
                </div>

                {/* Distance Analysis */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaRoute className="text-purple-500" />
                    Distance Analysis
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Distance:</span> {selectedBooking.distance ? `${selectedBooking.distance.toFixed(2)} km` : 'Cannot calculate'}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Same City:</span> {selectedBooking.providerCity === 'Gurgaon' ? '✅ Yes' : '❌ No'}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Has Coordinates:</span> {selectedBooking.latitude && selectedBooking.longitude ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                </div>

                {/* Map Preview */}
                {selectedBooking.latitude && selectedBooking.longitude && selectedBooking.providerCoordinates && (
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FaEye className="text-indigo-500" />
                      Location Map
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <ModernMap
                        latitude={parseFloat(selectedBooking.latitude)}
                        longitude={parseFloat(selectedBooking.longitude)}
                        title="Customer Location"
                        height={300}
                        showControls={true}
                        className="rounded-2xl overflow-hidden"
                        zoom={15}
                        address={selectedBooking.address}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Google Maps Modal */}
      {showGoogleMaps && selectedBooking && (
        <GoogleMapRoute
          providerLocation={getProviderCoordinates(selectedBooking)}
          customerLocation={getCustomerCoordinates(selectedBooking)}
          providerCity={selectedBooking.providerCity}
          customerAddress={selectedBooking.address}
          onClose={() => setShowGoogleMaps(false)}
        />
      )}
    </ServiceProviderLayout>
  );
}
