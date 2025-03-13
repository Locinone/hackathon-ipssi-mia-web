import { ApiResponse, Comment, FollowResponse, Post, UnfollowResponse } from '@/types';

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
        try {
            console.log(`Service - Suppression du like pour le post ${postId}`);
            const response = await api.fetchRequest(
                `${this.apiUrl}/likes/${postId}/delete`,
                'DELETE',
                null,
                true
            );

            if (!response.success) {
                console.error('Service - Erreur lors de la suppression du like:', response.message);
                throw new Error(response.message || 'Erreur lors de la suppression du like');
            }

            console.log('Service - Like supprimé avec succès');
            return response;
        } catch (error) {
            console.error('Service - Exception lors de la suppression du like:', error);
            throw error;
        }
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
        try {
            console.log(`Service - Suppression du dislike pour le post ${postId}`);
            const response = await api.fetchRequest(
                `${this.apiUrl}/dislikes/${postId}/delete`,
                'DELETE',
                null,
                true
            );

            if (!response.success) {
                console.error(
                    'Service - Erreur lors de la suppression du dislike:',
                    response.message
                );
                throw new Error(response.message || 'Erreur lors de la suppression du dislike');
            }

            console.log('Service - Dislike supprimé avec succès');
            return response;
        } catch (error) {
            console.error('Service - Exception lors de la suppression du dislike:', error);
            throw error;
        }
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
        try {
            console.log(`Service - Suppression du commentaire ${commentId} du post ${postId}`);
            const response = await api.fetchRequest(
                `${this.apiUrl}/comments/${postId}/${commentId}/delete`,
                'DELETE',
                null,
                true
            );

            if (!response.success) {
                console.error(
                    'Service - Erreur lors de la suppression du commentaire:',
                    response.message
                );
                throw new Error(response.message || 'Erreur lors de la suppression du commentaire');
            }

            console.log('Service - Commentaire supprimé avec succès');
            return response;
        } catch (error) {
            console.error('Service - Exception lors de la suppression du commentaire:', error);
            throw error;
        }
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
        try {
            console.log(`Service - Suppression du retweet pour le post ${postId}`);
            const response = await api.fetchRequest(
                `${this.apiUrl}/retweets/${postId}/delete`,
                'DELETE',
                null,
                true
            );

            if (!response.success) {
                console.error(
                    'Service - Erreur lors de la suppression du retweet:',
                    response.message
                );
                throw new Error(response.message || 'Erreur lors de la suppression du retweet');
            }

            console.log('Service - Retweet supprimé avec succès');
            return response;
        } catch (error) {
            console.error('Service - Exception lors de la suppression du retweet:', error);
            throw error;
        }
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
        try {
            console.log(`Service - Suppression du signet pour le post ${postId}`);
            const response = await api.fetchRequest(
                `${this.apiUrl}/bookmarks/${postId}/delete`,
                'DELETE',
                null,
                true
            );

            if (!response.success) {
                console.error(
                    'Service - Erreur lors de la suppression du signet:',
                    response.message
                );
                throw new Error(response.message || 'Erreur lors de la suppression du signet');
            }

            console.log('Service - Signet supprimé avec succès');
            return response;
        } catch (error) {
            console.error('Service - Exception lors de la suppression du signet:', error);
            throw error;
        }
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

    /**
     * Suivre un utilisateur
     * @param userId ID de l'utilisateur à suivre
     */
    public async followUser(userId: string): Promise<ApiResponse<FollowResponse>> {
        try {
            console.log(`Service - Suivre l'utilisateur ${userId}`);
            const response = await api.fetchRequest(
                `${this.apiUrl}/follow/${userId}`,
                'POST',
                null,
                true
            );

            if (!response.success) {
                console.error("Service - Erreur lors du suivi de l'utilisateur:", response.message);
                throw new Error(response.message || "Erreur lors du suivi de l'utilisateur");
            }

            console.log('Service - Utilisateur suivi avec succès:', response.data);
            return response;
        } catch (error) {
            console.error("Service - Exception lors du suivi de l'utilisateur:", error);
            throw error;
        }
    }

    /**
     * Ne plus suivre un utilisateur
     * @param userId ID de l'utilisateur à ne plus suivre
     */
    public async unfollowUser(userId: string): Promise<ApiResponse<UnfollowResponse>> {
        try {
            console.log(`Service - Ne plus suivre l'utilisateur ${userId}`);
            const response = await api.fetchRequest(
                `${this.apiUrl}/unfollow/${userId}`,
                'DELETE',
                null,
                true
            );

            if (!response.success) {
                console.error('Service - Erreur lors du désabonnement:', response.message);
                throw new Error(response.message || 'Erreur lors du désabonnement');
            }

            console.log('Service - Désabonnement effectué avec succès:', response.data);
            return response;
        } catch (error) {
            console.error('Service - Exception lors du désabonnement:', error);
            throw error;
        }
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
