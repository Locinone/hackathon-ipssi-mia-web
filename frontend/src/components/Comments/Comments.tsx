import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MessageCircle } from 'lucide-react';

import { api } from '../../services/api';
import { useGetCommentsByUserId, useReplyToComment } from '../../services/queries/commentQueries';
import { useUserProfile } from '../../services/queries/useUserProfile';
import Loader from '../ui/Loader';

// Définition du type Comment si non disponible dans @/types
interface Comment {
    _id: string;
    content: string;
    author: {
        _id: string;
        name?: string;
        username: string;
        image?: string;
        email?: string;
    };
    post?: string;
    parentComment?: string;
    createdAt?: string;
    likes?: any[];
    replies?: Comment[];
    reposts?: number;
}

interface CommentCardProps {
    comment: Comment;
    setShowReplies: (show: boolean) => void;
}

// Composant pour le formulaire de réponse
interface ReplyFormProps {
    commentId: string;
    postId: string;
    onReplyAdded: () => void;
    onCancel: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ commentId, onReplyAdded, onCancel }) => {
    const [content, setContent] = useState('');
    const { mutate: replyToComment, isPending } = useReplyToComment();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        replyToComment(
            { content, commentId },
            {
                onSuccess: () => {
                    setContent('');
                    onReplyAdded();
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 mb-4">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrire une réponse..."
                className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                rows={2}
            />
            <div className="flex justify-end mt-2 space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={isPending || !content.trim()}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? 'Envoi...' : 'Répondre'}
                </button>
            </div>
        </form>
    );
};

// Mise à jour du composant CommentCard pour gérer les réponses
export const CommentCard: React.FC<CommentCardProps> = ({ comment, setShowReplies }) => {
    const baseUrl = api.getUrl();
    const [showReplyForm, setShowReplyForm] = useState(false);

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
        if (!name) return '';
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    };

    const handleReplyAdded = () => {
        setShowReplyForm(false);
    };

    return (
        <div className="bg-black border border-gray-800 rounded-lg p-4 mb-2">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    {comment.author.image ? (
                        <img
                            src={`${baseUrl}${comment.author.image}`}
                            alt={comment.author.name || comment.author.username}
                            className="w-10 h-10 rounded-full"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {getInitials(comment.author.name || comment.author.username)}
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                            <span className="font-bold text-white">
                                {comment.author.name || comment.author.username}
                            </span>
                            <span className="text-gray-500">{comment.author.username}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500">{formattedDate}</span>
                        </div>
                    </div>
                    <div className="mt-1">
                        <p className="text-white">{comment.content}</p>
                    </div>
                    <div className="mt-3 flex items-center space-x-4 text-gray-500">
                        <button
                            className="flex items-center space-x-1 hover:text-blue-500"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            <MessageCircle size={16} />
                            <span>Répondre</span>
                        </button>
                        {comment.replies && comment.replies.length > 0 && (
                            <button
                                className="flex items-center space-x-1 hover:text-blue-500"
                                onClick={() => setShowReplies(true)}
                            >
                                <MessageCircle size={16} />
                                <span>Voir les réponses</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showReplyForm && (
                <ReplyForm
                    commentId={comment._id}
                    postId={comment.post || ''}
                    onReplyAdded={handleReplyAdded}
                    onCancel={() => setShowReplyForm(false)}
                />
            )}
        </div>
    );
};

export const UserComments: React.FC = () => {
    const { username } = useParams();
    const { data: userData } = useUserProfile(username);
    const { data: userComments, isLoading, error } = useGetCommentsByUserId(userData?._id);

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
                    onClick={() => window.location.reload()}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!userComments || !userComments.data || userComments.data.length === 0) {
        return (
            <div className="text-white p-4 text-center">
                <p>Aucun commentaire trouvé pour cet utilisateur.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold mb-4">
                Commentaires ({userComments.data.length})
            </h2>
            {userComments.data.map((comment) => (
                <CommentCard key={comment._id} comment={comment} setShowReplies={() => {}} />
            ))}
        </div>
    );
};
