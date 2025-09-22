package com.misboi.jwtlogin.repository;

import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.model.Remarks;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RemarksRepository extends JpaRepository<Remarks,Long> {
    List<Remarks> findByActivity(ActivityMaster activity);
}
