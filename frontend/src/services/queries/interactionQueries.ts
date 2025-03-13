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
        mutationFn: async (postId: string) => {
            await interactionService.createBookmark(postId);
            return postId;
        },
        onSuccess: (postId: string) => {
            let posts = queryClient.getQueryData<any>(['posts']);
            // find bookmark by postId, set hasBookmarked to true
            let postData = posts.data;
            postData = postData.map((post: any) => {
                if (post._id === postId) {
                    post.hasBookmarked = true;
                }
                return post;
            });
            queryClient.setQueryData(['posts'], { ...posts, data: postData });
            toast.success('Post ajouré aux signets');
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'ajout aux signets");
        },
    });
};

export const useDeleteBookmark = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: string) => {
            await interactionService.deleteBookmark(postId);
            return postId;
        },
        onSuccess: (postId: string) => {
            // Mettre à jour le cache des posts
            let posts = queryClient.getQueryData<any>(['posts']);
            let postData = posts.data;
            postData = postData.map((post: any) => {
                if (post._id === postId) {
                    post.hasBookmarked = false;
                }
                return post;
            });
            queryClient.setQueryData(['posts'], { ...posts, data: postData });

            // Invalider le cache des signets
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
        queryFn: async () => {
            console.log("Récupération des bookmarks de l'utilisateur...");
            try {
                const response = await interactionService.getUserBookmarks();
                console.log('Bookmarks récupérés avec succès:', response);
                return response;
            } catch (error) {
                console.error('Erreur lors de la récupération des bookmarks:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60, // 1 minute
        retry: 1,
    });
};

// Followers
export const useFollowUser = () => {
    return useMutation({
        mutationFn: (userId: string) => interactionService.followUser(userId),
        onSuccess: () => {
            toast.success('Utilisateur suivi avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la suivi de l'utilisateur");
        },
    });
};

export const useUnfollowUser = () => {
    return useMutation({
        mutationFn: (userId: string) => interactionService.unfollowUser(userId),
        onSuccess: () => {
            toast.success('Utilisateur non suivi avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la non suivi de l'utilisateur");
        },
    });
};

export const useGetUserRetweets = (userId?: string) => {
    return useQuery({
        queryKey: ['retweets', userId],
        queryFn: async () => {
            console.log(`Récupération des retweets de l'utilisateur ${userId}...`);
            try {
                if (!userId) {
                    console.log('Aucun ID utilisateur fourni pour récupérer les retweets');
                    return [];
                }
                const response = await interactionService.getUserRetweets(userId);
                console.log('Retweets récupérés avec succès:', response);
                return response;
            } catch (error) {
                console.error('Erreur lors de la récupération des retweets:', error);
                throw error;
            }
        },
        enabled: !!userId,
        staleTime: 1000 * 60, // 1 minute
        retry: 1,
    });
};
