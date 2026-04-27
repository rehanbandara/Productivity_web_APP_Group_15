package com.productivity.backend.dto.focus_wishwaka_dto;

import com.productivity.backend.entity.focus_wishwaka_entity.UserSettings;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsDTO {
    private Long id;
    private UserSettings.FocusSettings focus;
    private UserSettings.WellnessSettings wellness;
    private UserSettings.NotificationSettings notifications;
    private UserSettings.GeneralSettings general;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static UserSettingsDTO fromEntity(UserSettings settings) {
        UserSettingsDTO dto = new UserSettingsDTO();
        dto.setId(settings.getId());
        dto.setFocus(settings.getFocus());
        dto.setWellness(settings.getWellness());
        dto.setNotifications(settings.getNotifications());
        dto.setGeneral(settings.getGeneral());
        dto.setCreatedAt(settings.getCreatedAt());
        dto.setUpdatedAt(settings.getUpdatedAt());
        return dto;
    }
    
    public UserSettings toEntity() {
        UserSettings settings = new UserSettings();
        settings.setId(this.id);
        settings.setFocus(this.focus);
        settings.setWellness(this.wellness);
        settings.setNotifications(this.notifications);
        settings.setGeneral(this.general);
        return settings;
    }
}
