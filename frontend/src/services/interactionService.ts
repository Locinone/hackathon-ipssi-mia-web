import { api } from './api';

class InteractionService {
    private apiUrl = '/api/interactions';

    public async createLike(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/likes/${postId}/create`,
            'POST',
            null,
            true
        );
        return response.data;
    }

    public async deleteLike(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/likes/${postId}/delete`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    public async createDislike(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/dislikes/${postId}/create`,
            'POST',
            null,
            true
        );
        return response.data;
    }

    public async deleteDislike(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/dislikes/${postId}/delete`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    // Comments

    public async createComment(postId: string, comment: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/comments/${postId}/create`,
            'POST',
            { comment },
            true
        );
        return response.data;
    }

    public async deleteComment(postId: string, commentId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/comments/${postId}/${commentId}/delete`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    public async getComments(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/comments/${postId}`,
            'GET',
            null,
            true
        );
        return response.data;
    }

    public async answerComment(commentId: string, answer: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/comments/${commentId}/answer`,
            'POST',
            { answer },
            true
        );
        return response.data;
    }

    // Retweet

    public async createRetweet(postId: string, content?: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/retweets/${postId}/create`,
            'POST',
            content ? { content } : null,
            true
        );
        return response.data;
    }

    public async deleteRetweet(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/retweets/${postId}/delete`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    // Signets

    public async createBookmark(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/bookmarks/${postId}/create`,
            'POST',
            null,
            true
        );
        return response.data;
    }

    public async deleteBookmark(postId: string) {
        const response = await api.fetchRequest(
            `${this.apiUrl}/bookmarks/${postId}/delete`,
            'DELETE',
            null,
            true
        );
        return response.data;
    }

    public async getUserBookmarks() {
        const response = await api.fetchRequest(`${this.apiUrl}/bookmarks/user`, 'GET', null, true);
        return response.data;
    }
}

export const interactionService = new InteractionService();
