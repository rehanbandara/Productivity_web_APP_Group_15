package com.productivity.backend.entity.focus_wishwaka_entity;

import com.productivity.backend.entity.user_entity.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "timer_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimerSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionMode mode;
    
    @Column(nullable = false)
    private Boolean isRunning = false;
    
    @Column(name = "time_left")
    private Integer timeLeft;
    
    @Column(name = "current_session")
    private Integer currentSession;
    
    @Column(nullable = false)
    private Integer duration;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.PAUSED;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "paused_at")
    private LocalDateTime pausedAt;
    
    @Column(name = "resumed_at")
    private LocalDateTime resumedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "completed_sessions")
    private Boolean completedSessions = false;
    
    public enum SessionMode {
        WORK, BREAK
    }
    
    public enum SessionStatus {
        RUNNING, PAUSED, COMPLETED, RESET
    }
    
    public TimerSession(SessionMode mode, Integer duration) {
        this.mode = mode;
        this.duration = duration;
        this.timeLeft = duration * 60; // Convert minutes to seconds
        this.status = SessionStatus.PAUSED;
        this.isRunning = false;
    }
}
