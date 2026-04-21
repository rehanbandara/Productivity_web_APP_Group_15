import api from './axiosInstance';

export const quizService = {
  generate: (noteId, includeVideoNote = false) =>
    api.post(`/api/notes/${noteId}/quiz/generate`, null, {
      params: { includeVideoNote },
    }),
  getAll: (noteId) =>
    api.get(`/api/notes/${noteId}/quiz`),
  delete: (noteId, questionId) =>
    api.delete(`/api/notes/${noteId}/quiz/${questionId}`),
};
