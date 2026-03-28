import { useState, useEffect } from 'react';
import { FaRoute, FaEye, FaMapMarkerAlt } from 'react-icons/fa';
import ServiceRequestRoute from './pages/ServiceRequestRoute';
import LocationDisplay from './components/LocationDisplay';
import ApiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import HouseCrewLogo from '../assets/HouseCrewLogo.png';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRouteModal, setShowRouteModal] = useState(false);

  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await ApiService.getCustomerServiceRequests(user.id);
        
        // Transform the data to match the expected format
        const transformedRequests = data.service_requests.map(request => ({
          id: request.id,
          service_name: request.service_name,
          service_category: request.service_category,
          description: request.description,
          address: request.address,
          distance_km: null, // Will be calculated if needed
          address_details: {
            city: request.address.split(',').pop().trim() || 'Unknown',
            detection_method: request.location_type === 'auto' ? 'GPS' : 'Manual',
            coordinates: {
              latitude: request.latitude,
              longitude: request.longitude
            }
          },
          status: request.status,
          provider_info: request.provider_name ? {
            provider_name: request.provider_name,
            provider_city: request.provider_city || 'Unknown',
            provider_coordinates: request.provider_coordinates || null
          } : null
        }));
        
        setServiceRequests(transformedRequests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching service requests:', error);
        // Fallback to mock data if API fails
        const mockRequests = [
          {
            id: 'SR1',
            service_name: 'Tap Leakage',
            service_category: 'Plumbing',
            description: 'Kitchen tap is leaking heavily',
            address: '123 Main Street, Damoh, Madhya Pradesh, India',
            distance_km: 624.83,
            address_details: {
              city: 'Damoh',
              detection_method: 'Manual',
              coordinates: {
                latitude: 23.1505,
                longitude: 79.0731
              }
            },
            status: 'accepted',
            provider_info: {
              provider_name: 'Ashok Kumar',
              provider_city: 'Gurgaon',
              provider_coordinates: {
                latitude: 28.4595,
                longitude: 77.0266
              }
            }
          },
          {
            id: 'SR2',
            service_name: 'Electrical Work',
            service_category: 'Electrical',
            description: 'Light fixtures not working',
            address: 'Sector 41, Gurgaon, Haryana, 122012, India',
            distance_km: 3.02,
            address_details: {
              city: 'Gurgaon',
              detection_method: 'GPS',
              coordinates: {
                latitude: 28.455779,
                longitude: 77.057204
              }
            },
            status: 'pending',
            provider_info: null
          }
        ];
        
        setServiceRequests(mockRequests);
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, [user]);

  const handleViewRoute = (request) => {
    setSelectedRequest(request);
    setShowRouteModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-slate-900 to-black font-[Inter]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin"></div>
          <span className="text-slate-300 text-lg">Loading service requests...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="pt-28 pb-20 bg-gradient-to-b from-gray-950 via-black to-gray-950 font-[Inter] min-h-screen">
      <div className="max-w-7xl mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ================= LEFT ================= */}
          <div>
            {/* SERVICES BOX */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-gray-300 mb-6">
                Manage Your Services
              </h2>

              {/* STATS */}
              <div className="flex gap-14 mt-12">
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-100">{serviceRequests.length}</h3>
                  <p className="text-sm text-gray-500">
                    Total Requests
                    <span className="text-purple-400">*</span>
                  </p>
                </div>

                <div>
                  <h3 className="text-3xl font-extrabold text-gray-100">
                    {serviceRequests.filter(r => r.status === 'accepted').length}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Active Services
                    <span className="text-purple-400">*</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Location Display */}
            <div className="mt-12">
              <LocationDisplay userId={user?.id} />
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-300 mb-6">
              Your Service Requests
            </h2>
            
            {serviceRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-1">
                  <div className="w-full h-full bg-gray-950 rounded-full flex items-center justify-center">
                    <span className="text-3xl">📋</span>
                  </div>
                </div>
                <p className="text-gray-300 text-lg mb-2">No service requests found</p>
                <p className="text-gray-500">Create your first service request to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {serviceRequests.map((request, index) => (
                  <div
                    key={request.id}
                    className="group cursor-pointer"
                  >
                    <div
                      className="
                        rounded-xl overflow-hidden
                        bg-gray-900/50 backdrop-blur-lg
                        border border-gray-800/50
                        transition-all duration-300
                        hover:-translate-y-1
                        hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]
                      "
                    >
                      {/* HEADER */}
                      <div className="p-4 border-b border-gray-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-100 text-sm">{request.id}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'accepted' 
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' 
                              : request.status === 'pending' 
                              ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                              : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-gray-300 text-sm font-semibold">
                          {request.service_name}
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Category:</span>
                          <span className="text-gray-300">{request.service_category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Address:</span>
                          <span className="text-gray-300 text-right text-xs">
                            {request.address.split(',')[0]}
                          </span>
                        </div>
                        {request.provider_info && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Provider:</span>
                            <span className="text-emerald-400">{request.provider_info.provider_name}</span>
                          </div>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="p-4 pt-0">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewRoute(request)}
                            disabled={!request.provider_info}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-gray-100 rounded-lg font-semibold text-xs transition-all duration-300 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            <FaRoute />
                            Route
                          </button>
                          
                          <button
                            className="flex-1 px-3 py-2 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 text-gray-100 rounded-lg font-semibold text-xs transition-all duration-300 hover:bg-gray-700/50 flex items-center justify-center gap-1"
                          >
                            <FaEye />
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Route Modal */}
      {showRouteModal && selectedRequest && (
        <ServiceRequestRoute
          serviceRequest={selectedRequest}
          providerInfo={selectedRequest.provider_info}
          onClose={() => {
            setShowRouteModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </section>
  );
};

export default CustomerDashboard;
