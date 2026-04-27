package com.productivity.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VideoNoteRequest {

    @NotBlank
    private String youtubeUrl;

    private String videoTitle;
}
