import {
    useCreateBookmark,
    useCreateRetweet,
    useDeleteBookmark,
    useDeleteRetweet,
    useDislikePost,
    useLikePost,
    useUndislikePost,
    useUnlikePost,
} from '@/services/queries/interactionQueries';
import { Post } from '@/types';

import { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';
import { Bookmark, MessageCircle, Repeat, ThumbsDown, ThumbsUp } from 'lucide-react';

interface PostActionsProps {
    post: Post;
    timeAgo: string;
    onCommentsToggle: () => void;
}

function PostActions({ post, timeAgo, onCommentsToggle }: PostActionsProps) {
    const [openRetweet, setOpenRetweet] = useState(false);
    const [retweetContent, setRetweetContent] = useState('');
    const [isRetweeting, setIsRetweeting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const retweetMenuRef = useRef<HTMLDivElement>(null);

    const { mutate: createLike } = useLikePost();
    const { mutate: createDislike } = useDislikePost();
    const { mutate: createBookmark } = useCreateBookmark();
    const { mutate: createRetweet } = useCreateRetweet();

    const { mutate: deleteLike } = useUnlikePost();
    const { mutate: deleteDislike } = useUndislikePost();
    const { mutate: deleteBookmark } = useDeleteBookmark();
    const { mutate: deleteRetweet } = useDeleteRetweet();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (retweetMenuRef.current && !retweetMenuRef.current.contains(event.target as Node)) {
                setOpenRetweet(false);
            }
        };

        if (openRetweet) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openRetweet]);

    const handleRetweetWithContent = async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            if (post.hasShared) {
                setIsDeleting(true);
                await deleteRetweet(post._id!);
            } else {
                setIsRetweeting(true);
                await createRetweet({
                    postId: post._id!,
                    content: retweetContent.trim() || undefined,
                });
            }

            setRetweetContent('');
            setOpenRetweet(false);
        } catch (error) {
            console.error('Erreur lors du retweet:', error);
        } finally {
            setIsRetweeting(false);
            setIsDeleting(false);
        }
    };

    const handleSimpleRetweet = async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            if (post.hasShared) {
                setIsDeleting(true);
                await deleteRetweet(post._id!);
            } else {
                setIsRetweeting(true);
                await createRetweet({
                    postId: post._id!,
                });
            }

            setOpenRetweet(false);
        } catch (error) {
            console.error('Erreur lors du retweet simple:', error);
        } finally {
            setIsRetweeting(false);
            setIsDeleting(false);
        }
    };

    const toggleRetweetMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenRetweet(!openRetweet);
    };

    return (
        <div className="flex flex-col items-start gap-4">
            <div className="flex flex-row justify-between items-center w-full md:w-auto gap-4 sm:gap-10 py-2 px-2 sm:px-4 rounded-full text-white">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                        post.hasLiked ? deleteLike(post._id!) : createLike(post._id!);
                    }}
                    className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                >
                    <ThumbsUp
                        size={24}
                        fill={post.hasLiked ? 'currentColor' : 'none'}
                        className={`${post.hasLiked ? 'text-blue-300' : 'text-white'}`}
                    />
                    <p className="text-sm sm:text-lg">{post.likes.length || 0}</p>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                        post.hasDisliked ? deleteDislike(post._id!) : createDislike(post._id!);
                    }}
                    className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                >
                    <ThumbsDown
                        size={24}
                        fill={post.hasDisliked ? 'currentColor' : 'none'}
                        className={`${post.hasDisliked ? 'text-red-400' : 'text-white'}`}
                    />
                    <p className="text-sm sm:text-lg">{post.dislikes.length || 0}</p>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={onCommentsToggle}
                    className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                >
                    <MessageCircle size={24} />
                    <p className="text-sm sm:text-lg">{post.comments.length || 0}</p>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={toggleRetweetMenu}
                    className="relative flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                >
                    <Repeat
                        size={24}
                        className={`${post.hasShared ? 'text-green-500' : 'text-white'}`}
                    />
                    <p className="text-sm sm:text-lg">{post.shares.length || 0}</p>
                    {openRetweet && (
                        <div
                            ref={retweetMenuRef}
                            className="absolute top-8 left-0 p-3 w-[250px] rounded-lg bg-black/80 backdrop-blur-sm z-10 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col text-left gap-3">
                                <button
                                    onClick={handleSimpleRetweet}
                                    disabled={isRetweeting || isDeleting}
                                    className="hover:bg-gray-800 p-2 rounded-md transition-colors disabled:opacity-50"
                                >
                                    {isDeleting && post.hasShared
                                        ? 'Suppression...'
                                        : isRetweeting && !post.hasShared
                                          ? 'Retweet en cours...'
                                          : post.hasShared
                                            ? 'Annuler le retweet'
                                            : 'Retweeter'}
                                </button>

                                <div className="border-t border-gray-700 pt-2">
                                    <p className="mb-2 text-sm text-gray-300">
                                        {post.hasShared
                                            ? 'Supprimer votre retweet'
                                            : 'Retweeter avec un message (optionnel)'}
                                    </p>
                                    {!post.hasShared && (
                                        <textarea
                                            value={retweetContent}
                                            onChange={(e) => setRetweetContent(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full p-2 bg-gray-900 rounded-md text-white mb-2 resize-none"
                                            rows={2}
                                            placeholder="Ajouter un commentaire (optionnel)..."
                                            disabled={isRetweeting}
                                        />
                                    )}
                                    <button
                                        onClick={handleRetweetWithContent}
                                        disabled={isRetweeting || isDeleting}
                                        className={`${
                                            post.hasShared
                                                ? 'bg-red-600 hover:bg-red-700'
                                                : 'bg-green-600 hover:bg-green-700'
                                        } p-1 px-3 rounded-full text-sm transition-colors w-full disabled:opacity-50`}
                                    >
                                        {isDeleting && post.hasShared
                                            ? 'Suppression...'
                                            : isRetweeting && !post.hasShared
                                              ? 'Retweet en cours...'
                                              : post.hasShared
                                                ? 'Supprimer le retweet'
                                                : 'Retweeter'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        post.hasBookmarked ? deleteBookmark(post._id!) : createBookmark(post._id!);
                    }}
                    className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                >
                    <Bookmark
                        size={24}
                        className={`${post.hasBookmarked ? 'text-yellow-300' : 'text-white'}`}
                        fill={post.hasBookmarked ? 'currentColor' : 'none'}
                    />
                </motion.button>
            </div>
            <p className="mt-5 text-sm sm:text-lg">{timeAgo}</p>
        </div>
    );
}

export default PostActions;
