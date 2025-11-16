import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Sweet {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SweetData {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

// Auth API
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};

// Sweets API
export const sweetsAPI = {
  getAll: async (): Promise<Sweet[]> => {
    const response = await api.get<{ sweets: Sweet[] }>('/sweets');
    return response.data.sweets;
  },
  search: async (params: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Sweet[]> => {
    const response = await api.get<{ sweets: Sweet[] }>('/sweets/search', {
      params,
    });
    return response.data.sweets;
  },
  create: async (data: SweetData): Promise<Sweet> => {
    const response = await api.post<{ sweet: Sweet }>('/sweets', data);
    return response.data.sweet;
  },
  update: async (id: string, data: Partial<SweetData>): Promise<Sweet> => {
    const response = await api.put<{ sweet: Sweet }>(`/sweets/${id}`, data);
    return response.data.sweet;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/sweets/${id}`);
  },
  purchase: async (id: string, quantity: number = 1): Promise<Sweet> => {
    const response = await api.post<{ sweet: Sweet }>(`/sweets/${id}/purchase`, {
      quantity,
    });
    return response.data.sweet;
  },
  restock: async (id: string, quantity: number): Promise<Sweet> => {
    const response = await api.post<{ sweet: Sweet }>(`/sweets/${id}/restock`, {
      quantity,
    });
    return response.data.sweet;
  },
};

export default api;

