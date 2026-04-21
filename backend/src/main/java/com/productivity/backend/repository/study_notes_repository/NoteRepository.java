package com.productivity.backend.repository.study_notes_repository;

import com.productivity.backend.entity.study_notes_entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findAllByOrderByIsPinnedDescUpdatedAtDesc();

    List<Note> findAllByTopicIdOrderByIsPinnedDescUpdatedAtDesc(Long topicId);

    @Query("SELECT DISTINCT n FROM Note n JOIN n.tags t WHERE t.id = :tagId ORDER BY n.isPinned DESC, n.updatedAt DESC")
    List<Note> findAllByTagId(@Param("tagId") Long tagId);

    @Query("SELECT n FROM Note n WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY n.isPinned DESC, n.updatedAt DESC")
    List<Note> searchByKeyword(@Param("keyword") String keyword);
}
