import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Calendar, Link as LinkIcon, MapPin } from 'lucide-react';

import Posts from '../components/Posts/Posts';

// Données fictives pour démonstration
const userData = {
    id: 1,
    username: 'JohnDoe',
    displayName: 'John Doe',
    bio: "Développeur web passionné | Fan de tech et de design | Toujours en quête d'apprentissage",
    location: 'Paris, France',
    website: 'johndoe.dev',
    joinDate: 'Juin 2022',
    following: 245,
    followers: 532,
    bannerImage:
        'https://images.unsplash.com/photo-1741334632363-58022899ce91?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    profileImage:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
};

const userPosts = [
    {
        id: 1,
        content:
            "Les #chiens c'est bien, mais les #chats c'est mieux. Ils sont indépendants, propres et parfaits compagnons pour les moments calmes.",
        author: 'John Doe',
        date: '24/08/2023',
        likes: 10,
        comments: 5,
        repeat: 2,
    },
    {
        id: 2,
        content:
            "La #programmation est une forme d'art. Chaque ligne de #code raconte une histoire, chaque fonction résout un problème.",
        author: 'John Doe',
        date: '15/09/2023',
        likes: 42,
        comments: 8,
        repeat: 15,
        mediaItems: [
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            },
        ],
    },
];

const userComments = [
    {
        id: 1,
        content:
            "Totalement d'accord ! Le développement front-end est un mélange parfait d'art et de logique.",
        author: 'John Doe',
        date: '05/10/2023',
        likes: 8,
        replyTo: 'Jane Smith',
        postId: 3,
    },
    {
        id: 2,
        content:
            "C'est une perspective intéressante. J'aime voir comment différentes technologies peuvent être combinées pour créer des solutions innovantes.",
        author: 'John Doe',
        date: '12/10/2023',
        likes: 15,
        replyTo: 'Tech Explorer',
        postId: 5,
    },
];

const userLikes = [
    {
        id: 3,
        content:
            "Le #voyage élargit l'esprit et nourrit l'âme. Découvrir de nouvelles #cultures est la plus belle des éducations.",
        author: 'Marc Dupont',
        date: '03/05/2023',
        likes: 87,
        comments: 12,
        repeat: 23,
    },
    {
        id: 4,
        content: 'Regardez cette incroyable vidéo de #nature! #vidéo #découverte',
        author: 'Emma Naturelle',
        date: '12/06/2023',
        likes: 156,
        comments: 34,
        repeat: 67,
        mediaType: 'video',
        mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
];

const userDislikes = [
    {
        id: 5,
        content:
            "Le marketing digital est plus important que jamais dans le monde d'aujourd'hui. #marketing #digital",
        author: 'Marketing Pro',
        date: '22/09/2023',
        likes: 32,
        comments: 7,
        repeat: 5,
    },
];

const Profile = () => {
    const { username } = useParams();
    const [activeTab, setActiveTab] = useState('posts');
    const [contentToDisplay, setContentToDisplay] = useState([]);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        // Détermine quel contenu afficher en fonction de l'onglet actif
        switch (activeTab) {
            case 'posts':
                setContentToDisplay(userPosts);
                break;
            case 'comments':
                setContentToDisplay(userComments);
                break;
            case 'likes':
                setContentToDisplay(userLikes);
                break;
            case 'dislikes':
                setContentToDisplay(userDislikes);
                break;
            default:
                setContentToDisplay(userPosts);
        }
    }, [activeTab]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="w-full min-h-screen bg-black">
            <div className="relative px-32 pt-32">
                <div className="flex flex-col gap-4">
                    <div className="relative flex flex-col gap-4">
                        <div className="h-48 w-full overflow-hidden">
                            <img
                                src={userData.bannerImage}
                                alt="Bannière de profil"
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>

                        <div className="absolute -bottom-16 right-4 md:right-10">
                            <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden">
                                <img
                                    src={userData.profileImage}
                                    alt="Photo de profil"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-4">
                        <h1 className="text-2xl font-bold text-white">{userData.displayName}</h1>
                        <p className="text-gray-500">@{userData.username}</p>

                        <p className="my-3 text-white">{userData.bio}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 my-3">
                            {userData.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    <span>{userData.location}</span>
                                </div>
                            )}
                            {userData.website && (
                                <div className="flex items-center gap-1">
                                    <LinkIcon size={16} />
                                    <a
                                        href={`https://${userData.website}`}
                                        className="text-blue-500 hover:underline"
                                    >
                                        {userData.website}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>A rejoint en {userData.joinDate}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 my-3">
                            <div>
                                <span className="font-bold text-white">{userData.following}</span>{' '}
                                <span className="text-gray-500">abonnements</span>
                            </div>
                            <div>
                                <span className="font-bold text-white">{userData.followers}</span>{' '}
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
            </div>
        </div>
    );
};

export default Profile;
