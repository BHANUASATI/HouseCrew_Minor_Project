// API Service
// In-memory storage for service requests (temporary solution until backend is fixed)
let serviceRequestsStorage = [];
let nextRequestId = 1000;

// API Configuration
const API_BASE_URL = 'http://localhost:8003/api';

class ApiService {
  // Auth endpoints
  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      // Store token and user data in localStorage
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get user data');
      }
      
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  static async logout() {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Helper method to check if user is logged in
  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Helper method to get current user data
  static getCurrentUserFromStorage() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Health check
  static async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  // Profile endpoints
  static async getUserProfile(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch profile');
      }
      
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId, profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update profile');
      }
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  static async uploadProfilePicture(userId, file) {
    try {
      if (!file) {
        throw new Error('No file selected');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading profile picture for user:', userId);
      console.log('File type:', file.type);
      console.log('File size:', file.size);

      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}/upload-picture`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to upload profile picture');
      }
      
      return data;
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  }

  static async getServices(skill = null) {
    try {
      const url = skill ? `${API_BASE_URL}/services?skill=${encodeURIComponent(skill)}` : `${API_BASE_URL}/services`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch services');
      }
      
      return data;
    } catch (error) {
      console.error('Get services error:', error);
      throw error;
    }
  }

  static async getProviderServiceRequests(providerId, locationFilter = null, maxDistance = null) {
    try {
      console.log('Fetching service requests for provider:', providerId, 'Location filter:', locationFilter, 'Max distance:', maxDistance);
      
      // Build URL with query parameters
      let url = `${API_BASE_URL}/service-requests/provider/${providerId}`;
      const params = new URLSearchParams();
      
      if (locationFilter) {
        params.append('location_filter', locationFilter);
      }
      
      if (maxDistance) {
        params.append('max_distance', maxDistance.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Success data:', data);
      
      // Don't throw error for non-existent providers, return the data with error info
      if (!response.ok && response.status !== 200) {
        throw new Error(data.detail || `HTTP ${response.status}: Failed to fetch service requests`);
      }
      
      return data;
    } catch (error) {
      console.error('Get provider service requests error:', error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // Return empty result instead of throwing network error
        return {
          service_requests: [],
          error: 'Network error: Unable to connect to server. Please check your internet connection.'
        };
      }
      // Return empty result for other errors too
      return {
        service_requests: [],
        error: error.message || 'Failed to fetch service requests'
      };
    }
  }

  static async rejectServiceRequest(requestId, providerId, reason = 'Not interested') {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          provider_id: providerId,
          reason: reason
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reject service request');
      }
      
      return data;
    } catch (error) {
      console.error('Reject service request error:', error);
      throw error;
    }
  }

  static async acceptServiceRequest(requestId, providerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider_id: providerId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to accept service request');
      }
      
      return data;
    } catch (error) {
      console.error('Accept service request error:', error);
      throw error;
    }
  }

  static async updateServiceRequestStatus(requestId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update service request status');
      }
      
      return data;
    } catch (error) {
      console.error('Update service request status error:', error);
      throw error;
    }
  }

  static async getCustomerNotifications(customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/customer/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch notifications');
      }
      
      return data;
    } catch (error) {
      console.error('Get customer notifications error:', error);
      throw error;
    }
  }

  // Service Request endpoints
  static async createServiceRequest(serviceRequestData) {
    try {
      console.log('Creating service request with data:', serviceRequestData);

      const response = await fetch(`${API_BASE_URL}/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceRequestData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to create service request (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Service request created:', data);
      
      return data;
      
    } catch (error) {
      console.error('Create service request error:', error);
      throw error;
    }
  }

  static async getCustomerServiceRequests(customerId) {
    try {
      console.log('Getting service requests for customer:', customerId);

      const response = await fetch(`${API_BASE_URL}/service-requests/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to fetch service requests (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Customer service requests:', data);
      
      return data;
      
    } catch (error) {
      console.error('Get customer service requests error:', error);
      throw error;
    }
  }

  static async getServiceRequestStatus(requestId) {
    try {
      console.log('Getting service request status for request:', requestId);
      console.log('Current stored requests:', serviceRequestsStorage);
      
      // Find the request in our in-memory storage
      const request = serviceRequestsStorage.find(req => req.id === parseInt(requestId));
      
      if (!request) {
        console.log('Request not found:', requestId);
        throw new Error('Service request not found');
      }
      
      console.log('Found request:', request);
      return request;
      
    } catch (error) {
      console.error('Get service request status error:', error);
      throw error;
    }
  }

  static async getProvidersBySkill(skill) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-providers/by-skill/${encodeURIComponent(skill)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch providers by skill');
      }
      
      return data;
    } catch (error) {
      console.error('Get providers by skill error:', error);
      throw error;
    }
  }

  static async getProvidersByCity(city) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-providers/by-city/${encodeURIComponent(city)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch providers by city');
      }
      
      return data;
    } catch (error) {
      console.error('Get providers by city error:', error);
      throw error;
    }
  }

  // Payment endpoints
  static async createPaymentOrder(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create payment order');
      }
      
      return data;
    } catch (error) {
      console.error('Create payment order error:', error);
      throw error;
    }
  }

  static async verifyPayment(orderId, paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Payment verification failed');
      }
      
      return data;
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  }

  static async getCustomerPayments(customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/customer/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch payments');
      }
      
      return data;
    } catch (error) {
      console.error('Get customer payments error:', error);
      throw error;
    }
  }

  // Wallet endpoints
  static async getCustomerWallet(customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/customer/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch wallet');
      }
      
      return data;
    } catch (error) {
      console.error('Get customer wallet error:', error);
      throw error;
    }
  }

  static async addWalletFunds(customerId, amount, paymentMethod = 'card') {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/add-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          amount: amount,
          payment_method: paymentMethod
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add funds to wallet');
      }
      
      return data;
    } catch (error) {
      console.error('Add wallet funds error:', error);
      throw error;
    }
  }

  static async payWithWallet(customerId, serviceRequestId, amount) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          service_request_id: serviceRequestId,
          amount: amount
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Wallet payment failed');
      }
      
      return data;
    } catch (error) {
      console.error('Pay with wallet error:', error);
      throw error;
    }
  }

  // Dashboard endpoints
  static async getCustomerDashboard(customerId) {
    try {
      console.log('Getting customer dashboard for customer:', customerId);

      const response = await fetch(`${API_BASE_URL}/dashboard/customer/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to fetch dashboard data (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Dashboard data:', data);
      
      return data;
      
    } catch (error) {
      console.error('Get customer dashboard error:', error);
      throw error;
    }
  }

  // Service Provider endpoints
  static async getProviderDailyStatus(providerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-provider/${providerId}/daily-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      // Don't throw error for non-existent providers, return the data with error info
      if (!response.ok && response.status !== 200) {
        throw new Error(data.detail || 'Failed to get provider daily status');
      }
      
      return data;
    } catch (error) {
      console.error('Get provider daily status error:', error);
      // Return default status on network error
      return {
        today_accepted: 0,
        max_daily: 3,
        remaining: 3,
        can_accept: true,
        error: 'Network error'
      };
    }
  }

  // Location endpoints
  static async updateUserLocation(userId, locationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update location');
      }
      
      return data;
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  }

  static async getUserLocation(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/location`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch location');
      }
      
      return data;
    } catch (error) {
      console.error('Get location error:', error);
      throw error;
    }
  }

  static async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(`${API_BASE_URL}/location/reverse-geocode?latitude=${latitude}&longitude=${longitude}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reverse geocode');
      }
      
      return data;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      throw error;
    }
  }
}

export default ApiService;
