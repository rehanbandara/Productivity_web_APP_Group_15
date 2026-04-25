package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class AdminReviewRequest {

    @NotNull(message = "Decision (approved true/false) is required")
    private Boolean approved;

    private String remarks;
}