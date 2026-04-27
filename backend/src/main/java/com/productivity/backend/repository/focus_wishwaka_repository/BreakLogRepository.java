package com.productivity.backend.repository.focus_wishwaka_repository;

import com.productivity.backend.entity.focus_wishwaka_entity.BreakLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BreakLogRepository extends JpaRepository<BreakLog, Long> {
    
    List<BreakLog> findByType(BreakLog.BreakType type);
    
    @Query("SELECT b FROM BreakLog b WHERE b.createdAt >= :startDate AND b.createdAt <= :endDate ORDER BY b.createdAt DESC")
    List<BreakLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT b FROM BreakLog b WHERE DATE(b.createdAt) = CURRENT_DATE ORDER BY b.createdAt DESC")
    List<BreakLog> findTodayBreaks();
    
    @Query("SELECT COUNT(b) FROM BreakLog b WHERE DATE(b.createdAt) = CURRENT_DATE")
    Long getTodayBreakCount();
    
    @Query("SELECT COUNT(b) FROM BreakLog b WHERE b.type = :type AND DATE(b.createdAt) = CURRENT_DATE")
    Long getTodayBreakCountByType(@Param("type") BreakLog.BreakType type);
    
    @Query("SELECT b FROM BreakLog b ORDER BY b.createdAt DESC")
    List<BreakLog> findAllOrdered();
}
