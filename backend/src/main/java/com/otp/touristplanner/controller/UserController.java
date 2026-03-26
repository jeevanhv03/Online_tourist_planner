package com.otp.touristplanner.controller;

import com.otp.touristplanner.dto.ChangePasswordRequest;
import com.otp.touristplanner.service.EmailService;
import com.otp.touristplanner.service.UserService;
import com.otp.touristplanner.dto.UserDTO;
import com.otp.touristplanner.entity.User;
import com.otp.touristplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentUserProfile() {
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "fullName", user.getFullName() != null ? user.getFullName() : "",
                        "email", user.getEmail() != null ? user.getEmail() : "",
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "address", user.getAddress() != null ? user.getAddress() : "",
                        "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                        "loyaltyPoints", user.getLoyaltyPoints())))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id).map(user -> {
            // Check if username is changed and if it's already taken
            if (!user.getUsername().equals(userDetails.getUsername()) &&
                    userRepository.existsByUsername(userDetails.getUsername())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is already taken!"));
            }

            user.setUsername(userDetails.getUsername());
            user.setFullName(userDetails.getFullName());
            user.setEmail(userDetails.getEmail());
            user.setPhone(userDetails.getPhone());
            user.setAddress(userDetails.getAddress());
            user.setAvatarUrl(userDetails.getAvatarUrl());
            userRepository.save(user);

            // Send real-time email notification
            emailService.sendProfileUpdatedEmail(user.getEmail(), user.getUsername());

            return ResponseEntity.ok(Map.of("message", "Profile updated successfully!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/change-password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        return userRepository.findById(id).map(user -> {
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Current password is incorrect!"));
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            // Send real-time email notification
            emailService.sendPasswordChangedEmail(user.getEmail());

            return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserDTO> users = userService.getAllUsers();
            System.out.println("DEBUG: getAllUsers returned " + users.size() + " users");
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("DEBUG: Error in getAllUsers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error loading users: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
        try {
            return ResponseEntity.ok(userService.toggleUserStatus(id, status.get("active")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
