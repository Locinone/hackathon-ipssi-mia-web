import { toast } from 'react-toastify';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationService } from '../notificationService';

export const useGetNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            console.log('Query - Récupération des notifications...');
            try {
                const notifications = await notificationService.getNotifications();
                console.log('Query - Notifications récupérées:', notifications);
                return notifications;
            } catch (error) {
                console.error('Query - Erreur lors de la récupération des notifications:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60, // 1 minute
        refetchInterval: 1000 * 60, // Rafraîchir toutes les minutes même en arrière-plan
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
        onSuccess: () => {
            // Invalider la requête pour forcer un rafraîchissement des notifications
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors du marquage de la notification comme lue');
        },
    });
};

// Mutation pour tester l'envoi d'une notification
export const useTestNotification = () => {
    return useMutation({
        mutationFn: () => notificationService.testNotification(),
        onSuccess: () => {
            toast.success('Notification de test envoyée avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'envoi de la notification de test");
        },
    });
};
