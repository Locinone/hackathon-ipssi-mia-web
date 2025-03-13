import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
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
                <div className="flex flex-col items-center bg-black text-white justify-center h-screen">
                    <h1 className="text-2xl font-bold">Aucun post trouvé</h1>
                    <p className="text-gray-500">Essayez de modifier les paramètres de recherche</p>
                    <Link to="/" className="text-blue-500 mt-3">
                        <Button>Retour à la page d'accueil</Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Home;
