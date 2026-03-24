import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaExclamationTriangle, FaMap, FaSatellite, FaStreetView, FaRoute, FaClock, FaLocationArrow } from 'react-icons/fa';

const ModernMap = ({ 
  latitude, 
  longitude, 
  title = "Location Map",
  height = 300,
  showControls = true,
  className = "",
  zoom = 15,
  address = ""
}) => {
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('standard');
  const [showDetails, setShowDetails] = useState(false);

  // Validate coordinates
  const isValidCoordinate = (lat, lng) => {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !isNaN(lat) && !isNaN(lng)
    );
  };

  const coordinates = isValidCoordinate(latitude, longitude) 
    ? { lat: latitude, lng: longitude }
    : null;

  // Generate external map URLs
  const getGoogleMapsUrl = () => {
    if (!coordinates) return null;
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
  };

  const getOpenStreetMapUrl = () => {
    if (!coordinates) return null;
    return `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}&zoom=${zoom}`;
  };

  const googleMapsUrl = getGoogleMapsUrl();
  const openStreetMapUrl = getOpenStreetMapUrl();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // If coordinates are invalid, show error state
  if (!coordinates) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 flex items-center justify-center ${className}`} style={{ height: `${height}px` }}>
        <div className="text-center p-4">
          <FaExclamationTriangle className="text-3xl text-orange-500 mx-auto mb-2" />
          <p className="text-gray-600 text-sm font-medium">Location not available</p>
          <p className="text-gray-500 text-xs mt-1">Please check location settings</p>
        </div>
      </div>
    );
  }

  // Modern map views inspired by Zomato/Swiggy
  const renderModernMapView = () => {
    switch (selectedView) {
      case 'satellite':
        return (
          <div className="w-full h-full bg-gradient-to-br from-emerald-700 to-teal-800 relative overflow-hidden">
            {/* Modern satellite view with clean tiles */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-6 grid-rows-6 h-full">
                {[...Array(36)].map((_, i) => (
                  <div key={i} className="border border-emerald-600 bg-gradient-to-br from-emerald-600 to-teal-700" />
                ))}
              </div>
            </div>
            
            {/* Modern overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Location indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full" />
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs font-medium">Satellite View</p>
            </div>
          </div>
        );
      
      case 'terrain':
        return (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-600 relative overflow-hidden">
            {/* Modern terrain view */}
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <path d="M0,40 Q20,25 40,40 T80,40 L80,100 L0,100 Z" fill="rgba(255,255,255,0.2)" />
                <path d="M0,60 Q20,45 40,60 T80,60 L80,100 L0,100 Z" fill="rgba(255,255,255,0.3)" />
                <path d="M0,80 Q20,65 40,80 T80,80 L80,100 L0,100 Z" fill="rgba(255,255,255,0.4)" />
              </svg>
            </div>
            
            {/* Location indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                <div className="absolute inset-0 w-4 h-4 bg-orange-600 rounded-full animate-ping" />
                <div className="absolute inset-0 w-4 h-4 bg-orange-600 rounded-full" />
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs font-medium">Terrain View</p>
            </div>
          </div>
        );
      
      default: // standard - Zomato/Swiggy style
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
            {/* Clean modern map background */}
            <div className="absolute inset-0 opacity-40">
              <div className="grid grid-cols-8 grid-rows-8 h-full">
                {[...Array(64)].map((_, i) => (
                  <div key={i} className="border border-gray-200 bg-white" />
                ))}
              </div>
            </div>
            
            {/* Modern road network */}
            <div className="absolute inset-0">
              {/* Main roads */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 transform -translate-y-1/2" />
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-400 transform -translate-x-1/2" />
              
              {/* Secondary roads */}
              <div className="absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-gray-300 transform -translate-y-1/2" />
              <div className="absolute top-3/4 left-1/4 right-1/4 h-0.5 bg-gray-300 transform -translate-y-1/2" />
              <div className="absolute top-1/4 bottom-1/4 left-1/4 w-0.5 bg-gray-300 transform -translate-x-1/2" />
              <div className="absolute top-1/4 bottom-1/4 left-3/4 w-0.5 bg-gray-300 transform -translate-x-1/2" />
              
              {/* Small streets */}
              <div className="absolute top-1/3 left-1/3 right-1/3 h-0.5 bg-gray-200 transform -translate-y-1/2" />
              <div className="absolute top-2/3 left-1/3 right-1/3 h-0.5 bg-gray-200 transform -translate-y-1/2" />
            </div>
            
            {/* Modern location marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                {/* Pulsing effect */}
                <div className="absolute inset-0 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75" />
                {/* Outer circle */}
                <div className="relative w-6 h-6 bg-red-500 rounded-full shadow-lg">
                  {/* Inner dot */}
                  <div className="absolute inset-1 bg-white rounded-full" />
                  {/* Center dot */}
                  <div className="absolute inset-2 bg-red-500 rounded-full" />
                </div>
                {/* Direction indicator */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-red-500" />
              </div>
            </div>
            
            {/* Modern map elements */}
            <div className="absolute top-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md">
                <p className="text-xs font-medium text-gray-700">Standard View</p>
              </div>
            </div>
            
            {/* Scale indicator */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-8 h-0.5 bg-gray-400" />
                  <span>200m</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white rounded-2xl border border-gray-200 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm font-medium">Loading map...</p>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className="relative rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white" style={{ height: `${height}px` }}>
        {/* Map View */}
        {renderModernMapView()}
        
        {/* Top Controls - Modern Style */}
        {showControls && !loading && (
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
            {/* Left: External Links */}
            <div className="flex gap-2 pointer-events-auto">
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-red-600"
                >
                  <FaExternalLinkAlt className="text-xs" />
                  Google Maps
                </a>
              )}
              {openStreetMapUrl && (
                <a
                  href={openStreetMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-blue-600"
                >
                  <FaMap className="text-xs" />
                  OpenStreetMap
                </a>
              )}
            </div>

            {/* Right: View Controls */}
            <div className="flex gap-1 pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-md">
                <button
                  onClick={() => setSelectedView('standard')}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                    selectedView === 'standard' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Standard View"
                >
                  <FaMap />
                </button>
                <button
                  onClick={() => setSelectedView('satellite')}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                    selectedView === 'satellite' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Satellite View"
                >
                  <FaSatellite />
                </button>
                <button
                  onClick={() => setSelectedView('terrain')}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                    selectedView === 'terrain' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Terrain View"
                >
                  <FaStreetView />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom Information Bar - Modern Style */}
        {showControls && !loading && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex justify-between items-end">
              {/* Location Details */}
              <div className="flex items-center gap-3">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500 text-sm" />
                    <div>
                      <p className="text-xs font-medium text-gray-800">
                        {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                      </p>
                      {address && (
                        <p className="text-xs text-gray-600 truncate max-w-xs">{address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-xs font-medium text-gray-700"
                >
                  <FaLocationArrow className="text-xs" />
                  Details
                </button>
                <button className="bg-red-500 text-white rounded-lg px-3 py-2 shadow-md hover:bg-red-600 transition-all duration-200 flex items-center gap-2 text-xs font-medium">
                  <FaRoute className="text-xs" />
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Panel */}
        {showDetails && !loading && (
          <div className="absolute top-16 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Location Information</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><span className="font-medium">Latitude:</span> {coordinates.lat.toFixed(6)}°</p>
                  <p><span className="font-medium">Longitude:</span> {coordinates.lng.toFixed(6)}°</p>
                  <p><span className="font-medium">Zoom Level:</span> {zoom}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Quick Actions</h4>
                <div className="flex gap-2">
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-500 text-white rounded-lg px-2 py-1 text-xs font-medium text-center hover:bg-blue-600 transition-colors"
                    >
                      Google Maps
                    </a>
                  )}
                  {openStreetMapUrl && (
                    <a
                      href={openStreetMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 text-white rounded-lg px-2 py-1 text-xs font-medium text-center hover:bg-green-600 transition-colors"
                    >
                      OpenStreetMap
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernMap;
