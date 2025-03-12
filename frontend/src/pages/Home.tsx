import Loader from '@/components/ui/Loader';

import Posts from '../components/Posts/Posts';
import { useGetPosts } from '../services/queries/postQueries';

const Home = () => {
    const { data: posts, isLoading, error } = useGetPosts();

    if (isLoading) return <Loader />;
    if (error) return <div>Error: {error.message}</div>;

    if (posts?.data && posts.data.length > 0) {
        return <Posts userProfile={false} postsData={posts.data} />;
    }
    return <div>No posts found</div>;
};

export default Home;
