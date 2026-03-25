package com.productivity.backend.service.planner_rehan_service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.productivity.backend.entity.planner_rehan_entity.Task;
import com.productivity.backend.repository.planner_rehan_repository.TaskRepository;

/**
 * TaskService
 * ----------
 * What is the Service layer?
 * - The service layer contains your business logic (the "rules" of your application).
 * - Examples later: validation, priority calculation, Eisenhower matrix logic, etc.
 *
 * Why not call the repository directly in the controller?
 * - Controllers should focus on handling HTTP requests/responses only.
 * - Repositories focus on database operations only.
 * - Services sit in the middle to keep your code organized and maintainable.
 *
 * How dependency injection works:
 * - Spring creates objects (beans) automatically and "injects" them where needed.
 * - @Autowired tells Spring: "give me an instance of TaskRepository".
 * - You do NOT manually create TaskRepository using new TaskRepository().
 */
@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    /**
     * Create a new task
     * - save() inserts a new row into the database.
     */
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    /**
     * Get all tasks
     * - findAll() returns all rows in the tasks table.
     */
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    /**
     * Get a single task by id
     * - If task is not found, return null (simple beginner approach).
     */
    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    /**
     * Update an existing task
     * - save() updates when the id already exists.
     */
    public Task updateTask(Task task) {
        return taskRepository.save(task);
    }

    /**
     * Delete a task by id
     * - deleteById() removes the row from the database.
     */
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    /**
     * Optional: Get tasks by deadline
     * - Uses the custom repository method findByDeadline().
     */
    public List<Task> getTasksByDeadline(String deadline) {
        return taskRepository.findByDeadline(deadline);
    }
}