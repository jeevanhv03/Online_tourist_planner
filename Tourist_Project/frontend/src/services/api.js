// api.js - Axios instance with JWT interceptor
import axios from 'axios';

const API = axios.create({
    baseURL: `http://${window.location.hostname}:8080/api`,
    headers: { 'Content-Type': 'application/json' }
});

// Attach JWT to every request
API.interceptors.request.use(config => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, error => Promise.reject(error));

// Handle 401 globally
API.interceptors.response.use(
    response => response,
    error => {
        const isAuthRequest = error.config?.url?.includes('/auth/');
        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
