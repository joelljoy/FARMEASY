import axios from 'axios';

// Use same-origin proxy in dev by default, but allow overriding for production deployments.
// Example: VITE_API_BASE="https://farmeasy-backend-ap8q.onrender.com"
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('frameasy_token') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('frameasy_token');
      localStorage.removeItem('frameasy_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const auth = {
  register: (data) => api.post('/auth/register', data),
  verifyRegistration: (data) => api.post('/auth/verify-registration', data),
  login: (data) => api.post('/auth/login', data),
  verifyLogin: (data) => api.post('/auth/verify-login', data),
  me: () => api.get('/auth/me'),
  resendOtp: (email, purpose) => api.post('/auth/resend-otp', { email, purpose }),
};

// User
export const user = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Equipment
export const equipment = {
  listPublic: (params) => api.get('/equipment/public', { params }),
  myList: () => api.get('/equipment/my'),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
};

// Land
export const land = {
  listPublic: (params) => api.get('/land/public', { params }),
  myList: () => api.get('/land/my'),
  getById: (id) => api.get(`/land/${id}`),
  create: (data) => api.post('/land', data),
  update: (id, data) => api.put(`/land/${id}`, data),
  delete: (id) => api.delete(`/land/${id}`),
};

// Trade
export const trade = {
  listPublic: (params) => api.get('/trade/public', { params }),
  myList: () => api.get('/trade/my'),
  getById: (id) => api.get(`/trade/${id}`),
  create: (data) => api.post('/trade', data),
  update: (id, data) => api.put(`/trade/${id}`, data),
  delete: (id) => api.delete(`/trade/${id}`),
};

// Schemes
export const schemes = {
  list: (params) => api.get('/schemes/public/list', { params }),
  getById: (id) => api.get(`/schemes/${id}`),
};

// Agreements
export const agreements = {
  sendOtp: (email) => api.post('/agreements/send-otp', null, { params: { email } }),
  create: (data) => api.post('/agreements', data),
  myList: () => api.get('/agreements/my'),
  getById: (id) => api.get(`/agreements/${id}`),
};

// Chat
export const chat = {
  getConversation: (otherUserId) => api.get('/chat/conversation', { params: { otherUserId } }),
  send: (data) => api.post('/chat/send', data),
  markRead: (messageId) => api.post(`/chat/mark-read/${messageId}`),
};

// AI
export const ai = {
  chat: (message) => api.post('/ai/chat', { message }),
};

// Admin
export const admin = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  pendingEquipment: () => api.get('/admin/equipment/pending'),
  approveEquipment: (id) => api.post(`/admin/equipment/${id}/approve`),
  deleteEquipment: (id) => api.delete(`/admin/equipment/${id}`),
  pendingLand: () => api.get('/admin/land/pending'),
  approveLand: (id) => api.post(`/admin/land/${id}/approve`),
  deleteLand: (id) => api.delete(`/admin/land/${id}`),
  pendingTrade: () => api.get('/admin/trade/pending'),
  approveTrade: (id) => api.post(`/admin/trade/${id}/approve`),
  deleteTrade: (id) => api.delete(`/admin/trade/${id}`),
  agreements: () => api.get('/admin/agreements'),
  refreshSchemes: () => api.post('/admin/schemes/refresh'),
};

// Orders (checkout)
export const orders = {
  create: (data) => api.post('/orders', data),
  myList: () => api.get('/orders/my'),
};

export default api;
