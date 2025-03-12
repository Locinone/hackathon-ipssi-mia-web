import { Post, User } from '@/types';

import React, { Fragment, useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useColorStore } from '@/stores/colorStore';

import CardPost from './CardPost';

function Posts({ userProfile = false, postsData }: { userProfile: boolean; postsData: Post[] }) {
    const containerRef = useRef(null);
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentPage, setCurrentPage] = useState('home'); // 'home' ou 'search'
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);

    // Utiliser le store de couleurs
    const { gradient, generateRandomGradient } = useColorStore();

    useEffect(() => {
        generateRandomGradient();
    }, [generateRandomGradient]);

    const goToNextPost = () => {
        if (isTransitioning || currentPage !== 'home') return;

        setIsTransitioning(true);

        // Changer de post
        setCurrentPostIndex((prevIndex) => (prevIndex + 1) % postsData.length);

        // Générer un nouveau gradient
        generateRandomGradient();

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
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
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
        const handleScrollDown = (event: WheelEvent) => {
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
        window.addEventListener('touchstart', handleTouchStart as unknown as EventListener);
        window.addEventListener('touchmove', handleTouchMove as unknown as EventListener);
        window.addEventListener('touchend', handleTouchEnd);

        // Nettoyage des événements
        return () => {
            window.removeEventListener('wheel', handleScrollDown);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('touchstart', handleTouchStart as unknown as EventListener);
            window.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isTransitioning, currentPage]);

    const currentPost = postsData[currentPostIndex];

    return (
        <Fragment>
            <motion.div
                ref={containerRef}
                className={`w-full min-h-screen flex justify-center items-center relative pb-16 md:pb-0`}
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
                                author={currentPost.author as unknown as User}
                                date={currentPost.date}
                                likes={currentPost.likes}
                                dislikes={currentPost.dislikes}
                                comments={currentPost.comments}
                                repeat={currentPost.repeat}
                                files={currentPost.files ? currentPost.files : []}
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </Fragment>
    );
}

export default Posts;
