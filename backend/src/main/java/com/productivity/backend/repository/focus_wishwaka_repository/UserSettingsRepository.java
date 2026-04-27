package com.productivity.backend.repository.focus_wishwaka_repository;

import com.productivity.backend.entity.focus_wishwaka_entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    
    Optional<UserSettings> findFirstByOrderByIdAsc();
}
