package com.misboi.jwtlogin.controller;

import com.misboi.jwtlogin.dto.AuthRequest;
import com.misboi.jwtlogin.model.User;
import com.misboi.jwtlogin.repository.UserRepository;
import com.misboi.jwtlogin.security.JwtUtil;
import com.misboi.jwtlogin.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Period;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@RestController
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /** ✅ Improved authentication API to return JSON **/
    @PostMapping("/authenticate")
    public ResponseEntity<?> generateToken(@RequestBody AuthRequest request) {
        try {
            // ✅ Authenticate user
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid username or password"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Authentication failed due to an internal error"));
        }

        // ✅ Load user details from database
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // ✅ Generate JWT token
        String token = jwtUtil.generateToken(userDetails);

        // ✅ Extract user roles
        List<String> roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority()) // Mapping GrantedAuthority to role name
                .collect(Collectors.toList());

        // ✅ Return response in JSON format
        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", request.getUsername(),
                "roles", roles // ✅ Returns roles as an array
        ));
    }



//    @PostMapping("/register")
//    public ResponseEntity<String> register(@RequestBody AuthRequest request) {
//        // Check if userId already exists
//        if (request.getUserId() != null && userRepository.findById(request.getUserId()).isPresent()) {
//            return ResponseEntity.badRequest().body("User ID already exists.");
//        }
//
//        if (userRepository.findByUsername(request.getUsername()) != null) {
//            return ResponseEntity.badRequest().body("Username already exists.");
//        }
//
//        if (userRepository.findByEmail(request.getEmail()) != null) {
//            return ResponseEntity.badRequest().body("Email already exists.");
//        }
//
//        String role = request.getRole() != null ? request.getRole().toUpperCase() : "USER";
//
//        User user = User.builder()
//                .userId(request.getUserId()) // Set userId manually
//                .username(request.getUsername())
//                .email(request.getEmail())
//                .dob(request.getDob())
//                .phone(request.getPhone())
//                .employeeCode(request.getEmployeeCode())
//                .joiningDate(request.getJoiningDate())
//                .status(request.getStatus())
//                .password(passwordEncoder.encode(request.getPassword()))
//                .role(role)
//                .build();
//
//        userRepository.save(user);
//        return ResponseEntity.ok("User registered successfully with role: " + role);
//    }



    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest request) {
        // Validate mandatory fields
        if (request.getDob() == null) {
            return ResponseEntity.badRequest().body("Date of Birth is required.");
        }
        if (request.getJoiningDate() == null) {
            return ResponseEntity.badRequest().body("Joining Date is required.");
        }
        if (request.getPhone() == null || request.getPhone().length() < 10) {
            return ResponseEntity.badRequest().body("Phone number must be at least 10 digits.");
        }

        // Validate unique fields
        if (userRepository.findByUsername(request.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username already exists.");
        }
        if (userRepository.findByEmail(request.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }
        if (userRepository.findByEmployeeCode(request.getEmployeeCode()) != null) {
            return ResponseEntity.badRequest().body("Employee Code already exists.");
        }

        // Validate age ≥ 18 years
        LocalDate dob = request.getDob();
        int age = Period.between(dob, LocalDate.now()).getYears();
        if (age < 18) {
            return ResponseEntity.badRequest().body("Employee must be at least 18 years old.");
        }

        // Validate joining date
        LocalDate joiningDate = request.getJoiningDate();
        if (joiningDate.isBefore(dob)) {
            return ResponseEntity.badRequest().body("Invalid joining date. Joining date cannot be before DOB.");
        }
        if (joiningDate.isAfter(LocalDate.now())) {
            return ResponseEntity.badRequest().body("Invalid joining date. Joining date cannot be in the future.");
        }

        // Default status
        String status = (request.getStatus() == null || request.getStatus().isEmpty())
                ? "ACTIVE"
                : request.getStatus().toUpperCase();

        // Role default
        String role = request.getRole() != null ? request.getRole().toUpperCase() : "USER";

        // Build new User
        User user = User.builder()
                .userId(request.getUserId())
                .username(request.getUsername())
                .email(request.getEmail())
                .dob(dob)
                .phone(request.getPhone())
                .employeeCode(request.getEmployeeCode())
                .joiningDate(joiningDate)
                .status(status)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully with role: " + role + " and status: " + status);
    }


}