import { User } from '@/types/userTypes';

import { toast } from 'react-toastify';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { userService } from '../userService';

export const useUserProfile = (username: string | undefined) => {
    const queryClient = useQueryClient();

    return useQuery<User>({
        queryKey: ['userProfile', username],
        queryFn: async () => {
            if (!username) throw new Error('Username is required');
            console.log('Récupération du profil pour:', username);
            const response = await userService.getUserProfile(username);

            if (!response.data && response.message && typeof response.message === 'object') {
                // Si les données sont dans message au lieu de data
                console.log('Données utilisateur trouvées dans message:', response.message);
                return response.message as User;
            }

            if (!response.data) {
                console.error('Aucune donnée utilisateur trouvée:', response);
                throw new Error('User not found');
            }

            return response.data;
        },
        enabled: !!username,
        staleTime: 0, // Considérer les données comme obsolètes immédiatement
        gcTime: 1000 * 60, // Conserver en cache pendant 1 minute (cacheTime renommé en gcTime dans React Query v5)
        refetchOnWindowFocus: false,
    });
};

// Hook pour récupérer les abonnés d'un utilisateur
export const useUserFollowers = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['userFollowers', userId],
        queryFn: async () => {
            if (!userId) return [];
            console.log('Récupération des abonnés pour:', userId);
            const response = await userService.getUserFollowers(userId);

            if (!response.success || !response.data) {
                console.error('Erreur lors de la récupération des abonnés:', response.message);
                return [];
            }

            return response.data;
        },
        enabled: !!userId,
        staleTime: 0,
        gcTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
};

// Hook pour récupérer les abonnements d'un utilisateur
export const useUserFollowing = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['userFollowing', userId],
        queryFn: async () => {
            if (!userId) return [];
            console.log('Récupération des abonnements pour:', userId);
            const response = await userService.getUserFollowing(userId);

            if (!response.success || !response.data) {
                console.error('Erreur lors de la récupération des abonnements:', response.message);
                return [];
            }

            return response.data;
        },
        enabled: !!userId,
        staleTime: 0,
        gcTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
};

// update user profile
export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    return useMutation<User, Error, Partial<User>>({
        mutationFn: async (data: Partial<User>) => {
            console.log('Données envoyées pour mise à jour:', JSON.stringify(data));

            const response = await userService.updateUserProfile(data);
            console.log("Réponse complète de l'API:", response);

            if (!response.success) {
                throw new Error(response.message || 'Erreur lors de la mise à jour du profil');
            }

            if (!response.data) {
                throw new Error("Aucune donnée retournée par l'API");
            }

            // Log détaillé des modifications
            console.log('Modifications appliquées:', {
                name: data.name,
                username: data.username,
                biography: data.biography,
                location: data.location,
                link: data.link,
            });

            return response.data;
        },
        onSuccess: (updatedUser) => {
            console.log('Mise à jour réussie, données complètes:', updatedUser);

            // Forcer l'invalidation des requêtes
            if (updatedUser.username) {
                // Invalider la requête pour le profil spécifique
                queryClient.invalidateQueries({ queryKey: ['userProfile', updatedUser.username] });

                // Mettre à jour directement le cache avec les nouvelles données
                queryClient.setQueryData(['userProfile', updatedUser.username], updatedUser);
            }

            // Invalider également la requête pour l'utilisateur courant
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });

            // Mettre à jour directement le cache de l'utilisateur courant
            queryClient.setQueryData(['currentUser'], updatedUser);

            toast.success('Profil mis à jour avec succès');
        },
        onError: (error) => {
            console.error('Erreur détaillée lors de la mise à jour:', error);
            toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
        },
    });
};
