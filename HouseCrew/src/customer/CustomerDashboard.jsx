import { useState, useEffect } from 'react';
import { FaRoute, FaEye, FaMapMarkerAlt } from 'react-icons/fa';
import ServiceRequestRoute from './pages/ServiceRequestRoute';
import LocationDisplay from './components/LocationDisplay';
import ApiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700">Loading service requests...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Dashboard</h1>
          <p className="text-gray-600">Manage your service requests and track provider routes</p>
        </div>

        {/* Location Display */}
        <div className="mb-6">
          <LocationDisplay userId={user?.id} />
        </div>

        {/* Service Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Service Requests</h2>
          
          {serviceRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No service requests found</p>
          ) : (
            <div className="space-y-4">
              {serviceRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800">{request.id}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Service:</span>
                          <span className="ml-2 font-medium">{request.service_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2 font-medium">{request.service_category}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Address:</span>
                          <span className="ml-2 font-medium">{request.address}</span>
                          {request.address_details?.detection_method === 'GPS' && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              📍 Location detected automatically
                            </span>
                          )}
                        </div>
                        {request.address_details?.coordinates && (
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Coordinates:</span>
                            <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              📍 {request.address_details.coordinates.latitude.toFixed(6)}, {request.address_details.coordinates.longitude.toFixed(6)}
                            </span>
                            {request.address_details?.detection_method === 'GPS' && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                GPS
                              </span>
                            )}
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Detection:</span>
                          <span className="ml-2 font-medium">{request.address_details?.detection_method}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Distance:</span>
                          <span className="ml-2 font-medium">
                            {request.distance_km ? `${request.distance_km.toFixed(1)} km` : 'Not calculated'}
                          </span>
                        </div>
                        {request.description && (
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Description:</span>
                            <span className="ml-2 font-medium">{request.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {request.status === 'accepted' && request.provider_info && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Provider: {request.provider_info.provider_name}</p>
                          <p className="text-sm text-gray-600">City: {request.provider_info.provider_city}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewRoute(request)}
                          disabled={!request.provider_info}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm flex items-center gap-1"
                        >
                          <FaRoute />
                          Route
                        </button>
                        
                        <button
                          className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm flex items-center gap-1"
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
    </div>
  );
};

export default CustomerDashboard;
