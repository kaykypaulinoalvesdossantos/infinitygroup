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

export const dashboardService = {
    getMetrics: async () => {
        const response = await api.get('/dashboard/metrics');
        return response.data;
    },

    getRevenueChart: async () => {
        const response = await api.get('/dashboard/revenue-chart');
        return response.data;
    },

    getProductDistribution: async () => {
        const response = await api.get('/dashboard/product-distribution');
        return response.data;
    },

    getOverdueInvoices: async () => {
        const response = await api.get('/dashboard/overdue-invoices');
        return response.data;
    },

    getUpcomingSubscriptions: async () => {
        const response = await api.get('/dashboard/upcoming-subscriptions');
        return response.data;
    },
};
