import { useAuthStore } from '@/store/authStore';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';

import { api } from '../../services/api';
import { useGetUserRetweets } from '../../services/queries/interactionQueries';
import { useUserProfile } from '../../services/queries/useUserProfile';
import Loader from '../ui/Loader';

// Définition d'un type local pour les posts mockés qui correspond à la structure attendue
interface MockRetweet {
    _id: string;
    content?: string;
    post: {
        _id: string;
        content: string;
        author: {
            _id: string;
            name: string;
            username: string;
            image: string;
        };
        createdAt?: string;
        likes?: any[];
        comments?: any[];
    };
    user: {
        _id: string;
        name: string;
        username: string;
        image: string;
    };
    createdAt: string;
}

// Données mockées pour visualiser le rendu
const mockRetweets: MockRetweet[] = [
    {
        _id: '1',
        content: 'Ce post est vraiment intéressant !',
        post: {
            _id: '101',
            content:
                "Ceci est un post retweeté avec un contenu assez long pour voir comment le texte s'affiche sur plusieurs lignes. Qu'en pensez-vous ?",
            author: {
                _id: '201',
                name: 'Barack Obama',
                username: 'BarackObama',
                image: '',
            },
            createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            likes: Array(14),
            comments: Array(3),
        },
        user: {
            _id: '301',
            name: 'John Doe',
            username: 'johndoe',
            image: '',
        },
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
        _id: '2',
        post: {
            _id: '102',
            content: 'Un autre post retweeté avec un point de vue intéressant !',
            author: {
                _id: '202',
                name: 'Elon Musk',
                username: 'elonmusk',
                image: '',
            },
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            likes: Array(42),
            comments: Array(7),
        },
        user: {
            _id: '302',
            name: 'Jane Smith',
            username: 'janesmith',
            image: '',
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
];

interface RetweetCardProps {
    retweet: any;
}

const RetweetCard: React.FC<RetweetCardProps> = ({ retweet }) => {
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

    // Fonction pour obtenir les initiales à partir du nom
    const getInitials = (name: string | undefined): string => {
        if (!name) return 'U';

        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Vérifier si le retweet a un post valide
    if (!retweet.post) {
        return null;
    }

    const post = retweet.post;
    const formattedDate = formatDate(post.createdAt);
    const retweetDate = formatDate(retweet.createdAt);

    return (
        <div className="bg-black border border-gray-800 rounded-lg p-4 mb-4">
            {/* En-tête du retweet */}
            <div className="flex items-center mb-3">
                <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                    {retweet.user.image ? (
                        <img
                            src={`${baseUrl}${retweet.user.image}`}
                            alt={retweet.user.name || 'Utilisateur'}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs">
                            {getInitials(retweet.user.name)}
                        </div>
                    )}
                </div>
                <p className="text-gray-400 text-sm">
                    <span className="font-medium text-white">{retweet.user.name}</span> a retweeté
                    ce post {retweetDate}
                </p>
            </div>

            {/* Contenu du retweet si présent */}
            {retweet.content && (
                <div className="mb-3 pl-8 text-gray-300 italic">"{retweet.content}"</div>
            )}

            {/* Post retweeté */}
            <div className="border border-gray-800 rounded-lg p-3">
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
        </div>
    );
};

const UserRetweets: React.FC = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuthStore();
    const { data: userData } = useUserProfile(username);
    const {
        data: userRetweets,
        isLoading,
        error,
        refetch,
        isError,
    } = useGetUserRetweets(userData?._id);

    // État pour contrôler l'affichage des données mockées
    const [showMockData, setShowMockData] = useState(false);

    useEffect(() => {
        if (userRetweets) {
            console.log('Retweets récupérés:', userRetweets);
            console.log('Nombre de retweets:', userRetweets.length);

            // Si nous avons des données réelles, désactiver les données mockées
            if (userRetweets.length > 0) {
                setShowMockData(false);
                console.log('Affichage des retweets réels');
            } else {
                console.log('Aucun retweet trouvé');
            }
        }
    }, [userRetweets]);

    // Afficher les données mockées pour visualisation ou si aucun retweet n'est trouvé
    if (showMockData || (userRetweets && userRetweets.length === 0)) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-lg font-semibold">
                        Retweets {showMockData ? '(Exemple)' : ''}
                    </h2>
                    {currentUser &&
                        userData &&
                        currentUser._id === userData._id &&
                        showMockData && (
                            <button
                                className="text-xs text-gray-400 hover:text-blue-500"
                                onClick={() => {
                                    setShowMockData(false);
                                    refetch();
                                }}
                            >
                                Charger mes retweets
                            </button>
                        )}
                </div>
                {showMockData ? (
                    mockRetweets.map((retweet) => (
                        <RetweetCard key={retweet._id} retweet={retweet} />
                    ))
                ) : (
                    <div className="text-white p-4 text-center">
                        <p className="text-xl font-semibold">Aucun retweet pour le moment.</p>
                        <p className="text-gray-500 mt-2">
                            Les posts que vous retweetez apparaîtront ici.
                        </p>
                        <button
                            className="mt-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                            onClick={() => setShowMockData(true)}
                        >
                            Voir à quoi ressemblent les retweets
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader />
                <p className="text-white ml-4">Chargement des retweets...</p>
            </div>
        );
    }

    if (isError || error) {
        console.error('Erreur lors du chargement des retweets:', error);
        return (
            <div className="text-white p-4 text-center">
                <p>Une erreur est survenue lors du chargement des retweets.</p>
                <p className="text-red-500 mt-2">
                    {error instanceof Error ? error.message : 'Erreur inconnue'}
                </p>
                <div className="flex justify-center mt-4 space-x-4">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            toast.info('Tentative de récupération des retweets...');
                            refetch().catch((err) => {
                                console.error('Nouvelle erreur lors du refetch:', err);
                                toast.error('Échec de la récupération. Affichage des exemples.');
                                setShowMockData(true);
                            });
                        }}
                    >
                        Réessayer
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                        onClick={() => setShowMockData(true)}
                    >
                        Afficher des exemples
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold mb-4">
                Retweets ({userRetweets.length})
            </h2>
            {userRetweets.map((retweet) => (
                <RetweetCard key={retweet._id} retweet={retweet} />
            ))}
        </div>
    );
};

export default UserRetweets;
