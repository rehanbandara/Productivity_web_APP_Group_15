package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.dto.focus_wishwaka_dto.GoalDTO;
import com.productivity.backend.service.focus_wishwaka_service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// import javax.validation.Valid;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping(value = "api/v1")
public class GoalController {
    @Autowired
    private GoalService goalService;

    @GetMapping("/goals")
    public List<GoalDTO> getGoals(){
        return goalService.getAllGoals();
    }

    @GetMapping("/goals/{id}")
    public ResponseEntity<GoalDTO> getGoalById(@PathVariable Long id) {
        try {
            GoalDTO goal = goalService.getGoalById(id);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/goals")
    public ResponseEntity<GoalDTO> createGoal(/* @Valid */ @RequestBody GoalDTO goalDTO) {
        GoalDTO createdGoal = goalService.createGoal(goalDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdGoal);
    }

    @PutMapping("/goals/{id}")
    public ResponseEntity<GoalDTO> updateGoal(@PathVariable Long id, /* @Valid */ @RequestBody GoalDTO goalDTO) {
        try {
            GoalDTO updatedGoal = goalService.updateGoal(id, goalDTO);
            return ResponseEntity.ok(updatedGoal);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        try {
            goalService.deleteGoal(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PatchMapping("/goals/{id}/progress")
    public ResponseEntity<GoalDTO> updateGoalProgress(@PathVariable Long id, @RequestBody Integer progress) {
        try {
            GoalDTO updatedGoal = goalService.updateGoalProgress(id, progress);
            return ResponseEntity.ok(updatedGoal);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
