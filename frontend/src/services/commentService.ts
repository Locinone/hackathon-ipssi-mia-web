import { ApiResponse, Comment } from '@/types';

import { api } from './api';

class CommentService {
    private apiUrl = '/api/comments';

    public async createComment(data: FormData): Promise<ApiResponse<Comment>> {
        // Débogage pour voir les données envoyées
        for (const [key, value] of data.entries()) {
            console.log(key, value);
        }

        // Vérifier que le contenu est bien présent dans FormData
        if (!data.get('content')) {
            console.error('Le contenu est manquant dans FormData');
        }

        const response = await api.fetchMultipartRequest(
            `${this.apiUrl}/create`,
            'POST',
            data,
            true
        );
        return response;
    }

    public async getComments(): Promise<ApiResponse<Comment[]>> {
        const response = await api.fetchRequest(`${this.apiUrl}/`, 'GET');
        return response as ApiResponse<Comment[]>;
    }

    public async getCommentsByUserId(userId: string): Promise<ApiResponse<Comment[]>> {
        console.log(`Récupération des commentaires pour l'utilisateur: ${userId}`);
        const response = await api.fetchRequest(`${this.apiUrl}/user/${userId}`, 'GET');
        console.log('Réponse API commentaires:', response);
        return response as ApiResponse<Comment[]>;
    }

    public async getCommentsByPostId(postId: string): Promise<ApiResponse<Comment[]>> {
        const response = await api.fetchRequest(`${this.apiUrl}/post/${postId}`, 'GET');
        return response as ApiResponse<Comment[]>;
    }

    public async deleteComment(commentId: string): Promise<ApiResponse<any>> {
        const response = await api.fetchRequest(`${this.apiUrl}/delete/${commentId}`, 'DELETE');
        return response;
    }
}

export const commentService = new CommentService();
