package com.productivity.backend.entity.focus_wishwaka_entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Goal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;
    
    @Column(nullable = false)
    private Integer progress = 0;
    
    @Column(nullable = false)
    private Boolean completed = false;
    
    @Column(name = "due_date")
    private String dueDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalStatus status = GoalStatus.NOT_STARTED;
    
    @Column(nullable = false)
    private String category;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum Priority {
        HIGH, MEDIUM, LOW
    }
    
    public enum GoalStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED
    }
    
    public Goal(String title, String description, Priority priority, String dueDate, String category) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.dueDate = dueDate;
        this.category = category;
        this.progress = 0;
        this.completed = false;
        this.status = GoalStatus.NOT_STARTED;
    }
    
    @PreUpdate
    public void preUpdate() {
        if (progress != null) {
            this.completed = progress >= 100;
            this.status = progress >= 100 ? GoalStatus.COMPLETED : 
                         (progress > 0 && progress < 100) ? GoalStatus.IN_PROGRESS : 
                         GoalStatus.NOT_STARTED;
        }
    }
}
