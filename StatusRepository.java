package com.misboi.jwtlogin.repository;

import com.misboi.jwtlogin.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusRepository extends JpaRepository<Status,Long> {
}
