import { useFollowUser, useUnfollowUser } from '@/services/queries/interactionQueries';
import { User } from '@/types';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { motion } from 'framer-motion';

interface FollowButtonProps {
    user: User;
    isFollowing: boolean;
    onFollowStatusChange?: (isFollowing: boolean) => void;
    className?: string;
    showText?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({
    user,
    isFollowing: initialIsFollowing,
    onFollowStatusChange,
    className = '',
    showText = true,
}) => {
    // État local pour suivre le statut d'abonnement
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();
    const isPending = followMutation.isPending || unfollowMutation.isPending;

    // Mettre à jour l'état local si la prop change
    useEffect(() => {
        if (initialIsFollowing !== isFollowing) {
            console.log(
                `FollowButton: Mise à jour de l'état isFollowing de ${isFollowing} à ${initialIsFollowing}`
            );
            setIsFollowing(initialIsFollowing);
        }
    }, [initialIsFollowing]);

    const handleFollowToggle = async () => {
        if (isPending) return;

        try {
            if (isFollowing) {
                // Désabonnement - Mettre à jour l'état local immédiatement
                setIsFollowing(false);
                if (onFollowStatusChange) onFollowStatusChange(false);

                console.log(`Désabonnement de l'utilisateur: ${user.username} (${user._id})`);
                const loadingToast = toast.loading('Désabonnement en cours...');

                await unfollowMutation.mutateAsync(user._id, {
                    onSuccess: () => {
                        console.log(`Désabonnement réussi pour: ${user.username}`);
                        toast.dismiss(loadingToast);
                        toast.success(`Vous ne suivez plus ${user.username}`);
                    },
                    onError: (error) => {
                        console.error(`Erreur lors du désabonnement de ${user.username}:`, error);
                        // Revenir à l'état précédent en cas d'erreur
                        setIsFollowing(true);
                        if (onFollowStatusChange) onFollowStatusChange(true);

                        toast.dismiss(loadingToast);
                        toast.error(`Échec du désabonnement: ${error.message}`);
                    },
                });
            } else {
                // Abonnement - Mettre à jour l'état local immédiatement
                setIsFollowing(true);
                if (onFollowStatusChange) onFollowStatusChange(true);

                console.log(`Abonnement à l'utilisateur: ${user.username} (${user._id})`);
                const loadingToast = toast.loading('Abonnement en cours...');

                await followMutation.mutateAsync(user._id, {
                    onSuccess: () => {
                        console.log(`Abonnement réussi pour: ${user.username}`);
                        toast.dismiss(loadingToast);
                        toast.success(`Vous suivez maintenant ${user.username}`);
                    },
                    onError: (error) => {
                        console.error(`Erreur lors de l'abonnement à ${user.username}:`, error);
                        // Revenir à l'état précédent en cas d'erreur
                        setIsFollowing(false);
                        if (onFollowStatusChange) onFollowStatusChange(false);

                        toast.dismiss(loadingToast);
                        toast.error(`Échec de l'abonnement: ${error.message}`);
                    },
                });
            }
        } catch (error) {
            // En cas d'erreur, revenir à l'état précédent
            console.error('Erreur générale lors de la modification du statut de suivi:', error);
            setIsFollowing(!isFollowing);
            if (onFollowStatusChange) onFollowStatusChange(!isFollowing);

            toast.error('Une erreur est survenue. Veuillez réessayer.');
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            className={`${
                isFollowing
                    ? 'bg-white/20 hover:bg-red-500 group'
                    : 'bg-white/20 hover:bg-white group'
            } px-4 py-2 rounded-full cursor-pointer transition-all duration-300 ${className} ${
                isPending ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            onClick={handleFollowToggle}
            disabled={isPending}
        >
            {showText && (
                <>
                    <span className="group-hover:hidden">{isFollowing ? 'Suivi' : 'Suivre'}</span>
                    {isFollowing && <span className="hidden group-hover:block">Se désabonner</span>}
                    {!isFollowing && (
                        <span className="hidden group-hover:block group-hover:text-black">
                            Suivre
                        </span>
                    )}
                </>
            )}
            {!showText && (
                <span className={isFollowing ? 'text-white' : 'text-white group-hover:text-black'}>
                    {isFollowing ? '✓' : '+'}
                </span>
            )}
        </motion.button>
    );
};

export default FollowButton;
