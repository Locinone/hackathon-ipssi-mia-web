import { ApiResponse, Post } from '@/types';

import { api } from './api';

class PostService {
    private apiUrl = '/api/posts';

    public async createPost(data: FormData): Promise<ApiResponse<Post>> {
        const response = await api.fetchMultipartRequest(`${this.apiUrl}/register`, 'POST', data);
        return response;
    }

    public async getPosts(): Promise<ApiResponse<Post>> {
        const response = await api.fetchRequest(`${this.apiUrl}/`, 'GET');
        return response;
    }
}

export const postService = new PostService();
