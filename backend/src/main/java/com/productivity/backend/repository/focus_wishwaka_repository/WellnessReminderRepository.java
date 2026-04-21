package com.productivity.backend.repository.focus_wishwaka_repository;

import com.productivity.backend.entity.focus_wishwaka_entity.WellnessReminder;
import com.productivity.backend.entity.user_entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WellnessReminderRepository extends JpaRepository<WellnessReminder, Long> {
    
    List<WellnessReminder> findByUser(User user);
    
    List<WellnessReminder> findByUserAndEnabled(User user, Boolean enabled);
    
    List<WellnessReminder> findByUserAndType(User user, WellnessReminder.ReminderType type);
    
    Optional<WellnessReminder> findByUserAndTypeAndEnabled(User user, WellnessReminder.ReminderType type, Boolean enabled);
    
    @Query("SELECT w FROM WellnessReminder w WHERE w.user = :user AND w.enabled = true AND w.isActive = false")
    List<WellnessReminder> findActiveReminders(@Param("user") User user);
    
    @Query("SELECT w FROM WellnessReminder w WHERE w.user = :user AND w.type = :type AND w.enabled = true")
    Optional<WellnessReminder> findEnabledReminderByType(@Param("user") User user, @Param("type") WellnessReminder.ReminderType type);
}
