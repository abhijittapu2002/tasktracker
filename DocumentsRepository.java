package com.misboi.jwtlogin.repository;

import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.model.Documents;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentsRepository extends JpaRepository<Documents,Long> {
    List<Documents> findByActivity(ActivityMaster activity);
}

