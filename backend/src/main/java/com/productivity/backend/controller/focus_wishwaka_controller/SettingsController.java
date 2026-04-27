package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.dto.focus_wishwaka_dto.UserSettingsDTO;
import com.productivity.backend.service.focus_wishwaka_service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SettingsController {
    
    private final UserSettingsService userSettingsService;
    
    @GetMapping
    public ResponseEntity<UserSettingsDTO> getUserSettings() {
        UserSettingsDTO settings = userSettingsService.getUserSettings();
        return ResponseEntity.ok(settings);
    }
    
    @PutMapping
    public ResponseEntity<UserSettingsDTO> updateSettings(@com.productivity.backend.controller.focus_wishwaka_controller.Valid @RequestBody UserSettingsDTO settingsDTO) {
        UserSettingsDTO updatedSettings = userSettingsService.updateSettings(settingsDTO);
        return ResponseEntity.ok(updatedSettings);
    }
    
    @PostMapping("/reset")
    public ResponseEntity<UserSettingsDTO> resetToDefaults() {
        UserSettingsDTO defaultSettings = userSettingsService.resetToDefaults();
        return ResponseEntity.ok(defaultSettings);
    }
}
