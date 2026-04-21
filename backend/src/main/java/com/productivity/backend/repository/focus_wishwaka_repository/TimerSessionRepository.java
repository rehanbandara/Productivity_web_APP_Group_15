package com.productivity.backend.repository.focus_wishwaka_repository;

import com.productivity.backend.entity.focus_wishwaka_entity.TimerSession;
import com.productivity.backend.entity.user_entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimerSessionRepository extends JpaRepository<TimerSession, Long> {
    
    List<TimerSession> findByUser(User user);
    
    List<TimerSession> findByUserAndStatus(User user, TimerSession.SessionStatus status);
    
    List<TimerSession> findByUserAndMode(User user, TimerSession.SessionMode mode);
    
    @Query("SELECT t FROM TimerSession t WHERE t.user = :user AND t.createdAt >= :startDate AND t.createdAt <= :endDate ORDER BY t.createdAt DESC")
    List<TimerSession> findByDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM TimerSession t WHERE t.user = :user AND DATE(t.createdAt) = CURRENT_DATE ORDER BY t.createdAt DESC")
    List<TimerSession> findTodaySessions(@Param("user") User user);
    
    @Query("SELECT t FROM TimerSession t WHERE t.user = :user AND t.createdAt >= :weekStart ORDER BY t.createdAt DESC")
    List<TimerSession> findWeekSessions(@Param("user") User user, @Param("weekStart") LocalDateTime weekStart);
    
    @Query("SELECT t FROM TimerSession t WHERE t.user = :user AND t.createdAt >= :monthStart ORDER BY t.createdAt DESC")
    List<TimerSession> findMonthSessions(@Param("user") User user, @Param("monthStart") LocalDateTime monthStart);
    
    @Query("SELECT COUNT(t) FROM TimerSession t WHERE t.user = :user AND DATE(t.createdAt) = CURRENT_DATE")
    Long getTodaySessionCount(@Param("user") User user);
    
    @Query("SELECT COUNT(t) FROM TimerSession t WHERE t.user = :user AND t.status = :status AND DATE(t.createdAt) = CURRENT_DATE")
    Long getTodaySessionCountByStatus(@Param("user") User user, @Param("status") TimerSession.SessionStatus status);
    
    @Query("SELECT COALESCE(SUM(t.duration), 0) FROM TimerSession t WHERE t.user = :user AND t.status = 'COMPLETED' AND DATE(t.createdAt) = CURRENT_DATE")
    Integer getTodayTotalFocusTime(@Param("user") User user);
    
    @Query("SELECT t FROM TimerSession t WHERE t.user = :user AND t.completedSessions = true ORDER BY t.completedAt DESC")
    List<TimerSession> findRecentCompletedSessions(@Param("user") User user);
    
    @Query("SELECT COUNT(t) FROM TimerSession t WHERE t.user = :user AND t.completedSessions = :completed")
    Long countByUserAndCompletedSessions(@Param("user") User user, @Param("completed") Boolean completed);
    
    @Query("SELECT t FROM TimerSession t WHERE t.user = :user AND t.isRunning = true")
    TimerSession findRunningSession(@Param("user") User user);
}
