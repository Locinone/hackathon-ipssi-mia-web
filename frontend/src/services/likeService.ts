import { ApiResponse, Post } from '@/types';

import { api } from './api';

// Définition d'un type local pour Like si non disponible dans @/types
interface Like {
    _id: string;
    post: string;
    user: string;
    createdAt: string;
}

class LikeService {
    private apiUrl = '/api/likes';
    private interactionApiUrl = '/api/interactions';

    public async createLike(postId: string): Promise<ApiResponse<any>> {
        const response = await api.fetchRequest(`${this.apiUrl}/${postId}/create`, 'POST', {
            postId,
        });
        return response;
    }

    public async deleteLike(postId: string): Promise<ApiResponse<any>> {
        const response = await api.fetchRequest(`${this.apiUrl}/${postId}/delete`, 'DELETE');
        return response;
    }

    public async getLikesByPost(postId: string): Promise<ApiResponse<Like[]>> {
        const response = await api.fetchRequest(`${this.apiUrl}/post/${postId}`, 'GET');
        return response as ApiResponse<Like[]>;
    }

    public async getLikesByUser(userId: string): Promise<ApiResponse<Post[]>> {
        console.log(`Récupération des likes pour l'utilisateur: ${userId}`);

        // Utiliser la route correcte
        const response = await api.fetchRequest(
            `${this.interactionApiUrl}/likes/user/${userId}`,
            'GET'
        );

        console.log('Réponse API likes:', response);
        return response as ApiResponse<Post[]>;
    }
}

export const likeService = new LikeService();
