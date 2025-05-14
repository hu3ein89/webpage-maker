import defaultBanner from '../assets/default.png'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Content Operations
export const fetchContent = async () => {
  try {
    // First try to get from server
    const data = await apiRequest('/content');
    return data;
  } catch (error) {
    console.warn('Failed to fetch from server, using local storage:', error);
    // Fallback to localStorage
    const localContent = localStorage.getItem('websiteContent');
    return localContent ? JSON.parse(localContent) : getDefaultContent();
  }
};

export const updateContent = async (content) => {
  try {
    // Try to save to server first
    const data = await apiRequest('/content', 'PUT', content);
    
    // Also save to localStorage as backup
    localStorage.setItem('websiteContent', JSON.stringify(content));
    
    return data;
  } catch (error) {
    console.warn('Failed to save to server, using local storage:', error);
    // Fallback to localStorage
    localStorage.setItem('websiteContent', JSON.stringify(content));
    return content;
  }
};

// Auth Operations
export const login = async (credentials) => {
  return apiRequest('/auth/login', 'POST', credentials);
};

export const logout = async () => {
  return apiRequest('/auth/logout', 'POST');
};

// Image Operations
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  return response.json();
};

// Helper function for default content
const getDefaultContent = () => ({
  banner: {
    title: 'Welcome to Our Website',
    subtitle: 'Discover amazing content',
    backgroundImage: null,
    ctaText: 'Learn More',
    ctaLink: '#'
  },
  sections: []
});

export default {
  fetchContent,
  updateContent,
  login,
  logout,
  uploadImage
};