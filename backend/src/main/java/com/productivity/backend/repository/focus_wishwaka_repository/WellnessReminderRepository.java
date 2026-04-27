package com.productivity.backend.repository.focus_wishwaka_repository;

import com.productivity.backend.entity.focus_wishwaka_entity.WellnessReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WellnessReminderRepository extends JpaRepository<WellnessReminder, Long> {
    
    List<WellnessReminder> findByEnabled(Boolean enabled);
    
    List<WellnessReminder> findByType(WellnessReminder.ReminderType type);
    
    Optional<WellnessReminder> findByTypeAndEnabled(WellnessReminder.ReminderType type, Boolean enabled);
    
    @Query("SELECT w FROM WellnessReminder w WHERE w.enabled = true AND w.isActive = false")
    List<WellnessReminder> findActiveReminders();
    
    @Query("SELECT w FROM WellnessReminder w WHERE w.type = :type AND w.enabled = true")
    Optional<WellnessReminder> findEnabledReminderByType(@Param("type") WellnessReminder.ReminderType type);
}
