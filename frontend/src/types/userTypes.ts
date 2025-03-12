export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    biography?: string;
    location?: string;
    link?: string;
    image: string;
    banner: string;
    role: 'user' | 'admin';
    following: string[] | User[];
    followers: string[] | User[];
    createdAt?: string;
    acceptNotification?: boolean;
    acceptTerms?: boolean;
    acceptCamera?: boolean;
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
