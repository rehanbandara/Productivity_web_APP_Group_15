package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.DTO.focus_wishwaka_DTO.TimerSessionDTO;
import com.productivity.backend.DTO.focus_wishwaka_DTO.StatsDTO;
import com.productivity.backend.service.focus_wishwaka_service.TimerSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/timer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TimerController {
    
    private final TimerSessionService timerSessionService;
    
    @GetMapping("/current")
    public ResponseEntity<TimerSessionDTO> getCurrentSession() {
        TimerSessionDTO session = timerSessionService.getCurrentSession();
        return ResponseEntity.ok(session);
    }
    
    @PostMapping("/start")
    public ResponseEntity<TimerSessionDTO> startSession(@RequestBody TimerSessionDTO sessionDTO) {
        try {
            System.out.println("DEBUG: Controller received session DTO: " + sessionDTO);
            
            TimerSessionDTO session = timerSessionService.startSession(sessionDTO);
            
            System.out.println("DEBUG: Controller returning session: " + session);
            return ResponseEntity.status(HttpStatus.CREATED).body(session);
        } catch (Exception e) {
            System.err.println("ERROR: Controller failed to start session: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PatchMapping("/{sessionId}/pause")
    public ResponseEntity<TimerSessionDTO> pauseSession(@PathVariable Long sessionId) {
        TimerSessionDTO session = timerSessionService.pauseSession(sessionId);
        return ResponseEntity.ok(session);
    }
    
    @PatchMapping("/{sessionId}/resume")
    public ResponseEntity<TimerSessionDTO> resumeSession(@PathVariable Long sessionId) {
        TimerSessionDTO session = timerSessionService.resumeSession(sessionId);
        return ResponseEntity.ok(session);
    }
    
    @PatchMapping("/{sessionId}/complete")
    public ResponseEntity<TimerSessionDTO> completeSession(@PathVariable Long sessionId) {
        TimerSessionDTO session = timerSessionService.completeSession(sessionId);
        return ResponseEntity.ok(session);
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<TimerSessionDTO>> getSessionHistory() {
        List<TimerSessionDTO> sessions = timerSessionService.getSessionHistory();
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/stats/today")
    public ResponseEntity<StatsDTO> getTodayStats() {
        StatsDTO stats = timerSessionService.getTodayStats();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/sessions/today")
    public ResponseEntity<List<TimerSessionDTO>> getTodaySessions() {
        List<TimerSessionDTO> sessions = timerSessionService.getTodaySessions();
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/sessions/week")
    public ResponseEntity<List<TimerSessionDTO>> getWeekSessions() {
        List<TimerSessionDTO> sessions = timerSessionService.getWeekSessions();
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/sessions/month")
    public ResponseEntity<List<TimerSessionDTO>> getMonthSessions() {
        List<TimerSessionDTO> sessions = timerSessionService.getMonthSessions();
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/sessions/recent-completed")
    public ResponseEntity<List<TimerSessionDTO>> getRecentCompletedSessions() {
        // TODO: Get actual user_id from authentication context
        Long userId = 1L; // Default user for now
        List<TimerSessionDTO> sessions = timerSessionService.getRecentCompletedSessions(userId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/sessions/completed-count")
    public ResponseEntity<Long> getCompletedSessionsCount() {
        // TODO: Get actual user_id from authentication context
        Long userId = 1L; // Default user for now
        Long count = timerSessionService.getCompletedSessionsCount(userId);
        return ResponseEntity.ok(count);
    }
    
    @PostMapping("/sessions/store-recent")
    public ResponseEntity<List<TimerSessionDTO>> storeRecentSessions(@RequestBody List<TimerSessionDTO> sessions) {
        timerSessionService.storeRecentSessions(sessions);
        List<TimerSessionDTO> storedSessions = timerSessionService.getRecentSessions();
        return ResponseEntity.ok(storedSessions);
    }
    
    @GetMapping("/sessions/recent")
    public ResponseEntity<List<TimerSessionDTO>> getRecentSessions() {
        List<TimerSessionDTO> sessions = timerSessionService.getRecentSessions();
        return ResponseEntity.ok(sessions);
    }
}
