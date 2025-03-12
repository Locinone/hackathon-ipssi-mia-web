import { ApiResponse, AuthResponse } from '@/types';

import Cookies from 'js-cookie';

class Interceptor {
    private url: string;

    constructor() {
        this.url = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000';
        console.log('API Base URL:', this.url);
    }

    public getUrl(): string {
        return this.url;
    }

    private createHeaders(includeAuth: boolean = false, isFormData: boolean = false): HeadersInit {
        const headers: HeadersInit = {};

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (includeAuth) {
            const token = Cookies.get('accessToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Gestion des erreurs 401 et retry
    private async handleUnauthorizedRequest(
        response: Response,
        retryRequest: () => Promise<Response>
    ): Promise<Response> {
        if (response.status === 401) {
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
                const newToken = await this.getNewAccessToken(refreshToken);

                if (newToken && newToken.accessToken) {
                    return retryRequest();
                }
            }
        }
        return response;
    }

    public async fetchMultipartRequest(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        body: any = null,
        includeAuth: boolean = false
    ): Promise<any> {
        const isFormData = body instanceof FormData;
        const fullUrl = `${this.url}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        console.log('Making request to:', fullUrl);

        const options: RequestInit = {
            method,
            headers: {
                ...this.createHeaders(includeAuth, isFormData),
            },
        };

        if (body) {
            options.body = isFormData ? body : JSON.stringify(body);
        }

        try {
            const response = await fetch(fullUrl, options);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    errorData = { message: response.statusText };
                }
                throw new Error(
                    errorData.message || `${method} request failed: ${response.statusText}`
                );
            }

            try {
                return await response.json();
            } catch (jsonError) {
                return { success: true };
            }
        } catch (error: any) {
            console.error('Request error:', error);
            throw new Error(error.message || 'Une erreur est survenue lors de la requête');
        }
    }

    // Fonction générique pour gérer toutes les requêtes HTTP
    public async fetchRequest<T>(
        url: string,
        method: string,
        data: any = null,
        auth: boolean = false
    ): Promise<ApiResponse<T>> {
        try {
            console.log(`API - Requête ${method} à ${url}`, { data, auth });

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (auth) {
                // Vérifier d'abord le token dans les cookies
                let token = Cookies.get('accessToken');

                // Si pas trouvé, essayer dans localStorage (pour la compatibilité)
                if (!token) {
                    token = localStorage.getItem('token');
                }

                if (!token) {
                    console.error("API - Token d'authentification manquant");
                    return {
                        success: false,
                        message: 'Veuillez vous connecter pour accéder à cette fonctionnalité',
                        data: null,
                    };
                }

                headers['Authorization'] = `Bearer ${token}`;
                console.log('API - Token utilisé:', token.substring(0, 10) + '...');
            }

            const options: RequestInit = {
                method,
                headers,
                credentials: 'include',
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                options.body = JSON.stringify(data);
                console.log('API - Corps de la requête:', options.body);
            }

            console.log(`API - URL complète: ${this.url}${url}`);
            console.log('API - Options:', JSON.stringify(options));

            const response = await fetch(`${this.url}${url}`, options);
            console.log(`API - Statut de la réponse: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API - Erreur réponse:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText,
                });

                try {
                    // Tenter de parser comme JSON
                    const errorData = JSON.parse(errorText);
                    throw {
                        status: response.status,
                        message: errorData.message || response.statusText,
                        data: errorData,
                    };
                } catch (e) {
                    // Si ce n'est pas du JSON, utiliser le texte brut
                    throw {
                        status: response.status,
                        message: errorText || response.statusText,
                    };
                }
            }

            const responseData = await response.json();
            console.log('API - Données reçues:', responseData);

            // Normalisation de la réponse
            // Si la réponse a déjà le format ApiResponse, la retourner telle quelle
            if ('success' in responseData) {
                return responseData as ApiResponse<T>;
            }

            // Si la réponse a une structure avec status, message, data, la convertir
            if ('status' in responseData) {
                const normalizedResponse: ApiResponse<T> = {
                    success: responseData.status >= 200 && responseData.status < 300,
                    message: responseData.message || '',
                    data: responseData.data as T,
                };
                console.log('API - Réponse normalisée:', normalizedResponse);
                return normalizedResponse;
            }

            // Format de réponse inconnu, essayer de l'adapter au mieux
            return {
                success: true,
                message: 'Opération réussie',
                data: responseData as unknown as T,
            };
        } catch (error) {
            console.error('API - Erreur lors de la requête:', error);

            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error(
                    "API - Erreur de connexion au serveur. Vérifiez que le backend est en cours d'exécution."
                );
                return {
                    success: false,
                    message:
                        'Impossible de se connecter au serveur. Vérifiez votre connexion internet ou que le serveur est en ligne.',
                    data: null,
                };
            }

            // Formater la réponse d'erreur
            return {
                success: false,
                message:
                    error instanceof Error ? error.message : 'Erreur inconnue lors de la requête',
                data: null,
            };
        }
    }

    // Récupération d'un nouveau token via le refresh token
    public async getNewAccessToken(refreshToken: string): Promise<AuthResponse | null> {
        const response = await this.fetchRequest('/api/auth/refresh', 'POST', {
            token: refreshToken,
        });

        if (response.token) {
            Cookies.set('accessToken', response.token, { expires: 1 }); // expire dans 1 jour
        }

        if (response.refreshToken) {
            Cookies.set('refreshToken', response.refreshToken, { expires: 30 }); // expire dans 30 jours
        }

        return response || null;
    }
}

export const api = new Interceptor();
