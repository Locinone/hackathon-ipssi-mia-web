import { useFollowUser, useUnfollowUser } from '@/services/queries/interactionQueries';
import { Post } from '@/types';

import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';
import { MoreVertical, User as UserIcon } from 'lucide-react';

interface PostAuthorProps {
    post: Post;
    currentUser: any;
}

function PostAuthor({ post, currentUser }: PostAuthorProps) {
    const { mutate: followUser } = useFollowUser();
    const { mutate: unfollowUser } = useUnfollowUser();

    return (
        <div className="flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 sm:w-16 sm:h-16 p-2 rounded-full overflow-hidden bg-white/20 flex items-center justify-center"
            >
                <UserIcon className="text-white" size={32} />
            </motion.div>
            <div className="flex flex-row gap-3">
                <div className="flex flex-col gap-[-20em]">
                    <h3 className="text-xl sm:text-2xl font-bold">{post.author.name}</h3>
                    <Link to={`/profile/${post.author.username}`}>
                        <p className="text-sm sm:text-lg hover:underline">{post.author.username}</p>
                    </Link>
                </div>
            </div>
            {post.author.username === currentUser?.username ? (
                <button className="top-0 right-0">
                    <MoreVertical size={24} />
                </button>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    className={`bg-white/20 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 ${
                        post.author.isFollowing ? 'hover:bg-red-500 group' : 'hover:bg-white group'
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
                        <span className="hidden group-hover:block">Se désabonner</span>
                    )}
                    {!post.author.isFollowing && (
                        <span className="hidden group-hover:block group-hover:text-black">
                            Suivre
                        </span>
                    )}
                </motion.button>
            )}
        </div>
    );
}

export default PostAuthor;
