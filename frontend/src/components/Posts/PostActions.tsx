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

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Bookmark, MessageCircle, Repeat, ThumbsDown, ThumbsUp } from 'lucide-react';

interface PostActionsProps {
    post: Post;
    timeAgo: string;
    onCommentsToggle: () => void;
}

function PostActions({ post, timeAgo, onCommentsToggle }: PostActionsProps) {
    const [openRetweet, setOpenRetweet] = useState(false);
    const [openRetweetContent, setOpenRetweetContent] = useState(false);
    const [retweetContent, setRetweetContent] = useState('');

    const { mutate: createLike } = useLikePost();
    const { mutate: createDislike } = useDislikePost();
    const { mutate: createBookmark } = useCreateBookmark();
    const { mutate: createRetweet } = useCreateRetweet();

    const { mutate: deleteLike } = useUnlikePost();
    const { mutate: deleteDislike } = useUndislikePost();
    const { mutate: deleteBookmark } = useDeleteBookmark();
    const { mutate: deleteRetweet } = useDeleteRetweet();

    return (
        <div className="flex flex-row justify-between items-center gap-4 sm:gap-10">
            <div className="flex flex-row justify-between items-center gap-4 sm:gap-10 py-2 px-2 sm:px-4 rounded-full text-white">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
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
                    whileTap={{ scale: 0.9 }}
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
                    whileTap={{ scale: 0.9 }}
                    onClick={onCommentsToggle}
                    className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                >
                    <MessageCircle size={24} />
                    <p className="text-sm sm:text-lg">{post.comments.length || 0}</p>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpenRetweet(!openRetweet)}
                    className="relative flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                >
                    <Repeat
                        size={24}
                        className={`${post.hasShared ? 'text-green-500' : 'text-white'}`}
                    />
                    <p className="text-sm sm:text-lg">{post.shares.length || 0}</p>
                    {openRetweet && (
                        <div className="absolute top-0 left-0 p-2 w-[200px] rounded-lg bg-black/70 backdrop-blur-sm">
                            <div className="flex flex-col text-left gap-2">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        post.hasShared
                                            ? deleteRetweet(post._id!)
                                            : createRetweet({
                                                  postId: post._id!,
                                              });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            post.hasShared
                                                ? deleteRetweet(post._id!)
                                                : createRetweet({
                                                      postId: post._id!,
                                                  });
                                        }
                                    }}
                                    className="cursor-pointer"
                                >
                                    Retweeter
                                </div>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setOpenRetweetContent(true)}
                                >
                                    Retweeter + Message
                                </div>
                            </div>
                        </div>
                    )}
                    {openRetweetContent && (
                        <div className="absolute top-0 left-0 p-2 rounded-lg bg-black">
                            <input
                                type="text"
                                value={retweetContent}
                                onChange={(e) => setRetweetContent(e.target.value)}
                            />
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    post.hasShared
                                        ? deleteRetweet(post._id!)
                                        : createRetweet({
                                              postId: post._id!,
                                              content: retweetContent,
                                          });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        post.hasShared
                                            ? deleteRetweet(post._id!)
                                            : createRetweet({
                                                  postId: post._id!,
                                                  content: retweetContent,
                                              });
                                    }
                                }}
                                className="cursor-pointer"
                            >
                                Retweeter
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
                <p className="m-0 text-sm sm:text-lg">{timeAgo}</p>
            </div>
        </div>
    );
}

export default PostActions;
