import { LoginFormData } from '@/schemas/authSchemas';
import { ApiResponse, User } from '@/types';

import { api } from './api';

class UserService {
    private apiUrl = '/api/users';

    public async registerUser(data: FormData): Promise<ApiResponse<User>> {
        const response = await api.fetchMultipartRequest(`${this.apiUrl}/register`, 'POST', data);
        return response;
    }

    public async loginUser(
        data: LoginFormData
    ): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
        const response = await api.fetchRequest(`${this.apiUrl}/login`, 'POST', data);
        return response;
    }

    public async getCurrentUser(): Promise<ApiResponse<User>> {
        const response = await api.fetchRequest(`${this.apiUrl}/me`, 'GET', null, true);
        return response;
    }

    public async getUserProfile(username: string): Promise<ApiResponse<User>> {
        const response = await api.fetchRequest(`${this.apiUrl}/profile/${username}`, 'GET');
        return response;
    }

    public async logoutUser(): Promise<ApiResponse<void>> {
        const response = await api.fetchRequest(`${this.apiUrl}/logout`, 'POST');
        return response;
    }

    public async updateUserProfile(
        data: Partial<User>
    ): Promise<ApiResponse<User>> {
        const response = await api.fetchRequest(
            `${this.apiUrl}/update`,
            'PUT',
            data,
            true
        );
        return response;
    }
}

export const userService = new UserService();
