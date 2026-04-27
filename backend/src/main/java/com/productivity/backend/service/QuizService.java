package com.productivity.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.productivity.backend.dto.response.QuizQuestionResponse;
import com.productivity.backend.entity.study_notes_entity.Note;
import com.productivity.backend.entity.study_notes_entity.QuizQuestion;
import com.productivity.backend.exception.BadRequestException;
import com.productivity.backend.exception.ResourceNotFoundException;
import com.productivity.backend.repository.QuizQuestionRepository;
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
public class QuizService {

    private final QuizQuestionRepository quizQuestionRepository;
    private final NoteService noteService;
    private final GitHubModelsService gitHubModelsService;
    private final ObjectMapper objectMapper;
    private final VideoNoteRepository videoNoteRepository;

    @Transactional
    public List<QuizQuestionResponse> generate(Long noteId, boolean includeVideoNote) {
        Note note = noteService.getOwnedNote(noteId);
        String noteText = stripHtml(note.getContent());

        String videoTranscript = "";
        if (includeVideoNote) {
            videoTranscript = videoNoteRepository.findByNoteId(noteId)
                    .map(vn -> vn.getTranscript() != null ? "\n\nVideo Transcript:\n" + vn.getTranscript() : "")
                    .orElse("");
        }

        String plainText = noteText + videoTranscript;
        if (plainText.isBlank()) {
            throw new BadRequestException("Note has no content to generate quiz from");
        }

        // Limit to ~3000 chars to stay within the model's 4000-token limit
        String truncated = plainText.length() > 3000
                ? plainText.substring(0, 3000) + "..."
                : plainText;

        String json = gitHubModelsService.generateQuizJson(truncated);

        List<Map<String, Object>> parsed;
        try {
            parsed = objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ex) {
            throw new BadRequestException("AI returned invalid JSON for quiz: " + ex.getMessage(), ex);
        }

        quizQuestionRepository.deleteAllByNoteId(noteId);
        List<QuizQuestion> questions = new ArrayList<>();

        for (Map<String, Object> item : parsed) {
            QuizQuestion q = new QuizQuestion();
            q.setNote(note);
            q.setQuestion(String.valueOf(item.getOrDefault("question", "")));
            q.setCorrectAnswer(String.valueOf(item.getOrDefault("correctAnswer", "")));
            q.setExplanation(String.valueOf(item.getOrDefault("explanation", "")));
            q.setDifficulty(parseDifficulty(item.get("difficulty")));

            Object rawOptions = item.get("options");
            if (rawOptions instanceof List<?> optList) {
                q.setOptions(optList.stream().map(Object::toString).toList());
            } else {
                q.setOptions(List.of());
            }

            questions.add(q);
        }

        return quizQuestionRepository.saveAll(questions).stream()
                .map(QuizQuestionResponse::from)
                .toList();
    }

    public List<QuizQuestionResponse> getAll(Long noteId) {
        noteService.getOwnedNote(noteId);
        return quizQuestionRepository.findAllByNoteId(noteId).stream()
                .map(QuizQuestionResponse::from)
                .toList();
    }

    public void delete(Long noteId, Long questionId) {
        noteService.getOwnedNote(noteId);
        QuizQuestion q = quizQuestionRepository.findByIdAndNoteId(questionId, noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz question not found"));
        quizQuestionRepository.delete(q);
    }

    private QuizQuestion.Difficulty parseDifficulty(Object raw) {
        try {
            return QuizQuestion.Difficulty.valueOf(String.valueOf(raw).toUpperCase());
        } catch (Exception ex) {
            return QuizQuestion.Difficulty.MEDIUM;
        }
    }

    private String stripHtml(String content) {
        if (content == null) return "";
        return content.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
    }
}
