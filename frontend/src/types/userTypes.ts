export interface User {
    id: number;
    name: string;
    username: string;
    displayName: string;
    bio?: string;
    location?: string;
    website?: string;
    joinDate: string;
    following: number;
    followers: number;
    bannerImage?: string;
    profileImage?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface AuthState {
    isAuth: boolean;
    user: User | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    successMessage: string | null;
}
