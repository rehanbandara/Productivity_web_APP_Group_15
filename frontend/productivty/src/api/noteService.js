import api from './axiosInstance';

export const noteService = {
  getAll: (params = {}) => api.get('/api/notes', { params }),
  getById: (id) => api.get(`/api/notes/${id}`),
  create: (data) => api.post('/api/notes', data),
  update: (id, data) => api.put(`/api/notes/${id}`, data),
  autoSave: (id, content) => api.patch(`/api/notes/${id}/autosave`, { content }),
  delete: (id) => api.delete(`/api/notes/${id}`),
  togglePin: (id) => api.patch(`/api/notes/${id}/pin`),
  attachTag: (noteId, tagId) => api.post(`/api/notes/${noteId}/tags/${tagId}`),
  removeTag: (noteId, tagId) => api.delete(`/api/notes/${noteId}/tags/${tagId}`),
  suggestMetadata: (title, content) => api.get('/api/notes/suggest-metadata', { params: { title, content } }),
};
