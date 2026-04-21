package com.productivity.backend.controller;

import com.productivity.backend.dto.response.FlashcardResponse;
import com.productivity.backend.service.FlashcardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notes/{noteId}/flashcards")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardService flashcardService;

    @PostMapping("/generate")
    public ResponseEntity<List<FlashcardResponse>> generate(
            @PathVariable Long noteId,
            @RequestParam(defaultValue = "false") boolean includeVideoNote) {
        return ResponseEntity.ok(flashcardService.generate(noteId, includeVideoNote));
    }

    @GetMapping
    public ResponseEntity<List<FlashcardResponse>> getAll(@PathVariable Long noteId) {
        return ResponseEntity.ok(flashcardService.getAll(noteId));
    }

    @DeleteMapping("/{flashcardId}")
    public ResponseEntity<Void> delete(@PathVariable Long noteId, @PathVariable Long flashcardId) {
        flashcardService.delete(noteId, flashcardId);
        return ResponseEntity.noContent().build();
    }
}
