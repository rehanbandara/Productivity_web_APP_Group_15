package com.productivity.backend.service.focus_wishwaka_service;

import com.productivity.backend.dto.focus_wishwaka_dto.StatsDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class DashboardService {
    
    private final GoalService goalService;
    private final TimerSessionService timerSessionService;
    private final WellnessService wellnessService;
    
    public Map<String, Object> getDashboardOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        // Get stats from all services
        StatsDTO goalsStats = goalService.getGoalsStats();
        StatsDTO timerStats = timerSessionService.getTodayStats();
        StatsDTO wellnessStats = wellnessService.getWellnessStats();
        
        // Goals data
        overview.put("goals", goalsStats);
        
        // Timer data
        overview.put("timer", timerStats);
        
        // Wellness data
        overview.put("wellness", wellnessStats);
        
        // Productivity data (simplified calculation)
        Map<String, Object> productivity = new HashMap<>();
        productivity.put("score", calculateProductivityScore(goalsStats, timerStats));
        productivity.put("streak", calculateStreak());
        productivity.put("weeklyProgress", calculateWeeklyProgress());
        overview.put("productivity", productivity);
        
        return overview;
    }
    
    public StatsDTO getProductivityStats(String period) {
        // Simplified implementation - in real app would query based on period
        StatsDTO stats = new StatsDTO();
        
        switch (period.toLowerCase()) {
            case "week":
                stats.setTotalFocusTime(375);
                stats.setCompletedSessions(15);
                break;
            case "month":
                stats.setTotalFocusTime(1500);
                stats.setCompletedSessions(60);
                break;
            default:
                stats.setTotalFocusTime(75);
                stats.setCompletedSessions(3);
                break;
        }
        
        stats.setAverageSessionLength(25);
        stats.setCompletionRate(92.0);
        stats.setDailyGoalProgress(78);
        
        return stats;
    }
    
    public Map<String, Object> getRecentActivity() {
        // Simplified implementation - would query actual recent activities
        return Map.of(
            "activities", java.util.List.of(
                Map.of("id", 1, "type", "session", "message", "Completed work session", "time", "09:25 AM", "icon", "work"),
                Map.of("id", 2, "type", "break", "message", "Took a wellness break", "time", "09:30 AM", "icon", "break"),
                Map.of("id", 3, "type", "goal", "message", "Completed goal: Exercise Routine", "time", "08:00 AM", "icon", "complete")
            )
        );
    }
    
    private Integer calculateProductivityScore(StatsDTO goalsStats, StatsDTO timerStats) {
        // Simple scoring algorithm
        int goalScore = goalsStats.getOverallProgressPercentage();
        int timerScore = timerStats.getCompletionRate().intValue();
        return (goalScore + timerScore) / 2;
    }
    
    private Integer calculateStreak() {
        // Simplified - would calculate from actual session data
        return 5;
    }
    
    private Integer calculateWeeklyProgress() {
        // Simplified - would calculate from actual weekly data
        return 70;
    }
}
