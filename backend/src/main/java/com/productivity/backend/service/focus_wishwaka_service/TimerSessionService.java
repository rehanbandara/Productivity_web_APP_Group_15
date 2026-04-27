package com.productivity.backend.service.focus_wishwaka_service;

import com.productivity.backend.dto.focus_wishwaka_dto.TimerSessionDTO;
import com.productivity.backend.dto.focus_wishwaka_dto.StatsDTO;
import com.productivity.backend.entity.focus_wishwaka_entity.TimerSession;
import com.productivity.backend.repository.focus_wishwaka_repository.TimerSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TimerSessionService {
    
    private final TimerSessionRepository timerSessionRepository;
    
    public TimerSessionDTO getCurrentSession() {
        TimerSession runningSession = timerSessionRepository.findRunningSession();
        if (runningSession != null) {
            return TimerSessionDTO.fromEntity(runningSession);
        }
        
        // Return default session if no running session
        TimerSession defaultSession = new TimerSession();
        defaultSession.setId(1L);
        defaultSession.setMode(TimerSession.SessionMode.WORK);
        defaultSession.setIsRunning(false);
        defaultSession.setTimeLeft(25 * 60);
        defaultSession.setCurrentSession(1);
        defaultSession.setDuration(25);
        defaultSession.setStatus(TimerSession.SessionStatus.PAUSED);
        
        return TimerSessionDTO.fromEntity(defaultSession);
    }
    
    public TimerSessionDTO startSession(TimerSessionDTO sessionDTO) {
        TimerSession session = sessionDTO.toEntity();
        session.setStatus(TimerSession.SessionStatus.RUNNING);
        session.setIsRunning(true);
        session.setStartTime(LocalDateTime.now());
        session.setCreatedAt(LocalDateTime.now());
        
        TimerSession savedSession = timerSessionRepository.save(session);
        return TimerSessionDTO.fromEntity(savedSession);
    }
    
    public TimerSessionDTO pauseSession(Long sessionId) {
        TimerSession session = timerSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
        
        session.setStatus(TimerSession.SessionStatus.PAUSED);
        session.setIsRunning(false);
        session.setPausedAt(LocalDateTime.now());
        
        TimerSession updatedSession = timerSessionRepository.save(session);
        return TimerSessionDTO.fromEntity(updatedSession);
    }
    
    public TimerSessionDTO resumeSession(Long sessionId) {
        TimerSession session = timerSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
        
        session.setStatus(TimerSession.SessionStatus.RUNNING);
        session.setIsRunning(true);
        session.setResumedAt(LocalDateTime.now());
        
        TimerSession updatedSession = timerSessionRepository.save(session);
        return TimerSessionDTO.fromEntity(updatedSession);
    }
    
    public TimerSessionDTO completeSession(Long sessionId) {
        TimerSession session = timerSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
        
        // Calculate duration if not set
        if (session.getDuration() == null) {
            if (session.getStartTime() != null && session.getCompletedAt() != null) {
                long durationMinutes = java.time.Duration.between(session.getStartTime(), session.getCompletedAt()).toMinutes();
                session.setDuration((int) durationMinutes);
            } else if (session.getTimeLeft() != null) {
                // Use timeLeft to calculate duration (for sessions that were started but never had proper duration set)
                session.setDuration(session.getTimeLeft() / 60); // Convert seconds back to minutes
            } else {
                session.setDuration(0); // Default to 0 if we can't calculate
            }
        }
        
        session.setStatus(TimerSession.SessionStatus.COMPLETED);
        session.setIsRunning(false);
        session.setCompletedAt(LocalDateTime.now());
        
        TimerSession updatedSession = timerSessionRepository.save(session);
        return TimerSessionDTO.fromEntity(updatedSession);
    }
    
    public List<TimerSessionDTO> getSessionHistory() {
        List<TimerSession> sessions = timerSessionRepository.findAll();
        return sessions.stream()
                .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
                .map(TimerSessionDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public StatsDTO getTodayStats() {
        Long totalSessions = timerSessionRepository.getTodaySessionCount();
        if (totalSessions == null) totalSessions = 0L;
        
        Long completedSessions = timerSessionRepository.getTodaySessionCountByStatus(TimerSession.SessionStatus.COMPLETED);
        if (completedSessions == null) completedSessions = 0L;
        
        Integer totalFocusTime = timerSessionRepository.getTodayTotalFocusTime();
        if (totalFocusTime == null) totalFocusTime = 0;
        
        Integer averageSessionLength = completedSessions > 0 ? totalFocusTime / completedSessions.intValue() : 0;
        Double completionRate = totalSessions > 0 ? (completedSessions.doubleValue() / totalSessions) * 100 : 0.0;
        
        StatsDTO stats = new StatsDTO();
        stats.setTotalSessions(totalSessions.intValue());
        stats.setCompletedSessions(completedSessions.intValue());
        stats.setTotalFocusTime(totalFocusTime);
        stats.setAverageSessionLength(averageSessionLength);
        stats.setCompletionRate(completionRate);
        
        return stats;
    }
    
    public List<TimerSessionDTO> getTodaySessions() {
        List<TimerSession> sessions = timerSessionRepository.findTodaySessions();
        return sessions.stream()
                .map(TimerSessionDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TimerSessionDTO> getWeekSessions() {
        LocalDateTime weekStart = LocalDateTime.now().with(LocalTime.MIN).minusDays(LocalDateTime.now().getDayOfWeek().getValue() - 1);
        List<TimerSession> sessions = timerSessionRepository.findWeekSessions(weekStart);
        return sessions.stream()
                .map(TimerSessionDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TimerSessionDTO> getMonthSessions() {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).with(LocalTime.MIN);
        List<TimerSession> sessions = timerSessionRepository.findMonthSessions(monthStart);
        return sessions.stream()
                .map(TimerSessionDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
