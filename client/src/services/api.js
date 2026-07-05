import axios from 'axios';

// Create an instance of axios with the backend base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle common API errors (like token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user from localStorage if unauthorized (e.g. token expired)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login, but we let AuthContext state changes handle the render redirect
    }
    return Promise.reject(error);
  }
);

export default api;
