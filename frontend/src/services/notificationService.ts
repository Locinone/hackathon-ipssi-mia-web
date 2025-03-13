import { Notification } from '@/types';

import { api } from './api';

class NotificationService {
    private apiUrl = '/api/notifications';

    /**
     * Récupère toutes les notifications de l'utilisateur
     */
    public async getNotifications(): Promise<Notification[]> {
        try {
            console.log('Service - Récupération des notifications');
            const response = await api.fetchRequest(`${this.apiUrl}`, 'GET', null, true);

            if (!response.success) {
                console.error(
                    'Service - Erreur lors de la récupération des notifications:',
                    response.message
                );
                throw new Error(
                    response.message || 'Erreur lors de la récupération des notifications'
                );
            }

            console.log('Service - Notifications récupérées:', response.data);
            return response.data;
        } catch (error) {
            console.error('Service - Exception lors de la récupération des notifications:', error);
            throw error;
        }
    }

    /**
     * Marque une notification comme lue
     * @param notificationId ID de la notification
     */
    public async markAsRead(notificationId: string): Promise<void> {
        try {
            console.log(`Service - Marquer la notification ${notificationId} comme lue`);
            const response = await api.fetchRequest(
                `${this.apiUrl}/${notificationId}/read`,
                'PUT',
                null,
                true
            );

            if (!response.success) {
                console.error(
                    'Service - Erreur lors du marquage de la notification:',
                    response.message
                );
                throw new Error(response.message || 'Erreur lors du marquage de la notification');
            }

            console.log('Service - Notification marquée comme lue avec succès');
            return response.data;
        } catch (error) {
            console.error('Service - Exception lors du marquage de la notification:', error);
            throw error;
        }
    }

    /**
     * Supprime une notification
     * @param notificationId ID de la notification
     */
    public async deleteNotification(notificationId: string): Promise<void> {
        try {
            console.log(`Service - Suppression de la notification ${notificationId}`);

            // Vérifier que l'ID est valide
            if (!notificationId || notificationId.trim() === '') {
                throw new Error('ID de notification invalide');
            }

            const response = await api.fetchRequest(
                `${this.apiUrl}/${notificationId}`,
                'DELETE',
                null,
                true
            );

            // Vérifier la réponse même si elle n'est pas un succès
            console.log('Service - Réponse de suppression:', response);

            if (!response.success) {
                console.error(
                    'Service - Erreur lors de la suppression de la notification:',
                    response.message
                );
                throw new Error(
                    response.message || 'Erreur lors de la suppression de la notification'
                );
            }

            console.log('Service - Notification supprimée avec succès');
            return response.data;
        } catch (error) {
            console.error('Service - Exception lors de la suppression de la notification:', error);
            throw error;
        }
    }

    /**
     * Méthode pour tester la connexion WebSocket
     */
    public async testNotification(): Promise<void> {
        try {
            console.log("Service - Envoi d'une notification de test");
            const response = await api.fetchRequest(
                `${this.apiUrl}/test`,
                'POST',
                { message: 'Ceci est une notification de test' },
                true
            );

            if (!response.success) {
                console.error(
                    "Service - Erreur lors de l'envoi de la notification de test:",
                    response.message
                );
                throw new Error(
                    response.message || "Erreur lors de l'envoi de la notification de test"
                );
            }

            console.log('Service - Notification de test envoyée avec succès');
            return response.data;
        } catch (error) {
            console.error("Service - Exception lors de l'envoi de la notification de test:", error);
            throw error;
        }
    }
}

export const notificationService = new NotificationService();
