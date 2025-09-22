package com.misboi.jwtlogin.repository;

import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.model.ActivityPerformance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ActivityPerformanceRepository extends JpaRepository<ActivityPerformance, Long> {
    Optional<ActivityPerformance> findByActivity(ActivityMaster activity);
}
