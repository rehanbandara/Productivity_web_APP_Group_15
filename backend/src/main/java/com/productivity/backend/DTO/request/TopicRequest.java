package com.productivity.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicRequest {
    @NotBlank
    private String name;
    private String color;
    private String description;
}
