import api from './axiosInstance';

export const topicService = {
  getAll: () => api.get('/api/topics'),
  getById: (id) => api.get(`/api/topics/${id}`),
  create: (data) => api.post('/api/topics', data),
  update: (id, data) => api.put(`/api/topics/${id}`, data),
  delete: (id) => api.delete(`/api/topics/${id}`),
};
