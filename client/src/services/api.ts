import axios from 'axios';
import { User } from '../types/auth';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Kérés küldése előtt hozzáadjuk a tokent a fejléchez, ha van
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Válasz feldolgozása
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ha lejárt a token, töröljük a local storage-ból
      localStorage.removeItem('token');
      // Átirányítás a bejelentkezési oldalra
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (credentials: any) => api.post('/auth/register', credentials),
  login: (credentials: any) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Users API endpoints
export const usersAPI = {
  getUsers: () => api.get('/users'),
  createUser: (userData: any) => api.post('/users', userData),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
  updateUser: (userId: string, userData: Partial<User>) => api.put(`/users/${userId}`, userData),
};

// Buildings API endpoints
export const buildingsAPI = {
  // Get all buildings for a village
  getVillageBuildings: (villageId: string) => api.get(`/villages/${villageId}/buildings`),
  
  // Update a building level
  updateBuildingLevel: (villageId: string, buildingId: string, level: number) => 
    api.patch(`/villages/${villageId}/buildings/${buildingId}`, { level }),
  
  // Get all building types (for reference)
  getBuildingTypes: () => api.get('/buildings/types'),
};

export default api;
