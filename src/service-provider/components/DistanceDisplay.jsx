import { useState, useEffect } from 'react';
import { FaRoute, FaLocationArrow, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import ApiService from '../../services/apiService';

const DistanceDisplay = ({ providerId, customerLat, customerLon, customerAddress }) => {
  const [distanceData, setDistanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    calculateDistance();
  }, [providerId, customerLat, customerLon]);

  const calculateDistance = async () => {
    if (!providerId || !customerLat || !customerLon) {
      setDistanceData({
        distance: null,
        formattedDistance: 'No Location',
        color: 'text-gray-600 bg-gray-100 border-gray-200',
        label: 'No Location'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get provider's current location
      const providerLocationResponse = await ApiService.getUserLocation(providerId);
      
      if (!providerLocationResponse.success || !providerLocationResponse.latitude) {
        // Provider hasn't set their location yet - this is normal
        setDistanceData({
          distance: null,
          formattedDistance: 'Set Your Location',
          color: 'text-blue-600 bg-blue-100 border-blue-200',
          label: 'Action Needed'
        });
        return;
      }

      // Calculate distance using Haversine formula
      const distance = calculateHaversineDistance(
        providerLocationResponse.latitude,
        providerLocationResponse.longitude,
        parseFloat(customerLat),
        parseFloat(customerLon)
      );

      const formattedDistance = formatDistance(distance);
      const color = getDistanceColor(distance);
      const label = getDistanceLabel(distance);

      setDistanceData({
        distance,
        formattedDistance,
        color,
        label,
        providerLocation: providerLocationResponse,
        customerLocation: {
          latitude: parseFloat(customerLat),
          longitude: parseFloat(customerLon),
          address: customerAddress
        }
      });

    } catch (error) {
      console.error('Error calculating distance:', error);
      // Use mock data when backend is offline
      const mockDistance = generateMockDistance(providerId, parseFloat(customerLat), parseFloat(customerLon));
      setDistanceData({
        distance: mockDistance.distance,
        formattedDistance: mockDistance.formattedDistance,
        color: mockDistance.color,
        label: mockDistance.label,
        providerLocation: {
          latitude: 28.4595,
          longitude: 77.0266,
          address: 'Sector 14, Gurgaon (Mock Location)'
        },
        customerLocation: {
          latitude: parseFloat(customerLat),
          longitude: parseFloat(customerLon),
          address: customerAddress
        },
        isMock: true
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockDistance = (providerId, customerLat, customerLon) => {
    // Generate realistic mock distances based on provider ID and customer location
    const baseDistance = Math.abs(Math.sin(providerId) * 10 + Math.cos(customerLat) * 5);
    const distance = Math.max(0.5, Math.min(25, baseDistance)); // Between 0.5km and 25km
    
    const formattedDistance = formatDistance(distance);
    const color = getDistanceColor(distance);
    const label = getDistanceLabel(distance);

    return { distance, formattedDistance, color, label };
  };

  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} km`;
    } else {
      return `${Math.round(distance)} km`;
    }
  };

  const getDistanceColor = (distance) => {
    if (distance < 2) {
      return 'text-green-600 bg-green-100 border-green-200';
    } else if (distance < 5) {
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    } else if (distance < 10) {
      return 'text-orange-600 bg-orange-100 border-orange-200';
    } else {
      return 'text-red-600 bg-red-100 border-red-200';
    }
  };

  const getDistanceLabel = (distance) => {
    if (distance < 2) {
      return 'Very Close';
    } else if (distance < 5) {
      return 'Close';
    } else if (distance < 10) {
      return 'Moderate';
    } else if (distance < 20) {
      return 'Far';
    } else {
      return 'Very Far';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <FaSpinner className="animate-spin" />
        <span className="text-xs">Calculating...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <FaMapMarkerAlt />
        <span className="text-xs">Distance unavailable</span>
      </div>
    );
  }

  if (!distanceData) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <FaMapMarkerAlt />
        <span className="text-xs">No location data</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${distanceData.color}`}>
        <div className="flex items-center gap-1">
          <FaRoute className="text-xs" />
          <span>{distanceData.formattedDistance}</span>
          <span className="text-xs opacity-75">({distanceData.label})</span>
          {distanceData.isMock && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">Demo</span>
          )}
        </div>
      </div>
      
      {distanceData.distance === null && distanceData.label === 'Action Needed' && !distanceData.isMock && (
        <div className="text-xs text-blue-600 hidden lg:block">
          <div className="flex items-center gap-1">
            <FaLocationArrow className="text-xs" />
            <span>Set your location above to see distances</span>
          </div>
        </div>
      )}
      
      {distanceData.isMock && (
        <div className="text-xs text-yellow-600 hidden lg:block">
          <div className="flex items-center gap-1">
            <FaLocationArrow className="text-xs" />
            <span>Demo mode - Start backend for real distances</span>
          </div>
        </div>
      )}
      
      {distanceData.providerLocation && distanceData.distance !== null && !distanceData.isMock && (
        <div className="text-xs text-gray-500 hidden lg:block">
          <div className="flex items-center gap-1">
            <FaLocationArrow className="text-xs" />
            <span>From: {distanceData.providerLocation.address || 'Your Location'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistanceDisplay;
