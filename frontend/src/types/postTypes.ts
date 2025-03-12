import { User } from './userTypes';

export interface MediaItem {
    type: 'image' | 'video';
    url: string;
}

export interface Post {
    id?: number;
    content: string;
    author: User;
    date: string;
    likes: User[];
    dislikes: User[];
    comments: User[];
    repeat: User[];
    files?: string[];
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
