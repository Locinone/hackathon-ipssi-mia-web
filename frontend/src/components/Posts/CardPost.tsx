import {
    useCreateBookmark,
    useCreateRetweet,
    useDeleteBookmark,
    useDeleteRetweet,
    useDislikePost,
    useFollowUser,
    useLikePost,
    useUndislikePost,
    useUnfollowUser,
    useUnlikePost,
} from '@/services/queries/interactionQueries';
import { useAuthStore } from '@/store/authStore';
import { Post } from '@/types';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';
import {
    Bookmark,
    MessageCircle,
    MoreVertical,
    Repeat,
    ThumbsDown,
    ThumbsUp,
    User as UserIcon,
    X,
} from 'lucide-react';

import CreateCommentForm from './CreateCommentForm';

function CardPost({ post }: { post: Post }) {
    const [hashtags, setHashtags] = useState<string[] | null>(null);
    const [openComments, setOpenComments] = useState(false);
    const [openRetweet, setOpenRetweet] = useState(false);
    const [openRetweetContent, setOpenRetweetContent] = useState(false);
    const [retweetContent, setRetweetContent] = useState('');
    const { user } = useAuthStore();

    const { mutate: createLike } = useLikePost();
    const { mutate: createDislike } = useDislikePost();
    const { mutate: createBookmark } = useCreateBookmark();
    const { mutate: createRetweet } = useCreateRetweet();
    const { mutate: followUser } = useFollowUser();

    const { mutate: deleteLike } = useUnlikePost();
    const { mutate: deleteDislike } = useUndislikePost();
    const { mutate: deleteBookmark } = useDeleteBookmark();
    const { mutate: deleteRetweet } = useDeleteRetweet();
    const { mutate: unfollowUser } = useUnfollowUser();

    if (!post) return null;

    useEffect(() => {
        const hashtags = post.content.match(/#\w+/g);
        setHashtags(hashtags);
    }, [post.content]);

    const getTextSizeClass = (text: string) => {
        if (!text) return 'text-7xl';

        const length = text.length;
        if (length > 100) return 'text-2xl md:text-4xl lg:text-6xl';
        if (length > 80) return 'text-3xl md:text-4xl lg:text-7xl';
        return 'text-4xl md:text-5xl lg:text-8xl';
    };

    const timeAgo = (date: string) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffTime = Math.abs(now.getTime() - postDate.getTime());

        const seconds = Math.floor(diffTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);
        if (years > 0) return `Posté il y a ${years} an${years > 1 ? 's' : ''}.`;
        if (months > 0) return `Posté il y a ${months} mois.`;
        if (days > 0) return `Posté il y a ${days} jour${days > 1 ? 's' : ''}.`;
        if (hours > 0) return `Posté il y a ${hours} heure${hours > 1 ? 's' : ''}.`;
        if (minutes > 0) return `Posté il y a ${minutes} minute${minutes > 1 ? 's' : ''}.`;
        return `Posté il y a ${seconds} seconde${seconds > 1 ? 's' : ''}.`;
    };

    return (
        <div className="w-full h-full flex flex-col items-start text-white">
            <div className="relative px-4 sm:px-8 md:px-16 lg:px-24 flex flex-col gap-6 md:gap-10 w-full">
                <div
                    className={`${post.files && post.files.length > 0 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}
                >
                    {/* Contenu texte */}
                    {post.content && (
                        <div className="flex flex-col gap-10">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="w-12 h-12 sm:w-16 sm:h-16 p-2 rounded-full overflow-hidden bg-white/20 flex items-center justify-center"
                                >
                                    <UserIcon className="text-white" size={32} />
                                </motion.div>
                                <div className="flex flex-row gap-3">
                                    <div className="flex flex-col gap-[-20em]">
                                        <h3 className="text-xl sm:text-2xl font-bold">
                                            {post.author.name}
                                        </h3>
                                        <Link to={`/profile/${post.author.username}`}>
                                            <p className="text-sm sm:text-lg hover:underline">
                                                {post.author.username}
                                            </p>
                                        </Link>
                                    </div>
                                </div>
                                {post.author.username === user?.username ? (
                                    <button className=" top-0 right-0">
                                        <MoreVertical size={24} />
                                    </button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        className={`bg-white/20 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 ${
                                            post.author.isFollowing
                                                ? 'hover:bg-red-500 group'
                                                : 'hover:bg-white group'
                                        } `}
                                        onClick={() => {
                                            post.author.isFollowing
                                                ? unfollowUser(post.author._id!)
                                                : followUser(post.author._id!);
                                        }}
                                    >
                                        <span className="group-hover:hidden">
                                            {post.author.isFollowing ? 'Suivi' : 'Suivre'}
                                        </span>
                                        {post.author.isFollowing && (
                                            <span className="hidden group-hover:block">
                                                Se désabonner
                                            </span>
                                        )}
                                        {!post.author.isFollowing && (
                                            <span className="hidden group-hover:block group-hover:text-black">
                                                Suivre
                                            </span>
                                        )}
                                    </motion.button>
                                )}
                            </div>
                            <h2
                                className={`${getTextSizeClass(post.content)} font-bold leading-tight text-left ${post.files && post.files.length > 0 ? 'col-span-1' : ''}`}
                            >
                                {post.content}
                            </h2>

                            {/* Hashtags */}
                            {hashtags && hashtags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {hashtags.map((hashtag) => (
                                        <motion.p
                                            key={hashtag}
                                            whileHover={{ scale: 1.05 }}
                                            className="text-base sm:text-xl cursor-pointer"
                                        >
                                            {hashtag}
                                        </motion.p>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-row justify-between items-center gap-4 sm:gap-10">
                                <div className="flex flex-row justify-between items-center gap-4 sm:gap-10 py-2 px-2 sm:px-4 rounded-full text-white">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            post.hasLiked
                                                ? deleteLike(post._id!)
                                                : createLike(post._id!);
                                        }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <ThumbsUp
                                            size={24}
                                            fill={post.hasLiked ? 'currentColor' : 'none'}
                                            className={`${post.hasLiked ? 'text-blue-300' : 'text-white'}`}
                                        />
                                        <p className="text-sm sm:text-lg">
                                            {post.likes.length || 0}
                                        </p>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            post.hasDisliked
                                                ? deleteDislike(post._id!)
                                                : createDislike(post._id!);
                                        }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <ThumbsDown
                                            size={24}
                                            fill={post.hasDisliked ? 'currentColor' : 'none'}
                                            className={`${post.hasDisliked ? 'text-red-400' : 'text-white'}`}
                                        />
                                        <p className="text-sm sm:text-lg">
                                            {post.dislikes.length || 0}
                                        </p>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setOpenComments(!openComments)}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <MessageCircle size={24} />
                                        <p className="text-sm sm:text-lg">
                                            {post.comments.length || 0}
                                        </p>
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
                                        <p className="text-sm sm:text-lg">
                                            {post.shares.length || 0}
                                        </p>
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
                                                    onChange={(e) =>
                                                        setRetweetContent(e.target.value)
                                                    }
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
                                            post.hasBookmarked
                                                ? deleteBookmark(post._id!)
                                                : createBookmark(post._id!);
                                        }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <Bookmark
                                            size={24}
                                            className={`${post.hasBookmarked ? 'text-yellow-300' : 'text-white'}`}
                                            fill={post.hasBookmarked ? 'currentColor' : 'none'}
                                        />
                                    </motion.button>
                                    <p className="m-0 text-sm sm:text-lg">
                                        {timeAgo(post.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Média (image ou vidéo) au format grid */}
                    {post.files && post.files.length > 0 && (
                        <div className="w-3/4 mx-auto grid grid-cols-2 gap-2 rounded-xl overflow-hidden col-span-1">
                            {post.files.map((item, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.02 }}
                                    className="overflow-hidden aspect-square"
                                >
                                    {item.endsWith('.jpg') ||
                                    item.endsWith('.png') ||
                                    item.endsWith('.jpeg') ? (
                                        <img
                                            src={'http://localhost:3000' + item}
                                            alt={`Media ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : item.endsWith('.mp4') ? (
                                        <video
                                            src={'http://localhost:3000' + item}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <p>ff</p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Commentaires */}
                    {openComments && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed bottom-0 left-0 w-full h-full bg-black/50 z-20"
                        >
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute p-4 bg-black z-[100] h-full gap-4 w-1/3 right-0"
                            >
                                <div className="flex flex-row justify-between items-center gap-4">
                                    <p className="text-white text-2xl font-bold">Commentaires</p>
                                    <motion.button
                                        onClick={() => setOpenComments(false)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="cursor-pointer"
                                    >
                                        <X size={24} />
                                    </motion.button>
                                </div>
                                <CreateCommentForm postId={post._id!} onSubmit={() => {}} />
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CardPost;
