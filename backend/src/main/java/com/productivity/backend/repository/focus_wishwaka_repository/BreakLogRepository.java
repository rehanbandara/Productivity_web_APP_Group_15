package com.productivity.backend.repository.focus_wishwaka_repository;

import com.productivity.backend.entity.focus_wishwaka_entity.BreakLog;
import com.productivity.backend.entity.user_entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BreakLogRepository extends JpaRepository<BreakLog, Long> {
    
    List<BreakLog> findByUser(User user);
    
    List<BreakLog> findByUserAndType(User user, BreakLog.BreakType type);
    
    @Query("SELECT b FROM BreakLog b WHERE b.user = :user AND b.createdAt >= :startDate AND b.createdAt <= :endDate ORDER BY b.createdAt DESC")
    List<BreakLog> findByDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT b FROM BreakLog b WHERE b.user = :user AND DATE(b.createdAt) = CURRENT_DATE ORDER BY b.createdAt DESC")
    List<BreakLog> findTodayBreaks(@Param("user") User user);
    
    @Query("SELECT COUNT(b) FROM BreakLog b WHERE b.user = :user AND DATE(b.createdAt) = CURRENT_DATE")
    Long getTodayBreakCount(@Param("user") User user);
    
    @Query("SELECT COUNT(b) FROM BreakLog b WHERE b.user = :user AND b.type = :type AND DATE(b.createdAt) = CURRENT_DATE")
    Long getTodayBreakCountByType(@Param("user") User user, @Param("type") BreakLog.BreakType type);
    
    @Query("SELECT b FROM BreakLog b WHERE b.user = :user ORDER BY b.createdAt DESC")
    List<BreakLog> findAllOrdered(@Param("user") User user);
    
    List<BreakLog> findByUserOrderByCreatedAtDesc(User user);
    
    List<BreakLog> findByUserAndCreatedAtBetween(User user, LocalDateTime startDate, LocalDateTime endDate);
}
