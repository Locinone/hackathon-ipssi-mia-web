import { userService } from '@/services/userService';
import { User } from '@/types';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    error: string | null;
    loading: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setUser: (user: User | null) => void;
    setError: (error: string | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
    autoLogin: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            error: null,
            loading: false,
            setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
            setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
            setError: (error: string | null) => set({ error }),
            setLoading: (loading: boolean) => set({ loading }),
            logout: () => set({ isAuthenticated: false, user: null, error: null }),
            autoLogin: async () => {
                set({ loading: true });
                try {
                    const response = await userService.getCurrentUser();
                    console.log(response);

                    if (response && response.data) {
                        set({ user: response.data, isAuthenticated: true, error: null });
                    } else {
                        set({
                            user: null,
                            isAuthenticated: false,
                            error: 'Utilisateur non trouvé',
                        });
                    }
                } catch (error) {
                    console.error("Erreur d'auto-connexion:", error);
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: 'Échec de la connexion automatique',
                    });
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }),
        }
    )
);
