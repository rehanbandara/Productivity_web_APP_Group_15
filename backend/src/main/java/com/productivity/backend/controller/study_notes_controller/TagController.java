package com.productivity.backend.controller.study_notes_controller;

import com.productivity.backend.service.study_notes_service.TagService;
import com.productivity.backend.dto.request.TagRequest;
import com.productivity.backend.dto.response.TagResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags() {
        List<TagResponse> tags = tagService.getAll();
        return ResponseEntity.ok(tags);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> getTagById(@PathVariable Long id) {
        TagResponse tag = tagService.getById(id);
        return ResponseEntity.ok(tag);
    }

    @PostMapping
    public ResponseEntity<TagResponse> createTag(@Valid @RequestBody TagRequest request) {
        TagResponse tag = tagService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tag);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TagResponse> updateTag(
            @PathVariable Long id,
            @Valid @RequestBody TagRequest request) {
        TagResponse tag = tagService.update(id, request);
        return ResponseEntity.ok(tag);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
