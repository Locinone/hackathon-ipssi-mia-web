import { useParams } from 'react-router-dom';

import Loader from '@/components/ui/Loader';

import Posts from '../components/Posts/Posts';
import { useGetPostById } from '../services/queries/postQueries';

const UniquePostPage = () => {
    const { id } = useParams();
    const { data: posts, isLoading, error } = useGetPostById(id ? id : '');

    if (isLoading) return <Loader />;
    if (error) return <div>Error: {error.message}</div>;

    if (posts?.data) {
        return <Posts userProfile={false} postsData={[posts.data]} />;
    }
    return <div>No posts found</div>;
};

export default UniquePostPage;
