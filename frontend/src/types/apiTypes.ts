// Types pour les réponses API
export interface ApiResponse<T = any> {
    message: string;
    status: number;
    data?: T;
    error?: string;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    status?: string;
    message?: string;
}
