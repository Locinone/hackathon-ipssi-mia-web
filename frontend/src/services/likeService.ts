import { ApiResponse, Post } from '@/types';

import { api } from './api';

class LikeService {
    private apiUrl = '/api/likes';
    private interactionApiUrl = '/api/interactions';

    public async createLike(postId: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(`${this.apiUrl}/${postId}/create`, 'POST', {
            postId,
        });
        return response;
    }

    public async deleteLike(postId: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(`${this.apiUrl}/${postId}/delete`, 'DELETE');
        return response;
    }

    public async getLikesByPost(postId: string): Promise<ApiResponse<Post[]>> {
        const response = await api.fetchRequest(`${this.apiUrl}/post/${postId}`, 'GET');
        return response;
    }

    public async getLikesByUser(userId: string): Promise<ApiResponse<Post[]>> {
        console.log(`Récupération des likes pour l'utilisateur: ${userId}`);

        // Utiliser la route correcte
        const response = await api.fetchRequest(
            `${this.interactionApiUrl}/likes/user/${userId}`,
            'GET'
        );

        console.log('Réponse API likes:', response);
        return response;
    }
}

export const likeService = new LikeService();
