import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaExclamationTriangle, FaMap } from 'react-icons/fa';

const GoogleMapView = ({ 
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
  const [mapStyle, setMapStyle] = useState(null);

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

  // Generate Google Maps Static URL (without API key - using free embed)
  const generateGoogleMapsUrl = () => {
    if (!coordinates) return null;

    try {
      // Use Google Maps embed URL (free, no API key required)
      return `https://www.google.com/maps/embed/v1/place?key=&q=${coordinates.lat},${coordinates.lng}&zoom=${zoom}&maptype=roadmap`;
    } catch (error) {
      console.error('Error generating Google Maps URL:', error);
      return null;
    }
  };

  // Generate OpenStreetMap URL as fallback
  const generateOpenStreetMapUrl = () => {
    if (!coordinates) return null;

    try {
      const bounds = 0.02;
      const bbox = `${coordinates.lng - bounds}%2C${coordinates.lat - bounds}%2C${coordinates.lng + bounds}%2C${coordinates.lat + bounds}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`;
    } catch (error) {
      console.error('Error generating OpenStreetMap URL:', error);
      return null;
    }
  };

  // Generate Google Maps directions URL
  const generateGoogleMapsDirectionsUrl = () => {
    if (!coordinates) return null;
    
    try {
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    } catch (error) {
      console.error('Error generating Google Maps directions URL:', error);
      return null;
    }
  };

  // Create custom map style as fallback
  const generateCustomMap = () => {
    if (!coordinates) return null;

    // Generate a simple map-like background with marker
    return {
      backgroundColor: '#f0f0f0',
      backgroundImage: `
        linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
        linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
        linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
  };

  const googleMapsUrl = generateGoogleMapsUrl();
  const openStreetMapUrl = generateOpenStreetMapUrl();
  const googleMapsDirectionsUrl = generateGoogleMapsDirectionsUrl();

  useEffect(() => {
    if (coordinates) {
      // Try to load Google Maps first
      if (googleMapsUrl) {
        setMapStyle('google');
      } else if (openStreetMapUrl) {
        setMapStyle('openstreet');
      } else {
        setMapStyle('custom');
      }
    }
  }, [coordinates, googleMapsUrl, openStreetMapUrl]);

  const handleMapError = () => {
    console.log('Google Maps failed, trying OpenStreetMap...');
    if (mapStyle === 'google' && openStreetMapUrl) {
      setMapStyle('openstreet');
    } else {
      setMapError(true);
      setLoading(false);
      setMapStyle('custom');
    }
  };

  const handleMapLoad = () => {
    setLoading(false);
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
              The map service is experiencing issues. Please try again later.
            </p>
            
            {/* Fallback Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setMapError(false);
                  setLoading(true);
                  setMapStyle('google');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 mx-auto"
              >
                Retry Map
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
          {mapStyle === 'google' && googleMapsUrl && (
            <iframe
              title={title}
              width="100%"
              height={height}
              loading="lazy"
              src={googleMapsUrl}
              onLoad={handleMapLoad}
              onError={handleMapError}
              className="border-0"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
          
          {mapStyle === 'openstreet' && openStreetMapUrl && (
            <iframe
              title={title}
              width="100%"
              height={height}
              loading="lazy"
              src={openStreetMapUrl}
              onLoad={handleMapLoad}
              onError={handleMapError}
              className="border-0"
              sandbox="allow-scripts allow-same-origin"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
          
          {mapStyle === 'custom' && (
            <div style={generateCustomMap()} className="w-full h-full">
              <div className="text-center">
                <FaMapMarkerAlt className="text-4xl text-red-500 mb-2" />
                <p className="text-gray-700 font-medium">Location</p>
                <p className="text-gray-600 text-sm">
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
              </div>
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

export default GoogleMapView;
