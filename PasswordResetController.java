package com.misboi.jwtlogin.controller;

import com.misboi.jwtlogin.model.User;
import com.misboi.jwtlogin.repository.UserRepository;
import com.misboi.jwtlogin.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/reset")

public class PasswordResetController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MailService mailService;
    @Autowired
    private PasswordEncoder passwordEncoder;


    @PostMapping("/request-password-reset")
    public ResponseEntity<String> requestReset(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.badRequest().body("No user with this email.");
        }

        // generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        mailService.sendMail(email, "OTP for Password Reset", "Your OTP is: " + otp);
        return ResponseEntity.ok("OTP sent to your email.");
    }

    @PostMapping("/confirm-password-reset")
    public ResponseEntity<String> confirmReset(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        User user = userRepository.findByEmail(email);

        if (user == null || !otp.equals(user.getOtp()) || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null); // clear OTP
        user.setOtpExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successful.");
    }

}
