import { CommentSchema } from '@/schemas/postSchemas';

import { toast } from 'react-toastify';

import { useMutation, useQuery } from '@tanstack/react-query';

import { commentService } from '../commentService';

export const useCreateComment = () => {
    return useMutation({
        mutationFn: async (data: CommentSchema) => {
            const response = await commentService.createComment(data);
            return response;
        },
        onSuccess: () => {
            toast.success('Commentaire ajouté avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'ajout du commentaire");
        },
    });
};

export const useGetComments = () => {
    return useQuery({
        queryKey: ['comments'],
        queryFn: () => commentService.getComments(),
    });
};

export const useGetCommentsByUserId = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['comments', 'user', userId],
        queryFn: async () => {
            if (!userId) {
                return { success: true, message: 'Aucun utilisateur spécifié', data: [] };
            }
            return await commentService.getCommentsByUserId(userId);
        },
        enabled: !!userId, // La requête ne s'exécute que si userId existe
    });
};

export const useGetCommentsByPostId = (postId: string | undefined) => {
    return useQuery({
        queryKey: ['comments', 'post', postId],
        queryFn: async () => {
            if (!postId) {
                return { success: true, message: 'Aucun post spécifié', data: [] };
            }
            return await commentService.getCommentsByPostId(postId);
        },
        enabled: !!postId, // La requête ne s'exécute que si postId existe
    });
};

export const useDeleteComment = () => {
    return useMutation({
        mutationFn: async (commentId: string) => {
            const response = await commentService.deleteComment(commentId);
            return response;
        },
        onSuccess: () => {
            toast.success('Commentaire supprimé avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de la suppression du commentaire');
        },
    });
};

export const useReplyToComment = () => {
    return useMutation({
        mutationFn: async (data: { content: string; commentId: string }) => {
            const response = await commentService.replyToComment(data);
            return response;
        },
        onSuccess: () => {
            toast.success('Réponse ajoutée avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'ajout de la réponse");
        },
    });
};

export const useGetRepliesByComment = (commentId: string | undefined) => {
    return useQuery({
        queryKey: ['replies', 'comment', commentId],
        queryFn: async () => {
            if (!commentId) {
                return { success: true, message: 'Aucun commentaire spécifié', data: [] };
            }
            return await commentService.getRepliesByComment(commentId);
        },
        enabled: !!commentId, // La requête ne s'exécute que si commentId existe
    });
};
