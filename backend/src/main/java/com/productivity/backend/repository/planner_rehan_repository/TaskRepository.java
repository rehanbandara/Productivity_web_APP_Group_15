package com.productivity.backend.repository.planner_rehan_repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.productivity.backend.entity.planner_rehan_entity.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Preferred: query by deadlineDate (YYYY-MM-DD)
    List<Task> findByDeadlineDate(String deadlineDate);

    // Optional (keep only if you still want legacy support):
    // List<Task> findByDeadline(String deadline);
}
