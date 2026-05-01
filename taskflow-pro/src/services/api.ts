import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ NO quotes
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling global errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login if needed, or let context handle it
    }
    
    if (error.response?.status !== 404) {
       toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
