package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.DTO.focus_wishwaka_DTO.UserSettingsDTO;
import com.productivity.backend.service.focus_wishwaka_service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SettingsController {
    
    private final UserSettingsService userSettingsService;
    
    @GetMapping
    public ResponseEntity<UserSettingsDTO> getUserSettings() {
        UserSettingsDTO settings = userSettingsService.getUserSettings();
        return ResponseEntity.ok(settings);
    }
    
    @PutMapping
    public ResponseEntity<UserSettingsDTO> updateSettings(@Valid @RequestBody UserSettingsDTO settingsDTO) {
        UserSettingsDTO updatedSettings = userSettingsService.updateSettings(settingsDTO);
        return ResponseEntity.ok(updatedSettings);
    }
    
    @PostMapping("/reset")
    public ResponseEntity<UserSettingsDTO> resetToDefaults() {
        UserSettingsDTO defaultSettings = userSettingsService.resetToDefaults();
        return ResponseEntity.ok(defaultSettings);
    }
    
    @GetMapping("/timer")
    public ResponseEntity<UserSettingsDTO> getTimerSettings() {
        UserSettingsDTO settings = userSettingsService.getUserSettings();
        return ResponseEntity.ok(settings);
    }
    
    @PutMapping("/timer")
    public ResponseEntity<UserSettingsDTO> updateTimerSettings(@Valid @RequestBody UserSettingsDTO settingsDTO) {
        // Only update focus settings (timer settings)
        UserSettingsDTO currentSettings = userSettingsService.getUserSettings();
        
        if (settingsDTO.getFocus() != null) {
            currentSettings.setFocus(settingsDTO.getFocus());
        }
        
        UserSettingsDTO updatedSettings = userSettingsService.updateSettings(currentSettings);
        return ResponseEntity.ok(updatedSettings);
    }
}
