import axios from "axios";

/**
 * taskApi.js
 * ----------
 * This file centralizes all HTTP calls to your Spring Boot backend.
 * Using a single API module keeps your UI components clean.
 */

const API_URL = "http://localhost:8080/api/tasks";

export async function fetchTasks() {
    const res = await axios.get(API_URL);
    return res.data; // expected: array of tasks
}

export async function createTask(task) {
    const res = await axios.post(API_URL, task);
    return res.data; // expected: saved task (with id)
}

/**
 * updateTask
 * - Accepts a full task object that includes id.
 * - Sends PUT /api/tasks/{id}
 */
export async function updateTask(task) {
    if (!task?.id) throw new Error("updateTask requires task.id");
    const res = await axios.put(`${API_URL}/${task.id}`, task);
    return res.data;
}

export async function deleteTask(id) {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data; // could be message string or empty
}