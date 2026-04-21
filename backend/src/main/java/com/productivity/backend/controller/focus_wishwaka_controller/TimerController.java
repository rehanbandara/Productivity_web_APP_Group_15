package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.DTO.focus_wishwaka_DTO.TimerSessionDTO;
import com.productivity.backend.DTO.focus_wishwaka_DTO.StatsDTO;
import com.productivity.backend.entity.user_entity.User;
import com.productivity.backend.service.focus_wishwaka_service.TimerSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TimerController {
    
    private final TimerSessionService timerSessionService;
    
    @GetMapping("/current")
    public ResponseEntity<TimerSessionDTO> getCurrentSession(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        TimerSessionDTO session = timerSessionService.getCurrentSession(user);
        return ResponseEntity.ok(session);
    }
    
    @PostMapping("/start")
    public ResponseEntity<TimerSessionDTO> startSession(@RequestBody TimerSessionDTO sessionDTO, Authentication authentication) {
        try {
            System.out.println("DEBUG: Controller received session DTO: " + sessionDTO);
            
            User user = (User) authentication.getPrincipal();
            TimerSessionDTO session = timerSessionService.startSession(sessionDTO, user);
            
            System.out.println("DEBUG: Controller returning session: " + session);
            return ResponseEntity.status(HttpStatus.CREATED).body(session);
        } catch (Exception e) {
            System.err.println("ERROR: Controller failed to start session: " + e.getMessage());
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
    public ResponseEntity<TimerSessionDTO> completeSession(@PathVariable Long sessionId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        TimerSessionDTO session = timerSessionService.completeSession(sessionId, user);
        return ResponseEntity.ok(session);
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<TimerSessionDTO>> getSessionHistory() {
        List<TimerSessionDTO> sessions = timerSessionService.getSessionHistory();
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/stats/today")
    public ResponseEntity<StatsDTO> getTodayStats(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        StatsDTO stats = timerSessionService.getTodayStats(user);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/sessions/today")
    public ResponseEntity<List<TimerSessionDTO>> getTodaySessions(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<TimerSessionDTO> sessions = timerSessionService.getTodaySessions(user);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/sessions/week")
    public ResponseEntity<List<TimerSessionDTO>> getWeekSessions(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<TimerSessionDTO> sessions = timerSessionService.getWeekSessions(user);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/sessions/month")
    public ResponseEntity<List<TimerSessionDTO>> getMonthSessions(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<TimerSessionDTO> sessions = timerSessionService.getMonthSessions(user);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/sessions/recent-completed")
    public ResponseEntity<List<TimerSessionDTO>> getRecentCompletedSessions(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        List<TimerSessionDTO> sessions = timerSessionService.getRecentCompletedSessions(user);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/sessions/completed-count")
    public ResponseEntity<Long> getCompletedSessionsCount(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        Long count = timerSessionService.getCompletedSessionsCount(user);
        return ResponseEntity.ok(count);
    }
    
    @PostMapping("/sessions/store-recent")
    public ResponseEntity<List<TimerSessionDTO>> storeRecentSessions(@RequestBody List<TimerSessionDTO> sessions, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        timerSessionService.storeRecentSessions(sessions, user);
        List<TimerSessionDTO> storedSessions = timerSessionService.getRecentSessions();
        return ResponseEntity.ok(storedSessions);
    }
    
    @GetMapping("/sessions/recent")
    public ResponseEntity<List<TimerSessionDTO>> getRecentSessions() {
        List<TimerSessionDTO> sessions = timerSessionService.getRecentSessions();
        return ResponseEntity.ok(sessions);
    }
}
