import axios from 'axios';
import type { DashboardData, AdminData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

export const authAPI = {
  login: async (password: string) => {
    const response = await api.post('/login', { password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },
  checkAuth: async () => {
    const response = await api.get('/check-auth');
    return response.data;
  },
};

export const dashboardAPI = {
  getData: async (filter?: string): Promise<DashboardData> => {
    const response = await api.get('/dashboard', { params: { filter } });
    return response.data;
  },
  getHistory: async (table: string, date?: string) => {
    const response = await api.get('/history', { params: { table, date } });
    return response.data;
  },
  getUnknownDevices: async () => {
    const response = await api.get('/unknown-devices');
    return response.data;
  },
};

export const adminAPI = {
  getData: async (): Promise<AdminData> => {
    const response = await api.get('/admin');
    return response.data;
  },
  addDevice: async (data: {
    name: string;
    campus: string;
    location: string;
    type: string;
    room: string;
  }) => {
    const response = await api.post('/admin/device/add', data);
    return response.data;
  },
  deleteDevice: async (id: number, name: string) => {
    const response = await api.delete(`/admin/device/${id}/${name}`);
    return response.data;
  },
  addLocation: async (data: { name: string; shortcode: string }) => {
    const response = await api.post('/admin/location/add', data);
    return response.data;
  },
  deleteLocation: async (id: number) => {
    const response = await api.delete(`/admin/location/${id}`);
    return response.data;
  },
  addAlarm: async (data: { email: string; temp: number }) => {
    const response = await api.post('/admin/alarm/add', data);
    return response.data;
  },
  deleteAlarm: async (id: number) => {
    const response = await api.delete(`/admin/alarm/${id}`);
    return response.data;
  },
};

export default api;
