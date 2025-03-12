export * from './apiTypes';
export * from './postTypes';
export * from './userTypes';

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T | null;
}
