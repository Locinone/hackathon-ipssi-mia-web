import { CommentSchema } from '@/schemas/postSchemas';
import { ApiResponse, Comment } from '@/types';

import { api } from './api';

class CommentService {
    private apiUrl = '/api/comments';

    public async createComment(data: CommentSchema): Promise<ApiResponse<Comment>> {
        // Débogage pour voir les données envoyées
        const response = await api.fetchRequest(`${this.apiUrl}/create`, 'POST', data, true);
        return response;
    }

    public async getComments(): Promise<ApiResponse<Comment[]>> {
        const response = await api.fetchRequest(`${this.apiUrl}/`, 'GET');
        return response;
    }

    public async getCommentsByUserId(userId: string): Promise<ApiResponse<Comment[]>> {
        console.log(`Récupération des commentaires pour l'utilisateur: ${userId}`);
        const response = await api.fetchRequest(`${this.apiUrl}/user/${userId}`, 'GET');
        console.log('Réponse API commentaires:', response);
        return response;
    }

    public async getCommentsByPostId(postId: string): Promise<ApiResponse<Comment[]>> {
        try {
            const response = await api.fetchRequest(`${this.apiUrl}/post/${postId}`, 'GET');

            // Transformation des données pour gérer les réponses imbriquées si nécessaire
            if (response.data) {
                response.data = this.processCommentReplies(response.data);
            }

            return response;
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
            throw error;
        }
    }

    public async deleteComment(commentId: string): Promise<ApiResponse<Comment>> {
        const response = await api.fetchRequest(`${this.apiUrl}/delete/${commentId}`, 'DELETE');
        return response;
    }

    public async replyToComment(data: {
        content: string;
        commentId: string;
    }): Promise<ApiResponse<Comment>> {
        try {
            console.log('REPLY', data);
            const response = await api.fetchRequest(`${this.apiUrl}/reply`, 'POST', data, true);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la réponse au commentaire:', error);
            throw error;
        }
    }

    public async getRepliesByComment(commentId: string): Promise<ApiResponse<Comment[]>> {
        const response = await api.fetchRequest(`${this.apiUrl}/replies/${commentId}`, 'GET');
        return response;
    }

    // Méthode pour traiter les réponses imbriquées
    private processCommentReplies(comments: any[]): Comment[] {
        return comments.map((comment) => {
            // Si le commentaire a des réponses, les traiter récursivement
            if (comment.replies && Array.isArray(comment.replies)) {
                comment.replies = this.processCommentReplies(comment.replies);
            }
            return comment;
        });
    }
}

export const commentService = new CommentService();
