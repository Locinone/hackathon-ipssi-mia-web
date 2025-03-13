import { useWebSocket } from '@/context/WebSocketContext';
import {
    useDeleteNotification,
    useGetNotifications,
    useMarkNotificationAsRead,
    useTestNotification,
} from '@/services/queries/notificationQueries';
import { useAuthStore } from '@/store/authStore';
import { Notification } from '@/types';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
    Bell,
    Bookmark,
    Check,
    Heart,
    MessageCircle,
    Repeat,
    UserMinus,
    UserPlus,
    X,
    Zap,
} from 'lucide-react';

// Composant pour le panneau de notifications
const NotificationPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { connected, notifications: wsNotifications, deleteNotification } = useWebSocket();
    const { data: apiNotifications = [], isLoading, error } = useGetNotifications();
    const markAsReadMutation = useMarkNotificationAsRead();
    const deleteNotificationMutation = useDeleteNotification();
    const testNotificationMutation = useTestNotification();
    const { user } = useAuthStore();

    // État local pour gérer les notifications visibles
    const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

    // Mettre à jour les notifications visibles quand les sources changent
    useEffect(() => {
        // Combiner les notifications du WebSocket et de l'API
        const combinedNotifications = [...wsNotifications];

        // Ajouter les notifications de l'API qui ne sont pas déjà dans le WebSocket
        if (apiNotifications && apiNotifications.length > 0) {
            apiNotifications.forEach((apiNotif) => {
                if (!combinedNotifications.some((wsNotif) => wsNotif._id === apiNotif._id)) {
                    combinedNotifications.push(apiNotif);
                }
            });
        }

        // Trier les notifications par date (les plus récentes d'abord)
        combinedNotifications.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setVisibleNotifications(combinedNotifications);
    }, [wsNotifications, apiNotifications]);

    // Fermer le panneau quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const panel = document.getElementById('notification-panel');
            if (
                panel &&
                !panel.contains(event.target as Node) &&
                !document.getElementById('notification-button')?.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Marquer une notification comme lue
    const handleMarkAsRead = (notificationId: string) => {
        markAsReadMutation.mutate(notificationId);

        // Mettre à jour l'état local immédiatement
        setVisibleNotifications((prev) =>
            prev.map((notif) => (notif._id === notificationId ? { ...notif, isRead: true } : notif))
        );
    };

    // Supprimer une notification
    const handleDeleteNotification = (event: React.MouseEvent, notificationId: string) => {
        // Empêcher la propagation pour éviter que le clic ne déclenche d'autres actions
        event.stopPropagation();
        console.log(`Suppression de la notification: ${notificationId}`);

        // Vérifier que l'ID est valide
        if (!notificationId || notificationId.trim() === '') {
            toast.error('ID de notification invalide');
            return;
        }

        // Supprimer immédiatement de l'interface
        setVisibleNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));

        // Utiliser une seule méthode de suppression pour éviter les doubles suppressions
        try {
            // Afficher un toast de chargement
            const loadingToast = toast.loading('Suppression en cours...');

            // Privilégier l'API REST pour la suppression (plus fiable)
            deleteNotificationMutation.mutate(notificationId, {
                onSuccess: () => {
                    console.log(
                        `Notification ${notificationId} supprimée avec succès via API REST`
                    );
                    toast.dismiss(loadingToast);
                    toast.success('Notification supprimée avec succès');

                    // Supprimer également via WebSocket si connecté (pour synchroniser les autres clients)
                    if (connected) {
                        console.log('Synchronisation via WebSocket...');
                        deleteNotification(notificationId);
                    }
                },
                onError: (error) => {
                    console.error('Erreur lors de la suppression via API:', error);
                    toast.dismiss(loadingToast);

                    // Si l'erreur indique que la notification est déjà supprimée, considérer comme un succès
                    if (
                        error.message &&
                        (error.message.includes('déjà supprimée') ||
                            error.message.includes('non trouvée'))
                    ) {
                        toast.success('Notification supprimée avec succès');
                        return;
                    }

                    toast.error('Erreur lors de la suppression de la notification');

                    // En cas d'erreur, restaurer la notification dans l'interface
                    const notifToRestore = [...wsNotifications, ...apiNotifications].find(
                        (n) => n._id === notificationId
                    );
                    if (notifToRestore) {
                        setVisibleNotifications((prev) =>
                            [...prev, notifToRestore].sort(
                                (a, b) =>
                                    new Date(b.createdAt).getTime() -
                                    new Date(a.createdAt).getTime()
                            )
                        );
                    }
                },
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de la notification:', error);
            toast.error('Une erreur est survenue lors de la suppression');

            // Restaurer la notification dans l'interface en cas d'erreur
            const notifToRestore = [...wsNotifications, ...apiNotifications].find(
                (n) => n._id === notificationId
            );
            if (notifToRestore) {
                setVisibleNotifications((prev) =>
                    [...prev, notifToRestore].sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                );
            }
        }
    };

    // Envoyer une notification de test
    const handleTestNotification = () => {
        testNotificationMutation.mutate();
    };

    // Obtenir l'icône en fonction du type de notification
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <Heart fill="currentColor" className="w-5 h-5 text-red-500" />;
            case 'comment':
            case 'answer':
                return <MessageCircle fill="currentColor" className="w-5 h-5 text-blue-500" />;
            case 'follow':
                return <UserPlus className="w-5 h-5 text-green-500" />;
            case 'unfollow':
                return <UserMinus className="w-5 h-5 text-orange-500" />;
            case 'retweet':
                return <Repeat fill="currentColor" className="w-5 h-5 text-green-500" />;
            case 'bookmark':
                return <Bookmark fill="currentColor" className="w-5 h-5 text-purple-500" />;
            default:
                return <Bell fill="currentColor" className="w-5 h-5 text-gray-500" />;
        }
    };

    // Formater la date relative
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMin = Math.floor(diffMs / (1000 * 60));
            const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMin < 60) return `il y a ${diffMin} min`;
            if (diffHour < 24) return `il y a ${diffHour} h`;
            if (diffDay < 7) return `il y a ${diffDay} j`;
            return date.toLocaleDateString('fr-FR');
        } catch (e) {
            return 'Date inconnue';
        }
    };

    // Nombre de notifications non lues
    const unreadCount = visibleNotifications.filter((n) => !n.isRead).length;

    // Déterminer la couleur de l'icône de notification en fonction de la préférence de l'utilisateur
    const notificationIconTooltip =
        user?.acceptNotification === false ? 'Notifications désactivées' : 'Notifications activées';

    // Déterminer la couleur du point indicateur
    let indicatorColor = 'bg-red-500';
    let indicatorTooltip = 'Déconnecté des notifications';

    if (connected) {
        if (user?.acceptNotification === false) {
            indicatorColor = 'bg-red-500';
            indicatorTooltip = 'Notifications désactivées';
        } else {
            indicatorColor = 'bg-green-500';
            indicatorTooltip = 'Connecté aux notifications';
        }
    }

    return (
        <div className="relative">
            {/* Bouton de notification */}
            <button
                id="notification-button"
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
                title={notificationIconTooltip}
            >
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Indicateur de connexion */}
            <div className="absolute -bottom-1 -right-1">
                <div
                    className={`w-3 h-3 rounded-full ${indicatorColor}`}
                    title={indicatorTooltip}
                />
            </div>

            {/* Panneau de notifications */}
            {isOpen && (
                <div
                    id="notification-panel"
                    className="absolute right-0 mt-2 w-80 md:w-96 bg-black/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden z-50 border border-gray-700"
                >
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {/* Bouton de test */}
                            <button
                                onClick={handleTestNotification}
                                className="text-yellow-400 hover:text-yellow-300"
                                title="Envoyer une notification de test"
                                disabled={testNotificationMutation.isPending}
                            >
                                <Zap className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {user?.acceptNotification === false && (
                        <div className="p-3 bg-red-900/30 border-b border-red-800">
                            <p className="text-sm text-red-300">
                                <span className="font-semibold">Notifications désactivées</span> -
                                Modifiez vos préférences dans votre profil pour recevoir des
                                notifications.
                            </p>
                        </div>
                    )}

                    <div className="max-h-96 overflow-y-auto">
                        {isLoading && visibleNotifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">Chargement...</div>
                        ) : error && visibleNotifications.length === 0 ? (
                            <div className="p-4 text-center text-red-500">
                                Erreur de chargement des notifications
                            </div>
                        ) : visibleNotifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">Aucune notification</div>
                        ) : (
                            <ul>
                                {visibleNotifications.map((notification: Notification) => (
                                    <li
                                        key={notification._id}
                                        className={`p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors ${
                                            !notification.isRead ? 'bg-blue-900/20' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-sm text-white">
                                                    <span className="font-semibold">
                                                        {notification.sender?.username ||
                                                            'Utilisateur'}
                                                    </span>{' '}
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatDate(notification.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() =>
                                                            handleMarkAsRead(notification._id)
                                                        }
                                                        className="text-blue-400 hover:text-blue-300"
                                                        title="Marquer comme lu"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) =>
                                                        handleDeleteNotification(
                                                            e,
                                                            notification._id
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-red-500"
                                                    title="Supprimer la notification"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
