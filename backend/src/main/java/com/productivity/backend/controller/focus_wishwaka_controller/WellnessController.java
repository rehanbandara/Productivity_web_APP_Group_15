package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.DTO.focus_wishwaka_DTO.WellnessReminderDTO;
import com.productivity.backend.DTO.focus_wishwaka_DTO.StatsDTO;
import com.productivity.backend.entity.focus_wishwaka_entity.BreakLog;
import com.productivity.backend.entity.focus_wishwaka_entity.WellnessReminder;
import com.productivity.backend.entity.user_entity.User;
import com.productivity.backend.service.focus_wishwaka_service.WellnessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wellness")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WellnessController {
    
    private final WellnessService wellnessService;
    
    @GetMapping("/reminders")
    public ResponseEntity<Map<String, WellnessReminderDTO>> getReminders(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            // Return reminders for anonymous users using session ID
            String sessionId = "anonymous-wellness"; // Fixed session ID for wellness settings
            Map<String, WellnessReminderDTO> reminders = wellnessService.getAnonymousReminders(sessionId);
            return ResponseEntity.ok(reminders);
        }
        User user = (User) authentication.getPrincipal();
        Map<String, WellnessReminderDTO> reminders = wellnessService.getReminders(user);
        return ResponseEntity.ok(reminders);
    }
    
    @PutMapping("/reminders")
    public ResponseEntity<Map<String, WellnessReminderDTO>> updateReminders(@Valid @RequestBody Map<String, WellnessReminderDTO> reminders, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            // Store reminders for anonymous users using session ID
            String sessionId = "anonymous-wellness"; // Fixed session ID for wellness settings
            Map<String, WellnessReminderDTO> updatedReminders = wellnessService.updateAnonymousReminders(sessionId, reminders);
            return ResponseEntity.ok(updatedReminders);
        }
        User user = (User) authentication.getPrincipal();
        Map<String, WellnessReminderDTO> updatedReminders = wellnessService.updateReminders(reminders, user);
        return ResponseEntity.ok(updatedReminders);
    }
    
    private Map<String, WellnessReminderDTO> createDefaultReminders() {
        Map<String, WellnessReminderDTO> defaultReminders = new java.util.HashMap<>();
        
        // Create default eye rest reminder
        WellnessReminderDTO eyeRest = new WellnessReminderDTO();
        eyeRest.setType(WellnessReminder.ReminderType.EYE_REST);
        eyeRest.setEnabled(true);
        eyeRest.setInterval(20); // 20 minutes
        eyeRest.setDuration(20); // 20 seconds
        eyeRest.setSoundEnabled(true);
        defaultReminders.put("eyeRest", eyeRest);
        
        // Create default posture reminder
        WellnessReminderDTO posture = new WellnessReminderDTO();
        posture.setType(WellnessReminder.ReminderType.POSTURE);
        posture.setEnabled(true);
        posture.setInterval(30); // 30 minutes
        posture.setDuration(10); // 10 seconds
        posture.setSoundEnabled(true);
        defaultReminders.put("posture", posture);
        
        // Create default break reminder
        WellnessReminderDTO breakReminder = new WellnessReminderDTO();
        breakReminder.setType(WellnessReminder.ReminderType.BREAK);
        breakReminder.setEnabled(true);
        breakReminder.setInterval(60); // 60 minutes
        breakReminder.setDuration(120); // 2 minutes
        breakReminder.setSoundEnabled(true);
        defaultReminders.put("break", breakReminder);
        
        return defaultReminders;
    }
    
    @GetMapping("/stats")
    public ResponseEntity<StatsDTO> getWellnessStats(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        StatsDTO stats = wellnessService.getWellnessStats(user);
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping("/breaks")
    public ResponseEntity<BreakLog> logBreak(@RequestBody Map<String, Object> breakData, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String typeStr = (String) breakData.get("type");
        Integer duration = (Integer) breakData.get("duration");
        
        User user = (User) authentication.getPrincipal();
        BreakLog.BreakType type = BreakLog.BreakType.valueOf(typeStr.toUpperCase());
        BreakLog breakLog = wellnessService.logBreak(type, duration, user);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(breakLog);
    }
    
    @GetMapping("/breaks/history")
    public ResponseEntity<List<BreakLog>> getBreakHistory(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        List<BreakLog> breakHistory = wellnessService.getBreakHistory(user);
        return ResponseEntity.ok(breakHistory);
    }
    
    @GetMapping("/breaks/today")
    public ResponseEntity<List<BreakLog>> getTodayBreaks(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        List<BreakLog> todayBreaks = wellnessService.getTodayBreaks(user);
        return ResponseEntity.ok(todayBreaks);
    }
}
