package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.repository.focus_wishwaka_repository.TimerSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {
    
    private final TimerSessionRepository timerSessionRepository;
    
    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> checkDatabaseHealth() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Test database connection by counting sessions
            long sessionCount = timerSessionRepository.count();
            
            response.put("status", "healthy");
            response.put("database", "connected");
            response.put("sessionCount", sessionCount);
            response.put("message", "Database connection successful");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "unhealthy");
            response.put("database", "disconnected");
            response.put("error", e.getMessage());
            response.put("message", "Database connection failed");
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/table-check")
    public ResponseEntity<Map<String, Object>> checkTableExists() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Test if timer_sessions table exists by trying to count
            long sessionCount = timerSessionRepository.count();
            
            response.put("status", "table_exists");
            response.put("tableName", "timer_sessions");
            response.put("rowCount", sessionCount);
            response.put("message", "timer_sessions table exists and is accessible");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "table_missing");
            response.put("tableName", "timer_sessions");
            response.put("error", e.getMessage());
            response.put("message", "timer_sessions table does not exist or is not accessible");
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
