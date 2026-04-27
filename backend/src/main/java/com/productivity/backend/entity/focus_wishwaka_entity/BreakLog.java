package com.productivity.backend.entity.focus_wishwaka_entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "break_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BreakLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BreakType type;
    
    @Column(nullable = false)
    private Integer duration; // in seconds
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    public enum BreakType {
        EYE_REST, POSTURE, BREAK
    }
    
    public BreakLog(BreakType type, Integer duration) {
        this.type = type;
        this.duration = duration;
    }
    
    public BreakLog(WellnessReminder.ReminderType reminderType, Integer duration) {
        this.type = BreakType.valueOf(reminderType.name());
        this.duration = duration;
    }
}
