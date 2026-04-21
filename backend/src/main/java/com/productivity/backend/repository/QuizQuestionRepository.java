package com.productivity.backend.repository;

import com.productivity.backend.entity.study_notes_entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findAllByNoteId(Long noteId);
    void deleteAllByNoteId(Long noteId);
    Optional<QuizQuestion> findByIdAndNoteId(Long id, Long noteId);
}
