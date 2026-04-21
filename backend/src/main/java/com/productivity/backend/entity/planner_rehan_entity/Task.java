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
 * Task Entity (Planner)
 *
 * Stores:
 * - Required: title, plannedDate
 * - Optional schedule: startTime, endTime
 * - Optional deadline: deadlineDate, deadlineTime
 * - Meta: priority, effort, category, notes, status
 *
 * NOTE:
 * - We keep dates/times as Strings for now to match your frontend
 * ("YYYY-MM-DD", "HH:mm").
 * - Later you can migrate to LocalDate/LocalTime.
 */
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Required
    private String title;

    /**
     * Planned date user intends to do the task ("YYYY-MM-DD").
     * This is what your TaskBoard filters by.
     */
    private String plannedDate;

    /**
     * Optional time slot ("HH:mm").
     * If both startTime and endTime are present => "Scheduled" task.
     */
    private String startTime;
    private String endTime;

    /**
     * Optional deadline date/time.
     * deadlineDate: "YYYY-MM-DD"
     * deadlineTime: "HH:mm"
     */
    private String deadlineDate;
    private String deadlineTime;

    /**
     * Legacy field (optional).
     * Keep it for backward compatibility with your current frontend payload
     * (`deadline`).
     * You can remove this later once frontend fully uses deadlineDate/deadlineTime.
     */
    private String deadline;

    /**
     * Priority as a string: "high", "medium", "low", "normal"
     */
    private String priority;

    /**
     * Estimated effort (hours).
     * Your frontend uses numeric input; this should be Integer.
     */
    private Integer effort;

    /**
     * Importance (1-10) used by your matrix logic.
     * (Your frontend has `importance` already.)
     */
    private Integer importance;

    private String category;
    private String notes;

    /**
     * Status: "todo", "in-progress", "done"
     */
    private String status;

    // Optional: if you later want to persist your analysis fields, add them here
    // too.
}
