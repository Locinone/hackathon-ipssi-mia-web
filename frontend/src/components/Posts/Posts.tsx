import { Post } from '@/types';

import React, { Fragment, useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useColorStore } from '@/stores/colorStore';

import { useCreateBookmark, useDislikePost, useLikePost } from '@/services/queries/interactionQueries';
import CameraCapture from '../Camera/CameraCapture';
import CardPost from './CardPost';

function Posts({ userProfile = false, postsData }: { userProfile: boolean; postsData: Post[] }) {
    const containerRef = useRef(null);
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentPage, setCurrentPage] = useState('home'); // 'home' ou 'search'
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);
    const cameraRef = useRef<{ captureMultipleImages: () => void }>(null);

    const {mutate: autoLikePost} = useLikePost()
    const {mutate: autoDislikePost} = useDislikePost()
    const {mutate: autoBookmarkPost} = useCreateBookmark()
    // const {mutate: autoCommentPost} = useCommentPost()

    // Utiliser le store de couleurs
    const { gradient, generateRandomGradient } = useColorStore();

    useEffect(() => {
        generateRandomGradient();
    }, [generateRandomGradient]);


    const handleEmotionDetected = async (emotion: string) => {
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const currentPost = postsData[currentPostIndex];
        if (emotion === 'neutral') {
            await sleep(1500);
            goToNextPost();
        }
        if (emotion === 'surprise') {
            autoBookmarkPost(currentPost._id!);
            await sleep(1500);
            return;
        }
        if (emotion === 'happy') {
            await sleep(1500);
            autoLikePost(currentPost._id!);
            currentPost.isLiked = true;
            return;
        } 
        if (emotion === 'angry' || emotion === 'sad' || emotion === 'disguste' || emotion === 'fear') {
            await sleep(1500);
            autoDislikePost(currentPost._id!);
            currentPost.isDisliked = true;
            return;
        }
    };

    const goToNextPost = () => {
        if (isTransitioning || currentPage !== 'home') return;

        setIsTransitioning(true);

        // Capture multiple images
        if (cameraRef.current) {
            cameraRef.current.captureMultipleImages();
        }

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
            <CameraCapture ref={cameraRef} onEmotionDetected={handleEmotionDetected} currentPostId={currentPost._id ?? null} />
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
                            <CardPost post={currentPost} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </Fragment>
    );
}

export default Posts;
