package com.productivity.backend.controller.study_notes_controller;

import com.productivity.backend.service.study_notes_service.NoteService;
import com.productivity.backend.dto.request.NoteRequest;
import com.productivity.backend.dto.request.AutoSaveRequest;
import com.productivity.backend.dto.response.NoteMetadataSuggestionResponse;
import com.productivity.backend.dto.response.NoteResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getAllNotes(
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) String search) {
        List<NoteResponse> notes = noteService.getAll(topicId, tagId, search);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteResponse> getNoteById(@PathVariable Long id) {
        NoteResponse note = noteService.getById(id);
        return ResponseEntity.ok(note);
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(@Valid @RequestBody NoteRequest request) {
        NoteResponse note = noteService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request) {
        NoteResponse note = noteService.update(id, request);
        return ResponseEntity.ok(note);
    }

    @PatchMapping("/{id}/autosave")
    public ResponseEntity<NoteResponse> autoSaveNote(
            @PathVariable Long id,
            @Valid @RequestBody AutoSaveRequest request) {
        NoteResponse note = noteService.autoSave(id, request);
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<NoteResponse> togglePin(@PathVariable Long id) {
        NoteResponse note = noteService.togglePin(id);
        return ResponseEntity.ok(note);
    }

    @PostMapping("/{noteId}/tags/{tagId}")
    public ResponseEntity<NoteResponse> attachTag(
            @PathVariable Long noteId,
            @PathVariable Long tagId) {
        NoteResponse note = noteService.attachTag(noteId, tagId);
        return ResponseEntity.ok(note);
    }

    @GetMapping("/suggest-metadata")
    public ResponseEntity<NoteMetadataSuggestionResponse> suggestMetadata(
            @RequestParam String title,
            @RequestParam String content) {
        return ResponseEntity.ok(noteService.suggestMetadata(title, content));
    }

    @DeleteMapping("/{noteId}/tags/{tagId}")
    public ResponseEntity<NoteResponse> removeTag(
            @PathVariable Long noteId,
            @PathVariable Long tagId) {
        NoteResponse note = noteService.removeTag(noteId, tagId);
        return ResponseEntity.ok(note);
    }
}
