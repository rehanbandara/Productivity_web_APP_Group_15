package com.productivity.backend.service.focus_wishwaka_service;

import com.productivity.backend.DTO.focus_wishwaka_DTO.TimerSessionDTO;
import com.productivity.backend.DTO.focus_wishwaka_DTO.StatsDTO;
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
        try {
            System.out.println("DEBUG: Starting new session with DTO: " + sessionDTO);
            
            TimerSession session = sessionDTO.toEntity();
            System.out.println("DEBUG: Converted to entity: " + session);
            
            session.setStatus(TimerSession.SessionStatus.RUNNING);
            session.setIsRunning(true);
            session.setStartTime(LocalDateTime.now());
            session.setCreatedAt(LocalDateTime.now());
            
            System.out.println("DEBUG: About to save session to database");
            
            TimerSession savedSession = timerSessionRepository.save(session);
            
            System.out.println("DEBUG: Successfully saved session with ID: " + savedSession.getId());
            
            return TimerSessionDTO.fromEntity(savedSession);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to start session: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to start session: " + e.getMessage(), e);
        }
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
        try {
            System.out.println("DEBUG: Attempting to complete session with ID: " + sessionId);
            
            TimerSession session = timerSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
            
            System.out.println("DEBUG: Found session: " + session.getId() + ", mode: " + session.getMode());
            
            // Calculate duration if not set
            if (session.getDuration() == null || session.getDuration() == 0) {
                if (session.getTimeLeft() != null && session.getStartTime() != null) {
                    long elapsedMinutes = java.time.Duration.between(session.getStartTime(), LocalDateTime.now()).toMinutes();
                    session.setDuration((int) elapsedMinutes);
                    System.out.println("DEBUG: Calculated duration from start time: " + elapsedMinutes + " minutes");
                } else if (session.getTimeLeft() != null) {
                    session.setDuration(session.getTimeLeft() / 60); // Convert seconds back to minutes
                    System.out.println("DEBUG: Calculated duration from timeLeft: " + (session.getTimeLeft() / 60) + " minutes");
                } else {
                    session.setDuration(0); // Default to 0 if we can't calculate
                    System.out.println("DEBUG: Using default duration: 0 minutes");
                }
            }
            
            session.setStatus(TimerSession.SessionStatus.COMPLETED);
            session.setIsRunning(false);
            session.setCompletedAt(LocalDateTime.now());
            session.setCompletedSessions(true);
            // TODO: Set actual user_id when authentication is implemented
            session.setUserId(1L); // Default user for now
            
            System.out.println("DEBUG: About to save session with completedSessions: " + session.getCompletedSessions());
            
            TimerSession updatedSession = timerSessionRepository.save(session);
            
            System.out.println("DEBUG: Successfully saved session. New ID: " + updatedSession.getId());
            System.out.println("DEBUG: completedSessions value: " + updatedSession.getCompletedSessions());
            
            return TimerSessionDTO.fromEntity(updatedSession);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to complete session: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to complete session: " + e.getMessage(), e);
        }
    }
    
    public List<TimerSessionDTO> getSessionHistory() {
        List<TimerSession> sessions = timerSessionRepository.findAll();
        return sessions.stream()
                .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
                .map(TimerSessionDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TimerSessionDTO> getRecentSessions() {
        List<TimerSession> sessions = timerSessionRepository.findAll();
        return sessions.stream()
                .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
                .limit(10)
                .map(TimerSessionDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TimerSessionDTO> getRecentCompletedSessions(Long userId) {
        List<TimerSession> sessions = timerSessionRepository.findRecentCompletedSessions(userId);
        return sessions.stream()
                .limit(10) // Limit to last 10 sessions
                .map(TimerSessionDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public Long getCompletedSessionsCount(Long userId) {
        return timerSessionRepository.countByUserIdAndCompletedSessions(userId, true);
    }
    
    public void storeRecentSessions(List<TimerSessionDTO> sessions) {
        for (TimerSessionDTO sessionDTO : sessions) {
            TimerSession session = sessionDTO.toEntity();
            session.setCreatedAt(LocalDateTime.now());
            session.setCompletedSessions(true);
            session.setUserId(1L); // Default user for now
            timerSessionRepository.save(session);
        }
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
