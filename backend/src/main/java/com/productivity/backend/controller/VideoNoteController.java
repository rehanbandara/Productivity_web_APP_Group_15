package com.productivity.backend.controller;

import com.productivity.backend.dto.request.VideoNoteRequest;
import com.productivity.backend.dto.response.VideoNoteResponse;
import com.productivity.backend.service.VideoNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notes/{noteId}/video")
@RequiredArgsConstructor
public class VideoNoteController {

    private final VideoNoteService videoNoteService;

    @PostMapping
    public ResponseEntity<VideoNoteResponse> attach(
            @PathVariable Long noteId,
            @Valid @RequestBody VideoNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(videoNoteService.attach(noteId, request));
    }

    @GetMapping
    public ResponseEntity<VideoNoteResponse> get(@PathVariable Long noteId) {
        return ResponseEntity.ok(videoNoteService.get(noteId));
    }

    @DeleteMapping
    public ResponseEntity<Void> remove(@PathVariable Long noteId) {
        videoNoteService.remove(noteId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh-transcript")
    public ResponseEntity<VideoNoteResponse> refreshTranscript(@PathVariable Long noteId) {
        return ResponseEntity.ok(videoNoteService.refreshTranscript(noteId));
    }
}
