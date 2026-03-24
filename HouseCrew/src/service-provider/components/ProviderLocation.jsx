import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaLocationArrow, FaSyncAlt, FaExclamationTriangle, FaCrosshairs } from 'react-icons/fa';
import LocationUtils from '../../utils/locationUtils';
import ApiService from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const ProviderLocation = () => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  useEffect(() => {
    checkLocationPermission();
    fetchStoredLocation();
  }, [user]);

  const checkLocationPermission = async () => {
    try {
      const permission = await LocationUtils.getLocationPermission();
      setPermissionStatus(permission);
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const fetchStoredLocation = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }
    
    try {
      console.log('Fetching location for user:', user.id);
      const locationData = await ApiService.getUserLocation(user.id);
      console.log('Location response:', locationData);
      
      if (locationData && locationData.success) {
        setCurrentLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
          detection_method: 'Stored',
          timestamp: locationData.timestamp
        });
      } else {
        // No location data exists, which is normal for first-time users
        console.log('No location data found for user');
        setCurrentLocation(null);
      }
    } catch (error) {
      console.error('Error fetching stored location:', error);
      // Use mock location when backend is offline
      setCurrentLocation({
        latitude: 28.4595,
        longitude: 77.0266,
        address: 'Sector 14, Gurgaon, Haryana (Demo Location)',
        detection_method: 'Demo',
        timestamp: new Date().toISOString(),
        isMock: true
      });
    }
  };

  const detectCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const location = await LocationUtils.getCurrentLocation();
      
      // Update backend
      if (user?.id) {
        await ApiService.updateUserLocation(user.id, {
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
          <span className="text-gray-600">Detecting your location...</span>
        </div>
      );
    }

    // Don't show error for initial load - this is expected behavior
    if (error && currentLocation !== null) {
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
        <div className={`border rounded-lg p-4 ${
          currentLocation.isMock 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <FaMapMarkerAlt className={`mr-2 ${
                  currentLocation.isMock ? 'text-yellow-600' : 'text-purple-600'
                }`} />
                <span className={`font-medium ${
                  currentLocation.isMock ? 'text-yellow-800' : 'text-purple-800'
                }`}>
                  Your Current Location
                </span>
                {currentLocation.detection_method === 'GPS' && (
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    📍 Location detected automatically
                  </span>
                )}
                {currentLocation.detection_method === 'Demo' && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    📍 Demo Mode
                  </span>
                )}
                {currentLocation.detection_method !== 'GPS' && currentLocation.detection_method !== 'Demo' && (
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
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      GPS
                    </span>
                  )}
                  {currentLocation.detection_method === 'Demo' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      Demo
                    </span>
                  )}
                </div>
                {currentLocation.timestamp && (
                  <p className="text-gray-500 text-xs">
                    Last updated: {formatTimestamp(currentLocation.timestamp)}
                  </p>
                )}
              </div>
              
              <div className={`mt-3 p-2 rounded border ${
                currentLocation.isMock 
                  ? 'bg-yellow-100 border-yellow-200' 
                  : 'bg-purple-100 border-purple-200'
              }`}>
                <p className={`text-xs ${
                  currentLocation.isMock ? 'text-yellow-700' : 'text-purple-700'
                }`}>
                  {currentLocation.isMock ? (
                    <><strong>💡 Demo Mode:</strong> Backend server is not running. 
                    To use real location detection, start the backend server with: 
                    <code className="ml-1 bg-yellow-200 px-1 rounded">cd backend && python3 main.py</code></>
                  ) : (
                    <><strong>💡 Tip:</strong> Your location is used to calculate distances to customer service requests. 
                    Update your location when you move to a new area for accurate distance calculations.</>
                  )}
                </p>
              </div>
            </div>
            
            {!currentLocation.isMock && (
              <button
                onClick={detectCurrentLocation}
                className="ml-4 p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                title="Update location"
              >
                <FaSyncAlt />
              </button>
            )}
          </div>
        </div>
      );
    }

    // Default state - no location set yet (no error shown)
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center">
          <FaMapMarkerAlt className="text-gray-400 text-3xl mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Set your current location to see distances to service requests</p>
          <p className="text-sm text-gray-500 mb-4">This helps you prioritize nearby requests and estimate travel time</p>
          <button
            onClick={detectCurrentLocation}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center mx-auto"
          >
            <FaCrosshairs className="mr-2" />
            Set My Location
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <FaMapMarkerAlt className="mr-2 text-purple-600" />
        Your Service Location
      </h2>
      
      {renderLocationContent()}
      
      {permissionStatus === 'unknown' && (
        <div className="mt-4 text-xs text-gray-500">
          <p>Setting your location helps you see accurate distances to customer service requests.</p>
        </div>
      )}
    </div>
  );
};

export default ProviderLocation;
