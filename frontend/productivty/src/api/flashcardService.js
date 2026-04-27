import api from './axiosInstance';

export const flashcardService = {
  generate: (noteId, includeVideoNote = false) =>
    api.post(`/api/notes/${noteId}/flashcards/generate`, null, {
      params: { includeVideoNote },
    }),
  getAll: (noteId) =>
    api.get(`/api/notes/${noteId}/flashcards`),
  delete: (noteId, flashcardId) =>
    api.delete(`/api/notes/${noteId}/flashcards/${flashcardId}`),
};
