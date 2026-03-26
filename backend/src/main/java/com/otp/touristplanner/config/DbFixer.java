package com.otp.touristplanner.config;

import com.otp.touristplanner.entity.Role;
import com.otp.touristplanner.entity.User;
import com.otp.touristplanner.repository.RoleRepository;
import com.otp.touristplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Emergency Fix: Ensure roles and admin account are correctly mapped.
 */
@Component
@Order(1) // Run before other logic
public class DbFixer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            System.out.println("🔧 Running DB Fixer...");

            // 1. Ensure Roles exist
            ensureRole(Role.ERole.ROLE_USER);
            ensureRole(Role.ERole.ROLE_ADMIN);

            // 2. Fix Admin User
            userRepository.findByUsername("admin").ifPresent(user -> {
                System.out.println("👤 Found admin user, fixing roles and verification...");

                Role adminRole = roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                        .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found after initialization!"));
                Role userRole = roleRepository.findByName(Role.ERole.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("ROLE_USER not found after initialization!"));

                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                roles.add(userRole);

                user.setRoles(roles);
                user.setEmailVerified(true);
                user.setActive(true);
                user.setPassword(passwordEncoder.encode("admin123"));

                userRepository.save(user);
                System.out.println("✅ Admin account fixed: admin / admin123");
            });

            System.out.println("🔧 DB Fixer completed successfully.");
        } catch (Exception e) {
            System.err.println("❌ DB Fixer failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void ensureRole(Role.ERole roleName) {
        if (!roleRepository.findByName(roleName).isPresent()) {
            Role role = new Role(null, roleName);
            roleRepository.saveAndFlush(role);
            System.out.println("➕ Added missing role: " + roleName);
        }
    }
}
