import { User } from '@/types';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';
import {
    Bookmark,
    MessageCircle,
    Repeat,
    ThumbsDown,
    ThumbsUp,
    User as UserIcon,
} from 'lucide-react';

function CardPost({
    content = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    author,
    date = new Date().toLocaleDateString(),
    repeat = [],
    likes = [],
    dislikes = [],
    comments = [],
    files = [],
}: {
    content: string;
    author: User;
    date: string;
    repeat: User[];
    likes: User[];
    dislikes: User[];
    comments: User[];
    files: string[];
}) {
    const [hashtags, setHashtags] = useState<string[] | null>(null);

    useEffect(() => {
        const hashtags = content.match(/#\w+/g);
        setHashtags(hashtags);
    }, [content]);

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
            <div className="px-4 sm:px-8 md:px-16 lg:px-24 flex flex-col gap-6 md:gap-10 w-full">
                <div
                    className={`${files && files.length > 0 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}
                >
                    {/* Contenu texte */}
                    {content && (
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
                                            {author.name}
                                        </h3>
                                        <Link to={`/profile/${author.username}`}>
                                            <p className="text-sm sm:text-lg hover:underline">
                                                {author.username}
                                            </p>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <h2
                                className={`${getTextSizeClass(content)} font-bold leading-tight text-left ${files && files.length > 0 ? 'col-span-1' : ''}`}
                            >
                                {content}
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
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <ThumbsUp size={24} />
                                        <p className="text-sm sm:text-lg">{likes.length || 0}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <ThumbsDown size={24} />
                                        <p className="text-sm sm:text-lg">{dislikes.length || 0}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <MessageCircle size={24} />
                                        <p className="text-sm sm:text-lg">{comments.length || 0}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <Repeat size={24} />
                                        <p className="text-sm sm:text-lg">{repeat.length || 0}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <Bookmark size={24} />
                                    </motion.div>
                                    <p className="m-0 text-sm sm:text-lg">{timeAgo(date)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Média (image ou vidéo) au format grid */}
                    {files && files.length > 0 && (
                        <div className="w-3/4 mx-auto grid grid-cols-2 gap-2 rounded-xl overflow-hidden col-span-1">
                            {files.map((item, index) => (
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
                </div>
            </div>
        </div>
    );
}

export default CardPost;
