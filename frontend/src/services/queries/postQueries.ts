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

export const useGetPosts = () => {
    return useQuery({
        queryKey: ['posts'],
        queryFn: () => postService.getPosts(),
    });
};
