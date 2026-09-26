import axios from 'axios';

// Dynamically compute backend URL so mobile phones on local Wi-Fi connect to port 5000
const getBaseURL = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:5000/api`;
};

// Create base Axios instance
const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT Bearer token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global error logging
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected API error occurred';
    return Promise.reject(new Error(message));
  }
);

export default API;
