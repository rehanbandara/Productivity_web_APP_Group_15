package com.productivity.backend.dto.focus_wishwaka_dto;

import com.productivity.backend.entity.focus_wishwaka_entity.WellnessReminder;
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
public class WellnessReminderDTO {
    private Long id;
    
    // @NotNull(message = "Reminder type is required")
    private WellnessReminder.ReminderType type;
    
    private Boolean enabled;
    
    // @NotNull(message = "Interval is required")
    // @Min(value = 1, message = "Interval must be at least 1 minute")
    // @Max(value = 1440, message = "Interval cannot exceed 24 hours")
    private Integer interval;
    
    // @NotNull(message = "Duration is required")
    // @Min(value = 5, message = "Duration must be at least 5 seconds")
    // @Max(value = 3600, message = "Duration cannot exceed 1 hour")
    private Integer duration;
    
    private LocalDateTime lastTriggered;
    private Boolean isActive;
    private Boolean soundEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static WellnessReminderDTO fromEntity(WellnessReminder reminder) {
        WellnessReminderDTO dto = new WellnessReminderDTO();
        dto.setId(reminder.getId());
        dto.setType(reminder.getType());
        dto.setEnabled(reminder.getEnabled());
        dto.setInterval(reminder.getInterval());
        dto.setDuration(reminder.getDuration());
        dto.setLastTriggered(reminder.getLastTriggered());
        dto.setIsActive(reminder.getIsActive());
        dto.setSoundEnabled(reminder.getSoundEnabled());
        dto.setCreatedAt(reminder.getCreatedAt());
        dto.setUpdatedAt(reminder.getUpdatedAt());
        return dto;
    }
    
    public WellnessReminder toEntity() {
        WellnessReminder reminder = new WellnessReminder();
        reminder.setId(this.id);
        reminder.setType(this.type);
        reminder.setEnabled(this.enabled);
        reminder.setInterval(this.interval);
        reminder.setDuration(this.duration);
        reminder.setLastTriggered(this.lastTriggered);
        reminder.setIsActive(this.isActive);
        reminder.setSoundEnabled(this.soundEnabled);
        return reminder;
    }
}
