// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  // Note: You need to get a Google Maps API key from https://console.cloud.google.com/
  // Enable these APIs for your project:
  // - Maps JavaScript API
  // - Directions API
  // - Geocoding API
  
  API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
  
  // Default center (Gurgaon, India)
  DEFAULT_CENTER: {
    lat: 28.4595,
    lng: 77.0266
  },
  
  // Map styles
  MAP_STYLES: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ],
  
  // Travel modes
  TRAVEL_MODES: {
    DRIVING: 'DRIVING',
    WALKING: 'WALKING',
    BICYCLING: 'BICYCLING',
    TRANSIT: 'TRANSIT'
  }
};

// Helper function to check if Google Maps is available
export const isGoogleMapsAvailable = () => {
  return typeof window !== 'undefined' && window.google && window.google.maps;
};

// Helper function to load Google Maps script
export const loadGoogleMaps = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (isGoogleMapsAvailable()) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
    };
    
    document.head.appendChild(script);
  });
};

// Helper function to open Google Maps in new tab
export const openGoogleMapsDirections = (origin, destination) => {
  const url = `https://www.google.com/maps/dir/${origin.lat},${origin.lng}/${destination.lat},${destination.lng}`;
  window.open(url, '_blank');
};
