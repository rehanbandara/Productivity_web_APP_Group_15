import { create } from "zustand";
import {
  fetchTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from "../api/taskApi";

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  loadTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await fetchTasks();
      set({ tasks: Array.isArray(tasks) ? tasks : [], loading: false });
    } catch (err) {
      set({ loading: false, error: err?.message || "Failed to load tasks" });
    }
  },

  addTask: async (taskPayload) => {
    set({ loading: true, error: null });
    try {
      // Backend returns saved task with numeric id (Long)
      const saved = await apiCreateTask(taskPayload);
      set((state) => ({
        tasks: [saved, ...state.tasks],
        loading: false,
      }));
      return saved;
    } catch (err) {
      set({ loading: false, error: err?.message || "Failed to create task" });
      throw err;
    }
  },

  updateTask: async (task) => {
    if (!task?.id) throw new Error("updateTask requires task.id");

    set({ loading: true, error: null });
    try {
      const saved = await apiUpdateTask(task);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === saved.id ? saved : t)),
        loading: false,
      }));
      return saved;
    } catch (err) {
      set({ loading: false, error: err?.message || "Failed to update task" });
      throw err;
    }
  },

  deleteTask: async (id) => {
    if (id === null || id === undefined) return;

    set({ loading: true, error: null });
    try {
      await apiDeleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ loading: false, error: err?.message || "Failed to delete task" });
      throw err;
    }
  },
}));

export default useTaskStore;