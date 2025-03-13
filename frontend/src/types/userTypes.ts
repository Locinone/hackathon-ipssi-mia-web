export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    biography?: string;
    location?: string;
    link?: string;
    image?: string;
    banner?: string;
    role: string;
    followers: string[];
    following: string[];
    acceptNotification: boolean;
    acceptTerms: boolean;
    acceptCamera: boolean;
    isFollowing?: boolean;
    createdAt: string;
    __v?: number;
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
