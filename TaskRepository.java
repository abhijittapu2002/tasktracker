package com.misboi.jwtlogin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

interface TaskRepository extends JpaRepository<Entitylist, Long> {
    List<Entitylist> findByUserUsername(String username);

}

