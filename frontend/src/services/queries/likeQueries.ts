import { toast } from 'react-toastify';

import { useMutation, useQuery } from '@tanstack/react-query';

import { likeService } from '../likeService';

export const useCreateLike = () => {
    return useMutation({
        mutationFn: async (postId: string) => {
            const response = await likeService.createLike(postId);
            return response;
        },
        onSuccess: () => {
            toast.success('Post liké avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors du like du post');
        },
    });
};

export const useDeleteLike = () => {
    return useMutation({
        mutationFn: async (postId: string) => {
            const response = await likeService.deleteLike(postId);
            return response;
        },
        onSuccess: () => {
            toast.success('Like retiré avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors du retrait du like');
        },
    });
};

export const useGetLikesByPost = (postId: string | undefined) => {
    return useQuery({
        queryKey: ['likes', 'post', postId],
        queryFn: async () => {
            if (!postId) {
                return { success: true, message: 'Aucun post spécifié', data: [] };
            }
            return await likeService.getLikesByPost(postId);
        },
        enabled: !!postId,
    });
};

export const useGetLikesByUser = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['likes', 'user', userId],
        queryFn: async () => {
            if (!userId) {
                return { success: true, message: 'Aucun utilisateur spécifié', data: [] };
            }
            return await likeService.getLikesByUser(userId);
        },
        enabled: !!userId,
    });
};
