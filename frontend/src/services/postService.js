import api from './api';

class PostService {
    async createPost(postData) {
        try {
            const formData = new FormData();

            formData.append('content', postData.content);

            if (postData.files && postData.files.length > 0) {
                for (let i = 0; i < postData.files.length; i++) {
                    formData.append('files', postData.files[i]);
                }
            }

            const response = await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response;
        } catch (error) {
            return { error: error.message || 'Échec de la création du post' };
        }
    }

    async getPosts(page = 1, limit = 10) {
        try {
            return await api.get(`/posts?page=${page}&limit=${limit}`);
        } catch (error) {
            return { error: error.message || 'Impossible de récupérer les posts' };
        }
    }

    async getPostById(postId) {
        try {
            return await api.get(`/posts/${postId}`);
        } catch (error) {
            return { error: error.message || 'Impossible de récupérer le post' };
        }
    }
}

const postService = new PostService();

export default postService;
