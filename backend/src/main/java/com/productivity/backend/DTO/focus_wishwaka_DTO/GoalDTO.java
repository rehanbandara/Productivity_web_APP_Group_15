package com.productivity.backend.dto.focus_wishwaka_dto;

import com.productivity.backend.entity.focus_wishwaka_entity.Goal;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
// import javax.validation.constraints.NotBlank;
// import javax.validation.constraints.NotNull;
// import javax.validation.constraints.Min;
// import javax.validation.constraints.Max;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalDTO {
    private Long id;
    
    // @NotBlank(message = "Title is required")
    private String title;
    
    // @NotBlank(message = "Description is required")
    private String description;
    
    // @NotNull(message = "Priority is required")
    private Goal.Priority priority;
    
    // @Min(value = 0, message = "Progress cannot be negative")
    // @Max(value = 100, message = "Progress cannot exceed 100")
    private Integer progress;
    
    private Boolean completed;
    
    // @NotBlank(message = "Due date is required")
    private String dueDate;
    
    private Goal.GoalStatus status;
    
    // @NotBlank(message = "Category is required")
    private String category;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static GoalDTO fromEntity(Goal goal) {
        GoalDTO dto = new GoalDTO();
        dto.setId(goal.getId());
        dto.setTitle(goal.getTitle());
        dto.setDescription(goal.getDescription());
        dto.setPriority(goal.getPriority());
        dto.setProgress(goal.getProgress());
        dto.setCompleted(goal.getCompleted());
        dto.setDueDate(goal.getDueDate());
        dto.setStatus(goal.getStatus());
        dto.setCategory(goal.getCategory());
        dto.setCreatedAt(goal.getCreatedAt());
        dto.setUpdatedAt(goal.getUpdatedAt());
        return dto;
    }
    
    public Goal toEntity() {
        Goal goal = new Goal();
        goal.setId(this.id);
        goal.setTitle(this.title);
        goal.setDescription(this.description);
        goal.setPriority(this.priority);
        goal.setProgress(this.progress);
        goal.setCompleted(this.completed);
        goal.setDueDate(this.dueDate);
        goal.setStatus(this.status);
        goal.setCategory(this.category);
        return goal;
    }
}
