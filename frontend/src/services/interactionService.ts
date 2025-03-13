import { ApiResponse, Comment, Post, User } from '@/types';

import { api } from './api';

class InteractionService {
    private apiUrl = '/api/interactions';

    public async createLike(postId: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/likes/${postId}/create`,
            'POST',
            null,
            true
        );
        return response.data;
    }

    public async deleteLike(postId: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/likes/${postId}/delete`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    public async createDislike(postId: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/dislikes/${postId}/create`,
            'POST',
            null,
            true
        );
        return response.data;
    }

    public async deleteDislike(postId: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/dislikes/${postId}/delete`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    // Comments

    public async createComment(postId: string, comment: string): Promise<ApiResponse<Comment>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/comments/${postId}/create`,
            'POST',
            { comment },
            true
        );
        return response.data;
    }

    public async deleteComment(postId: string, commentId: string): Promise<ApiResponse<Comment>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/comments/${postId}/${commentId}/delete`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    public async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
        const response = await api.fetchRequest(`${this.apiUrl}/comments/${postId}`, 'GET', null);
        return response.data;
    }

    public async answerComment(commentId: string, answer: string): Promise<ApiResponse<Comment>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/comments/${commentId}/answer`,
            'POST',
            { answer },
            true
        );
        return response.data;
    }

    // Retweet

    public async createRetweet(postId: string, content?: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/retweets/${postId}/create`,
            'POST',
            content ? { content } : null,
            true
        );
        return response.data;
    }

    public async deleteRetweet(postId: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/retweets/${postId}/delete`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    // Signets

    public async createBookmark(postId: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/bookmarks/${postId}/create`,
            'POST',
            null,
            true
        );
        return response.data;
    }

    public async deleteBookmark(postId: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/bookmarks/${postId}/delete`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    public async getUserBookmarks(): Promise<ApiResponse<Post[]>> {
        try {
            console.log("Service - Récupération des bookmarks de l'utilisateur");
            const response = await api.fetchRequest(
                `${this.apiUrl}/bookmarks/user`,
                'GET',
                null,
                true
            );

            if (!response.success) {
                console.error(
                    'Service - Erreur lors de la récupération des bookmarks:',
                    response.message
                );
                throw new Error(response.message || 'Erreur lors de la récupération des bookmarks');
            }

            const bookmarks = Array.isArray(response.data) ? response.data : [];
            console.log('Service - Bookmarks récupérés:', bookmarks.length, 'éléments');
            return bookmarks;
        } catch (error) {
            console.error('Service - Exception lors de la récupération des bookmarks:', error);
            throw error;
        }
    }

    public async followUser(userId: string): Promise<ApiResponse<User>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/followers/${userId}/follow`,
            'POST',
            null,
            true
        );
        return response.data;
    }

    public async unfollowUser(userId: string): Promise<ApiResponse<User>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/followers/${userId}/unfollow`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    public async getUserRetweets(userId: string) {
        try {
            console.log(`Récupération des retweets pour l'utilisateur: ${userId}`);
            const response = await api.fetchRequest(
                `${this.apiUrl}/retweets/user/${userId}`,
                'GET',
                null
            );

            if (!response.success) {
                console.error(
                    'Service - Erreur lors de la récupération des retweets:',
                    response.message
                );
                throw new Error(response.message || 'Erreur lors de la récupération des retweets');
            }

            const retweets = Array.isArray(response.data) ? response.data : [];
            console.log('Service - Retweets récupérés:', retweets.length, 'éléments');
            return retweets;
        } catch (error) {
            console.error('Service - Exception lors de la récupération des retweets:', error);
            throw error;
        }
    }
}

export const interactionService = new InteractionService();
