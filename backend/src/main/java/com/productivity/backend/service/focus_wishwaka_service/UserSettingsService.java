package com.productivity.backend.service.focus_wishwaka_service;

import com.productivity.backend.dto.focus_wishwaka_dto.UserSettingsDTO;
import com.productivity.backend.entity.focus_wishwaka_entity.UserSettings;
import com.productivity.backend.repository.focus_wishwaka_repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSettingsService {
    
    private final UserSettingsRepository userSettingsRepository;
    
    public UserSettingsDTO getUserSettings() {
        Optional<UserSettings> settings = userSettingsRepository.findFirstByOrderByIdAsc();
        
        if (settings.isPresent()) {
            return UserSettingsDTO.fromEntity(settings.get());
        } else {
            // Create default settings if none exist
            UserSettings defaultSettings = createDefaultSettings();
            UserSettings savedSettings = userSettingsRepository.save(defaultSettings);
            return UserSettingsDTO.fromEntity(savedSettings);
        }
    }
    
    public UserSettingsDTO updateSettings(UserSettingsDTO settingsDTO) {
        Optional<UserSettings> existingSettings = userSettingsRepository.findFirstByOrderByIdAsc();
        
        UserSettings settings;
        if (existingSettings.isPresent()) {
            settings = existingSettings.get();
            updateSettingsFromDTO(settings, settingsDTO);
        } else {
            settings = settingsDTO.toEntity();
        }
        
        UserSettings savedSettings = userSettingsRepository.save(settings);
        return UserSettingsDTO.fromEntity(savedSettings);
    }
    
    public UserSettingsDTO resetToDefaults() {
        Optional<UserSettings> existingSettings = userSettingsRepository.findFirstByOrderByIdAsc();
        
        UserSettings defaultSettings = createDefaultSettings();
        
        if (existingSettings.isPresent()) {
            defaultSettings.setId(existingSettings.get().getId());
        }
        
        UserSettings savedSettings = userSettingsRepository.save(defaultSettings);
        return UserSettingsDTO.fromEntity(savedSettings);
    }
    
    private UserSettings createDefaultSettings() {
        UserSettings settings = new UserSettings();
        
        // Default focus settings
        UserSettings.FocusSettings focus = new UserSettings.FocusSettings();
        focus.setWorkDuration(25);
        focus.setShortBreakDuration(5);
        focus.setLongBreakDuration(15);
        focus.setSessionsUntilLongBreak(4);
        focus.setAutoStartBreaks(false);
        focus.setAutoStartWork(false);
        focus.setSoundEnabled(true);
        focus.setVolume(0.5);
        settings.setFocus(focus);
        
        // Default wellness settings
        UserSettings.WellnessSettings wellness = new UserSettings.WellnessSettings();
        
        UserSettings.EyeRestSettings eyeRest = new UserSettings.EyeRestSettings();
        eyeRest.setEnabled(true);
        eyeRest.setInterval(20);
        eyeRest.setDuration(20);
        eyeRest.setSoundEnabled(true);
        wellness.setEyeRest(eyeRest);
        
        UserSettings.PostureSettings posture = new UserSettings.PostureSettings();
        posture.setEnabled(true);
        posture.setInterval(45);
        posture.setDuration(15);
        posture.setSoundEnabled(true);
        wellness.setPosture(posture);
        
        UserSettings.BreakSettings breakSettings = new UserSettings.BreakSettings();
        breakSettings.setEnabled(true);
        breakSettings.setInterval(25);
        breakSettings.setDuration(300);
        breakSettings.setSoundEnabled(true);
        wellness.setBreakSettings(breakSettings);
        
        settings.setWellness(wellness);
        
        // Default notification settings
        UserSettings.NotificationSettings notifications = new UserSettings.NotificationSettings();
        notifications.setDesktop(true);
        notifications.setSound(true);
        notifications.setEmail(false);
        notifications.setPush(false);
        notifications.setReminderLeadTime(5);
        settings.setNotifications(notifications);
        
        // Default general settings
        UserSettings.GeneralSettings general = new UserSettings.GeneralSettings();
        general.setTheme("light");
        general.setLanguage("en");
        general.setTimezone("UTC");
        general.setDateFormat("MM/DD/YYYY");
        general.setTimeFormat("12h");
        settings.setGeneral(general);
        
        return settings;
    }
    
    private void updateSettingsFromDTO(UserSettings settings, UserSettingsDTO dto) {
        if (dto.getFocus() != null) {
            settings.setFocus(dto.getFocus());
        }
        if (dto.getWellness() != null) {
            settings.setWellness(dto.getWellness());
        }
        if (dto.getNotifications() != null) {
            settings.setNotifications(dto.getNotifications());
        }
        if (dto.getGeneral() != null) {
            settings.setGeneral(dto.getGeneral());
        }
    }
}
