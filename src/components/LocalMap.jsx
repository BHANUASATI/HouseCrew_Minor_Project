import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaExclamationTriangle, FaMap, FaSatellite, FaStreetView } from 'react-icons/fa';

const LocalMap = ({ 
  latitude, 
  longitude, 
  title = "Location Map",
  height = 300,
  showControls = true,
  className = "",
  zoom = 15
}) => {
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [selectedView, setSelectedView] = useState('standard');

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

  // Generate Google Maps URL (external link only)
  const getGoogleMapsUrl = () => {
    if (!coordinates) return null;
    
    try {
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    } catch (error) {
      console.error('Error generating Google Maps URL:', error);
      return null;
    }
  };

  // Generate OpenStreetMap URL (external link only)
  const getOpenStreetMapUrl = () => {
    if (!coordinates) return null;
    
    try {
      return `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}&zoom=${zoom}`;
    } catch (error) {
      console.error('Error generating OpenStreetMap URL:', error);
      return null;
    }
  };

  // Generate static map tiles URL (using a free tile server)
  const getTileUrl = (x, y, z) => {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  };

  // Convert lat/lng to tile coordinates
  const latLngToTile = (lat, lng, zoom) => {
    const n = Math.pow(2, zoom);
    const x = ((lng + 180) / 360) * n;
    const y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n;
    return { x: Math.floor(x), y: Math.floor(y) };
  };

  const googleMapsUrl = getGoogleMapsUrl();
  const openStreetMapUrl = getOpenStreetMapUrl();

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setMapError(false);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // If coordinates are invalid, show error state
  if (!coordinates) {
    return (
      <div className={`bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center ${className}`} style={{ height: `${height}px` }}>
        <div className="text-center p-4">
          <FaExclamationTriangle className="text-3xl text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Location coordinates not available</p>
          <p className="text-gray-500 text-xs mt-1">Please check location settings</p>
        </div>
      </div>
    );
  }

  // Render different map views
  const renderMapView = () => {
    const tileCoords = latLngToTile(coordinates.lat, coordinates.lng, zoom);
    
    switch (selectedView) {
      case 'satellite':
        return (
          <div className="w-full h-full bg-gradient-to-br from-green-800 to-green-600 relative overflow-hidden">
            {/* Satellite view simulation */}
            <div className="absolute inset-0 opacity-30">
              <div className="grid grid-cols-4 grid-rows-4 h-full">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="border border-green-700 bg-gradient-to-br from-green-700 to-green-800" />
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FaSatellite className="text-4xl text-white mb-2" />
                <p className="text-white text-sm">Satellite View</p>
              </div>
            </div>
          </div>
        );
      
      case 'terrain':
        return (
          <div className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-800 relative overflow-hidden">
            {/* Terrain view simulation */}
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="rgba(0,0,0,0.2)" />
                  <path d="M0,70 Q25,50 50,70 T100,70 L100,100 L0,100 Z" fill="rgba(0,0,0,0.3)" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FaMap className="text-4xl text-white mb-2" />
                <p className="text-white text-sm">Terrain View</p>
              </div>
            </div>
          </div>
        );
      
      default: // standard
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden">
            {/* Standard map view simulation */}
            <div className="absolute inset-0 opacity-30">
              <div className="grid grid-cols-8 grid-rows-8 h-full">
                {[...Array(64)].map((_, i) => (
                  <div key={i} className="border border-gray-300 bg-white" />
                ))}
              </div>
            </div>
            
            {/* Simulated roads */}
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400 transform -translate-y-1/2" />
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-400 transform -translate-x-1/2" />
              <div className="absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-gray-300 transform -translate-y-1/2" />
              <div className="absolute top-3/4 left-1/4 right-1/4 h-0.5 bg-gray-300 transform -translate-y-1/2" />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FaMap className="text-4xl text-blue-600 mb-2" />
                <p className="text-gray-700 text-sm">Standard View</p>
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
        <div className="absolute inset-0 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError ? (
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-4" style={{ height: `${height}px` }}>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FaExclamationTriangle className="text-3xl text-yellow-500 mb-3" />
            <p className="text-gray-700 font-medium mb-2">Map temporarily unavailable</p>
            <p className="text-gray-600 text-sm mb-4">
              Showing local map view instead.
            </p>
            
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 mx-auto"
              >
                Retry Map
              </button>
              
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2 mx-auto inline-block"
                >
                  <FaExternalLinkAlt />
                  Open in Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Map Display */
        <div className="relative rounded-lg border border-gray-200 overflow-hidden" style={{ height: `${height}px` }}>
          {/* Map View */}
          {renderMapView()}
          
          {/* Location Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <FaMapMarkerAlt className="text-3xl text-red-500 drop-shadow-lg" />
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-red-600"></div>
            </div>
          </div>
          
          {/* Map View Controls */}
          {showControls && !loading && (
            <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg p-1 space-y-1">
              <button
                onClick={() => setSelectedView('standard')}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                  selectedView === 'standard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Standard View"
              >
                <FaMap />
              </button>
              <button
                onClick={() => setSelectedView('satellite')}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                  selectedView === 'satellite' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Satellite View"
              >
                <FaSatellite />
              </button>
              <button
                onClick={() => setSelectedView('terrain')}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                  selectedView === 'terrain' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Terrain View"
              >
                <FaStreetView />
              </button>
            </div>
          )}
          
          {/* External Map Links */}
          {showControls && !loading && (
            <div className="absolute top-2 left-2 bg-white rounded-lg shadow-lg p-1 space-y-1">
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  title="Open in Google Maps"
                >
                  <FaExternalLinkAlt className="text-xs" />
                  Google
                </a>
              )}
              {openStreetMapUrl && (
                <a
                  href={openStreetMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                  title="Open in OpenStreetMap"
                >
                  <FaMap className="text-xs" />
                  OSM
                </a>
              )}
            </div>
          )}
          
          {/* Location Info Overlay */}
          <div className="absolute bottom-2 left-2 bg-white rounded-lg shadow-lg p-2">
            <div className="flex items-center gap-2 text-xs">
              <FaMapMarkerAlt className="text-red-500" />
              <span className="text-gray-700">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </span>
            </div>
          </div>
          
          {/* Zoom Controls */}
          {showControls && !loading && (
            <div className="absolute bottom-2 right-2 bg-white rounded-lg shadow-lg p-1 space-y-1">
              <button
                className="w-8 h-8 rounded flex items-center justify-center text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Zoom In"
              >
                +
              </button>
              <button
                className="w-8 h-8 rounded flex items-center justify-center text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Zoom Out"
              >
                −
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocalMap;
