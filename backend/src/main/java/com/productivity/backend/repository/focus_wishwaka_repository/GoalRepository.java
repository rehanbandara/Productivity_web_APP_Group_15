package com.productivity.backend.repository.focus_wishwaka_repository;

import com.productivity.backend.entity.focus_wishwaka_entity.Goal;
import com.productivity.backend.entity.user_entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    
    List<Goal> findByUser(User user);
    
    List<Goal> findByUserAndStatus(User user, Goal.GoalStatus status);
    
    List<Goal> findByUserAndCategory(User user, String category);
    
    List<Goal> findByUserAndPriority(User user, Goal.Priority priority);
    
    @Query("SELECT g FROM Goal g WHERE g.user = :user AND g.status != :completedStatus ORDER BY g.dueDate ASC")
    List<Goal> findUpcomingGoals(@Param("user") User user, @Param("completedStatus") Goal.GoalStatus completedStatus);
    
    @Query("SELECT COUNT(g) FROM Goal g WHERE g.user = :user AND g.status = :status")
    Long countByUserAndStatus(@Param("user") User user, @Param("status") Goal.GoalStatus status);
    
    @Query("SELECT g FROM Goal g WHERE g.user = :user AND (g.title LIKE %:keyword% OR g.description LIKE %:keyword% OR g.category LIKE %:keyword%)")
    List<Goal> searchGoals(@Param("user") User user, @Param("keyword") String keyword);
    
    @Query("SELECT g FROM Goal g WHERE g.user = :user AND g.dueDate < :today AND g.status != :completedStatus")
    List<Goal> findOverdueGoals(@Param("user") User user, @Param("today") String today, @Param("completedStatus") Goal.GoalStatus completedStatus);
    
    @Query("SELECT COUNT(g) FROM Goal g WHERE g.user = :user")
    Long getTotalGoals(@Param("user") User user);
    
    @Query("SELECT AVG(g.progress) FROM Goal g WHERE g.user = :user")
    Double getAverageProgress(@Param("user") User user);
}
