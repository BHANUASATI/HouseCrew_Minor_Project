// Location Detection Utility
class LocationUtils {
  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const address = await this.reverseGeocode(latitude, longitude);
            resolve({
              latitude,
              longitude,
              address: address,
              detection_method: 'GPS',
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            // If reverse geocoding fails, provide detailed coordinates-based location
            const coordinateLocation = this.formatCoordinatesLocation(latitude, longitude);
            resolve({
              latitude,
              longitude,
              address: coordinateLocation,
              detection_method: 'GPS',
              timestamp: new Date().toISOString(),
              error: 'Address lookup failed - using coordinates'
            });
          }
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  static formatCoordinatesLocation(latitude, longitude) {
    // Create a descriptive location based on coordinates
    const lat = latitude.toFixed(6);
    const lng = longitude.toFixed(6);
    
    // Try to provide some context based on coordinates
    let locationContext = '';
    
    // Rough estimation for Indian regions
    if (latitude >= 28 && latitude <= 30 && longitude >= 76 && longitude <= 78) {
      locationContext = ' (Delhi NCR Region)';
    } else if (latitude >= 26 && latitude <= 28 && longitude >= 88 && longitude <= 93) {
      locationContext = ' (Kolkata Region)';
    } else if (latitude >= 19 && latitude <= 20 && longitude >= 72 && longitude <= 73) {
      locationContext = ' (Mumbai Region)';
    } else if (latitude >= 12 && latitude <= 14 && longitude >= 77 && longitude <= 78) {
      locationContext = ' (Bangalore Region)';
    } else if (latitude >= 17 && latitude <= 19 && longitude >= 78 && longitude <= 81) {
      locationContext = ' (Hyderabad Region)';
    }
    
    return `Location detected via GPS${locationContext} - Coordinates: ${lat}, ${lng}`;
  }

  static async reverseGeocode(latitude, longitude) {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'HouseCrew/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Format the address
      const address = this.formatAddress(data);
      return address;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  static formatAddress(data) {
    const address = data.address || {};
    const components = [];

    // House number and street
    if (address.house_number) {
      components.push(address.house_number);
    }
    if (address.road) {
      components.push(address.road);
    }

    // Area/Neighborhood
    if (address.suburb || address.neighbourhood) {
      components.push(address.suburb || address.neighbourhood);
    }

    // Sector (common in India) - prioritize this
    if (address.sector) {
      components.push(`Sector ${address.sector}`);
    }

    // City/Town
    if (address.city || address.town || address.village) {
      components.push(address.city || address.town || address.village);
    }

    // District
    if (address.state_district) {
      components.push(address.state_district);
    }

    // State
    if (address.state) {
      components.push(address.state);
    }

    // PIN code
    if (address.postcode) {
      components.push(address.postcode);
    }

    // Country
    if (address.country) {
      components.push(address.country);
    }

    // If no components found, return a default with coordinates
    if (components.length === 0) {
      return 'Location detected - Coordinates available';
    }

    return components.join(', ') || 'Unknown location';
  }

  static async watchLocation(callback, errorCallback) {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported by this browser'));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const address = await this.reverseGeocode(latitude, longitude);
          callback({
            latitude,
            longitude,
            address,
            detection_method: 'GPS',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          callback({
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
            detection_method: 'GPS',
            timestamp: new Date().toISOString(),
            error: 'Address lookup failed'
          });
        }
      },
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );

    return watchId;
  }

  static clearWatch(watchId) {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  static async getLocationPermission() {
    if (!navigator.geolocation) {
      return 'unsupported';
    }

    return new Promise((resolve) => {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        resolve(result.state);
      }).catch(() => {
        resolve('unknown');
      });
    });
  }

  static async requestLocationPermission() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve('granted'),
        (error) => reject(error),
        { timeout: 5000 }
      );
    });
  }
}

export default LocationUtils;
