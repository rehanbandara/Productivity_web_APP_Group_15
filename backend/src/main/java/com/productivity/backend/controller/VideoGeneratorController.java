package com.productivity.backend.controller;

import com.productivity.backend.dto.response.GeneratedVideoNoteResponse;
import com.productivity.backend.service.VideoGeneratorService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/video-notes")
@RequiredArgsConstructor
public class VideoGeneratorController {

    private final VideoGeneratorService videoGeneratorService;

    /**
     * Standalone endpoint: paste a YouTube URL → auto-fetch transcript → LLM generates note title + content.
     * Creates and persists both a Note and a VideoNote, returns both.
     */
    @PostMapping("/generate")
    public ResponseEntity<GeneratedVideoNoteResponse> generate(
            @RequestParam @NotBlank String youtubeUrl) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(videoGeneratorService.generateFromUrl(youtubeUrl));
    }
}
