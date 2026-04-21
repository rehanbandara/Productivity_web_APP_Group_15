package com.productivity.backend.service;

import com.productivity.backend.dto.response.SummaryResponse;
import com.productivity.backend.entity.study_notes_entity.Note;
import com.productivity.backend.repository.study_notes_repository.NoteRepository;
import com.productivity.backend.service.external.GitHubModelsService;
import com.productivity.backend.service.study_notes_service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final NoteService noteService;
    private final NoteRepository noteRepository;
    private final GitHubModelsService gitHubModelsService;

    public SummaryResponse generate(Long noteId) {
        Note note = noteService.getOwnedNote(noteId);
        String plainText = stripHtml(note.getContent());
        String summary = gitHubModelsService.summarize(plainText);
        note.setSummary(summary);
        noteRepository.save(note);
        return new SummaryResponse(noteId, summary);
    }

    public SummaryResponse getCached(Long noteId) {
        Note note = noteService.getOwnedNote(noteId);
        String summary = note.getSummary();
        if (summary == null || summary.isBlank()) {
            return generate(noteId);
        }
        return new SummaryResponse(noteId, summary);
    }

    private String stripHtml(String content) {
        if (content == null) {
            return "";
        }
        return content.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
    }
}
