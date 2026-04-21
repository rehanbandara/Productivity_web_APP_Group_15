package com.productivity.backend.service.focus_wishwaka_service;

import com.productivity.backend.dto.focus_wishwaka_dto.WellnessReminderDTO;
import com.productivity.backend.dto.focus_wishwaka_dto.StatsDTO;
import com.productivity.backend.entity.focus_wishwaka_entity.WellnessReminder;
import com.productivity.backend.entity.focus_wishwaka_entity.BreakLog;
import com.productivity.backend.repository.focus_wishwaka_repository.WellnessReminderRepository;
import com.productivity.backend.repository.focus_wishwaka_repository.BreakLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WellnessService {
    
    private final WellnessReminderRepository wellnessReminderRepository;
    private final BreakLogRepository breakLogRepository;
    
    public Map<String, WellnessReminderDTO> getReminders() {
        List<WellnessReminder> reminders = wellnessReminderRepository.findByEnabled(true);
        Map<String, WellnessReminderDTO> reminderMap = new HashMap<>();
        
        for (WellnessReminder reminder : reminders) {
            reminderMap.put(reminder.getType().name().toLowerCase(), WellnessReminderDTO.fromEntity(reminder));
        }
        
        // Ensure all three types are present
        ensureReminderExists(reminderMap, WellnessReminder.ReminderType.EYE_REST);
        ensureReminderExists(reminderMap, WellnessReminder.ReminderType.POSTURE);
        ensureReminderExists(reminderMap, WellnessReminder.ReminderType.BREAK);
        
        return reminderMap;
    }
    
    private void ensureReminderExists(Map<String, WellnessReminderDTO> reminderMap, WellnessReminder.ReminderType type) {
        if (!reminderMap.containsKey(type.name().toLowerCase())) {
            WellnessReminder reminder = new WellnessReminder(type, getDefaultInterval(type), getDefaultDuration(type));
            reminder = wellnessReminderRepository.save(reminder);
            reminderMap.put(type.name().toLowerCase(), WellnessReminderDTO.fromEntity(reminder));
        }
    }
    
    private Integer getDefaultInterval(WellnessReminder.ReminderType type) {
        switch (type) {
            case EYE_REST: return 20;
            case POSTURE: return 45;
            case BREAK: return 25;
            default: return 30;
        }
    }
    
    private Integer getDefaultDuration(WellnessReminder.ReminderType type) {
        switch (type) {
            case EYE_REST: return 20;
            case POSTURE: return 15;
            case BREAK: return 300;
            default: return 60;
        }
    }
    
    public Map<String, WellnessReminderDTO> updateReminders(Map<String, WellnessReminderDTO> reminders) {
        Map<String, WellnessReminderDTO> updatedReminders = new HashMap<>();
        
        for (Map.Entry<String, WellnessReminderDTO> entry : reminders.entrySet()) {
            WellnessReminderDTO dto = entry.getValue();
            WellnessReminder reminder = wellnessReminderRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Reminder not found with id: " + dto.getId()));
            
            reminder.setEnabled(dto.getEnabled());
            reminder.setInterval(dto.getInterval());
            reminder.setDuration(dto.getDuration());
            reminder.setSoundEnabled(dto.getSoundEnabled());
            
            WellnessReminder savedReminder = wellnessReminderRepository.save(reminder);
            updatedReminders.put(entry.getKey(), WellnessReminderDTO.fromEntity(savedReminder));
        }
        
        return updatedReminders;
    }
    
    public StatsDTO getWellnessStats() {
        Long totalBreaks = breakLogRepository.getTodayBreakCount();
        if (totalBreaks == null) totalBreaks = 0L;
        
        Long eyeRestBreaks = breakLogRepository.getTodayBreakCountByType(BreakLog.BreakType.EYE_REST);
        if (eyeRestBreaks == null) eyeRestBreaks = 0L;
        
        Long postureBreaks = breakLogRepository.getTodayBreakCountByType(BreakLog.BreakType.POSTURE);
        if (postureBreaks == null) postureBreaks = 0L;
        
        Long regularBreaks = breakLogRepository.getTodayBreakCountByType(BreakLog.BreakType.BREAK);
        if (regularBreaks == null) regularBreaks = 0L;
        
        // Calculate wellness score and compliance rate (simplified logic)
        Integer wellnessScore = calculateWellnessScore(totalBreaks.intValue());
        Integer complianceRate = calculateComplianceRate(totalBreaks.intValue());
        
        StatsDTO stats = new StatsDTO();
        stats.setTotalBreaks(totalBreaks.intValue());
        stats.setEyeRestBreaks(eyeRestBreaks.intValue());
        stats.setPostureBreaks(postureBreaks.intValue());
        stats.setRegularBreaks(regularBreaks.intValue());
        stats.setWellnessScore(wellnessScore);
        stats.setComplianceRate(complianceRate);
        
        return stats;
    }
    
    private Integer calculateWellnessScore(Integer totalBreaks) {
        // Simple scoring: max 100 points, 20 points per break type up to 5 breaks each
        int score = Math.min(100, totalBreaks * 10);
        return Math.max(0, score);
    }
    
    private Integer calculateComplianceRate(Integer totalBreaks) {
        // Assume ideal is 10 breaks per day
        int idealBreaks = 10;
        return Math.min(100, (totalBreaks * 100) / idealBreaks);
    }
    
    public BreakLog logBreak(BreakLog.BreakType type, Integer duration) {
        BreakLog breakLog = new BreakLog(type, duration);
        return breakLogRepository.save(breakLog);
    }
    
    public List<BreakLog> getBreakHistory() {
        return breakLogRepository.findAllOrdered();
    }
    
    public List<BreakLog> getTodayBreaks() {
        return breakLogRepository.findTodayBreaks();
    }
}
