import { LoginFormData } from '@/schemas/authSchemas';
import { useAuthStore } from '@/store/authStore';

import { toast } from 'react-toastify';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import { userService } from '../userService';

export const useRegisterUser = () => {
    return useMutation({
        mutationFn: async (data: FormData) => {
            const response = await userService.registerUser(data);
            return response;
        },
        onSuccess: () => {
            toast.success('Utilisateur enregistré avec succès');
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'inscription");
        },
    });
};

export const useLoginUser = () => {
    const { setUser, setIsAuthenticated, setError } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: LoginFormData) => {
            const response = await userService.loginUser(data);
            return response.data;
        },
        onSuccess: (data) => {
            Cookies.set('accessToken', data!.token);
            Cookies.set('refreshToken', data!.refreshToken);

            setUser(data!.user);
            setIsAuthenticated(true);
            setError(null);

            queryClient.invalidateQueries({ queryKey: ['currentUser'] });

            toast.success('Connexion réussie');
            window.location.href = '/';
        },
        onError: (error: any) => {
            setError(error.message || 'Erreur de connexion');
            toast.error(error.message || 'Erreur de connexion');
        },
    });
};

export const useGetCurrentUser = () => {
    const { setUser, setIsAuthenticated, setLoading, setError } = useAuthStore();

    return useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            setLoading(true);
            try {
                const response = await userService.getCurrentUser();
                setUser(response.data);
                setIsAuthenticated(true);
                return response;
            } catch (error: any) {
                setError(error.message || "Erreur lors de la récupération de l'utilisateur");
                throw error;
            } finally {
                setLoading(false);
            }
        },
        retry: 1,
        refetchOnWindowFocus: false,
    });
};

export const useLogoutUser = () => {
    const { logout } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await userService.logoutUser();
            return response;
        },
        onSuccess: () => {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            logout();
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            toast.success('Déconnexion réussie');
            window.location.href = '/';
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de la déconnexion');
        },
    });
};
