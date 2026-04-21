package com.productivity.backend.controller.focus_wishwaka_controller;

import com.productivity.backend.DTO.focus_wishwaka_DTO.StatsDTO;
import com.productivity.backend.service.focus_wishwaka_service.DashboardService;
import com.productivity.backend.entity.user_entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Map<String, Object> overview = dashboardService.getDashboardOverview(user);
        return ResponseEntity.ok(overview);
    }
    
    @GetMapping("/productivity/stats")
    public ResponseEntity<StatsDTO> getProductivityStats(@RequestParam(defaultValue = "week") String period) {
        StatsDTO stats = dashboardService.getProductivityStats(period);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/activity/recent")
    public ResponseEntity<Map<String, Object>> getRecentActivity() {
        Map<String, Object> activity = dashboardService.getRecentActivity();
        return ResponseEntity.ok(activity);
    }
}
