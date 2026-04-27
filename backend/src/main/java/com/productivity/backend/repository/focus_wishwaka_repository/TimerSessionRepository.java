package com.productivity.backend.repository.focus_wishwaka_repository;

import com.productivity.backend.entity.focus_wishwaka_entity.TimerSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimerSessionRepository extends JpaRepository<TimerSession, Long> {
    
    List<TimerSession> findByStatus(TimerSession.SessionStatus status);
    
    List<TimerSession> findByMode(TimerSession.SessionMode mode);
    
    @Query("SELECT t FROM TimerSession t WHERE t.createdAt >= :startDate AND t.createdAt <= :endDate ORDER BY t.createdAt DESC")
    List<TimerSession> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM TimerSession t WHERE DATE(t.createdAt) = CURRENT_DATE ORDER BY t.createdAt DESC")
    List<TimerSession> findTodaySessions();
    
    @Query("SELECT t FROM TimerSession t WHERE t.createdAt >= :weekStart ORDER BY t.createdAt DESC")
    List<TimerSession> findWeekSessions(@Param("weekStart") LocalDateTime weekStart);
    
    @Query("SELECT t FROM TimerSession t WHERE t.createdAt >= :monthStart ORDER BY t.createdAt DESC")
    List<TimerSession> findMonthSessions(@Param("monthStart") LocalDateTime monthStart);
    
    @Query("SELECT COUNT(t) FROM TimerSession t WHERE DATE(t.createdAt) = CURRENT_DATE")
    Long getTodaySessionCount();
    
    @Query("SELECT COUNT(t) FROM TimerSession t WHERE t.status = :status AND DATE(t.createdAt) = CURRENT_DATE")
    Long getTodaySessionCountByStatus(@Param("status") TimerSession.SessionStatus status);
    
    @Query("SELECT COALESCE(SUM(t.duration), 0) FROM TimerSession t WHERE t.status = 'COMPLETED' AND DATE(t.createdAt) = CURRENT_DATE")
    Integer getTodayTotalFocusTime();
    
    @Query("SELECT t FROM TimerSession t WHERE t.isRunning = true")
    TimerSession findRunningSession();
}
