package com.productivity.backend.entity.planner_rehan_entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Task Entity
 * ----------
 * What is an Entity?
 * - In Spring Data JPA, an "entity" is a normal Java class that represents a row in a database table.
 * - Each object of this class becomes one record (row) in the table.
 *
 * How it maps to the database:
 * - This class maps to a table called "tasks".
 * - Each field maps to a column in that table.
 *
 * NOTE:
 * - We are keeping it simple (no relationships like User, SubTasks, etc. yet).
 */
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    /**
     * @Id
     * - Marks this field as the primary key column in the database table.
     *
     * @GeneratedValue(strategy = GenerationType.IDENTITY)
     * - Tells the database to auto-generate the id value.
     * - With MySQL, this usually means AUTO_INCREMENT.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Required field in your app (title must be provided).
     * For now we keep it as a simple String column.
     */
    private String title;

    /**
     * Deadline for the task.
     * Recommended best practice is LocalDate, but String also works.
     * We'll use LocalDate later if you want; keeping it simple now.
     */
    private String deadline;

    /**
     * Priority as a string:
     * "high", "medium", "low"
     */
    private String priority;

    /**
     * Estimated effort (example: hours).
     */
    private Integer effort;

    /**
     * Category / tag for grouping tasks.
     * Example: "#study"
     */
    private String category;

    /**
     * Extra notes for the task.
     */
    private String notes;

    /**
     * Status of the task:
     * "todo", "in-progress", "done"
     */
    private String status;
}