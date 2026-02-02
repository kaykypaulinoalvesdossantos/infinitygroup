import { apiRequest } from './api';

export const authService = {
    async login(credentials: { email: string; password: string }) {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    async registerClient(data: any) {
        return apiRequest('/auth/register-client', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }
};
