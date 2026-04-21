package com.productivity.backend.service.focus_wishwaka_service;

import com.productivity.backend.DTO.focus_wishwaka_DTO.GoalDTO;
import com.productivity.backend.DTO.focus_wishwaka_DTO.StatsDTO;
import com.productivity.backend.entity.focus_wishwaka_entity.Goal;
import com.productivity.backend.entity.user_entity.User;
import com.productivity.backend.repository.focus_wishwaka_repository.GoalRepository;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class GoalService {
    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private ModelMapper modelMapper;

    public List<GoalDTO> getAllGoals(User user){
        List<Goal>goalList = goalRepository.findByUser(user);
        return modelMapper.map(goalList, new TypeToken<List<GoalDTO>>(){}.getType());
    }

    public GoalDTO getGoalById(Long id, User user) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        
        // Ensure the goal belongs to the authenticated user
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Goal does not belong to user");
        }
        
        return modelMapper.map(goal, GoalDTO.class);
    }

    public GoalDTO createGoal(GoalDTO goalDTO, User user) {
        Goal goal = modelMapper.map(goalDTO, Goal.class);
        goal.setProgress(0);
        goal.setCompleted(false);
        goal.setCreatedAt(java.time.LocalDateTime.now());
        goal.setUpdatedAt(java.time.LocalDateTime.now());
        goal.setUser(user);
        
        Goal savedGoal = goalRepository.save(goal);
        return modelMapper.map(savedGoal, GoalDTO.class);
    }

    public GoalDTO updateGoal(Long id, GoalDTO goalDTO, User user) {
        Goal existingGoal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        
        // Ensure the goal belongs to the authenticated user
        if (!existingGoal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Goal does not belong to user");
        }
        
        existingGoal.setTitle(goalDTO.getTitle());
        existingGoal.setDescription(goalDTO.getDescription());
        existingGoal.setPriority(goalDTO.getPriority());
        existingGoal.setDueDate(goalDTO.getDueDate());
        existingGoal.setCategory(goalDTO.getCategory());
        existingGoal.setProgress(goalDTO.getProgress());
        existingGoal.setUpdatedAt(java.time.LocalDateTime.now());
        
        Goal updatedGoal = goalRepository.save(existingGoal);
        return modelMapper.map(updatedGoal, GoalDTO.class);
    }

    public void deleteGoal(Long id, User user) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        
        // Ensure the goal belongs to the authenticated user
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Goal does not belong to user");
        }
        
        goalRepository.deleteById(id);
    }

    public GoalDTO updateGoalProgress(Long id, Integer progress, User user) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        
        // Ensure the goal belongs to the authenticated user
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Goal does not belong to user");
        }
        
        goal.setProgress(progress);
        goal.setUpdatedAt(java.time.LocalDateTime.now());
        
        Goal updatedGoal = goalRepository.save(goal);
        return modelMapper.map(updatedGoal, GoalDTO.class);
    }

    public StatsDTO getGoalsStats(User user) {
        StatsDTO stats = new StatsDTO();
        
        Long total = goalRepository.getTotalGoals(user);
        if (total == null) total = 0L;
        
        Long completed = goalRepository.countByUserAndStatus(user, Goal.GoalStatus.COMPLETED);
        if (completed == null) completed = 0L;
        
        Long inProgress = goalRepository.countByUserAndStatus(user, Goal.GoalStatus.IN_PROGRESS);
        if (inProgress == null) inProgress = 0L;
        
        Long notStarted = goalRepository.countByUserAndStatus(user, Goal.GoalStatus.NOT_STARTED);
        if (notStarted == null) notStarted = 0L;
        
        Double avgProgress = goalRepository.getAverageProgress(user);
        Integer overallProgressPercentage = avgProgress != null ? avgProgress.intValue() : 0;
        
        stats.setTotal(total.intValue());
        stats.setCompleted(completed.intValue());
        stats.setInProgress(inProgress.intValue());
        stats.setNotStarted(notStarted.intValue());
        stats.setOverallProgressPercentage(overallProgressPercentage);
        
        return stats;
    }
}
