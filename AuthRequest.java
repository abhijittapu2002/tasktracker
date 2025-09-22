package com.misboi.jwtlogin.dto;

import jakarta.persistence.Column;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AuthRequest {
    private Long userId;
    private String username;
    private String password;
    private String role;
    private String email;
    private LocalDate dob;
    private String employeeCode;
    private LocalDate joiningDate;
    private String phone;
    private String status;


}