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

    async register(userData) {
        try {
            // Création d'un FormData pour gérer les fichiers si nécessaire
            const formData = new FormData();

            // Ajout des données textuelles
            formData.append('username', userData.username);
            formData.append('email', userData.email);
            formData.append('password', userData.password);
            formData.append('acceptNotification', userData.acceptNotification);
            formData.append('acceptTerms', userData.acceptTerms);
            formData.append('acceptCamera', userData.acceptCamera);

            // Ajout des fichiers s'ils existent
            if (userData.image) {
                formData.append('image', userData.image);
            }

            if (userData.banner) {
                formData.append('banner', userData.banner);
            }

            const response = await api.post('/auth/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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

const userService = new UserService();

export default userService;
