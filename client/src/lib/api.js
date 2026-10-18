import axios from 'axios';

// Centralized API client. Base URL comes from env (VITE_API_URL) with a dev fallback.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
    timeout: 20000,
});

// Attach JWT bearer token to every request.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout on 401 and surface a normalized error message.
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!location.pathname.startsWith('/login')) {
                location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
