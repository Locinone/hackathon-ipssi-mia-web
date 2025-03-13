import { useAuthStore } from '@/store/authStore';
import { Post } from '@/types';

import { useEffect, useState } from 'react';

import PostActions from './PostActions';
import PostAuthor from './PostAuthor';
import PostComments from './PostComments';
import PostContent from './PostContent';
import PostMedia from './PostMedia';

function CardPost({ post }: { post: Post }) {
    const [hashtags, setHashtags] = useState<string[] | null>(null);
    const [openComments, setOpenComments] = useState(false);
    const { user } = useAuthStore();

    if (!post) return null;

    useEffect(() => {
        const hashtags = post.content.match(/#\w+/g);
        setHashtags(hashtags);
    }, [post.content]);

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
                            <PostAuthor post={post} currentUser={user} />

                            <PostContent post={post} hashtags={hashtags} />

                            {/* Actions */}
                            <PostActions
                                post={post}
                                timeAgo={timeAgo(post.createdAt)}
                                onCommentsToggle={() => setOpenComments(!openComments)}
                            />
                        </div>
                    )}

                    {/* Média (image ou vidéo) */}
                    {post.files && post.files.length > 0 && <PostMedia files={post.files} />}

                    {/* Commentaires */}
                    {openComments && (
                        <PostComments postId={post._id!} onClose={() => setOpenComments(false)} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default CardPost;
