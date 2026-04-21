import api from './axiosInstance';

export const tagService = {
  getAll: () => api.get('/api/tags'),
  getById: (id) => api.get(`/api/tags/${id}`),
  create: (data) => api.post('/api/tags', data),
  update: (id, data) => api.put(`/api/tags/${id}`, data),
  delete: (id) => api.delete(`/api/tags/${id}`),
};
