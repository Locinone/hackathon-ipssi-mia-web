import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MessageCircle, MoreHorizontal } from 'lucide-react';

import { api } from '../../services/api';
import { useGetCommentsByUserId } from '../../services/queries/commentQueries';
import { useUserProfile } from '../../services/queries/useUserProfile';
import Loader from '../ui/Loader';

// Définition du type Comment si non disponible dans @/types
interface Comment {
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
    replies?: any[];
    reposts?: number;
}

// Données mockées pour visualiser le rendu
const mockComments: Comment[] = [
    {
        _id: '1',
        content:
            "Ceci est un commentaire de test avec un contenu assez long pour voir comment le texte s'affiche sur plusieurs lignes. Qu'en pensez-vous ?",
        author: {
            _id: '101',
            name: 'Barack Obama',
            username: 'BarackObama',
            image: '', // Image vide
        },
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
        likes: Array(14),
        replies: Array(3),
        reposts: 5,
    },
    {
        _id: '2',
        content: 'Un autre commentaire intéressant avec un point de vue différent !',
        author: {
            _id: '102',
            name: 'Elon Musk',
            username: 'elonmusk',
            image: '', // Image vide
        },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        likes: Array(42),
        replies: Array(7),
        reposts: 12,
    },
    {
        _id: '3',
        content: 'Voici un commentaire plus ancien pour tester le formatage des dates.',
        author: {
            _id: '103',
            name: 'Bill Gates',
            username: 'BillGates',
            image: '', // Image vide
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        likes: Array(89),
        replies: Array(15),
        reposts: 23,
    },
];

interface CommentCardProps {
    comment: Comment;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
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

    const formattedDate = formatDate(comment.createdAt);

    // Fonction pour obtenir les initiales du nom
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="bg-black border border-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    {comment.author.image ? (
                        <img
                            src={`${baseUrl}${comment.author.image}`}
                            alt={comment.author.name}
                            className="w-10 h-10 rounded-full"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {getInitials(comment.author.name)}
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                            <span className="font-bold text-white">{comment.author.name}</span>
                            <span className="text-gray-500">{comment.author.username}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500">{formattedDate}</span>
                        </div>
                    </div>
                    <div className="mt-1">
                        <p className="text-white">{comment.content}</p>
                    </div>
                    <div className="mt-3 flex items-center text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-blue-500">
                            <MessageCircle size={16} />
                            <span>{comment.replies?.length || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserComments: React.FC = () => {
    const { username } = useParams();
    const { data: userData } = useUserProfile(username);
    const { data: userComments, isLoading, error } = useGetCommentsByUserId(userData?._id);

    // État pour contrôler l'affichage des données mockées
    const [showMockData, setShowMockData] = useState(false); // Par défaut, on n'affiche pas les données mockées

    useEffect(() => {
        if (userData) {
            console.log('Données utilisateur pour les commentaires:', userData);
        }
    }, [userData]);

    useEffect(() => {
        if (userComments) {
            console.log('Commentaires récupérés:', userComments);
        }
    }, [userComments]);

    // Afficher les données mockées pour visualisation
    if (showMockData) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-lg font-semibold">
                        Commentaires (Données de test)
                    </h2>
                    <button
                        className="text-xs text-gray-400 hover:text-blue-500"
                        onClick={() => setShowMockData(false)}
                    >
                        Masquer les données de test
                    </button>
                </div>
                {mockComments.map((comment) => (
                    <CommentCard key={comment._id} comment={comment} />
                ))}
            </div>
        );
    }

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="text-white p-4 text-center">
                <p>Une erreur est survenue lors du chargement des commentaires.</p>
                <p className="text-red-500">
                    {error instanceof Error ? error.message : 'Erreur inconnue'}
                </p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setShowMockData(true)}
                >
                    Afficher des exemples de commentaires
                </button>
            </div>
        );
    }

    if (!userComments || !userComments.data || userComments.data.length === 0) {
        return (
            <div className="text-white p-4 text-center">
                <p>Aucun commentaire trouvé pour cet utilisateur.</p>
                <button
                    className="mt-2 text-sm text-blue-500 hover:underline"
                    onClick={() => setShowMockData(true)}
                >
                    Afficher des exemples de commentaires
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold mb-4">
                Commentaires ({userComments.data.length})
            </h2>
            {userComments.data.map((comment) => (
                <CommentCard key={comment._id} comment={comment} />
            ))}
        </div>
    );
};

export default UserComments;
