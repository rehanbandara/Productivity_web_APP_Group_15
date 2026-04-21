package com.productivity.backend.repository;

import com.productivity.backend.entity.study_notes_entity.VideoNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VideoNoteRepository extends JpaRepository<VideoNote, Long> {
    Optional<VideoNote> findByNoteId(Long noteId);

    void deleteByNoteId(Long noteId);
}
