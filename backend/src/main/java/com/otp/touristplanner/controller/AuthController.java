package com.otp.touristplanner.controller;

import com.otp.touristplanner.dto.JwtResponse;
import com.otp.touristplanner.dto.LoginRequest;
import com.otp.touristplanner.dto.RegisterRequest;
import com.otp.touristplanner.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.otp.touristplanner.entity.User;
import com.otp.touristplanner.repository.EmailVerificationTokenRepository;
import com.otp.touristplanner.repository.UserRepository;

import java.util.Map;

/**
 * REST Controller for authentication (login, register).
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            String message = authService.register(registerRequest);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        return emailVerificationTokenRepository.findByToken(token).map(verificationToken -> {
            if (verificationToken.isExpired()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Error: Email verification token is expired."));
            }

            User user = verificationToken.getUser();
            user.setEmailVerified(true);
            userRepository.save(user);

            // Optional: delete token after use
            emailVerificationTokenRepository.delete(verificationToken);

            return ResponseEntity.ok(Map.of("message", "Email verified successfully! You can now login."));
        }).orElseGet(
                () -> ResponseEntity.badRequest().body(Map.of("message", "Error: Invalid email verification token.")));
    }
}
