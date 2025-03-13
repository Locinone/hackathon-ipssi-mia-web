import { Post } from '@/types';

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';

import { api } from '../../services/api';
import { useGetLikesByUser } from '../../services/queries/likeQueries';
import { useUserProfile } from '../../services/queries/useUserProfile';
import Loader from '../ui/Loader';

interface LikedPostCardProps {
    post: Post;
}

const LikedPostCard: React.FC<LikedPostCardProps> = ({ post }) => {
    const baseUrl = api.getUrl();

    // Formatage de date natif
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return "à l'instant";
        if (diffMin < 60) return `il y a ${diffMin} min`;
        if (diffHour < 24) return `il y a ${diffHour} h`;
        if (diffDay < 30) return `il y a ${diffDay} j`;

        return date.toLocaleDateString('fr-FR');
    };

    const formattedDate = formatDate(post.createdAt);

    // Fonction pour obtenir les initiales à partir du nom
    const getInitials = (name: string | undefined): string => {
        if (!name) return 'U';

        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="bg-black border border-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                        {post.author.image ? (
                            <img
                                src={`${baseUrl}${post.author.image}`}
                                alt={post.author.name || 'Utilisateur'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                                {getInitials(post.author.name)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                            <div>
                                <p className="text-white font-medium">
                                    {post.author.name || 'Utilisateur'}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {post.author.username
                                        ? post.author.username.startsWith('@')
                                            ? post.author.username
                                            : `@${post.author.username}`
                                        : '@utilisateur'}
                                </p>
                            </div>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500">{formattedDate}</span>
                        </div>
                        <button className="text-gray-500 hover:text-blue-500">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <div className="mt-1">
                        <p className="text-white">{post.content}</p>
                    </div>
                    <div className="mt-3 flex items-center space-x-4 text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-blue-500">
                            <MessageCircle size={16} />
                            <span>{post.comments?.length || 0}</span>
                        </button>
                        <div className="flex items-center space-x-1">
                            <Heart size={16} className="text-red-500" />
                            <span>{post.likes?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserLikes: React.FC = () => {
    const { username } = useParams();
    const { data: userData } = useUserProfile(username);
    const { data: userLikes, isLoading, error } = useGetLikesByUser(userData?._id);

    useEffect(() => {
        if (userData) {
            console.log('Données utilisateur pour les likes:', userData);
        }
    }, [userData]);

    useEffect(() => {
        if (userLikes) {
            console.log('Likes récupérés:', userLikes);

            // Afficher plus de détails sur les données reçues pour le débogage
            if (userLikes.data && userLikes.data.length > 0) {
                console.log('Premier post liké:', userLikes.data[0]);
            }
        }
    }, [userLikes]);

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        console.error('Erreur lors du chargement des likes:', error);
        return (
            <div className="text-white p-4 text-center">
                <p>Une erreur est survenue lors du chargement des posts likés.</p>
                <p className="text-red-500">
                    {error instanceof Error ? error.message : 'Erreur inconnue'}
                </p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => window.location.reload()}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!userLikes || !userLikes.data || userLikes.data.length === 0) {
        return (
            <div className="text-white p-4 text-center">
                <p>Aucun post liké trouvé pour cet utilisateur.</p>
                <p className="text-gray-500">
                    {userLikes && !userLikes.success ? `Erreur: ${userLikes.message}` : ''}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold mb-4">
                Posts likés ({userLikes.data.length})
            </h2>
            {userLikes.data.map((post) => (
                <LikedPostCard key={post._id || `post-${Math.random()}`} post={post} />
            ))}
        </div>
    );
};

export default UserLikes;
