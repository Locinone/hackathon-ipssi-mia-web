import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Calendar, Link as LinkIcon, MapPin } from 'lucide-react';

import Posts from '../components/Posts/Posts';
import ProfileEditForm from '../components/ProfileEditForm';
import Loader from '../components/ui/Loader';
import { updateUserSchema } from '../schemas/authSchemas';
import { api } from '../services/api';
import { useUpdateUserProfile, useUserProfile } from '../services/queries/useUserProfile';

// Les données mockées userPosts, userComments, userLikes, userDislikes restent inchangées

const Profile = () => {
    const { username } = useParams();
    const [activeTab, setActiveTab] = useState('posts');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        biography: '',
        location: '',
        link: '',
    });

    const { data: userData, isLoading, error } = useUserProfile(username);
    const { mutate: updateUserProfile, isPending: isUpdating } = useUpdateUserProfile();

    const baseUrl = api.getUrl();

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        const parsedData = updateUserSchema.safeParse(formData);
        console.log(parsedData);
        if (!parsedData.success) {
            console.error('Erreur de validation:', parsedData.error.format());
            return;
        }
        try {
            updateUserProfile(parsedData.data, {
                onSuccess: () => {
                    setIsModalOpen(false);
                },
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
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
            <div className="relative px-32 pt-32">
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
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Modifier le profil
                    </button>
                    <div className="px-4">
                        <h1 className="text-2xl font-bold text-white">{userData.name}</h1>
                        <p className="text-gray-500">{userData.username}</p>

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
                            <div>
                                <span className="font-bold text-white">
                                    {userData.following.length}
                                </span>{' '}
                                <span className="text-gray-500">abonnements</span>
                            </div>
                            <div>
                                <span className="font-bold text-white">
                                    {userData.followers.length}
                                </span>{' '}
                                <span className="text-gray-500">abonnés</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-b border-gray-200 mt-4">
                    <div className="flex overflow-x-auto">
                        {['posts', 'comments', 'likes', 'dislikes'].map((tab) => (
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

                <div className="mt-4">{activeTab === 'posts' && <Posts userProfile />}</div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white p-6 rounded shadow-lg w-96">
                            <h2 className="text-xl font-bold mb-4">Modifier le profil</h2>
                            <ProfileEditForm onSubmit={handleSubmit} initialData={formData} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
