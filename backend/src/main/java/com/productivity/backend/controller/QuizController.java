package com.productivity.backend.controller;

import com.productivity.backend.dto.response.QuizQuestionResponse;
import com.productivity.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes/{noteId}/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/generate")
    public ResponseEntity<List<QuizQuestionResponse>> generate(
            @PathVariable Long noteId,
            @RequestParam(defaultValue = "false") boolean includeVideoNote) {
        return ResponseEntity.ok(quizService.generate(noteId, includeVideoNote));
    }

    @GetMapping
    public ResponseEntity<List<QuizQuestionResponse>> getAll(@PathVariable Long noteId) {
        return ResponseEntity.ok(quizService.getAll(noteId));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long noteId,
            @PathVariable Long questionId) {
        quizService.delete(noteId, questionId);
        return ResponseEntity.noContent().build();
    }
}
