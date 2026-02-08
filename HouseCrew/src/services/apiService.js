// API Service for HouseCrew
const API_BASE_URL = 'http://localhost:8000/api';

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
}

export default ApiService;
