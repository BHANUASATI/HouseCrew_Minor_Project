import { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaRoute, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

const GoogleMapRoute = ({ 
  providerLocation, 
  customerLocation, 
  providerCity, 
  customerAddress,
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    // Calculate route information immediately
    if (providerLocation && customerLocation) {
      calculateRouteInfo();
    }
  }, [providerLocation, customerLocation]);

  const calculateRouteInfo = () => {
    try {
      setLoading(true);
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        providerLocation.lat, providerLocation.lng,
        customerLocation.lat, customerLocation.lng
      );
      
      // Estimate travel time (assuming average speed of 30 km/h)
      const estimatedTime = Math.ceil(distance / 30 * 60);
      
      setRouteInfo({
        distance: `${distance.toFixed(1)} km`,
        duration: `${estimatedTime} mins`,
        startAddress: `${providerCity}, India`,
        endAddress: customerAddress
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Failed to calculate route information.');
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openGoogleMaps = () => {
    if (providerLocation && customerLocation) {
      const url = `https://www.google.com/maps/dir/${providerLocation.lat},${providerLocation.lng}/${customerLocation.lat},${customerLocation.lng}`;
      window.open(url, '_blank');
    }
  };

  const openGoogleMapsSearch = () => {
    if (customerAddress) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-700">Calculating route...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Route Error</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={openGoogleMaps}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Open in Google Maps
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaRoute />
                Route & Distance Information
              </h3>
              <p className="text-purple-100 text-sm mt-1">
                {providerCity} → {customerAddress}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          {/* Map Placeholder */}
          <div className="flex-1 relative bg-gray-100 min-h-[400px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center">
                <FaMapMarkerAlt className="text-6xl text-purple-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Route Visualization</h4>
                <p className="text-gray-600 mb-4">Interactive map available in Google Maps</p>
                
                {/* Route Info Card */}
                {routeInfo && (
                  <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm mx-auto">
                    <div className="flex items-center gap-2 mb-3">
                      <FaRoute className="text-purple-600" />
                      <span className="font-semibold text-sm">Route Summary</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-medium text-purple-600">{routeInfo.distance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. Time:</span>
                        <span className="font-medium text-green-600">{routeInfo.duration}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
              <button
                onClick={openGoogleMaps}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              >
                <FaExternalLinkAlt />
                Open in Google Maps
              </button>
              <button
                onClick={openGoogleMapsSearch}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <FaMapMarkerAlt />
                Search Location
              </button>
            </div>
          </div>

          {/* Route Details Panel */}
          <div className="w-full lg:w-96 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200">
            <div className="h-full overflow-y-auto p-4">
              {routeInfo && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Route Details</h4>
                    <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">From:</span>
                        <p className="font-medium">{routeInfo.startAddress}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">To:</span>
                        <p className="font-medium">{routeInfo.endAddress}</p>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600">Total Distance:</span>
                        <span className="font-bold text-purple-600">{routeInfo.distance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Time:</span>
                        <span className="font-bold text-green-600">{routeInfo.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Location Coordinates</h4>
                    <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Provider Location:</span>
                        <p className="font-mono text-xs">
                          {providerLocation.lat.toFixed(6)}, {providerLocation.lng.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Customer Location:</span>
                        <p className="font-mono text-xs">
                          {customerLocation.lat.toFixed(6)}, {customerLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Navigation Options</h4>
                    <div className="space-y-2">
                      <button
                        onClick={openGoogleMaps}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                      >
                        <FaExternalLinkAlt />
                        Open Route in Google Maps
                      </button>
                      <button
                        onClick={openGoogleMapsSearch}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <FaMapMarkerAlt />
                        Search Customer Location
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm">How to Navigate</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Click "Open Route in Google Maps" for turn-by-turn directions</li>
                      <li>• Click "Search Customer Location" to see the area</li>
                      <li>• Use Google Maps app on mobile for voice navigation</li>
                      <li>• Estimated time may vary based on traffic</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapRoute;
