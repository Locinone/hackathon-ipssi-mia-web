export * from './apiTypes';
export * from './postTypes';
export * from './userTypes';

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T | null;
}

export interface Post {
    _id?: string;
    title: string;
    content: string;
    // ...other properties...
    isLiked?: boolean;
    isDisliked?: boolean;
}
