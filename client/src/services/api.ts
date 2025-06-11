import axios from 'axios';
import { User } from '../types/auth';
import { BuildingType } from '../types/game';

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
  register: (credentials: { username: string; email: string; password: string }) => 
    api.post<{ user: User; token: string }>('/auth/register', credentials),
  login: (credentials: { email: string; password: string }) => 
    api.post<{ user: User; token: string }>('/auth/login', credentials),
  getProfile: () => api.get<User>('/auth/profile'),
  refreshToken: () => api.post<{ token: string }>('/auth/refresh-token'),
  logout: () => api.post('/auth/logout'),
  requestPasswordReset: (email: string) => 
    api.post('/auth/request-password-reset', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword })
};

// Users API endpoints
export const usersAPI = {
  getUsers: () => api.get('/users'),
  createUser: (userData: any) => api.post('/users', userData),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
  updateUser: (userId: string, userData: Partial<User>) => api.put(`/users/${userId}`, userData),
};

// Village API endpoints
export const villageAPI = {
  // Get village data
  getVillage: (villageId: string) => api.get(`/villages/${villageId}`),
  getVillages: () => api.get('/villages'),
  createVillage: (villageData: any) => api.post('/villages', villageData),
  updateVillage: (villageId: string, updateData: any) => 
    api.patch(`/villages/${villageId}`, updateData),
  
  // Buildings
  getBuildings: (villageId: string) => api.get(`/villages/${villageId}/buildings`),
  getBuilding: (villageId: string, buildingId: string) => 
    api.get(`/villages/${villageId}/buildings/${buildingId}`),
  constructBuilding: (villageId: string, buildingType: string, position: { x: number, y: number }) =>
    api.post(`/villages/${villageId}/buildings`, { type: buildingType, position }),
  upgradeBuilding: (villageId: string, buildingId: string) =>
    api.post(`/villages/${villageId}/buildings/${buildingId}/upgrade`),
  cancelUpgrade: (villageId: string, buildingId: string) =>
    api.post(`/villages/${villageId}/buildings/${buildingId}/cancel-upgrade`),
  
  // Resources
  getResources: (villageId: string) => api.get(`/villages/${villageId}/resources`),
  collectResources: (villageId: string, resourceType: string) =>
    api.post(`/villages/${villageId}/resources/collect`, { resourceType }),
  
  // Production
  getProductionRates: (villageId: string) => 
    api.get(`/villages/${villageId}/production`),
  updateWorkers: (villageId: string, buildingId: string, workerCount: number) =>
    api.patch(`/villages/${villageId}/buildings/${buildingId}/workers`, { workerCount })
};

// Player API endpoints
export const playerAPI = {
  getProfile: () => api.get('/players/me'),
  updateProfile: (updateData: any) => api.patch('/players/me', updateData),
  
  // Skills
  getSkills: () => api.get('/players/me/skills'),
  upgradeSkill: (skillId: string) => api.post(`/players/me/skills/${skillId}/upgrade`),
  
  // Inventory
  getInventory: () => api.get('/players/me/inventory'),
  useItem: (itemId: string, quantity: number = 1) => 
    api.post(`/players/me/inventory/${itemId}/use`, { quantity }),
  equipItem: (itemId: string) => api.post(`/players/me/inventory/${itemId}/equip`),
  unequipItem: (itemId: string) => api.post(`/players/me/inventory/${itemId}/unequip`)
};

// Achievement API endpoints
export const achievementAPI = {
  getAchievements: () => api.get('/achievements'),
  getPlayerAchievements: () => api.get('/players/me/achievements'),
  claimAchievementReward: (achievementId: string) => 
    api.post(`/achievements/${achievementId}/claim`)
};

// Game state API endpoints
export const gameAPI = {
  // Game time and ticks
  getGameTime: () => api.get('/game/time'),
  getServerTime: () => api.get('/game/servertime'),
  
  // Events and notifications
  getEvents: (limit: number = 10) => api.get(`/game/events?limit=${limit}`),
  getUnreadNotifications: () => api.get('/notifications/unread'),
  markNotificationAsRead: (notificationId: string) => 
    api.patch(`/notifications/${notificationId}/read`),
  
  // Leaderboards
  getLeaderboard: (type: 'players' | 'villages' | 'alliances', limit: number = 10) =>
    api.get(`/leaderboards/${type}?limit=${limit}`)
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
