import { useWebSocket } from '@/context/WebSocketContext';
import { api } from '@/services/api';
import { useMarkNotificationAsRead } from '@/services/queries/notificationQueries';
import { useLogoutUser } from '@/services/queries/userQueries';
import { useAuthStore } from '@/store/authStore';
import { Notification } from '@/types';

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { Bookmark, Flame, Home, LogOut, Plus, Search, User } from 'lucide-react';

import { useColorStore } from '@/stores/colorStore';

import NotificationPanel from '../Notifications/NotificationPanel';
import CreatePostForm from './CreatePostForm';

interface NavbarProps {
    onPageChange?: (page: string) => void;
}

// Composant pour afficher une notification
const NotificationItem = ({
    notification,
    onRead,
}: {
    notification: Notification;
    onRead: () => void;
}) => {
    const navigate = useNavigate();
    const baseUrl = api.getUrl();

    const formatDate = (dateString: string) => {
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
    };

    const getNotificationText = (notification: Notification) => {
        switch (notification.type) {
            case 'like':
                return 'a aimé votre post';
            case 'comment':
                return 'a commenté votre post';
            case 'follow':
                return 'vous suit maintenant';
            case 'retweet':
                return 'a retweeté votre post';
            case 'answer':
                return 'a répondu à votre commentaire';
            default:
                return notification.message || 'a interagi avec vous';
        }
    };

    const handleClick = () => {
        console.log('Notification cliquée:', notification);
        onRead();

        // Rediriger en fonction du type de notification
        if (notification.post) {
            // Si la notification concerne un post, rediriger vers le post
            navigate(`/post/${notification.post}`);
        } else if (notification.type === 'follow') {
            // Si c'est un follow, rediriger vers le profil
            navigate(`/profile/${notification.sender.username}`);
        }
    };

    return (
        <div
            className={`p-3 border-b border-gray-800 hover:bg-gray-900 transition-colors cursor-pointer ${
                notification.isRead ? 'opacity-60' : ''
            }`}
            onClick={handleClick}
        >
            <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    {notification.sender.image ? (
                        <img
                            src={`${baseUrl}${notification.sender.image}`}
                            alt={notification.sender.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                            {notification.sender.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-white">
                        <span className="font-semibold">{notification.sender.name}</span>{' '}
                        {getNotificationText(notification)}
                    </p>
                    <p className="text-gray-400 text-sm">{formatDate(notification.createdAt)}</p>
                </div>
            </div>
        </div>
    );
};

const Navbar: React.FC<NavbarProps> = ({ onPageChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [activePath, setActivePath] = useState('');
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const createPostRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const { color1, color2 } = useColorStore();
    const { mutate: logout, isPending: isLoggingOut } = useLogoutUser();
    const { notifications } = useWebSocket();
    const { mutate: markAsRead } = useMarkNotificationAsRead();

    // Calculer le nombre de notifications non lues
    const unreadCount = notifications.filter((notif) => !notif.isRead).length;

    // Log des notifications pour débogage
    useEffect(() => {
        console.log('Notifications actuelles dans la navbar:', notifications);
        console.log('Nombre de notifications non lues:', unreadCount);
    }, [notifications, unreadCount]);

    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (createPostRef.current && !createPostRef.current.contains(event.target as Node)) {
                setIsCreatePostOpen(false);
            }
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node) &&
                showNotificationMenu
            ) {
                setShowNotificationMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotificationMenu]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = async () => {
        logout();
    };

    const navigateTo = (path: string) => {
        navigate(path);
        if (onPageChange) {
            onPageChange(path.replace('/', '') || 'home');
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            console.log('Marquage de la notification comme lue:', notification._id);
            // Marquer comme lue dans l'API
            markAsRead(notification._id);
        }
    };

    return (
        <>
            {/* Navbar desktop */}
            <nav className="absolute top-0 left-0 w-full hidden md:flex justify-between items-center p-6 md:p-8 z-10">
                <div className="navbar-brand">
                    <motion.h1
                        whileHover={{ scale: 1.05 }}
                        className="text-white text-xl md:text-4xl font-bold m-0 cursor-pointer"
                        onClick={() => navigateTo('/')}
                    >
                        TakeIt
                    </motion.h1>
                </div>
                <div className="flex flex-row justify-between gap-10">
                    <motion.form
                        onSubmit={handleSearchSubmit}
                        whileHover={{ scale: 1.02 }}
                        className="flex flex-row justify-between items-center gap-2 py-2 px-4 rounded-full text-white border-white border-2 text-lg md:text-2xl"
                    >
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="bg-transparent outline-none border-none"
                        />
                        <button type="submit">
                            <Search size={24} />
                        </button>
                    </motion.form>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="flex flex-row justify-between items-center gap-2 py-2 px-4 rounded-full text-white border-white border-2 text-lg md:text-2xl"
                        onClick={() => setIsCreatePostOpen(true)}
                    >
                        <Plus size={24} />
                    </motion.button>
                </div>
                <div className="flex flex-row justify-between items-center gap-10">
                    <div className="flex flex-row justify-between items-center gap-10 py-2 px-4 rounded-full text-white text-lg md:text-2xl">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`${
                                activePath === '/'
                                    ? 'text-cyan-600 bg-cyan-100 rounded-full p-2'
                                    : 'text-white'
                            }`}
                        >
                            <Link to="/">
                                <Home size={24} className="cursor-pointer" />
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`${
                                activePath === '/trends'
                                    ? 'text-pink-500 bg-pink-200 rounded-full p-2'
                                    : 'text-white'
                            }`}
                        >
                            <Link to="/trending">
                                <Flame size={24} className="cursor-pointer" />
                            </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`${
                                activePath === '/bookmarks'
                                    ? 'text-yellow-600 bg-yellow-100 rounded-full p-2'
                                    : 'text-white'
                            }`}
                        >
                            <Link to={`/profile/${user?.username}?tab=bookmarks`}>
                                <Bookmark size={24} className="cursor-pointer" />
                            </Link>
                        </motion.div>

                        {/* Icône de notification avec badge */}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <NotificationPanel />
                        </motion.div>
                    </div>
                    <div className="relative">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-12 h-12 p-2 rounded-full overflow-hidden cursor-pointer bg-white/20 flex items-center justify-center"
                        >
                            <User className="text-white" size={48} />
                        </motion.div>

                        {showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-lg shadow-lg py-2 z-20"
                            >
                                <motion.button
                                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                    onClick={() => navigateTo(`/profile/${user?.username}`)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-white text-left"
                                >
                                    <User size={18} />
                                    <span>Mon Profil</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-white text-left"
                                >
                                    <LogOut size={18} />
                                    <span>Déconnexion</span>
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Navbar mobile (en bas) */}
            <nav className="fixed bottom-0 left-0 w-full md:hidden flex justify-around items-center p-3 bg-black/30 backdrop-blur-md z-10">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center"
                    onClick={() => navigateTo('/')}
                >
                    <Link to="/home">
                        <Home size={24} className="text-white" />
                    </Link>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center"
                    onClick={() => {
                        setSearchQuery('');
                        navigateTo('/search');
                    }}
                >
                    <Link to="/search">
                        <Search size={24} className="text-white" />
                    </Link>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center"
                >
                    <Link to={`/profile/${user?.username}?tab=bookmarks`}>
                        <Bookmark size={24} className="text-white" />
                    </Link>
                </motion.div>

                {/* Icône de notifications pour mobile */}
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center"
                >
                    <NotificationPanel />
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center"
                    onClick={() => handleLogout()}
                >
                    <Link to="/login">
                        <LogOut size={24} className="text-white" />
                    </Link>
                </motion.div>
            </nav>

            {isCreatePostOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-24 right-0 p-6 -translate-x-1/6 w-1/2 h-1/2 z-20"
                >
                    <motion.div
                        className="relative w-1/2"
                        whileHover={{ scale: 1.02 }}
                        ref={createPostRef}
                    >
                        <div
                            className="absolute -inset-2 rounded-sm opacity-75 blur"
                            style={{
                                background: `linear-gradient(to right, ${color1}, ${color2})`,
                            }}
                        ></div>
                        <motion.div className="relative p-3 bg-black/70 backdrop-blur-sm rounded-lg">
                            <CreatePostForm />
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
};

export default Navbar;
