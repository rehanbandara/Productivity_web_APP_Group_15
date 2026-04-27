package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.dto.focus_wishwaka_dto.TimerSessionDTO;
import com.productivity.backend.dto.focus_wishwaka_dto.StatsDTO;
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
    public ResponseEntity<TimerSessionDTO> startSession(@Valid @RequestBody TimerSessionDTO sessionDTO) {
        TimerSessionDTO session = timerSessionService.startSession(sessionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
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
}
