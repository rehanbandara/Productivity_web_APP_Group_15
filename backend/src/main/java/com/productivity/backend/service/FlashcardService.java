package com.productivity.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.productivity.backend.dto.response.FlashcardResponse;
import com.productivity.backend.entity.study_notes_entity.Flashcard;
import com.productivity.backend.entity.study_notes_entity.Note;
import com.productivity.backend.exception.BadRequestException;
import com.productivity.backend.exception.ResourceNotFoundException;
import com.productivity.backend.repository.FlashcardRepository;
import com.productivity.backend.repository.VideoNoteRepository;
import com.productivity.backend.service.external.GitHubModelsService;
import com.productivity.backend.service.study_notes_service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final NoteService noteService;
    private final GitHubModelsService gitHubModelsService;
    private final ObjectMapper objectMapper;
    private final VideoNoteRepository videoNoteRepository;

    @Transactional
    public List<FlashcardResponse> generate(Long noteId, boolean includeVideoNote) {
        Note note = noteService.getOwnedNote(noteId);
        String noteText = stripHtml(note.getContent());

        String videoTranscript = "";
        if (includeVideoNote) {
            videoTranscript = videoNoteRepository.findByNoteId(noteId)
                    .map(vn -> vn.getTranscript() != null ? "\n\nVideo Transcript:\n" + vn.getTranscript() : "")
                    .orElse("");
        }

        String plainText = noteText + videoTranscript;

        // Limit to ~3000 chars to stay within the model's 4000-token limit
        String truncated = plainText.length() > 3000
                ? plainText.substring(0, 3000) + "..."
                : plainText;

        String json = gitHubModelsService.generateFlashcardsJson(truncated);

        List<Map<String, Object>> parsed;
        try {
            parsed = objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ex) {
            throw new BadRequestException("AI returned invalid JSON for flashcards: " + ex.getMessage(), ex);
        }

        flashcardRepository.deleteAllByNoteId(noteId);
        List<Flashcard> flashcards = new ArrayList<>();

        for (Map<String, Object> item : parsed) {
            Flashcard flashcard = new Flashcard();
            flashcard.setNote(note);
            flashcard.setQuestion(String.valueOf(item.getOrDefault("question", "")));
            flashcard.setAnswer(String.valueOf(item.getOrDefault("answer", "")));
            flashcard.setDifficulty(parseDifficulty(item.get("difficulty")));
            flashcards.add(flashcard);
        }

        return flashcardRepository.saveAll(flashcards).stream()
                .map(FlashcardResponse::from)
                .toList();
    }

    public List<FlashcardResponse> getAll(Long noteId) {
        noteService.getOwnedNote(noteId);
        return flashcardRepository.findAllByNoteId(noteId).stream()
                .map(FlashcardResponse::from)
                .toList();
    }

    public void delete(Long noteId, Long flashcardId) {
        noteService.getOwnedNote(noteId);
        Flashcard flashcard = flashcardRepository.findByIdAndNoteId(flashcardId, noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard not found"));
        flashcardRepository.delete(flashcard);
    }

    private Flashcard.Difficulty parseDifficulty(Object rawDifficulty) {
        try {
            return Flashcard.Difficulty.valueOf(String.valueOf(rawDifficulty).toUpperCase());
        } catch (Exception ex) {
            return Flashcard.Difficulty.MEDIUM;
        }
    }

    private String stripHtml(String content) {
        if (content == null) {
            return "";
        }
        return content.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
    }
}
