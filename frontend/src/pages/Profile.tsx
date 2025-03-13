import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Calendar, Link as LinkIcon, MapPin } from 'lucide-react';

import UserBookmarks from '../components/Bookmarks/UserBookmarks';
import UserComments from '../components/Comments/Comments';
import UserLikes from '../components/Likes/UserLikes';
import Posts from '../components/Posts/Posts';
import ProfileEditForm from '../components/ProfileEditForm';
import Loader from '../components/ui/Loader';
import { updateUserSchema } from '../schemas/authSchemas';
import { api } from '../services/api';
import { useGetPostsByUserId } from '../services/queries/postQueries';
import {
    useUpdateUserProfile,
    useUserFollowers,
    useUserFollowing,
    useUserProfile,
} from '../services/queries/useUserProfile';

// Les données mockées userPosts, userComments, userLikes, userDislikes restent inchangées

// Type pour la modal des abonnements/abonnés
type FollowModalType = 'followers' | 'following' | null;

const Profile = () => {
    const { username } = useParams();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('posts');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [followModal, setFollowModal] = useState<FollowModalType>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        biography: '',
        location: '',
        link: '',
    });

    // Récupérer le paramètre tab de l'URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get('tab');
        if (tabParam && ['posts', 'comments', 'likes', 'bookmarks'].includes(tabParam)) {
            setActiveTab(tabParam);
            console.log(`Onglet activé depuis l'URL: ${tabParam}`);
        }
    }, [location.search]);

    const { data: userData, isLoading, error } = useUserProfile(username);
    const {
        data: userPosts,
        isLoading: isLoadingPosts,
        error: errorPosts,
    } = useGetPostsByUserId(userData?._id);
    const { mutate: updateUserProfile, isPending: isUpdating } = useUpdateUserProfile();

    // Récupérer les abonnés et les abonnements
    const { data: followers, isLoading: isLoadingFollowers } = useUserFollowers(
        followModal === 'followers' ? userData?._id : undefined
    );

    const { data: following, isLoading: isLoadingFollowing } = useUserFollowing(
        followModal === 'following' ? userData?._id : undefined
    );

    const baseUrl = api.getUrl();

    // Fonction pour ouvrir la modal des abonnements/abonnés
    const openFollowModal = (type: FollowModalType) => {
        setFollowModal(type);
    };

    // Fonction pour fermer la modal des abonnements/abonnés
    const closeFollowModal = () => {
        setFollowModal(null);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        console.log('Données utilisateur récupérées:', userData);
        if (userData) {
            setFormData({
                name: userData.name || '',
                username: userData.username || '',
                biography: userData.biography || '',
                location: userData.location || '',
                link: userData.link || '',
            });
        }
    }, [userData]);

    useEffect(() => {
        if (isModalOpen) {
            console.log('Contenu du formulaire:', formData);
        }
    }, [isModalOpen, formData]);

    const handleSubmit = async (updatedFormData: typeof formData) => {
        const parsedData = updateUserSchema.safeParse(updatedFormData);

        if (!parsedData.success) {
            console.error('Erreur de validation:', parsedData.error.format());
            toast.error('Erreur de validation des données');
            return;
        }

        try {
            console.log('Données validées envoyées pour mise à jour:', parsedData.data);

            // Afficher un toast de chargement
            const loadingToast = toast.loading('Mise à jour en cours...');

            updateUserProfile(parsedData.data, {
                onSuccess: (updatedUserData) => {
                    // Fermer le toast de chargement
                    toast.dismiss(loadingToast);

                    console.log('Mise à jour réussie, nouvelles données:', updatedUserData);

                    // Fermer la modal
                    setIsModalOpen(false);

                    // Mettre à jour les données du formulaire avec les nouvelles valeurs
                    if (updatedUserData) {
                        setFormData({
                            name: updatedUserData.name || '',
                            username: updatedUserData.username || '',
                            biography: updatedUserData.biography || '',
                            location: updatedUserData.location || '',
                            link: updatedUserData.link || '',
                        });

                        // Afficher un message de succès détaillé
                        toast.success(
                            `Profil mis à jour avec succès ! Nom: ${updatedUserData.name}, Username: @${updatedUserData.username}`
                        );
                    }
                },
                onError: (error) => {
                    // Fermer le toast de chargement
                    toast.dismiss(loadingToast);

                    console.error('Erreur lors de la mise à jour:', error);
                    toast.error(`Échec de la mise à jour: ${error.message}`);
                },
            });
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            toast.error('Une erreur est survenue lors de la mise à jour du profil');
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    if (error || !userData) {
        return (
            <div className="w-full min-h-screen bg-black flex items-center justify-center">
                <p className="text-red-500">
                    {error instanceof Error ? error.message : 'Profil non trouvé'}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-black">
            <style>
                {`
                @keyframes refresh-fade {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                .refresh-animation {
                    animation: refresh-fade 0.5s ease-in-out;
                }
                
                @keyframes slideDown {
                    0% { transform: translateY(-20px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out forwards;
                }
                `}
            </style>
            <div className="relative px-32 pt-32 profile-container">
                <div className="flex flex-col gap-4">
                    <div className="relative flex flex-col gap-4">
                        <div className="h-48 w-full overflow-hidden">
                            <img
                                src={`${baseUrl}${userData.banner}`}
                                alt="Bannière de profil"
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>

                        <div className="absolute -bottom-16 right-4 md:right-10">
                            <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden">
                                <img
                                    src={`${baseUrl}${userData.image}`}
                                    alt="Photo de profil"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{userData.name}</h1>
                            <p className="text-gray-500">{userData.username}</p>
                        </div>

                        <p className="my-3 text-white">{userData.biography}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 my-3">
                            {userData.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    <span>{userData.location}</span>
                                </div>
                            )}
                            {userData.link && (
                                <div className="flex items-center gap-1">
                                    <LinkIcon size={16} />
                                    <a
                                        href={`https://${userData.link}`}
                                        className="text-blue-500 hover:underline"
                                    >
                                        {userData.link}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>
                                    Profil créé le{' '}
                                    {userData?.createdAt
                                        ? new Date(userData.createdAt).toLocaleDateString()
                                        : 'Date inconnue'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 my-3">
                            <div
                                className="cursor-pointer hover:underline"
                                onClick={() => openFollowModal('following')}
                            >
                                <span className="font-bold text-white">
                                    {userData.following.length}
                                </span>{' '}
                                <span className="text-gray-500">abonnements</span>
                            </div>
                            <div
                                className="cursor-pointer hover:underline"
                                onClick={() => openFollowModal('followers')}
                            >
                                <span className="font-bold text-white">
                                    {userData.followers.length}
                                </span>{' '}
                                <span className="text-gray-500">abonnés</span>
                            </div>
                        </div>

                        <div className="mt-2">
                            <button
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Modifier le profil
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-b border-gray-200 mt-4">
                    <div className="flex overflow-x-auto">
                        {['posts', 'comments', 'likes', 'bookmarks'].map((tab) => (
                            <button
                                key={tab}
                                className={`px-4 py-3 font-medium text-sm flex-1 blackspace-nowrap ${
                                    activeTab === tab
                                        ? 'text-white border-b-2 border-white'
                                        : 'text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer'
                                }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    {activeTab === 'posts' && (
                        <>
                            {isLoadingPosts ? (
                                <Loader />
                            ) : errorPosts ? (
                                <div className="text-white p-4 text-center">
                                    <p>Une erreur est survenue lors du chargement des posts.</p>
                                </div>
                            ) : !userPosts || !userPosts.data || userPosts.data.length === 0 ? (
                                <div className="text-white p-4 text-center">
                                    <p>Les posts de l'utilisateur seront affichés ici.</p>
                                </div>
                            ) : (
                                <Posts userProfile={true} postsData={userPosts.data} />
                            )}
                        </>
                    )}
                    {activeTab === 'comments' && <UserComments />}
                    {activeTab === 'likes' && <UserLikes />}
                    {activeTab === 'bookmarks' && <UserBookmarks />}
                </div>

                {/* Modal pour modifier le profil */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 flex items-start justify-center z-50 pt-20 animate-slideDown"
                        onClick={(e) => {
                            // Fermer la modal si on clique en dehors de celle-ci
                            if (e.target === e.currentTarget) {
                                setIsModalOpen(false);
                            }
                        }}
                    >
                        <div className="bg-black border border-gray-800 rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                                <h2 className="text-xl font-bold text-white">Modifier le profil</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <ProfileEditForm
                                    onSubmit={handleSubmit}
                                    initialData={formData}
                                    isUpdating={isUpdating}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal pour afficher les abonnements/abonnés */}
                {followModal && (
                    <div
                        className="fixed inset-0 flex items-start justify-center z-50 pt-20 animate-slideDown"
                        onClick={(e) => {
                            // Fermer la modal si on clique en dehors de celle-ci
                            if (e.target === e.currentTarget) {
                                closeFollowModal();
                            }
                        }}
                    >
                        <div className="bg-black border border-gray-800 rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                                <h2 className="text-xl font-bold text-white">
                                    {followModal === 'followers' ? 'Abonnés' : 'Abonnements'}
                                </h2>
                                <button
                                    onClick={closeFollowModal}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {followModal === 'followers' ? (
                                    isLoadingFollowers ? (
                                        <div className="flex justify-center py-8">
                                            <Loader />
                                        </div>
                                    ) : followers && followers.length > 0 ? (
                                        <div className="space-y-4">
                                            {followers.map((follower) => (
                                                <div
                                                    key={follower._id}
                                                    className="flex items-center space-x-3 p-2 hover:bg-gray-900 rounded-lg"
                                                >
                                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                                        {follower.image ? (
                                                            <img
                                                                src={`${baseUrl}${follower.image}`}
                                                                alt={follower.name || 'Utilisateur'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                                                                {(follower.name || 'U')
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">
                                                            {follower.name || 'Utilisateur'}
                                                        </p>
                                                        <p className="text-gray-400 text-sm">
                                                            @{follower.username || 'utilisateur'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400">
                                                Aucun abonné pour le moment
                                            </p>
                                        </div>
                                    )
                                ) : isLoadingFollowing ? (
                                    <div className="flex justify-center py-8">
                                        <Loader />
                                    </div>
                                ) : following && following.length > 0 ? (
                                    <div className="space-y-4">
                                        {following.map((follow) => (
                                            <div
                                                key={follow._id}
                                                className="flex items-center space-x-3 p-2 hover:bg-gray-900 rounded-lg"
                                            >
                                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                                    {follow.image ? (
                                                        <img
                                                            src={`${baseUrl}${follow.image}`}
                                                            alt={follow.name || 'Utilisateur'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                                                            {(follow.name || 'U')
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {follow.name || 'Utilisateur'}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        @{follow.username || 'utilisateur'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400">
                                            Aucun abonnement pour le moment
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
