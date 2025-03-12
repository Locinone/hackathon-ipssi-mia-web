export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    password?: string;
    biography?: string;
    location?: string;
    link?: string;
    image?: string;
    banner?: string;
    role: string;
    acceptNotification: boolean;
    acceptTerms: boolean;
    isFollowing?: boolean;
    acceptCamera: boolean;
    followers: string[];
    following: string[];
    createdAt: string;
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
