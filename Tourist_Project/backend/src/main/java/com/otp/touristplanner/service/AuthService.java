package com.otp.touristplanner.service;

import com.otp.touristplanner.dto.JwtResponse;
import com.otp.touristplanner.dto.LoginRequest;
import com.otp.touristplanner.dto.RegisterRequest;
import com.otp.touristplanner.entity.Role;
import com.otp.touristplanner.entity.User;
import com.otp.touristplanner.repository.RoleRepository;
import com.otp.touristplanner.repository.UserRepository;
import com.otp.touristplanner.security.JwtUtils;
import com.otp.touristplanner.security.UserDetailsImpl;
import com.otp.touristplanner.entity.EmailVerificationToken;
import com.otp.touristplanner.repository.EmailVerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service handling user registration and login.
 */
@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private EmailService emailService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Error: Please verify your email before logging in.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toList());

        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(),
                userDetails.getFullName(), userDetails.getPhone(), userDetails.getAddress(), roles);
    }

    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .emailVerified(true) // Auto-verify as fallback for simulated development flow
                .build();

        Set<String> strRoles = request.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            roles.add(getRole(Role.ERole.ROLE_USER));
        } else {
            strRoles.forEach(role -> {
                if ("admin".equals(role)) {
                    roles.add(getRole(Role.ERole.ROLE_ADMIN));
                } else {
                    roles.add(getRole(Role.ERole.ROLE_USER));
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        // Generate email verification token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken(token, user);
        emailVerificationTokenRepository.save(verificationToken);

        // Send welcome email asynchronously
        emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), token);

        // Send in-app notification
        notificationService.createNotification(user,
                "Welcome to Tourist Planner",
                "Hi " + user.getUsername() + ", welcome aboard! Please check your email to verify your account.");

        return "User registered successfully! Please check your email to verify your account.";
    }

    private Role getRole(Role.ERole roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });
    }
}
