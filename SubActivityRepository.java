package com.misboi.jwtlogin.repository;

import com.misboi.jwtlogin.model.SubActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubActivityRepository extends JpaRepository<SubActivity, Long> {
    List<SubActivity> findByActivity_ActId(Long actId);
}