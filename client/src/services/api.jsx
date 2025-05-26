import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
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

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Define API endpoints
const endpoints = {
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    me: () => api.get('/auth/me'),
  },
  communities: {
    create: (communityData) => api.post('/communities', communityData),
    getAll: () => api.get('/communities'),
    getById: (id) => api.get(`/communities/${id}`),
    join: (id) => api.post(`/communities/${id}/join`),
    leave: (id) => api.post(`/communities/${id}/leave`),
    getMembers: (id) => api.get(`/communities/${id}/members`),
  },
  messages: {
    getByCommunity: (communityId) => api.get(`/messages/community/${communityId}`),
    send: (messageData) => api.post('/messages', messageData),
  }
};

// Add endpoints to api object
Object.assign(api, endpoints);

export default api; 