package com.productivity.backend.repository.planner_rehan_repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.productivity.backend.entity.planner_rehan_entity.Task;

/**
 * TaskRepository
 * --------------
 * What is a Repository?
 * - A repository is the layer that communicates with the database.
 * - Instead of writing SQL manually, we use Spring Data JPA repositories.
 *
 * What JpaRepository does:
 * - JpaRepository<Task, Long> gives you built-in CRUD methods automatically, such as:
 *   - save(task)
 *   - findAll()
 *   - findById(id)
 *   - deleteById(id)
 *
 * How Spring generates queries automatically:
 * - When you write a method like findByDeadline(...),
 *   Spring Data JPA reads the method name and generates the SQL query for you at runtime.
 * - No implementation class is needed — Spring creates it automatically.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Custom query method (generated automatically by Spring Data JPA)
     * Example usage:
     * - taskRepository.findByDeadline("2026-03-25");
     */
    List<Task> findByDeadline(String deadline);
}