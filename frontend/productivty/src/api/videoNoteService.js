import api from './axiosInstance';

export const videoNoteService = {
  // Standalone: paste URL → LLM generates note title + content automatically
  generateFromUrl: (youtubeUrl) =>
    api.post('/api/video-notes/generate', null, { params: { youtubeUrl } }),

  // Attach an existing note to a video (legacy / manual)
  attach: (noteId, data) =>
    api.post(`/api/notes/${noteId}/video`, data),
  get: (noteId) =>
    api.get(`/api/notes/${noteId}/video`),
  remove: (noteId) =>
    api.delete(`/api/notes/${noteId}/video`),
  refreshTranscript: (noteId) =>
    api.post(`/api/notes/${noteId}/video/refresh-transcript`),
};
