import { ApiResponse, Post } from '@/types';

import { api } from './api';

class PostService {
    private apiUrl = '/api/posts';

    public async createPost(data: FormData): Promise<ApiResponse<Post>> {
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

    public async getPosts(): Promise<ApiResponse<Post[]>> {
        const response = await api.fetchRequest(`${this.apiUrl}/`, 'GET');
        return response as ApiResponse<Post[]>;
    }

    public async getPostsByUserId(userId: string): Promise<ApiResponse<Post[]>> {
        const response = await api.fetchRequest(`${this.apiUrl}/user/${userId}`, 'GET');
        return response as ApiResponse<Post[]>;
    }
}

export const postService = new PostService();
