import axios from 'axios';

const baseURL =
  process.env.REACT_APP_API_BASE_URL?.trim() || 'http://localhost:8080';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor - surfaces the backend's `message` field on errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
