import Loader from '@/components/ui/Loader';
import Posts from '../components/Posts/Posts';
import { useGetPosts } from '../services/queries/postQueries';

const Home = () => {
    const { data: posts, isLoading, error } = useGetPosts();

    if (isLoading) return <Loader />;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {posts?.data && posts.data.length > 0 ? (
                <Posts userProfile={false} postsData={posts.data} />
            ) : (
                <div>No posts found</div>
            )}
        </div>
    );
};

export default Home;
