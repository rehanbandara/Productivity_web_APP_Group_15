package com.productivity.backend.controller.planner_rehan_controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.productivity.backend.entity.planner_rehan_entity.Task;
import com.productivity.backend.service.planner_rehan_service.TaskService;

/**
 * TaskController (REST API)
 * ------------------------
 * What is a REST API?
 * - REST API is a way for the frontend (React) to communicate with the backend
 * (Spring Boot)
 * using HTTP requests (GET, POST, PUT, DELETE).
 *
 * Common HTTP methods:
 * - GET : Read data (fetch tasks)
 * - POST : Create new data (add a new task)
 * - PUT : Update existing data (edit a task)
 * - DELETE : Delete data (remove a task)
 *
 * Key annotations:
 * - @RestController:
 * Marks this class as a REST controller. Methods return JSON/text directly.
 *
 * - @RequestMapping("/api/tasks"):
 * Sets a base URL for all endpoints in this controller.
 *
 * - @CrossOrigin:
 * Allows your React frontend (running on a different port like 3000) to call
 * these endpoints.
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin // simple: allow all origins (good for development)
public class TaskController {

    @Autowired
    private TaskService taskService;

    /**
     * 1) CREATE TASK
     * POST /api/tasks
     * - @RequestBody converts incoming JSON into a Task object.
     */
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    /**
     * 2) GET ALL TASKS
     * GET /api/tasks
     */
    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    /**
     * 3) GET TASK BY ID
     * GET /api/tasks/{id}
     * - @PathVariable reads the {id} from the URL.
     */
    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    /**
     * 4) UPDATE TASK
     * PUT /api/tasks/{id}
     * - Usually we update the task with the given id.
     * - Simple approach: set id to the request body then save.
     */
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task task) {
        task.setId(id);
        return taskService.updateTask(task);
    }

    /**
     * 5) DELETE TASK
     * DELETE /api/tasks/{id}
     */
    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return "Task deleted successfully";
    }

    /**
     * OPTIONAL: GET TASKS BY DEADLINE DATE
     * GET /api/tasks/date/{deadline}
     * Example: /api/tasks/date/2026-03-25
     */
    @GetMapping("/date/{deadline}")
    public List<Task> getTasksByDeadline(@PathVariable String deadline) {
        return taskService.getTasksByDeadline(deadline);
    }
}
