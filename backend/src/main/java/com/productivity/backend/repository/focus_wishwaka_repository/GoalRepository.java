package com.productivity.backend.repository.focus_wishwaka_repository;

import com.productivity.backend.entity.focus_wishwaka_entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    
    List<Goal> findByStatus(Goal.GoalStatus status);
    
    List<Goal> findByCategory(String category);
    
    List<Goal> findByPriority(Goal.Priority priority);
    
    @Query("SELECT g FROM Goal g WHERE g.status != :completedStatus ORDER BY g.dueDate ASC")
    List<Goal> findUpcomingGoals(@Param("completedStatus") Goal.GoalStatus completedStatus);
    
    @Query("SELECT COUNT(g) FROM Goal g WHERE g.status = :status")
    Long countByStatus(@Param("status") Goal.GoalStatus status);
    
    @Query("SELECT g FROM Goal g WHERE g.title LIKE %:keyword% OR g.description LIKE %:keyword% OR g.category LIKE %:keyword%")
    List<Goal> searchGoals(@Param("keyword") String keyword);
    
    @Query("SELECT g FROM Goal g WHERE g.dueDate < :today AND g.status != :completedStatus")
    List<Goal> findOverdueGoals(@Param("today") String today, @Param("completedStatus") Goal.GoalStatus completedStatus);
    
    @Query("SELECT COUNT(g) FROM Goal g")
    Long getTotalGoals();
    
    @Query("SELECT AVG(g.progress) FROM Goal g")
    Double getAverageProgress();
}
