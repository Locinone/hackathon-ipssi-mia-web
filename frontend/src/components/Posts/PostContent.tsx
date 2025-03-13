import { Post } from '@/types';

import { motion } from 'framer-motion';

interface PostContentProps {
    post: Post;
    hashtags: string[] | null;
}

function PostContent({ post, hashtags }: PostContentProps) {
    const getTextSizeClass = (text: string) => {
        if (!text) return 'text-7xl';

        const length = text.length;
        if (length > 100) return 'text-2xl md:text-4xl lg:text-6xl';
        if (length > 80) return 'text-3xl md:text-4xl lg:text-7xl';
        return 'text-4xl md:text-5xl lg:text-8xl';
    };

    return (
        <>
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
        </>
    );
}

export default PostContent;
