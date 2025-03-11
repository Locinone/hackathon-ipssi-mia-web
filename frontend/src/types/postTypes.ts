export interface MediaItem {
    type: 'image' | 'video';
    url: string;
}

export interface Post {
    id?: number;
    content: string;
    author: string;
    date: string;
    likes: number;
    comments: number;
    repeat: number;
    mediaItems?: MediaItem[];
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
