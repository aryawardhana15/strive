import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getProfile: (userId: number) => api.get(`/users/${userId}`),
  updateProfile: (userId: number, data: any) => api.put(`/users/${userId}`, data),
  uploadAvatar: (userId: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getActivities: (userId: number, params?: any) =>
    api.get(`/users/${userId}/activities`, { params }),
  getRecommendedJobs: (userId: number, params?: any) =>
    api.get(`/users/${userId}/recommended-jobs`, { params }),
  getProgress: (userId: number) => api.get(`/users/${userId}/progress`),
  getXPHistory: (userId: number, params?: any) =>
    api.get(`/users/${userId}/xp-history`, { params }),
};

// Skills API
export const skillsAPI = {
  getAll: (params?: any) => api.get('/skills', { params }),
  getCategories: () => api.get('/skills/categories'),
  addSkill: (userId: number, skillId: number, level: string) =>
    api.post(`/skills/users/${userId}/skills`, { skill_id: skillId, level }),
  removeSkill: (userId: number, skillId: number) =>
    api.delete(`/skills/users/${userId}/skills/${skillId}`),
  updateSkillLevel: (userId: number, skillId: number, level: string) =>
    api.put(`/skills/users/${userId}/skills/${skillId}`, { level }),
  getUserSkills: (userId: number) => api.get(`/skills/users/${userId}`),
  generateRecommendations: (userId: number) =>
    api.post(`/skills/users/${userId}/generate-recommendations`),
};

// Jobs API
export const jobsAPI = {
  getAll: (params?: any) => api.get('/jobs', { params }),
  getById: (id: number) => api.get(`/jobs/${id}`),
  getRecommended: (userId: number, params?: any) =>
    api.get(`/jobs/users/${userId}/recommended`, { params }),
  getCategories: () => api.get('/jobs/meta/categories'),
  getSimilar: (id: number, params?: any) => api.get(`/jobs/${id}/similar`, { params }),
};

// Roadmaps API
export const roadmapsAPI = {
  getAll: () => api.get('/roadmaps'),
  getById: (id: number) => api.get(`/roadmaps/${id}`),
  getSteps: (id: number) => api.get(`/roadmaps/${id}/steps`),
  getQuiz: (roadmapId: number, stepId: number) =>
    api.get(`/roadmaps/${roadmapId}/step/${stepId}/quiz`),
  submitQuiz: (roadmapId: number, stepId: number, answers: any) =>
    api.post(`/roadmaps/${roadmapId}/step/${stepId}/submit-quiz`, { answers }),
  getProgress: (id: number) => api.get(`/roadmaps/${id}/progress`),
  getStats: (userId: number) => api.get(`/roadmaps/users/${userId}/stats`),
};

// Challenges API
export const challengesAPI = {
  getAll: () => api.get('/challenges'),
  getByType: (type: string) => api.get(`/challenges/type/${type}`),
  getById: (id: number) => api.get(`/challenges/${id}`),
  start: (id: number) => api.post(`/challenges/${id}/start`),
  submit: (id: number, code: string, language: string) =>
    api.post(`/challenges/${id}/submit`, { code, language }),
  getProgress: (userId: number) => api.get(`/challenges/users/${userId}/progress`),
  getCompleted: (userId: number, params?: any) =>
    api.get(`/challenges/users/${userId}/completed`, { params }),
  getLeaderboard: (params?: any) => api.get('/challenges/leaderboard', { params }),
};

// CV API
export const cvAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('cv', file);
    return api.post('/cv/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getResult: (id: number) => api.get(`/cv/${id}/result`),
  getHistory: (userId: number, params?: any) =>
    api.get(`/cv/users/${userId}/history`, { params }),
  delete: (id: number) => api.delete(`/cv/${id}`),
  getStats: (userId: number) => api.get(`/cv/users/${userId}/stats`),
};

// Community API
export const communityAPI = {
  getPosts: (params?: any) => api.get('/community/posts', { params }),
  getPost: (id: number) => api.get(`/community/posts/${id}`),
  createPost: (content: string, imageUrl?: string) =>
    api.post('/community/posts', { content, image_url: imageUrl }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/community/posts/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  likePost: (id: number) => api.post(`/community/posts/${id}/like`),
  addComment: (id: number, content: string) =>
    api.post(`/community/posts/${id}/comments`, { content }),
  getRecentChats: (params?: any) => api.get('/community/recent-chats', { params }),
  getUserPosts: (userId: number, params?: any) =>
    api.get(`/community/users/${userId}/posts`, { params }),
  deletePost: (id: number) => api.delete(`/community/posts/${id}`),
  deleteComment: (id: number) => api.delete(`/community/comments/${id}`),
};

// Activities API
export const activitiesAPI = {
  getUserActivities: (userId: number, params?: any) =>
    api.get(`/activities/users/${userId}`, { params }),
  getRecentActivities: (userId: number, params?: any) =>
    api.get(`/activities/users/${userId}/recent`, { params }),
  getActivitiesByType: (userId: number, type: string, params?: any) =>
    api.get(`/activities/users/${userId}/type/${type}`, { params }),
  getStats: (userId: number) => api.get(`/activities/users/${userId}/stats`),
};

// Search API
export const searchAPI = {
  global: (query: string, params?: any) =>
    api.get('/search', { params: { q: query, ...params } }),
  jobs: (query: string, params?: any) =>
    api.get('/search/jobs', { params: { q: query, ...params } }),
  posts: (query: string, params?: any) =>
    api.get('/search/posts', { params: { q: query, ...params } }),
  users: (query: string, params?: any) =>
    api.get('/search/users', { params: { q: query, ...params } }),
  suggestions: (query: string, params?: any) =>
    api.get('/search/suggestions', { params: { q: query, ...params } }),
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: (params?: any) => api.get('/leaderboard', { params }),
  getStreaks: (params?: any) => api.get('/leaderboard/streaks', { params }),
  getChallenges: (params?: any) => api.get('/leaderboard/challenges', { params }),
  getCommunity: (params?: any) => api.get('/leaderboard/community', { params }),
  getUserContext: (userId: number) => api.get(`/leaderboard/users/${userId}/context`),
};

export default api;
