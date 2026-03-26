package com.otp.touristplanner.service;

import com.otp.touristplanner.entity.PasswordResetToken;
import com.otp.touristplanner.entity.User;
import com.otp.touristplanner.repository.PasswordResetTokenRepository;
import com.otp.touristplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Handles forgot-password / reset-password business logic.
 */
@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Initiates a password reset: generates a token and emails a reset link.
     * Always returns a success message regardless of whether the email exists
     * (to prevent user enumeration).
     */
    @Transactional
    public void requestPasswordReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // Delete any old tokens for this user
            tokenRepository.deleteByUserId(user.getId());

            // Generate a secure random token
            byte[] bytes = new byte[32];
            new SecureRandom().nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

            tokenRepository.save(new PasswordResetToken(token, user));
            emailService.sendPasswordResetEmail(email, token);
        });
    }

    /**
     * Validates the token and resets the password.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Reset link has expired. Please request a new one.");
        }
        if (resetToken.isUsed()) {
            throw new RuntimeException("Reset link has already been used.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        emailService.sendPasswordChangedEmail(user.getEmail());
    }
}
