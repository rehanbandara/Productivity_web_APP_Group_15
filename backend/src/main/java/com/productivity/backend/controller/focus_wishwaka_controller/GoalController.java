package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.DTO.focus_wishwaka_DTO.GoalDTO;
import com.productivity.backend.entity.user_entity.User;
import com.productivity.backend.service.focus_wishwaka_service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// import javax.validation.Valid;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping(value = "/api")
public class GoalController {
    @Autowired
    private GoalService goalService;

    @GetMapping("/goals")
    public ResponseEntity<List<GoalDTO>> getGoals(Authentication authentication){
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(goalService.getAllGoals(user));
    }

    @GetMapping("/goals/{id}")
    public ResponseEntity<GoalDTO> getGoalById(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            User user = (User) authentication.getPrincipal();
            GoalDTO goal = goalService.getGoalById(id, user);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/goals")
    public ResponseEntity<GoalDTO> createGoal(/* @Valid */ @RequestBody GoalDTO goalDTO, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        GoalDTO createdGoal = goalService.createGoal(goalDTO, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdGoal);
    }

    @PutMapping("/goals/{id}")
    public ResponseEntity<GoalDTO> updateGoal(@PathVariable Long id, /* @Valid */ @RequestBody GoalDTO goalDTO, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            User user = (User) authentication.getPrincipal();
            GoalDTO updatedGoal = goalService.updateGoal(id, goalDTO, user);
            return ResponseEntity.ok(updatedGoal);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            User user = (User) authentication.getPrincipal();
            goalService.deleteGoal(id, user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PatchMapping("/goals/{id}/progress")
    public ResponseEntity<GoalDTO> updateGoalProgress(@PathVariable Long id, @RequestBody Integer progress, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            User user = (User) authentication.getPrincipal();
            GoalDTO updatedGoal = goalService.updateGoalProgress(id, progress, user);
            return ResponseEntity.ok(updatedGoal);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
