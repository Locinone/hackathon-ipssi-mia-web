import { toast } from 'react-toastify';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { interactionService } from '../interactionService';

// Likes
export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => interactionService.createLike(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'ajout du like");
        },
    });
};

export const useUnlikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => interactionService.deleteLike(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de la suppression du like');
        },
    });
};

// Dislikes
export const useDislikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => interactionService.createDislike(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'ajout du dislike");
        },
    });
};

export const useUndislikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => interactionService.deleteDislike(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de la suppression du dislike');
        },
    });
};

// Commentaires
export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, comment }: { postId: string; comment: string }) =>
            interactionService.createComment(postId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            toast.success('Commentaire ajouté avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'ajout du commentaire");
        },
    });
};

export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
            interactionService.deleteComment(postId, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            toast.success('Commentaire supprimé avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de la suppression du commentaire');
        },
    });
};

export const useGetComments = (postId: string) => {
    return useQuery({
        queryKey: ['comments', postId],
        queryFn: () => interactionService.getComments(postId),
        enabled: !!postId,
    });
};

export const useAnswerComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, answer }: { commentId: string; answer: string }) =>
            interactionService.answerComment(commentId, answer),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            toast.success('Réponse ajoutée avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'ajout de la réponse");
        },
    });
};

// Retweets
export const useCreateRetweet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, content }: { postId: string; content?: string }) =>
            interactionService.createRetweet(postId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Retweet effectué avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors du retweet');
        },
    });
};

export const useDeleteRetweet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => interactionService.deleteRetweet(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Retweet supprimé avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de la suppression du retweet');
        },
    });
};

// Signets (Bookmarks)
export const useCreateBookmark = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => interactionService.createBookmark(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            toast.success('Post ajouté aux signets');
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'ajout aux signets");
        },
    });
};

export const useDeleteBookmark = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => interactionService.deleteBookmark(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            toast.success('Post retiré des signets');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de la suppression du signet');
        },
    });
};

export const useGetUserBookmarks = () => {
    return useQuery({
        queryKey: ['bookmarks'],
        queryFn: () => interactionService.getUserBookmarks(),
    });
};
