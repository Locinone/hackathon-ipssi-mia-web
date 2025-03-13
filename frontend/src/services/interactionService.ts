import { api } from './api';

class InteractionService {
    private apiUrl = '/api/interactions';

    public async createLike(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/likes/${postId}/create`,
            'POST',
            null
        );
        return response.data;
    }

    public async deleteLike(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/likes/${postId}/delete`,
            'DELETE',
            null
        );
        return response.data;
    }

    public async createDislike(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/dislikes/${postId}/create`,
            'POST',
            null
        );
        return response.data;
    }

    public async deleteDislike(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/dislikes/${postId}/delete`,
            'DELETE',
            null
        );
        return response.data;
    }

    // Comments

    public async createComment(postId: string, comment: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/comments/${postId}/create`,
            'POST',
            { comment }
        );
        return response.data;
    }

    public async deleteComment(postId: string, commentId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/comments/${postId}/${commentId}/delete`,
            'DELETE',
            null
        );
        return response.data;
    }

    public async getComments(postId: string) {
        const response = await api.fetchRequest(`${this.apiUrl}/comments/${postId}`, 'GET', null);
        return response.data;
    }

    public async answerComment(commentId: string, answer: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/comments/${commentId}/answer`,
            'POST',
            { answer }
        );
        return response.data;
    }

    // Retweet

    public async createRetweet(postId: string, content?: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/retweets/${postId}/create`,
            'POST',
            content ? { content } : null
        );
        return response.data;
    }

    public async deleteRetweet(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/retweets/${postId}/delete`,
            'DELETE',
            null
        );
        return response.data;
    }

    // Signets

    public async createBookmark(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/bookmarks/${postId}/create`,
            'POST',
            null
        );
        return response.data;
    }

    public async deleteBookmark(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/bookmarks/${postId}/delete`,
            'DELETE',
            null
        );
        return response.data;
    }

    public async getUserBookmarks() {
        try {
            console.log("Service - Récupération des bookmarks de l'utilisateur");
            const response = await api.fetchRequest(`${this.apiUrl}/bookmarks/user`, 'GET', null);

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
}

export const interactionService = new InteractionService();
