package com.productivity.backend.service.focus_wishwaka_service;

import com.productivity.backend.dto.focus_wishwaka_dto.GoalDTO;
import com.productivity.backend.dto.focus_wishwaka_dto.StatsDTO;
import com.productivity.backend.entity.focus_wishwaka_entity.Goal;
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

    public List<GoalDTO> getAllGoals(){
        List<Goal>goalList = goalRepository.findAll();
        return modelMapper.map(goalList, new TypeToken<List<GoalDTO>>(){}.getType());
    }

    public GoalDTO getGoalById(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        return modelMapper.map(goal, GoalDTO.class);
    }

    public GoalDTO createGoal(GoalDTO goalDTO) {
        Goal goal = modelMapper.map(goalDTO, Goal.class);
        goal.setProgress(0);
        goal.setCompleted(false);
        goal.setCreatedAt(java.time.LocalDateTime.now());
        goal.setUpdatedAt(java.time.LocalDateTime.now());
        
        Goal savedGoal = goalRepository.save(goal);
        return modelMapper.map(savedGoal, GoalDTO.class);
    }

    public GoalDTO updateGoal(Long id, GoalDTO goalDTO) {
        Goal existingGoal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        
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

    public void deleteGoal(Long id) {
        if (!goalRepository.existsById(id)) {
            throw new RuntimeException("Goal not found with id: " + id);
        }
        goalRepository.deleteById(id);
    }

    public GoalDTO updateGoalProgress(Long id, Integer progress) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
        
        goal.setProgress(progress);
        goal.setUpdatedAt(java.time.LocalDateTime.now());
        
        Goal updatedGoal = goalRepository.save(goal);
        return modelMapper.map(updatedGoal, GoalDTO.class);
    }

    public StatsDTO getGoalsStats() {
        StatsDTO stats = new StatsDTO();
        
        Long total = goalRepository.getTotalGoals();
        if (total == null) total = 0L;
        
        Long completed = goalRepository.countByStatus(Goal.GoalStatus.COMPLETED);
        if (completed == null) completed = 0L;
        
        Long inProgress = goalRepository.countByStatus(Goal.GoalStatus.IN_PROGRESS);
        if (inProgress == null) inProgress = 0L;
        
        Long notStarted = goalRepository.countByStatus(Goal.GoalStatus.NOT_STARTED);
        if (notStarted == null) notStarted = 0L;
        
        Double avgProgress = goalRepository.getAverageProgress();
        Integer overallProgressPercentage = avgProgress != null ? avgProgress.intValue() : 0;
        
        stats.setTotal(total.intValue());
        stats.setCompleted(completed.intValue());
        stats.setInProgress(inProgress.intValue());
        stats.setNotStarted(notStarted.intValue());
        stats.setOverallProgressPercentage(overallProgressPercentage);
        
        return stats;
    }
}
