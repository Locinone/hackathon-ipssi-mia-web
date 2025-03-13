export * from './apiTypes';
export * from './postTypes';
export * from './userTypes';

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T | null;
}

export interface Comment {
    _id: string;
    content: string;
    author: {
        _id: string;
        name?: string;
        username: string;
        image?: string;
        email?: string;
    };
    post?: string;
    parentComment?: string;
    createdAt?: string;
    likes?: any[];
    replies?: Comment[];
    reposts?: number;
}
