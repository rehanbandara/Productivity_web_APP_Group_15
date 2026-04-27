package com.productivity.backend.dto.response;

import com.productivity.backend.entity.study_notes_entity.Flashcard;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardResponse {
    private Long id;
    private Long noteId;
    private String question;
    private String answer;
    private String difficulty;
    private LocalDateTime createdAt;

    public static FlashcardResponse from(Flashcard flashcard) {
        return new FlashcardResponse(
                flashcard.getId(),
                flashcard.getNote().getId(),
                flashcard.getQuestion(),
                flashcard.getAnswer(),
                flashcard.getDifficulty().name(),
                flashcard.getCreatedAt()
        );
    }
}
