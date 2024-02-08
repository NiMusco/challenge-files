import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include the token in every request
api.interceptors.request.use((config) => {
    // Check if the request is not for the /login endpoint
    if (!config?.url?.endsWith('/auth/login')) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to redirect to login on a 401 response
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
