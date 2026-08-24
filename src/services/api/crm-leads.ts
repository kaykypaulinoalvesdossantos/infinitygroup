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

export interface CrmLead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    status: 'NEW' | 'CONTACTED' | 'PROPOSAL' | 'WON' | 'LOST';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export const crmLeadsService = {
    getAll: async () => {
        const response = await api.get('/crm-leads');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/crm-leads/${id}`);
        return response.data;
    },

    create: async (data: Partial<CrmLead>) => {
        const response = await api.post('/crm-leads', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CrmLead>) => {
        const response = await api.patch(`/crm-leads/${id}`, data);
        return response.data;
    },

    updateStatus: async (id: string, status: CrmLead['status']) => {
        const response = await api.patch(`/crm-leads/${id}`, { status });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/crm-leads/${id}`);
        return response.data;
    }
};
