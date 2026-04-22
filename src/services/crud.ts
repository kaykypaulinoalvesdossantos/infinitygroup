import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const clientsService = {
    getAll: async (params?: { type?: string; active?: boolean; search?: string }) => {
        const response = await api.get('/clients', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/clients/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/clients', data);
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.patch(`/clients/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/clients/${id}`);
        return response.data;
    },
};

export const clientSubscriptionsService = {
    getAll: async (params?: { status?: string }) => {
        const response = await api.get('/client-subscriptions', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/client-subscriptions/${id}`);
        return response.data;
    },

    getByClient: async (clientId: number) => {
        const response = await api.get(`/client-subscriptions/client/${clientId}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/client-subscriptions', data);
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.patch(`/client-subscriptions/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/client-subscriptions/${id}`);
        return response.data;
    },
};

export const subscriptionsService = {
    getAll: async (params?: { status?: string }) => {
        const response = await api.get('/subscriptions', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/subscriptions/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/subscriptions', data);
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.patch(`/subscriptions/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/subscriptions/${id}`);
        return response.data;
    },
};

export const invoicesService = {
    getAll: async (params?: { status?: string }) => {
        const response = await api.get('/invoices', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    },

    getMyInvoices: async () => {
        const response = await api.get('/invoices/my-invoices');
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.patch(`/invoices/${id}`, data);
        return response.data;
    },

    // Gerar pagamento (PIX + Boleto + Cartão) para uma fatura
    generatePayment: async (id: number) => {
        const response = await api.post(`/invoices/${id}/generate-payment`);
        return response.data;
    },

    // Buscar dados completos de pagamento de uma fatura
    getPaymentData: async (id: number) => {
        const response = await api.get(`/invoices/${id}/payment-data`);
        return response.data;
    },
};

export const usersService = {
    getMe: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    updateMe: async (data: any) => {
        const response = await api.patch('/users/me', data);
        return response.data;
    },
};
