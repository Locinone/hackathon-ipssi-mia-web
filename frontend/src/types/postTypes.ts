import { User } from './userTypes';

export interface MediaItem {
    type: 'image' | 'video';
    url: string;
}

export interface Post {
    _id?: string;
    content: string;
    author: User;
    date: string;
    likes: User[];
    dislikes: User[];
    comments: User[];
    repeat: User[];
    shares: User[];
    hasLiked: boolean;
    hasDisliked: boolean;
    hasShared: boolean;
    hasBookmarked: boolean;
    files?: string[];
    createdAt: string;
}

export interface PostFormData {
    content: string;
    files: File[];
}

export interface PostValidationResult {
    success: boolean;
    error?: Record<string, string>;
}

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}
