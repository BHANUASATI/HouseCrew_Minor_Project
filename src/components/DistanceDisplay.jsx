import React from 'react';
import { MapPin, Navigation, Clock, Car, Walking, Bike } from 'lucide-react';

const DistanceDisplay = ({ distanceInfo, showDetails = false, compact = false }) => {
  if (!distanceInfo) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <MapPin className="w-4 h-4" />
        <span className="text-sm">Distance unavailable</span>
      </div>
    );
  }

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  const getDistanceColor = (km) => {
    if (km <= 2) return 'text-green-600';
    if (km <= 5) return 'text-yellow-600';
    if (km <= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDistanceBadgeColor = (km) => {
    if (km <= 2) return 'bg-green-100 text-green-800 border-green-300';
    if (km <= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (km <= 10) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getDirectionIcon = (direction) => {
    const directionMap = {
      'N': '↑',
      'NE': '↗',
      'E': '→',
      'SE': '↘',
      'S': '↓',
      'SW': '↙',
      'W': '←',
      'NW': '↖'
    };
    return directionMap[direction] || '•';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className={`text-sm font-medium ${getDistanceColor(distanceInfo.distance_km)}`}>
          {distanceInfo.distance_km < 1 
            ? `${Math.round(distanceInfo.distance_km * 1000)}m`
            : `${distanceInfo.distance_km}km`
          }
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Distance Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-800">
              {distanceInfo.distance_km < 1 
                ? `${Math.round(distanceInfo.distance_km * 1000)} meters`
                : `${distanceInfo.distance_km} km`
              }
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDistanceBadgeColor(distanceInfo.distance_km)}`}>
            {distanceInfo.distance_km <= 2 ? 'Very Close' :
             distanceInfo.distance_km <= 5 ? 'Close' :
             distanceInfo.distance_km <= 10 ? 'Moderate' : 'Far'}
          </span>
        </div>
        
        {distanceInfo.distance_miles && (
          <span className="text-sm text-gray-500">
            ({distanceInfo.distance_miles} miles)
          </span>
        )}
      </div>

      {/* Direction Information */}
      {distanceInfo.cardinal_direction && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Navigation className="w-4 h-4" />
          <span>
            Direction: {distanceInfo.cardinal_direction} 
            <span className="ml-1 text-lg">{getDirectionIcon(distanceInfo.cardinal_direction)}</span>
            {distanceInfo.bearing_degrees && (
              <span className="ml-1 text-xs text-gray-500">
                ({distanceInfo.bearing_degrees}°)
              </span>
            )}
          </span>
        </div>
      )}

      {/* Estimated Travel Times */}
      {showDetails && distanceInfo.estimated_time && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Estimated Travel Time:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Driving</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatTime(distanceInfo.estimated_time.driving_minutes)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Bike className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Cycling</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatTime(distanceInfo.estimated_time.cycling_minutes)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Walking className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-500">Walking</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatTime(distanceInfo.estimated_time.walking_minutes)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distance Summary */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Precise calculation using GPS coordinates</span>
        <span>±10m accuracy</span>
      </div>
    </div>
  );
};

export default DistanceDisplay;
