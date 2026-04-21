package com.productivity.backend.dto.focus_wishwaka_dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatsDTO {
    // Goals Stats
    private Integer total;
    private Integer completed;
    private Integer inProgress;
    private Integer notStarted;
    private Integer overallProgressPercentage;
    
    // Timer Stats
    private Integer totalSessions;
    private Integer completedSessions;
    private Integer totalFocusTime;
    private Integer averageSessionLength;
    private Double completionRate;
    
    // Wellness Stats
    private Integer totalBreaks;
    private Integer eyeRestBreaks;
    private Integer postureBreaks;
    private Integer regularBreaks;
    private Integer wellnessScore;
    private Integer complianceRate;
    
    // Productivity Stats
    private Integer score;
    private Integer streak;
    private Integer weeklyProgress;
    private Integer dailyGoalProgress;
    
    public void setCompletionRate(Double rate) {
        this.completionRate = rate;
    }
    
    public void setDailyGoalProgress(Integer progress) {
        this.dailyGoalProgress = progress;
    }
}
