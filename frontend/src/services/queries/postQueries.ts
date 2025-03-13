import { toast } from 'react-toastify';

import { useMutation, useQuery } from '@tanstack/react-query';

import { postService } from '../postService';

export const useCreatePost = () => {
    return useMutation({
        mutationFn: async (data: FormData) => {
            const response = await postService.createPost(data);
            return response;
        },
        onSuccess: () => {
            toast.success('Post créé avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de la création du post');
        },
    });
};

export const useGetPosts = (
    h?: string,
    u?: string,
    s?: string,
    sd?: string,
    ed?: string,
    order?: string
) => {
    return useQuery({
        queryKey: ['posts', h, u, s, sd, ed, order],
        queryFn: () => postService.getPosts(h, u, s, sd, ed, order),
    });
};

export const useGetPostById = (id: string) => {
    return useQuery({
        queryKey: ['post', id],
        queryFn: () => postService.getPostById(id),
    });
};

export const useGetPostsByUserId = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['posts', userId],
        queryFn: async () => {
            if (!userId) {
                return { success: true, message: 'Aucun utilisateur spécifié', data: [] };
            }
            return await postService.getPostsByUserId(userId);
        },
        enabled: !!userId, // La requête ne s'exécute que si userId existe
    });
};
