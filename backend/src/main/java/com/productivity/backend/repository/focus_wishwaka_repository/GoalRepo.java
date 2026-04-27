package com.productivity.backend.repository.focus_wishwaka_repository;

import com.productivity.backend.entity.focus_wishwaka_entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoalRepo extends JpaRepository<Goal,Integer> {

}
