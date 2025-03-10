import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Gestion des erreurs d'authentification
        if (error.response && error.response.status === 401) {
            Cookies.remove('token');
            window.location.href = '/login';
        }
        return Promise.reject(error.response ? error.response.data : error);
    }
);

export default api;
