package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.DTO.focus_wishwaka_DTO.UserSettingsDTO;
import com.productivity.backend.entity.user_entity.User;
import com.productivity.backend.entity.focus_wishwaka_entity.UserSettings;
import com.productivity.backend.service.focus_wishwaka_service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SettingsController {
    
    private final UserSettingsService userSettingsService;
    
    @GetMapping
    public ResponseEntity<UserSettingsDTO> getUserSettings(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        UserSettingsDTO settings = userSettingsService.getUserSettings(user);
        return ResponseEntity.ok(settings);
    }
    
    @PutMapping
    public ResponseEntity<UserSettingsDTO> updateSettings(@Valid @RequestBody UserSettingsDTO settingsDTO, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        UserSettingsDTO updatedSettings = userSettingsService.updateSettings(settingsDTO, user);
        return ResponseEntity.ok(updatedSettings);
    }
    
    @PostMapping("/reset")
    public ResponseEntity<UserSettingsDTO> resetToDefaults(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        UserSettingsDTO defaultSettings = userSettingsService.resetToDefaults(user);
        return ResponseEntity.ok(defaultSettings);
    }
    
    @GetMapping("/timer")
    public ResponseEntity<UserSettingsDTO> getTimerSettings(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            // Return settings for anonymous users using session ID
            String sessionId = "anonymous-timer"; // Fixed session ID for timer settings
            UserSettingsDTO settings = userSettingsService.getAnonymousSettings(sessionId);
            return ResponseEntity.ok(settings);
        }
        User user = (User) authentication.getPrincipal();
        UserSettingsDTO settings = userSettingsService.getUserSettings(user);
        return ResponseEntity.ok(settings);
    }
    
    @PutMapping("/timer")
    public ResponseEntity<UserSettingsDTO> updateTimerSettings(@Valid @RequestBody UserSettingsDTO settingsDTO, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            // Store settings for anonymous users using session ID
            String sessionId = "anonymous-timer"; // Fixed session ID for timer settings
            UserSettingsDTO updatedSettings = userSettingsService.updateAnonymousSettings(sessionId, settingsDTO);
            return ResponseEntity.ok(updatedSettings);
        }
        // Only update focus settings (timer settings)
        User user = (User) authentication.getPrincipal();
        UserSettingsDTO currentSettings = userSettingsService.getUserSettings(user);
        
        if (settingsDTO.getFocus() != null) {
            currentSettings.setFocus(settingsDTO.getFocus());
        }
        
        UserSettingsDTO updatedSettings = userSettingsService.updateSettings(currentSettings, user);
        return ResponseEntity.ok(updatedSettings);
    }
    
    private UserSettingsDTO createDefaultTimerSettings() {
        UserSettingsDTO defaultSettings = new UserSettingsDTO();
        UserSettings.FocusSettings focusSettings = new UserSettings.FocusSettings();
        focusSettings.setWorkDuration(25);
        focusSettings.setShortBreakDuration(5);
        focusSettings.setLongBreakDuration(15);
        focusSettings.setSessionsUntilLongBreak(4);
        focusSettings.setAutoStartBreaks(false);
        focusSettings.setAutoStartWork(false);
        focusSettings.setSoundEnabled(true);
        focusSettings.setVolume(0.5);
        defaultSettings.setFocus(focusSettings);
        return defaultSettings;
    }
}
