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

    public async getPosts(
        h: string | undefined,
        u: string | undefined,
        s: string | undefined,
        sd: string | undefined,
        ed: string | undefined,
        order: string | undefined
    ): Promise<ApiResponse<Post[]>> {
        let finalUrl = `${this.apiUrl}`;
        const params = new URLSearchParams();
        if (h) params.append('h', h);
        if (u) params.append('u', u);
        if (s) params.append('s', s);
        if (sd) params.append('sd', sd);
        if (ed) params.append('ed', ed);
        if (order) params.append('order', order);
        if (params.toString()) finalUrl += `?${params.toString()}`;

        const response = await api.fetchRequest(finalUrl, 'GET', null, true);
        return response;
    }

    public async getPostsByUserId(userId: string): Promise<ApiResponse<Post[]>> {
        const response = await api.fetchRequest(`${this.apiUrl}/user/${userId}`, 'GET', null, true);
        return response;
    }

    public async getPostById(id: string): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(`${this.apiUrl}/${id}`, 'GET', null, true);
        return response;
    }
}

export const postService = new PostService();
