import { useAuthStore } from '@/store/authStore';
import { Notification } from '@/types';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Cookies from 'js-cookie';
import { Socket, io } from 'socket.io-client';

// Type pour le contexte
interface WebSocketContextType {
    socket: Socket | null;
    connected: boolean;
    notifications: Notification[];
    sendNotification: (notification: Partial<Notification>) => void;
    markNotificationAsRead: (notificationId: string) => void;
    deleteNotification: (notificationId: string) => void;
}

// Valeur par défaut du contexte
const defaultContext: WebSocketContextType = {
    socket: null,
    connected: false,
    notifications: [],
    sendNotification: () => {},
    markNotificationAsRead: () => {},
    deleteNotification: () => {},
};

// Création du contexte
const WebSocketContext = createContext<WebSocketContextType>(defaultContext);

// Hook personnalisé pour utiliser le contexte
export const useWebSocket = () => useContext(WebSocketContext);

// Fournisseur du contexte
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuthStore();

    // Récupérer le token depuis les cookies
    const token = Cookies.get('accessToken');

    // Initialisation de la connexion WebSocket
    useEffect(() => {
        if (!token) {
            console.log('Pas de token disponible, impossible de se connecter au WebSocket');
            return;
        }

        console.log('Initialisation de la connexion WebSocket...');

        // URL du backend (à configurer selon votre environnement)
        const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Création de l'instance Socket.IO
        const socketInstance = io(BACKEND_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Gestion des événements de connexion
        socketInstance.on('connect', () => {
            console.log('✅ Connecté au WebSocket:', socketInstance.id);
            setConnected(true);
            toast.success('Connecté aux notifications en temps réel', {
                position: 'bottom-right',
                autoClose: 2000,
            });
        });

        // Gestion des notifications
        socketInstance.on('notifications', (data: Notification[]) => {
            console.log('🔔 Notifications reçues lors de la connexion:', data);
            setNotifications(data);
        });

        // Gestion des notifications en temps réel
        socketInstance.on('notification', (data: Notification) => {
            console.log('🔔 Notification reçue en temps réel:', data);
            setNotifications((prev) => [data, ...prev]);

            // Afficher une notification toast
            toast.info(data.message || 'Nouvelle notification', {
                position: 'bottom-right',
            });
        });

        // Gestion des notifications lues
        socketInstance.on('notification-read', (data: { _id: string }) => {
            console.log('📖 Notification marquée comme lue:', data);
            setNotifications((prev) =>
                prev.map((notif) => (notif._id === data._id ? { ...notif, isRead: true } : notif))
            );
        });

        // Écouter l'événement de notification supprimée
        socketInstance.on('notification-deleted', (data: { _id: string }) => {
            console.log('🗑️ Notification supprimée reçue:', data);
            setNotifications((prevNotifications) =>
                prevNotifications.filter((notif) => notif._id !== data._id)
            );
        });

        // Gestion des erreurs de connexion
        socketInstance.on('connect_error', (err) => {
            console.error('❌ Erreur de connexion WebSocket:', err.message);
            setConnected(false);
            toast.error(`Erreur de connexion aux notifications: ${err.message}`, {
                position: 'bottom-right',
            });
        });

        // Gestion de la déconnexion
        socketInstance.on('disconnect', (reason) => {
            console.log('⚠️ Déconnecté du WebSocket:', reason);
            setConnected(false);

            if (reason === 'io server disconnect') {
                // Le serveur a forcé la déconnexion
                toast.warning('Déconnecté du serveur de notifications', {
                    position: 'bottom-right',
                });
            }
        });

        // Enregistrer l'instance
        setSocket(socketInstance);

        // Nettoyage à la déconnexion
        return () => {
            console.log('Fermeture de la connexion WebSocket');
            socketInstance.disconnect();
        };
    }, [token]);

    // Fonction pour envoyer une notification (pour les tests)
    const sendNotification = (notification: Partial<Notification>) => {
        if (socket && connected) {
            console.log('Envoi de notification:', notification);
            socket.emit('test-notification', notification);
        } else {
            console.error("Impossible d'envoyer la notification: non connecté");
        }
    };

    // Fonction pour marquer une notification comme lue
    const markNotificationAsRead = (notificationId: string) => {
        if (socket && connected) {
            console.log('Marquage de la notification comme lue:', notificationId);
            socket.emit('mark-notification-read', { notificationId });

            // Mettre à jour l'état local
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        }
    };

    // Fonction pour supprimer une notification
    const deleteNotification = (notificationId: string) => {
        if (socket && connected) {
            console.log('WebSocket - Suppression de la notification:', notificationId);

            // Mettre à jour l'état local immédiatement pour une meilleure expérience utilisateur
            setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));

            // Émettre l'événement de suppression au serveur
            socket.emit('delete-notification', { notificationId });
        } else {
            console.error('WebSocket - Impossible de supprimer la notification: non connecté');
        }
    };

    // Valeur du contexte
    const contextValue: WebSocketContextType = {
        socket,
        connected,
        notifications,
        sendNotification,
        markNotificationAsRead,
        deleteNotification,
    };

    return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};
