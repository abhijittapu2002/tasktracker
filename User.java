package com.misboi.jwtlogin.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {
    @Id
    private Long userId;

    private String username;
    private String password;
    private String role;

    @Column(unique = true)
    private String email;
    private LocalDate dob;
    private String employeeCode;
    private LocalDate joiningDate;
    private String phone;
    private String status;

    // Only used during password reset
    private String otp;
    private LocalDateTime otpExpiry;
}
