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
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => {
            console.log(`Mutation - Suivre l'utilisateur: ${userId}`);
            return interactionService.followUser(userId);
        },
        onSuccess: (data, userId) => {
            console.log(`Mutation - Suivi réussi pour: ${userId}`, data);

            // Invalider toutes les requêtes pertinentes
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });

            // Invalider spécifiquement les listes d'abonnés et d'abonnements
            queryClient.invalidateQueries({ queryKey: ['userFollowers'] });
            queryClient.invalidateQueries({ queryKey: ['userFollowing'] });

            // Invalider spécifiquement les données de l'utilisateur concerné
            queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });

            // Mettre à jour directement le cache si possible
            try {
                // Mettre à jour le statut isFollowing dans le profil de l'utilisateur
                queryClient.setQueryData(['userProfile', userId], (oldData: any) => {
                    if (!oldData) return oldData;
                    return { ...oldData, isFollowing: true };
                });

                // Ajouter l'utilisateur à la liste des abonnements de l'utilisateur courant
                const currentUserId = queryClient.getQueryData<any>(['currentUser'])?.data?._id;
                if (currentUserId) {
                    // Mettre à jour la liste des abonnements
                    queryClient.setQueryData(['userFollowing', currentUserId], (oldData: any) => {
                        if (!oldData || !Array.isArray(oldData)) return oldData;

                        // Vérifier si l'utilisateur est déjà dans la liste
                        const userExists = oldData.some((user: any) => user._id === userId);
                        if (userExists) return oldData;

                        // Récupérer les données de l'utilisateur depuis le cache si disponible
                        const userData = queryClient.getQueryData<any>(['userProfile', userId]);
                        if (!userData) return oldData;

                        // Ajouter l'utilisateur à la liste avec isFollowing=true
                        return [...oldData, { ...userData, isFollowing: true }];
                    });
                }
            } catch (error) {
                console.error('Erreur lors de la mise à jour du cache:', error);
            }

            toast.success('Vous suivez maintenant cet utilisateur');
        },
        onError: (error: any) => {
            console.error('Mutation - Erreur lors du suivi:', error);
            toast.error(error.message || "Erreur lors du suivi de l'utilisateur");
        },
    });
};

export const useUnfollowUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => {
            console.log(`Mutation - Ne plus suivre l'utilisateur: ${userId}`);
            return interactionService.unfollowUser(userId);
        },
        onSuccess: (data, userId) => {
            console.log(`Mutation - Désabonnement réussi pour: ${userId}`, data);

            // Invalider toutes les requêtes pertinentes
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });

            // Invalider spécifiquement les listes d'abonnés et d'abonnements
            queryClient.invalidateQueries({ queryKey: ['userFollowers'] });
            queryClient.invalidateQueries({ queryKey: ['userFollowing'] });

            // Invalider spécifiquement les données de l'utilisateur concerné
            queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });

            // Mettre à jour directement le cache si possible
            try {
                // Mettre à jour le statut isFollowing dans le profil de l'utilisateur
                queryClient.setQueryData(['userProfile', userId], (oldData: any) => {
                    if (!oldData) return oldData;
                    return { ...oldData, isFollowing: false };
                });

                // Supprimer l'utilisateur de la liste des abonnements de l'utilisateur courant
                const currentUserId = queryClient.getQueryData<any>(['currentUser'])?.data?._id;
                if (currentUserId) {
                    // Mettre à jour la liste des abonnements
                    queryClient.setQueryData(['userFollowing', currentUserId], (oldData: any) => {
                        if (!oldData || !Array.isArray(oldData)) return oldData;
                        return oldData.filter((user: any) => user._id !== userId);
                    });
                }
            } catch (error) {
                console.error('Erreur lors de la mise à jour du cache:', error);
            }

            toast.success('Vous ne suivez plus cet utilisateur');
        },
        onError: (error: any) => {
            console.error('Mutation - Erreur lors du désabonnement:', error);
            toast.error(error.message || 'Erreur lors du désabonnement');
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
