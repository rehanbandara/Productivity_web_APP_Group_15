package com.productivity.backend.controller;

import com.productivity.backend.dto.response.SummaryResponse;
import com.productivity.backend.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notes/{noteId}")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @PostMapping("/summarize")
    public ResponseEntity<SummaryResponse> generate(@PathVariable Long noteId) {
        return ResponseEntity.ok(summaryService.generate(noteId));
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getCached(@PathVariable Long noteId) {
        return ResponseEntity.ok(summaryService.getCached(noteId));
    }
}
