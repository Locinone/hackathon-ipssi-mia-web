import Cookies from 'js-cookie';

import api from './api';

class UserService {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.token) {
                Cookies.set('token', response.token, { expires: 7 });
            }
            return response;
        } catch (error) {
            return { error: error.message || 'Échec de la connexion' };
        }
    }

    async register(username, email, password) {
        try {
            const response = await api.post('/auth/register', { username, email, password });
            if (response.token) {
                Cookies.set('token', response.token, { expires: 7 });
            }
            return response;
        } catch (error) {
            return { error: error.message || "Échec de l'inscription" };
        }
    }

    logout() {
        Cookies.remove('token');
    }

    async getCurrentUser() {
        try {
            return await api.get('/users/me');
        } catch (error) {
            return {
                error: error.message || 'Impossible de récupérer les informations utilisateur',
            };
        }
    }

    isAuthenticated() {
        return !!Cookies.get('token');
    }
}

export default UserService;
