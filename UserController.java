package com.misboi.jwtlogin.controller;

import com.misboi.jwtlogin.UserService;
import com.misboi.jwtlogin.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users") // ✅ Organized API route for user management
public class UserController {

    @Autowired
    private UserService userService;

    /** ✅ Fetch all users for the admin dropdown */
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    /** ✅ Fetch individual user details by username */
    @GetMapping("/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.findByUsername(username);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    /** ✅ Fetch currently logged-in user */
    @GetMapping("/current-user")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String username = authentication.getName(); // Extracted from JWT
        User user = userService.findByUsername(username);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    /** ✅ Update user */
    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @RequestBody User updatedUser) {
        User user = userService.updateUser(userId, updatedUser);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    /** ✅ Delete user */
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        boolean deleted = userService.deleteUser(userId);
        return deleted ? ResponseEntity.ok("User deleted successfully.") :
                ResponseEntity.notFound().build();
    }
}
