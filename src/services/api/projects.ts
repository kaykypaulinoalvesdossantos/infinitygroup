import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    clientId: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}

export const projectsService = {
    getAll: async () => {
        const response = await api.get('/projects');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    create: async (data: Partial<Project>) => {
        const response = await api.post('/projects', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Project>) => {
        const response = await api.patch(`/projects/${id}`, data);
        return response.data;
    },

    updateStatus: async (id: string, status: Project['status']) => {
        const response = await api.patch(`/projects/${id}`, { status });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    }
};
