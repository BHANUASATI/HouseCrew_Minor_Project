import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaLocationArrow, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';
import LocationUtils from '../../utils/locationUtils';
import ApiService from '../../services/apiService';

const LocationDisplay = ({ userId }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  useEffect(() => {
    checkLocationPermission();
    fetchStoredLocation();
  }, [userId]);

  const checkLocationPermission = async () => {
    try {
      const permission = await LocationUtils.getLocationPermission();
      setPermissionStatus(permission);
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const fetchStoredLocation = async () => {
    if (!userId) return;
    
    try {
      const locationData = await ApiService.getUserLocation(userId);
      if (locationData.success) {
        setCurrentLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
          detection_method: 'Stored',
          timestamp: locationData.timestamp
        });
      }
    } catch (error) {
      console.error('Error fetching stored location:', error);
    }
  };

  const detectCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current location
      const location = await LocationUtils.getCurrentLocation();
      
      // Update backend
      if (userId) {
        await ApiService.updateUserLocation(userId, {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          detection_method: location.detection_method
        });
      }
      
      setCurrentLocation(location);
      setPermissionStatus('granted');
      
    } catch (error) {
      setError(error.message);
      if (error.message.includes('denied')) {
        setPermissionStatus('denied');
      }
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      await LocationUtils.requestLocationPermission();
      setPermissionStatus('granted');
      detectCurrentLocation();
    } catch (error) {
      setError(error.message);
      setPermissionStatus('denied');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderLocationContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Detecting location...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3" />
            <div>
              <p className="text-red-700 font-medium">Location Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          {permissionStatus === 'denied' && (
            <button
              onClick={requestLocationPermission}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Enable Location Access
            </button>
          )}
        </div>
      );
    }

    if (currentLocation) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <FaMapMarkerAlt className="text-green-600 mr-2" />
                <span className="font-medium text-green-800">Current Location</span>
                {currentLocation.detection_method === 'GPS' && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    📍 Location detected automatically
                  </span>
                )}
                {currentLocation.detection_method !== 'GPS' && (
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {currentLocation.detection_method}
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Address:</span> {currentLocation.address}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Coordinates:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                    📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </span>
                  {currentLocation.detection_method === 'GPS' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      GPS
                    </span>
                  )}
                </div>
                {currentLocation.timestamp && (
                  <p className="text-gray-500 text-xs">
                    Last updated: {formatTimestamp(currentLocation.timestamp)}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={detectCurrentLocation}
              className="ml-4 p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
              title="Refresh location"
            >
              <FaSyncAlt />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center">
          <FaMapMarkerAlt className="text-gray-400 text-3xl mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No location data available</p>
          <button
            onClick={detectCurrentLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center mx-auto"
          >
            <FaLocationArrow className="mr-2" />
            Detect My Location
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <FaMapMarkerAlt className="mr-2 text-blue-600" />
        My Location
      </h2>
      
      {renderLocationContent()}
      
      {permissionStatus === 'unknown' && (
        <div className="mt-4 text-xs text-gray-500">
          <p>Location access helps us provide better service and accurate address detection.</p>
        </div>
      )}
    </div>
  );
};

export default LocationDisplay;
