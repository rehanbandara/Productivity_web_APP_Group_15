package com.productivity.backend.service.focus_wishwaka_service;

import com.productivity.backend.DTO.focus_wishwaka_DTO.WellnessReminderDTO;
import com.productivity.backend.DTO.focus_wishwaka_DTO.StatsDTO;
import com.productivity.backend.entity.focus_wishwaka_entity.WellnessReminder;
import com.productivity.backend.entity.focus_wishwaka_entity.BreakLog;
import com.productivity.backend.entity.user_entity.User;
import com.productivity.backend.repository.focus_wishwaka_repository.WellnessReminderRepository;
import com.productivity.backend.repository.focus_wishwaka_repository.BreakLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WellnessService {
    
    private final WellnessReminderRepository wellnessReminderRepository;
    private final BreakLogRepository breakLogRepository;
    
    // In-memory storage for unauthenticated users
    private final Map<String, Map<String, WellnessReminderDTO>> anonymousReminders = new ConcurrentHashMap<>();
    
    public Map<String, WellnessReminderDTO> getReminders(User user) {
        List<WellnessReminder> reminders = wellnessReminderRepository.findByUserAndEnabled(user, true);
        Map<String, WellnessReminderDTO> reminderMap = new HashMap<>();
        
        for (WellnessReminder reminder : reminders) {
            reminderMap.put(reminder.getType().name().toLowerCase(), WellnessReminderDTO.fromEntity(reminder));
        }
        
        // Ensure all three types are present
        ensureReminderExists(reminderMap, WellnessReminder.ReminderType.EYE_REST, user);
        ensureReminderExists(reminderMap, WellnessReminder.ReminderType.POSTURE, user);
        ensureReminderExists(reminderMap, WellnessReminder.ReminderType.BREAK, user);
        
        return reminderMap;
    }
    
    private void ensureReminderExists(Map<String, WellnessReminderDTO> reminderMap, WellnessReminder.ReminderType type, User user) {
        if (!reminderMap.containsKey(type.name().toLowerCase())) {
            WellnessReminder reminder = new WellnessReminder(type, getDefaultInterval(type), getDefaultDuration(type));
            reminder.setUser(user);
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
    
    public Map<String, WellnessReminderDTO> updateReminders(Map<String, WellnessReminderDTO> reminders, User user) {
        Map<String, WellnessReminderDTO> updatedReminders = new HashMap<>();
        
        for (Map.Entry<String, WellnessReminderDTO> entry : reminders.entrySet()) {
            WellnessReminderDTO dto = entry.getValue();
            WellnessReminder reminder;
            
            // Try to find existing reminder by ID, if not found, find by type and create if needed
            if (dto.getId() != null && dto.getId() > 0) {
                reminder = wellnessReminderRepository.findById(dto.getId()).orElse(null);
            } else {
                reminder = null;
            }
            
            // If reminder not found by ID, try to find by type
            if (reminder == null) {
                WellnessReminder.ReminderType reminderType;
                switch (entry.getKey().toLowerCase()) {
                    case "eyerest":
                        reminderType = WellnessReminder.ReminderType.EYE_REST;
                        break;
                    case "posture":
                        reminderType = WellnessReminder.ReminderType.POSTURE;
                        break;
                    case "break":
                        reminderType = WellnessReminder.ReminderType.BREAK;
                        break;
                    default:
                        throw new RuntimeException("Unknown reminder type: " + entry.getKey());
                }
                
                // Find existing reminder by type for this user or create new one
                reminder = wellnessReminderRepository.findByUserAndType(user, reminderType).stream()
                        .findFirst()
                        .orElseGet(() -> {
                            WellnessReminder newReminder = new WellnessReminder(
                                reminderType, 
                                getDefaultInterval(reminderType), 
                                getDefaultDuration(reminderType)
                            );
                            newReminder.setUser(user);
                            return wellnessReminderRepository.save(newReminder);
                        });
            }
            
            // Update reminder properties
            reminder.setEnabled(dto.getEnabled());
            reminder.setInterval(dto.getInterval());
            reminder.setDuration(dto.getDuration());
            reminder.setSoundEnabled(dto.getSoundEnabled());
            
            WellnessReminder savedReminder = wellnessReminderRepository.save(reminder);
            updatedReminders.put(entry.getKey(), WellnessReminderDTO.fromEntity(savedReminder));
        }
        
        return updatedReminders;
    }
    
    public StatsDTO getWellnessStats(User user) {
        Long totalBreaks = breakLogRepository.getTodayBreakCount(user);
        if (totalBreaks == null) totalBreaks = 0L;
        
        Long eyeRestBreaks = breakLogRepository.getTodayBreakCountByType(user, BreakLog.BreakType.EYE_REST);
        if (eyeRestBreaks == null) eyeRestBreaks = 0L;
        
        Long postureBreaks = breakLogRepository.getTodayBreakCountByType(user, BreakLog.BreakType.POSTURE);
        if (postureBreaks == null) postureBreaks = 0L;
        
        Long regularBreaks = breakLogRepository.getTodayBreakCountByType(user, BreakLog.BreakType.BREAK);
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
    
    public BreakLog logBreak(BreakLog.BreakType type, Integer duration, User user) {
        BreakLog breakLog = new BreakLog(type, duration);
        breakLog.setUser(user);
        return breakLogRepository.save(breakLog);
    }
    
    public List<BreakLog> getBreakHistory(User user) {
        return breakLogRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public List<BreakLog> getTodayBreaks(User user) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        return breakLogRepository.findByUserAndCreatedAtBetween(user, startOfDay, endOfDay);
    }
    
    // Methods for handling anonymous/unauthenticated users
    public Map<String, WellnessReminderDTO> getAnonymousReminders(String sessionId) {
        return anonymousReminders.getOrDefault(sessionId, createDefaultAnonymousReminders());
    }
    
    public Map<String, WellnessReminderDTO> updateAnonymousReminders(String sessionId, Map<String, WellnessReminderDTO> reminders) {
        anonymousReminders.put(sessionId, reminders);
        return reminders;
    }
    
    private Map<String, WellnessReminderDTO> createDefaultAnonymousReminders() {
        Map<String, WellnessReminderDTO> defaultReminders = new HashMap<>();
        
        // Create default eye rest reminder
        WellnessReminderDTO eyeRest = new WellnessReminderDTO();
        eyeRest.setType(WellnessReminder.ReminderType.EYE_REST);
        eyeRest.setEnabled(true);
        eyeRest.setInterval(20); // 20 minutes
        eyeRest.setDuration(20); // 20 seconds
        eyeRest.setSoundEnabled(true);
        defaultReminders.put("eyeRest", eyeRest);
        
        // Create default posture reminder
        WellnessReminderDTO posture = new WellnessReminderDTO();
        posture.setType(WellnessReminder.ReminderType.POSTURE);
        posture.setEnabled(true);
        posture.setInterval(30); // 30 minutes
        posture.setDuration(10); // 10 seconds
        posture.setSoundEnabled(true);
        defaultReminders.put("posture", posture);
        
        // Create default break reminder
        WellnessReminderDTO breakReminder = new WellnessReminderDTO();
        breakReminder.setType(WellnessReminder.ReminderType.BREAK);
        breakReminder.setEnabled(true);
        breakReminder.setInterval(60); // 60 minutes
        breakReminder.setDuration(120); // 2 minutes
        breakReminder.setSoundEnabled(true);
        defaultReminders.put("break", breakReminder);
        
        return defaultReminders;
    }
}
