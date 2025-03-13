import { LoginFormData } from '@/schemas/authSchemas';
import { ApiResponse, User } from '@/types';

import Cookies from 'js-cookie';

import { api } from './api';

class UserService {
    private apiUrl = '/api/users';
    private url = 'http://localhost:3000'; // URL de base du backend

    public async registerUser(data: FormData): Promise<ApiResponse<User>> {
        const response = await api.fetchMultipartRequest(`${this.apiUrl}/register`, 'POST', data);
        return response as ApiResponse<User>;
    }

    public async loginUser(
        data: LoginFormData
    ): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
        const response = await api.fetchRequest(`${this.apiUrl}/login`, 'POST', data);
        return response as ApiResponse<{ user: User; token: string; refreshToken: string }>;
    }

    public async getCurrentUser(): Promise<ApiResponse<User>> {
        const response = await api.fetchRequest(`${this.apiUrl}/me`, 'GET');
        return response as ApiResponse<User>;
    }

    public async getUserProfile(username: string): Promise<ApiResponse<User>> {
        try {
            console.log(`Service - Récupération du profil pour: ${username}`);
            const response = await api.fetchRequest(`${this.apiUrl}/profile/${username}`, 'GET');
            console.log(`Service - Réponse pour ${username}:`, JSON.stringify(response));

            // Vérifier si la réponse a le format attendu
            if (!response.data && response.message && typeof response.message === 'object') {
                // Si les données sont dans message, les déplacer vers data pour être cohérent
                console.log('Service - Données trouvées dans message, adaptation du format');
                return {
                    success: true,
                    message: 'Profil utilisateur récupéré',
                    data: response.message as User,
                };
            }

            return response as ApiResponse<User>;
        } catch (error) {
            console.error(`Service - Erreur lors de la récupération du profil ${username}:`, error);
            throw error;
        }
    }

    public async getUserFollowers(userId: string): Promise<ApiResponse<User[]>> {
        try {
            console.log(`Service - Récupération des abonnés pour l'utilisateur: ${userId}`);
            const response = await api.fetchRequest(`${this.apiUrl}/followers/${userId}`, 'GET');
            return response as ApiResponse<User[]>;
        } catch (error) {
            console.error(`Service - Erreur lors de la récupération des abonnés:`, error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Erreur inconnue',
                data: [],
            };
        }
    }

    public async getUserFollowing(userId: string): Promise<ApiResponse<User[]>> {
        try {
            console.log(`Service - Récupération des abonnements pour l'utilisateur: ${userId}`);
            const response = await api.fetchRequest(`${this.apiUrl}/following/${userId}`, 'GET');
            return response as ApiResponse<User[]>;
        } catch (error) {
            console.error(`Service - Erreur lors de la récupération des abonnements:`, error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Erreur inconnue',
                data: [],
            };
        }
    }

    public async logoutUser(): Promise<ApiResponse<void>> {
        const response = await api.fetchRequest(`${this.apiUrl}/logout`, 'POST');
        return response as ApiResponse<void>;
    }

    public async deleteUser(): Promise<ApiResponse<void>> {
        try {
            console.log('Service - Suppression du compte utilisateur');
            const response = await api.fetchRequest(`${this.apiUrl}/delete`, 'DELETE');
            console.log('Service - Réponse de suppression:', response);
            return response as ApiResponse<void>;
        } catch (error) {
            console.error('Service - Erreur lors de la suppression du compte:', error);
            throw error;
        }
    }

    public async updateUserProfile(data: Partial<User>): Promise<ApiResponse<User>> {
        try {
            console.log('Service - Données envoyées:', JSON.stringify(data));

            // Récupérer le token d'authentification
            const token = Cookies.get('accessToken') || localStorage.getItem('token');

            if (!token) {
                throw new Error("Token d'authentification manquant");
            }

            // URL complète avec le port du backend (3000)
            const fullUrl = `${this.url}${this.apiUrl}/update`;
            console.log('Service - URL complète:', fullUrl);

            // Appel direct à l'API, similaire à Postman
            const response = await fetch(fullUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            // Vérifier si la réponse est OK
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erreur HTTP:', response.status, errorText);
                throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
            }

            // Parser la réponse JSON
            const responseData = await response.json();
            console.log('Service - Réponse complète:', JSON.stringify(responseData));

            // Construire une réponse standardisée
            return {
                success: true,
                message: 'Profil utilisateur mis à jour avec succès',
                data: responseData.data || responseData.message,
            };
        } catch (error) {
            console.error('Service - Erreur dans updateUserProfile:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Erreur inconnue',
                data: null,
            };
        }
    }
}

export const userService = new UserService();
