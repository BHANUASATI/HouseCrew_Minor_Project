import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaExclamationTriangle, FaMap } from 'react-icons/fa';

const ReliableMap = ({ 
  latitude, 
  longitude, 
  title = "Location Map",
  height = 300,
  showControls = true,
  className = "",
  zoom = 15
}) => {
  const [mapError, setMapError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentMapSource, setCurrentMapSource] = useState('openstreet');

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

  // Map sources in order of preference
  const mapSources = {
    google: {
      name: 'Google Maps',
      generateUrl: (coords) => {
        // Use Google Maps search embed (no API key required)
        return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
      },
      fallback: 'openstreet'
    },
    openstreet: {
      name: 'OpenStreetMap',
      generateUrl: (coords) => {
        const bounds = 0.02;
        const bbox = `${coords.lng - bounds}%2C${coords.lat - bounds}%2C${coords.lng + bounds}%2C${coords.lat + bounds}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;
      },
      fallback: 'bing'
    },
    bing: {
      name: 'Bing Maps',
      generateUrl: (coords) => {
        return `https://www.bing.com/maps/embed?cp=${coords.lat}~${coords.lng}&lvl=${zoom}&w=600&h=400`;
      },
      fallback: 'custom'
    },
    custom: {
      name: 'Custom Map',
      generateUrl: () => null,
      fallback: null
    }
  };

  // Generate current map URL
  const getCurrentMapUrl = () => {
    if (!coordinates || !mapSources[currentMapSource]) return null;
    
    try {
      return mapSources[currentMapSource].generateUrl(coordinates);
    } catch (error) {
      console.error('Error generating map URL:', error);
      return null;
    }
  };

  // Generate Google Maps directions URL (always available)
  const getGoogleMapsDirectionsUrl = () => {
    if (!coordinates) return null;
    
    try {
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    } catch (error) {
      console.error('Error generating Google Maps directions URL:', error);
      return null;
    }
  };

  const mapUrl = getCurrentMapUrl();
  const googleMapsDirectionsUrl = getGoogleMapsDirectionsUrl();

  const handleMapError = () => {
    console.log(`${mapSources[currentMapSource].name} failed, trying fallback...`);
    
    const nextSource = mapSources[currentMapSource].fallback;
    if (nextSource && mapSources[nextSource]) {
      setCurrentMapSource(nextSource);
      setLoading(true);
    } else {
      setMapError(true);
      setLoading(false);
    }
  };

  const handleMapLoad = () => {
    setLoading(false);
  };

  // Create custom map as last resort
  const renderCustomMap = () => (
    <div 
      className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50"
      style={{
        backgroundImage: `
          linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)`
      }}
    >
      <div className="text-center p-4">
        <FaMapMarkerAlt className="text-5xl text-red-500 mb-3 mx-auto" />
        <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <h4 className="font-semibold text-gray-800 mb-1">Location</h4>
          <p className="text-sm text-gray-600 mb-2">
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Latitude: {coordinates.lat.toFixed(4)}°</p>
            <p>Longitude: {coordinates.lng.toFixed(4)}°</p>
          </div>
        </div>
        
        {googleMapsDirectionsUrl && (
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <FaExternalLinkAlt className="text-xs" />
            View on Google Maps
          </a>
        )}
      </div>
    </div>
  );

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

  return (
    <div className={`relative ${className}`}>
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading {mapSources[currentMapSource].name}...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError ? (
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-4" style={{ height: `${height}px` }}>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FaExclamationTriangle className="text-3xl text-yellow-500 mb-3" />
            <p className="text-gray-700 font-medium mb-2">All map services unavailable</p>
            <p className="text-gray-600 text-sm mb-4">
              Unable to load any map service. Showing location details instead.
            </p>
            
            <div className="space-y-2">
              <button
                onClick={() => {
                  setMapError(false);
                  setLoading(true);
                  setCurrentMapSource('openstreet');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 mx-auto"
              >
                Retry All Maps
              </button>
              
              {googleMapsDirectionsUrl && (
                <a
                  href={googleMapsDirectionsUrl}
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
          {currentMapSource === 'custom' ? (
            renderCustomMap()
          ) : mapUrl ? (
            <iframe
              title={`${title} - ${mapSources[currentMapSource].name}`}
              width="100%"
              height={height}
              loading="lazy"
              src={mapUrl}
              onLoad={handleMapLoad}
              onError={handleMapError}
              className="border-0"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          ) : (
            renderCustomMap()
          )}
          
          {/* Map Source Indicator */}
          {showControls && !loading && currentMapSource !== 'custom' && (
            <div className="absolute top-2 left-2 bg-white rounded-lg shadow-lg px-2 py-1">
              <span className="text-xs text-gray-600">
                {mapSources[currentMapSource].name}
              </span>
            </div>
          )}
          
          {/* Map Controls Overlay */}
          {showControls && !loading && (
            <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg p-1 space-y-1">
              {googleMapsDirectionsUrl && (
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  title="Open in Google Maps"
                >
                  <FaExternalLinkAlt className="text-xs" />
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
        </div>
      )}
    </div>
  );
};

export default ReliableMap;
