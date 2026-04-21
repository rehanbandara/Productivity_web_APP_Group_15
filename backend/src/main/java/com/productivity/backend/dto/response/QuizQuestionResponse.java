package com.productivity.backend.dto.response;

import com.productivity.backend.entity.study_notes_entity.QuizQuestion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponse {
    private Long id;
    private Long noteId;
    private String question;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    private String difficulty;
    private LocalDateTime createdAt;

    public static QuizQuestionResponse from(QuizQuestion q) {
        return new QuizQuestionResponse(
                q.getId(),
                q.getNote().getId(),
                q.getQuestion(),
                q.getOptions(),
                q.getCorrectAnswer(),
                q.getExplanation(),
                q.getDifficulty().name(),
                q.getCreatedAt()
        );
    }
}
