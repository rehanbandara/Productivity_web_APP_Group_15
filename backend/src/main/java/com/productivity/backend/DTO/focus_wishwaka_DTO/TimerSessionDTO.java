package com.productivity.backend.dto.focus_wishwaka_dto;

import com.productivity.backend.entity.focus_wishwaka_entity.TimerSession;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
// import javax.validation.constraints.NotNull;
// import javax.validation.constraints.Min;
// import javax.validation.constraints.Max;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimerSessionDTO {
    private Long id;
    
    // @NotNull(message = "Session mode is required")
    private TimerSession.SessionMode mode;
    
    private Boolean isRunning;
    
    // @Min(value = 0, message = "Time left cannot be negative")
    private Integer timeLeft;
    
    // @Min(value = 1, message = "Current session must be at least 1")
    private Integer currentSession;
    
    // @NotNull(message = "Duration is required")
    // @Min(value = 1, message = "Duration must be at least 1 minute")
    // @Max(value = 480, message = "Duration cannot exceed 8 hours")
    private Integer duration;
    
    private LocalDateTime startTime;
    
    private TimerSession.SessionStatus status;
    
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private LocalDateTime pausedAt;
    private LocalDateTime resumedAt;
    
    public static TimerSessionDTO fromEntity(TimerSession session) {
        TimerSessionDTO dto = new TimerSessionDTO();
        dto.setId(session.getId());
        dto.setMode(session.getMode());
        dto.setIsRunning(session.getIsRunning());
        dto.setTimeLeft(session.getTimeLeft());
        dto.setCurrentSession(session.getCurrentSession());
        dto.setDuration(session.getDuration());
        dto.setStartTime(session.getStartTime());
        dto.setStatus(session.getStatus());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setCompletedAt(session.getCompletedAt());
        dto.setPausedAt(session.getPausedAt());
        dto.setResumedAt(session.getResumedAt());
        return dto;
    }
    
    public TimerSession toEntity() {
        TimerSession session = new TimerSession();
        session.setId(this.id);
        session.setMode(this.mode);
        session.setIsRunning(this.isRunning);
        session.setTimeLeft(this.timeLeft);
        session.setCurrentSession(this.currentSession);
        session.setDuration(this.duration);
        session.setStartTime(this.startTime);
        session.setStatus(this.status);
        session.setCompletedAt(this.completedAt);
        session.setPausedAt(this.pausedAt);
        session.setResumedAt(this.resumedAt);
        return session;
    }
}
