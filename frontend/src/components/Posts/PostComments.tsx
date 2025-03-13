import { CommentSchema } from '@/schemas/postSchemas';
import {
    useCreateComment,
    useGetCommentsByPostId,
    useGetRepliesByComment,
} from '@/services/queries/commentQueries';
import { Comment } from '@/types';

import { Fragment, useState } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';

import { CommentCard } from '../Comments/Comments';
import CreateCommentForm from './CreateCommentForm';

interface PostCommentsProps {
    postId: string;
    onClose: () => void;
}

function PostComments({ postId, onClose }: PostCommentsProps) {
    const [showReplies, setShowReplies] = useState(false);
    const [parentsComments, setParentsComments] = useState<Comment[]>([]);
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
    const { data: comments, isLoading, isError, refetch } = useGetCommentsByPostId(postId);
    const {
        data: replies,
        isLoading: isRepliesLoading,
        isError: isRepliesError,
        refetch: refetchReplies,
    } = useGetRepliesByComment(selectedComment?._id || '');

    const { mutate: createComment } = useCreateComment();

    const goBack = () => {
        let previousComment = parentsComments.pop();
        console.log(previousComment);
        if (previousComment) {
            setSelectedComment(previousComment);
            refetchReplies();
            setShowReplies(true);
        } else {
            setSelectedComment(null);
            setShowReplies(false);
        }
    };

    const handleSubmit = (data: CommentSchema) => {
        createComment(data, {
            onSuccess: () => {
                if (showReplies) {
                    refetchReplies();
                } else {
                    refetch();
                }
            },
        });
    };

    const handleShowReplies = (comment: Comment) => {
        setSelectedComment(comment);
        setParentsComments([...parentsComments, comment]);
        setShowReplies(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 w-full h-full bg-black/50 backdrop-blur-xs z-20"
        >
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute p-4 bg-black z-[100] h-full gap-4 w-1/3 right-0"
            >
                {showReplies ? (
                    <Fragment>
                        <div className="flex flex-row justify-between items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="cursor-pointer"
                                onClick={() => {
                                    goBack();
                                }}
                            >
                                <ArrowLeft size={24} />
                            </motion.button>
                            <p className="text-white text-2xl font-bold">
                                Réponses à {selectedComment?.author.username}
                            </p>
                        </div>
                        {isRepliesLoading && <p>Chargement des réponses...</p>}
                        {isRepliesError && <p>Erreur lors du chargement des réponses</p>}
                        {replies &&
                            replies.data &&
                            replies.data.map((reply: Comment) => (
                                <CommentCard
                                    key={reply._id}
                                    comment={reply}
                                    setShowReplies={() => {
                                        handleShowReplies(reply);
                                    }}
                                />
                            ))}
                    </Fragment>
                ) : (
                    <Fragment>
                        <div className="flex flex-row justify-between items-center gap-4">
                            <p className="text-white text-2xl font-bold">Commentaires</p>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="cursor-pointer"
                            >
                                <X size={24} />
                            </motion.button>
                        </div>
                        <CreateCommentForm postId={postId} onSubmit={handleSubmit} />
                        {isLoading && <p>Chargement des commentaires...</p>}
                        {isError && <p>Erreur lors du chargement des commentaires</p>}
                        {comments &&
                            comments.data &&
                            comments.data.map((comment: Comment) => (
                                <CommentCard
                                    key={comment._id}
                                    comment={comment}
                                    setShowReplies={() => {
                                        handleShowReplies(comment);
                                    }}
                                />
                            ))}
                    </Fragment>
                )}
            </motion.div>
        </motion.div>
    );
}

export default PostComments;
