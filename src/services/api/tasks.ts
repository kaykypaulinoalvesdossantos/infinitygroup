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

export interface Task {
    id: string;
    title: string;
    description?: string;
    projectId: string;
    status: 'IDEA' | 'DOING' | 'TESTING' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    isInternal?: boolean;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

export const tasksService = {
    getAll: async (projectId?: string) => {
        const response = await api.get('/tasks', { params: { projectId } });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },

    create: async (data: Partial<Task>) => {
        const response = await api.post('/tasks', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Task>) => {
        const response = await api.patch(`/tasks/${id}`, data);
        return response.data;
    },

    updateStatus: async (id: string, status: Task['status']) => {
        const response = await api.patch(`/tasks/${id}`, { status });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    }
};
