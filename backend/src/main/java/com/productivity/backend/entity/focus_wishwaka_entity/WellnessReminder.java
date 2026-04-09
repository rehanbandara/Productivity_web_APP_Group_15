package com.productivity.backend.entity.focus_wishwaka_entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "wellness_reminders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WellnessReminder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReminderType type;
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(name = "reminder_interval", nullable = false)
    private Integer interval; // in minutes
    
    @Column(nullable = false)
    private Integer duration; // in seconds
    
    @Column(name = "last_triggered")
    private LocalDateTime lastTriggered;
    
    @Column(name = "is_active")
    private Boolean isActive = false;
    
    @Column(nullable = false)
    private Boolean soundEnabled = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum ReminderType {
        EYE_REST, POSTURE, BREAK
    }
    
    public WellnessReminder(ReminderType type, Integer interval, Integer duration) {
        this.type = type;
        this.interval = interval;
        this.duration = duration;
        this.enabled = true;
        this.soundEnabled = true;
        this.isActive = false;
    }
}
