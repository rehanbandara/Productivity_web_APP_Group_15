package com.productivity.backend.service.planner_rehan_service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.productivity.backend.entity.planner_rehan_entity.Task;
import com.productivity.backend.repository.planner_rehan_repository.TaskRepository;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    public Task updateTask(Task task) {
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    // Updated to match TaskRepository.findByDeadlineDate(...)
    public List<Task> getTasksByDeadline(String deadlineDate) {
        return taskRepository.findByDeadlineDate(deadlineDate);
    }
}
