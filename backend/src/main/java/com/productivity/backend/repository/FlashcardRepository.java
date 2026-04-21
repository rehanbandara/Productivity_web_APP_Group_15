package com.productivity.backend.repository;

import com.productivity.backend.entity.study_notes_entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findAllByNoteId(Long noteId);

    Optional<Flashcard> findByIdAndNoteId(Long id, Long noteId);

    void deleteAllByNoteId(Long noteId);
}
