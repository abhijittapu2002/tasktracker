package com.misboi.jwtlogin.repository;

import com.misboi.jwtlogin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    User findByEmail(String email);
    User findByEmployeeCode(String employeeCode);

    List<User> findByRole(String role); // For example: "MANAGER"

}