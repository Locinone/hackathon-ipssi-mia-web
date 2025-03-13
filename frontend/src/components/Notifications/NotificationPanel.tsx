import { useWebSocket } from '@/context/WebSocketContext';
import {
    useMarkNotificationAsRead,
    useNotifications,
    useTestNotification,
} from '@/queries/notificationQueries';
import { Notification } from '@/types';

import React, { useEffect, useState } from 'react';

import {
    Bell,
    Bookmark,
    Check,
    Heart,
    MessageCircle,
    Repeat,
    UserPlus,
    X,
    Zap,
} from 'lucide-react';

// Composant pour le panneau de notifications
const NotificationPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { connected } = useWebSocket();
    const { data: notifications = [], isLoading, error } = useNotifications();
    const markAsReadMutation = useMarkNotificationAsRead();
    const testNotificationMutation = useTestNotification();

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
    };

    // Envoyer une notification de test
    const handleTestNotification = () => {
        testNotificationMutation.mutate();
    };

    // Obtenir l'icône en fonction du type de notification
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <Heart className="w-5 h-5 text-red-500" />;
            case 'comment':
            case 'answer':
                return <MessageCircle className="w-5 h-5 text-blue-500" />;
            case 'follow':
                return <UserPlus className="w-5 h-5 text-green-500" />;
            case 'retweet':
                return <Repeat className="w-5 h-5 text-green-500" />;
            case 'bookmark':
                return <Bookmark className="w-5 h-5 text-purple-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
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
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="relative">
            {/* Bouton de notification */}
            <button
                id="notification-button"
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Indicateur de connexion */}
            <div className="absolute -bottom-1 -right-1">
                <div
                    className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
                    title={
                        connected ? 'Connecté aux notifications' : 'Déconnecté des notifications'
                    }
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

                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400">Chargement...</div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">
                                Erreur de chargement des notifications
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">Aucune notification</div>
                        ) : (
                            <ul>
                                {notifications.map((notification: Notification) => (
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
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() =>
                                                        handleMarkAsRead(notification._id)
                                                    }
                                                    className="flex-shrink-0 text-blue-400 hover:text-blue-300"
                                                    title="Marquer comme lu"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                            )}
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
