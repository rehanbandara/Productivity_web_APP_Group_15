package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.dto.focus_wishwaka_dto.WellnessReminderDTO;
import com.productivity.backend.dto.focus_wishwaka_dto.StatsDTO;
import com.productivity.backend.entity.focus_wishwaka_entity.BreakLog;
import com.productivity.backend.service.focus_wishwaka_service.WellnessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, WellnessReminderDTO>> getReminders() {
        Map<String, WellnessReminderDTO> reminders = wellnessService.getReminders();
        return ResponseEntity.ok(reminders);
    }
    
    @PutMapping("/reminders")
    public ResponseEntity<Map<String, WellnessReminderDTO>> updateReminders(@Valid @RequestBody Map<String, WellnessReminderDTO> reminders) {
        Map<String, WellnessReminderDTO> updatedReminders = wellnessService.updateReminders(reminders);
        return ResponseEntity.ok(updatedReminders);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<StatsDTO> getWellnessStats() {
        StatsDTO stats = wellnessService.getWellnessStats();
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping("/breaks")
    public ResponseEntity<BreakLog> logBreak(@RequestBody Map<String, Object> breakData) {
        String typeStr = (String) breakData.get("type");
        Integer duration = (Integer) breakData.get("duration");
        
        BreakLog.BreakType type = BreakLog.BreakType.valueOf(typeStr.toUpperCase());
        BreakLog breakLog = wellnessService.logBreak(type, duration);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(breakLog);
    }
    
    @GetMapping("/breaks/history")
    public ResponseEntity<List<BreakLog>> getBreakHistory() {
        List<BreakLog> breakHistory = wellnessService.getBreakHistory();
        return ResponseEntity.ok(breakHistory);
    }
    
    @GetMapping("/breaks/today")
    public ResponseEntity<List<BreakLog>> getTodayBreaks() {
        List<BreakLog> todayBreaks = wellnessService.getTodayBreaks();
        return ResponseEntity.ok(todayBreaks);
    }
}
