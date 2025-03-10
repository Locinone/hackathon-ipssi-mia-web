import React, { Fragment, useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import CardPost from './CardPost';

const postsData = [
    {
        content:
            "Les #chiens c'est bien, mais les #chats c'est mieux. Ils sont indépendants, propres et parfaits compagnons pour les moments calmes.",
        author: 'John Doe',
        date: '24/08/2002',
        likes: 10,
        comments: 5,
        repeat: 2,
    },
    {
        content:
            "La #programmation est une forme d'art. Chaque ligne de #code raconte une histoire, chaque fonction résout un problème.",
        author: 'Jane Smith',
        date: '15/09/2023',
        likes: 42,
        comments: 8,
        repeat: 15,
        mediaItems: [
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            },
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            },
        ],
    },
    {
        content:
            "Le #voyage élargit l'esprit et nourrit l'âme. Découvrir de nouvelles #cultures est la plus belle des éducations.",
        author: 'Marc Dupont',
        date: '03/05/2023',
        likes: 87,
        comments: 12,
        repeat: 23,
    },
    {
        content: 'Regardez cette incroyable vidéo de #nature! #vidéo #découverte',
        author: 'Emma Naturelle',
        date: '12/06/2023',
        likes: 156,
        comments: 34,
        repeat: 67,
        mediaType: 'video',
        mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
        content: 'Ma collection de photos de #voyage de cet été! #photographie #souvenirs',
        author: 'Voyageur Pro',
        date: '05/09/2023',
        likes: 234,
        comments: 45,
        repeat: 78,
        mediaItems: [
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            },
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            },
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            },
            {
                type: 'video',
                url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            },
        ],
    },
];

function Posts({ userProfile = false }) {
    const containerRef = useRef(null);
    const [gradient, setGradient] = useState('');
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentPage, setCurrentPage] = useState('home'); // 'home' ou 'search'
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);

    const generateRandomGradient = () => {
        const baseHue = Math.floor(Math.random() * 360);

        const color1 = `hsl(${baseHue}, 80%, 40%)`;
        const color2 = `hsl(${(baseHue + 30) % 360}, 80%, 70%)`;
        const color3 = `hsl(${(baseHue + 15) % 360}, 80%, 30%)`;

        return `linear-gradient(${Math.floor(Math.random() * 360)}deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
    };

    useEffect(() => {
        setGradient(generateRandomGradient());
    }, []);

    const goToNextPost = () => {
        if (isTransitioning || currentPage !== 'home') return;

        setIsTransitioning(true);

        // Changer de post
        setCurrentPostIndex((prevIndex) => (prevIndex + 1) % postsData.length);

        // Générer un nouveau gradient
        setGradient(generateRandomGradient());

        // Remonter en haut de la page après un court délai
        setTimeout(() => {
            userProfile === false ? window.scrollTo({ top: 0, behavior: 'smooth' }) : null;
            setIsTransitioning(false);
        }, 500);
    };

    const handleScroll = () => {
        if (isTransitioning || currentPage !== 'home') return;

        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Si on est proche du bas de la page
        if (scrollPosition + windowHeight >= documentHeight - 100) {
            goToNextPost();
        }
    };

    // Gestion des événements tactiles pour le swipe
    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
        touchEndY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
        if (currentPage !== 'home') return;

        const swipeDistance = touchStartY.current - touchEndY.current;

        // Si le swipe vers le bas est assez long (plus de 100px)
        if (swipeDistance < -100) {
            console.log('Swipe vers le bas détecté');
            goToNextPost();
        }
    };

    useEffect(() => {
        // Utiliser une fonction pour détecter le scroll vers le bas
        const handleScrollDown = (event) => {
            // Vérifier si l'utilisateur scrolle vers le bas
            if (event.deltaY > 100) {
                console.log('Scroll vers le bas détecté');
                handleScroll();
            }
        };

        // Écouter l'événement wheel pour détecter le scroll vers le bas
        window.addEventListener('wheel', handleScrollDown);

        // Garder aussi l'événement scroll pour la compatibilité
        window.addEventListener('scroll', handleScroll);

        // Événements tactiles pour le swipe
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        // Nettoyage des événements
        return () => {
            window.removeEventListener('wheel', handleScrollDown);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isTransitioning, currentPage]);

    const currentPost = postsData[currentPostIndex];

    return (
        <Fragment>
            <motion.div
                ref={containerRef}
                className={`w-full min-h-screen flex justify-center items-center relative pb-16 md:pb-0 ${
                    userProfile === false ? 'pt-20 md:pt-24' : 'pt-0 md:pt-0'
                }`}
                animate={{ background: gradient }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                style={{ background: gradient }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPostIndex}
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: 0.8 }}
                        className="w-full pt-20 md:pt-24 flex justify-center"
                    >
                        <div className="w-full">
                            <CardPost
                                content={currentPost.content}
                                author={currentPost.author}
                                date={currentPost.date}
                                likes={currentPost.likes}
                                comments={currentPost.comments}
                                repeat={currentPost.repeat}
                                mediaItems={currentPost.mediaItems}
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </Fragment>
    );
}

export default Posts;
