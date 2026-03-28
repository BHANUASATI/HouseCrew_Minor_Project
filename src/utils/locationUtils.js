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

  static async forwardGeocode(address) {
    try {
      console.log('🔍 Starting geocoding for address:', address);
      
      // Try multiple geocoding services in order
      const geocodingServices = [
        { name: 'geocodeMapsCo', fn: this.geocodeWithMapsCo },
        { name: 'geocodeWithAlternative', fn: this.geocodeWithAlternative },
        { name: 'geocodeWithCityFallback', fn: this.geocodeWithCityFallback }
      ];

      let lastError = null;
      
      for (const service of geocodingServices) {
        try {
          console.log(`🔍 Trying geocoding service: ${service.name}`);
          const result = await service.fn.call(this, address);
          
          if (result && result.latitude && result.longitude) {
            console.log(`✅ Geocoding successful with ${service.name}:`, {
              latitude: result.latitude,
              longitude: result.longitude,
              address: result.address || result.display_name,
              service: service.name
            });
            
            return {
              latitude: result.latitude,
              longitude: result.longitude,
              address: this.formatAddressFromGeocode(result),
              confidence: this.getGeocodeConfidence(result),
              detection_method: `geocoded_${service.name}`,
              service_used: service.name,
              raw_data: result
            };
          }
        } catch (error) {
          console.warn(`❌ ${service.name} failed:`, error.message);
          lastError = error;
          continue;
        }
      }

      throw lastError || new Error('All geocoding services failed');
    } catch (error) {
      console.error('❌ Forward geocoding error:', error);
      throw error;
    }
  }

  static async geocodeWithMapsCo(address) {
    const apiKey = '69c7572eea0e4591472196pce879a88';
    
    // First try the direct address
    const response = await fetch(
      `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('geocode.maps.co API request failed');
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        ...result,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    }
    
    // If no direct results, try fallback searches for specific institutions
    console.log('🔄 No direct results, trying fallback searches...');
    
    const fallbackSearches = [
      // K.R. Mangalam University fallbacks
      {
        condition: (addr) => addr.toLowerCase().includes('mangalam') && addr.toLowerCase().includes('university'),
        queries: ['K.R. Mangalam World School Gurugram', 'Mangalam World School Gurugram', 'K.R. Mangalam School Gurugram']
      },
      // Other institution fallbacks can be added here
    ];
    
    for (const fallback of fallbackSearches) {
      if (fallback.condition(address)) {
        console.log('🔍 Trying fallback queries for:', address);
        
        for (const query of fallback.queries) {
          console.log('🔍 Trying fallback query:', query);
          
          try {
            const fallbackResponse = await fetch(
              `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&api_key=${apiKey}`
            );
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              
              if (fallbackData && fallbackData.length > 0) {
                const result = fallbackData[0];
                console.log('✅ Fallback search successful:', query, result);
                return {
                  ...result,
                  latitude: parseFloat(result.lat),
                  longitude: parseFloat(result.lon),
                  fallback_query_used: query,
                  fallback_match: true
                };
              }
            }
          } catch (error) {
            console.warn(`❌ Fallback query failed: ${query}`, error);
            continue;
          }
        }
      }
    }
    
    throw new Error('No results found in geocode.maps.co and fallback searches');
  }

  static async geocodeWithNominatim(address) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1`,
      {
        headers: {
          'User-Agent': 'HouseCrew/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Nominatim API request failed');
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('No results found in Nominatim');
    }

    const result = data[0];
    return {
      ...result,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    };
  }

  static async geocodeWithAlternative(address) {
    // Extract key location components and try different combinations
    const parts = address.split(',');
    const city = this.extractCity(address);
    const area = this.extractArea(address);
    
    console.log('🔍 Extracted components:', { city, area, parts });
    
    // Try different search strategies
    const searchQueries = [];
    
    // 1. Try area + city (most specific)
    if (area && city) {
      searchQueries.push(`${area}, ${city}`);
    }
    
    // 2. Try just the area
    if (area) {
      searchQueries.push(area);
    }
    
    // 3. Try city + state
    if (city) {
      searchQueries.push(city);
    }
    
    // 4. Try simplified address (first 2 parts)
    if (parts.length >= 2) {
      searchQueries.push(parts.slice(0, 2).join(',').trim());
    }
    
    for (const query of searchQueries) {
      try {
        console.log('🔍 Trying alternative search:', query);
        const response = await fetch(
          `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&api_key=69c7572eea0e4591472196pce879a88`
        );

        if (!response.ok) {
          throw new Error('Alternative geocoding failed');
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          console.log('✅ Alternative search successful:', query, result);
          return {
            ...result,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            search_query_used: query
          };
        }
      } catch (error) {
        console.warn(`❌ Alternative search failed for "${query}":`, error.message);
        continue;
      }
    }

    throw new Error('No results found with alternative searches');
  }

  static extractArea(address) {
    const parts = address.split(',');
    const areaKeywords = ['badshahpur', 'sohna', 'sector', 'colony', 'vihar', 'enclave', 'nagar', 'pura', 'garh'];
    
    for (const part of parts) {
      const lowerPart = part.toLowerCase().trim();
      for (const keyword of areaKeywords) {
        if (lowerPart.includes(keyword)) {
          return part.trim();
        }
      }
    }
    
    return null;
  }

  static async geocodeWithCityFallback(address) {
    // Extract city name and use city center coordinates
    const city = this.extractCity(address);
    console.log('Using city fallback for:', city);
    
    if (!city) {
      throw new Error('Could not extract city name');
    }

    // Common Indian city coordinates
    const cityCoordinates = {
      'gurgaon': { lat: 28.4595, lon: 77.0266 },
      'gurugram': { lat: 28.4595, lon: 77.0266 },
      'delhi': { lat: 28.7041, lon: 77.1025 },
      'noida': { lat: 28.5355, lon: 77.3910 },
      'faridabad': { lat: 28.4089, lon: 77.3178 },
      'ghaziabad': { lat: 28.6692, lon: 77.4538 },
      'mumbai': { lat: 19.0760, lon: 72.8777 },
      'bangalore': { lat: 12.9716, lon: 77.5946 },
      'hyderabad': { lat: 17.3850, lon: 78.4867 },
      'chennai': { lat: 13.0827, lon: 80.2707 },
      'kolkata': { lat: 22.5726, lon: 88.3639 },
      'pune': { lat: 18.5204, lon: 73.8567 },
      'jaipur': { lat: 26.9124, lon: 75.7873 },
      'lucknow': { lat: 26.8467, lon: 80.9462 },
      'kanpur': { lat: 26.4499, lon: 80.3319 },
      'nagpur': { lat: 21.1458, lon: 79.0882 },
      'indore': { lat: 22.7196, lon: 75.8577 },
      'thane': { lat: 19.2183, lon: 72.9781 },
      'bhopal': { lat: 23.2599, lon: 77.4126 },
      'visakhapatnam': { lat: 17.6868, lon: 83.2185 },
      'pimpri': { lat: 18.6298, lon: 73.8095 },
      'patna': { lat: 25.5941, lon: 85.1376 },
      'vadodara': { lat: 22.3072, lon: 73.1812 },
      'agra': { lat: 27.1767, lon: 78.0081 },
      'surat': { lat: 21.1702, lon: 72.8311 },
      'ludhiana': { lat: 30.9010, lon: 75.8573 },
      'coimbatore': { lat: 11.0168, lon: 76.9558 }
    };

    const cityKey = city.toLowerCase();
    if (cityCoordinates[cityKey]) {
      return {
        latitude: cityCoordinates[cityKey].lat,
        longitude: cityCoordinates[cityKey].lon,
        address: `${city} (city center)`,
        place_id: 'city_fallback',
        address: {
          city: city,
          state: 'Unknown',
          country: 'India'
        }
      };
    }

    throw new Error(`City ${city} not found in database`);
  }

  static simplifyAddress(address) {
    // Extract key parts: remove complex details, keep main location
    const parts = address.split(',');
    
    // For university addresses, try just the university name + city
    if (address.toLowerCase().includes('university') || address.toLowerCase().includes('college')) {
      const universityName = parts[0].trim();
      const city = parts.find(part => 
        part.toLowerCase().includes('gurgaon') || 
        part.toLowerCase().includes('gurugram') ||
        part.toLowerCase().includes('delhi') ||
        part.toLowerCase().includes('noida')
      );
      
      if (city) {
        return `${universityName}, ${city.trim()}`;
      }
    }
    
    // For other addresses, keep first 2-3 parts
    return parts.slice(0, 2).join(',').trim();
  }

  static extractCity(address) {
    const parts = address.split(',');
    const cityKeywords = ['gurgaon', 'gurugram', 'delhi', 'noida', 'faridabad', 'mumbai', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'];
    
    for (const part of parts) {
      const lowerPart = part.toLowerCase().trim();
      for (const city of cityKeywords) {
        if (lowerPart.includes(city)) {
          return city;
        }
      }
    }
    
    return null;
  }

  static formatAddressFromGeocode(data) {
    // Handle geocode.maps.co API response format
    if (data.display_name) {
      return data.display_name;
    }
    
    // Handle Nominatim API response format
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

    // Sector (common in India)
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

    return components.join(', ') || data.display_name || 'Unknown location';
  }

  static getGeocodeConfidence(result) {
    // Calculate confidence based on available address components
    const address = result.address || {};
    let confidence = 0.5; // Base confidence

    if (address.house_number) confidence += 0.2;
    if (address.road) confidence += 0.2;
    if (address.city || address.town || address.village) confidence += 0.3;
    if (address.state) confidence += 0.2;
    if (address.postcode) confidence += 0.1;

    return Math.min(confidence, 1.0);
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
