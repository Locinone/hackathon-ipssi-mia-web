import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Bookmark, Heart, MessageCircle, Repeat, User } from 'lucide-react';

function CardPost({
    content = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    author,
    date = new Date().toLocaleDateString(),
    repeat = 0,
    likes = 0,
    comments = 0,
    mediaItems = [],
}) {
    const [hashtags, setHashtags] = useState(['#hashtag1', '#hashtag2', '#hashtag3']);

    useEffect(() => {
        const hashtags = content.match(/#\w+/g);
        setHashtags(hashtags);
    }, [content]);

    const getTextSizeClass = (text) => {
        if (!text) return 'text-7xl';

        const length = text.length;
        if (length > 100) return 'text-2xl md:text-4xl lg:text-6xl';
        if (length > 80) return 'text-3xl md:text-4xl lg:text-7xl';
        return 'text-4xl md:text-5xl lg:text-8xl';
    };

    return (
        <div className="w-full h-full flex flex-col items-start text-white">
            <div className="px-4 sm:px-8 md:px-16 lg:px-24 flex flex-col gap-6 md:gap-10 w-full">
                <div
                    className={`${mediaItems && mediaItems.length > 0 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}
                >
                    {/* Contenu texte */}
                    {content && (
                        <div className="flex flex-col gap-10">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="w-12 h-12 sm:w-16 sm:h-16 p-2 rounded-full overflow-hidden bg-white/20 flex items-center justify-center"
                                >
                                    <User className="text-white" size={32} />
                                </motion.div>
                                <div className="text-left">
                                    <h3 className="m-0 text-xl sm:text-2xl font-medium">
                                        {author}
                                    </h3>
                                    <p className="m-0 text-sm sm:text-lg">{date}</p>
                                </div>
                            </div>
                            <h2
                                className={`${getTextSizeClass(content)} font-bold leading-tight text-left ${mediaItems && mediaItems.length > 0 ? 'col-span-1' : ''}`}
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
                                        <Heart size={24} />
                                        <p className="text-sm sm:text-lg">{likes}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <MessageCircle size={24} />
                                        <p className="text-sm sm:text-lg">{comments}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <Repeat size={24} />
                                        <p className="text-sm sm:text-lg">{repeat}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex flex-row justify-between items-center gap-1 sm:gap-2 cursor-pointer"
                                    >
                                        <Bookmark size={24} />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Média (image ou vidéo) au format grid */}
                    {mediaItems && mediaItems.length > 0 && (
                        <div className="w-3/4 mx-auto grid grid-cols-2 gap-2 rounded-xl overflow-hidden col-span-1">
                            {mediaItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.02 }}
                                    className="overflow-hidden aspect-square"
                                >
                                    {item.type === 'image' && (
                                        <img
                                            src={item.url}
                                            alt={`Media ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    {item.type === 'video' && (
                                        <video
                                            src={item.url}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
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
