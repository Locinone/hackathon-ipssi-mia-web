import { User } from '@/types/userTypes';

import { toast } from 'react-toastify';

import { useMutation, useQuery } from '@tanstack/react-query';

import { userService } from '../userService';

export const useUserProfile = (username: string | undefined) => {
    return useQuery<User>({
        queryKey: ['userProfile', username],
        queryFn: async () => {
            if (!username) throw new Error('Username is required');
            const response = await userService.getUserProfile(username);
            if (!response.data) throw new Error('User not found');
            return response.data;
        },
        enabled: !!username,
    });
};

// update user profile
export const useUpdateUserProfile = () => {
    return useMutation<User, unknown, Partial<User>>({
        mutationFn: async (data: Partial<User>) => {
            const response = await userService.updateUserProfile(data);

            if (!response.data) throw new Error('Erreur lors de la mise à jour du profil');
            return response.data;
        },
        onSuccess: () => {
            toast.success('Profil mis à jour avec succès');
        },
        onError: () => {
            toast.error('Erreur lors de la mise à jour du profil');
        },
    });
};
