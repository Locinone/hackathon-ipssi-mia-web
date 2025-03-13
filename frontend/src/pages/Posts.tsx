import { useSearchParams } from 'react-router-dom';

import Loader from '@/components/ui/Loader';

import Posts from '../components/Posts/Posts';
import { useGetPosts } from '../services/queries/postQueries';

const PostsPage = () => {
    const [searchParams] = useSearchParams();
    const h = searchParams.get('h');
    const u = searchParams.get('u');
    const s = searchParams.get('s');
    const sd = searchParams.get('sd');
    const ed = searchParams.get('ed');
    const order = searchParams.get('order');
    const {
        data: posts,
        isLoading,
        error,
    } = useGetPosts(
        h ? h : undefined,
        u ? u : undefined,
        s ? s : undefined,
        sd ? sd : undefined,
        ed ? ed : undefined,
        order ? order : undefined
    );

    if (isLoading) return <Loader />;
    if (error) return <div>Error: {error.message}</div>;

    if (posts?.data && posts.data.length > 0) {
        return <Posts userProfile={false} postsData={posts.data} />;
    }
    return <div>No posts found</div>;
};

export default PostsPage;
