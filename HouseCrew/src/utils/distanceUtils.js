// Distance calculation utility for service providers
class DistanceUtils {
  // Calculate distance between two coordinates using Haversine formula
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

  // Format distance for display
  static formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} km`;
    } else {
      return `${Math.round(distance)} km`;
    }
  }

  // Get distance color based on distance
  static getDistanceColor(distance) {
    if (distance < 2) {
      return 'text-green-600 bg-green-100 border-green-200';
    } else if (distance < 5) {
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    } else if (distance < 10) {
      return 'text-orange-600 bg-orange-100 border-orange-200';
    } else {
      return 'text-red-600 bg-red-100 border-red-200';
    }
  }

  // Get distance label
  static getDistanceLabel(distance) {
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
  }

  // Calculate distance from provider's current location to customer location
  static async calculateDistanceFromProvider(providerId, customerLat, customerLon) {
    try {
      // Get provider's current location from API
      const providerLocation = await this.getProviderLocation(providerId);
      
      if (!providerLocation || !providerLocation.latitude || !providerLocation.longitude) {
        return {
          distance: null,
          error: 'Provider location not available',
          formattedDistance: 'Unknown',
          color: 'text-gray-600 bg-gray-100 border-gray-200',
          label: 'Unknown'
        };
      }

      const distance = this.calculateDistance(
        providerLocation.latitude,
        providerLocation.longitude,
        customerLat,
        customerLon
      );

      return {
        distance,
        formattedDistance: this.formatDistance(distance),
        color: this.getDistanceColor(distance),
        label: this.getDistanceLabel(distance),
        providerLocation
      };

    } catch (error) {
      console.error('Error calculating distance:', error);
      return {
        distance: null,
        error: error.message,
        formattedDistance: 'Error',
        color: 'text-red-600 bg-red-100 border-red-200',
        label: 'Error'
      };
    }
  }

  // Get provider's current location (mock implementation - in real app, this would call API)
  static async getProviderLocation(providerId) {
    // In a real implementation, this would call the backend API
    // For now, return mock data for demonstration
    const mockProviderLocations = {
      1: { latitude: 28.4595, longitude: 77.0266, address: 'Sector 14, Gurgaon' }, // Ashok Kumar
      2: { latitude: 28.5089, longitude: 77.4028, address: 'Sector 62, Noida' },
      3: { latitude: 28.6139, longitude: 77.2090, address: 'Dwarka, Delhi' },
      4: { latitude: 28.455779, longitude: 77.057204, address: 'Sector 41, Gurgaon' }
    };

    return mockProviderLocations[providerId] || null;
  }

  // Batch calculate distances for multiple service requests
  static async calculateDistancesForRequests(providerId, requests) {
    const distancePromises = requests.map(async (request) => {
      if (!request.latitude || !request.longitude) {
        return {
          ...request,
          distance: null,
          formattedDistance: 'No Location',
          color: 'text-gray-600 bg-gray-100 border-gray-200',
          label: 'No Location'
        };
      }

      const distanceData = await this.calculateDistanceFromProvider(
        providerId,
        parseFloat(request.latitude),
        parseFloat(request.longitude)
      );

      return {
        ...request,
        ...distanceData
      };
    });

    return Promise.all(distancePromises);
  }
}

export default DistanceUtils;
