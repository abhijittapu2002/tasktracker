package com.misboi.jwtlogin;

import com.misboi.jwtlogin.model.User;
import com.misboi.jwtlogin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /** ✅ Fetch all users for dropdown */
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    /** ✅ Update user */
    public User updateUser(Long userId, User updatedUser) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            existingUser.setUsername(updatedUser.getUsername());
            existingUser.setPassword(updatedUser.getPassword());
            existingUser.setRole(updatedUser.getRole());
            existingUser.setEmail(updatedUser.getEmail());

            // 📌 Update new fields
            existingUser.setDob(updatedUser.getDob());
            existingUser.setEmployeeCode(updatedUser.getEmployeeCode());
            existingUser.setJoiningDate(updatedUser.getJoiningDate());
            existingUser.setPhone(updatedUser.getPhone());
            existingUser.setStatus(updatedUser.getStatus());

            // OTP fields
            existingUser.setOtp(updatedUser.getOtp());
            existingUser.setOtpExpiry(updatedUser.getOtpExpiry());

            return userRepository.save(existingUser);
        }
        return null;
    }

    /** ✅ Delete user */
    public boolean deleteUser(Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            userRepository.deleteById(userId);
            return true;
        }
        return false;
    }
}


