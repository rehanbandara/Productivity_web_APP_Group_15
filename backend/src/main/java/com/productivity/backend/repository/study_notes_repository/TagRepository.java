package com.productivity.backend.repository.study_notes_repository;

import com.productivity.backend.entity.study_notes_entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    boolean existsByName(String name);
}
