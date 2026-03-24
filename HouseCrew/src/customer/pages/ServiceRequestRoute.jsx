import { useState, useEffect } from 'react';
import { FaRoute, FaTimes, FaMapMarkerAlt, FaClock, FaCar } from 'react-icons/fa';
import GoogleMapRoute from '../../components/GoogleMapRoute';

const ServiceRequestRoute = ({ serviceRequest, providerInfo, onClose }) => {
  const [showGoogleMaps, setShowGoogleMaps] = useState(false);

  const getProviderCoordinates = () => {
    if (providerInfo?.provider_coordinates?.latitude && providerInfo?.provider_coordinates?.longitude) {
      return {
        lat: providerInfo.provider_coordinates.latitude,
        lng: providerInfo.provider_coordinates.longitude
      };
    }
    return null;
  };

  const getCustomerCoordinates = () => {
    if (serviceRequest?.address_details?.coordinates?.latitude && serviceRequest?.address_details?.coordinates?.longitude) {
      return {
        lat: serviceRequest.address_details.coordinates.latitude,
        lng: serviceRequest.address_details.coordinates.longitude
      };
    }
    return null;
  };

  const openGoogleMapsDirections = () => {
    const providerCoords = getProviderCoordinates();
    const customerCoords = getCustomerCoordinates();
    
    if (providerCoords && customerCoords) {
      const url = `https://www.google.com/maps/dir/${providerCoords.lat},${providerCoords.lng}/${customerCoords.lat},${customerCoords.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaRoute />
                Service Provider Route Information
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {providerInfo?.provider_city} → {serviceRequest?.address}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Route Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <FaRoute />
              Route Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <FaMapMarkerAlt className="text-blue-600 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Distance</p>
                <p className="font-bold text-blue-600">
                  {serviceRequest?.distance_km ? `${serviceRequest.distance_km.toFixed(1)} km` : 'Calculating...'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <FaClock className="text-green-600 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Est. Time</p>
                <p className="font-bold text-green-600">
                  {serviceRequest?.distance_km ? `${Math.ceil(serviceRequest.distance_km / 30 * 60)} mins` : 'Calculating...'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <FaCar className="text-purple-600 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Travel Mode</p>
                <p className="font-bold text-purple-600">Driving</p>
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-green-800 mb-3">Service Provider Location</h4>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Provider:</span> {providerInfo?.provider_name || 'Service Provider'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">City:</span> {providerInfo?.provider_city || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Coordinates:</span> 
                {getProviderCoordinates() ? 
                  `${getProviderCoordinates().lat.toFixed(4)}, ${getProviderCoordinates().lng.toFixed(4)}` : 
                  'Not available'
                }
              </p>
            </div>
          </div>

          {/* Service Location */}
          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-orange-800 mb-3">Service Location</h4>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Address:</span> {serviceRequest?.address || 'Not specified'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">City:</span> {serviceRequest?.address_details?.city || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Detection Method:</span> {serviceRequest?.address_details?.detection_method || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Coordinates:</span> 
                {getCustomerCoordinates() ? 
                  `${getCustomerCoordinates().lat.toFixed(4)}, ${getCustomerCoordinates().lng.toFixed(4)}` : 
                  'Not available'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowGoogleMaps(true)}
              disabled={!getProviderCoordinates() || !getCustomerCoordinates()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <FaRoute />
              View Route Map
            </button>
            <button
              onClick={openGoogleMapsDirections}
              disabled={!getProviderCoordinates() || !getCustomerCoordinates()}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <FaMapMarkerAlt />
              Open in Google Maps
            </button>
          </div>

          {/* Instructions */}
          {!getProviderCoordinates() || !getCustomerCoordinates() ? (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Route information is not available because location coordinates are missing. 
                Please ensure both provider and customer locations are properly set.
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Click "View Route Map" to see the interactive map with turn-by-turn directions, 
                or "Open in Google Maps" to launch navigation directly in the Google Maps app.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Google Maps Modal */}
      {showGoogleMaps && (
        <GoogleMapRoute
          providerLocation={getProviderCoordinates()}
          customerLocation={getCustomerCoordinates()}
          providerCity={providerInfo?.provider_city}
          customerAddress={serviceRequest?.address}
          onClose={() => setShowGoogleMaps(false)}
        />
      )}
    </div>
  );
};

export default ServiceRequestRoute;
