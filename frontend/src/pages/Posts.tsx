import { Link, useSearchParams } from 'react-router-dom';

import Button from '@/components/ui/Button';
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
    return (
        <div className="flex flex-col items-center bg-black text-white justify-center h-screen">
            <h1 className="text-2xl font-bold">Aucun post trouvé</h1>
            <p className="text-gray-500">Essayez de modifier les paramètres de recherche</p>
            <Link to="/" className="text-blue-500 mt-3">
                <Button>Retour à la page d'accueil</Button>
            </Link>
        </div>
    );
};

export default PostsPage;
