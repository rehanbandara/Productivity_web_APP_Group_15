package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.config.JwtUtil;
import com.smartcampus.smart_campus_api.dto.AuthResponse;
import com.smartcampus.smart_campus_api.dto.LoginRequest;
import com.smartcampus.smart_campus_api.dto.RegisterRequest;
import com.smartcampus.smart_campus_api.model.Role;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .provider("local")
                .roles(Set.of(Role.USER))  // default role for self-registration
                .enabled(true)
                .build();

        userRepository.save(user);

        String role = Role.USER.name();
        String token = jwtUtil.generateToken(user.getEmail(), role, user.getId());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(role)
                .userId(user.getId())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled");
        }

        // FIX: deterministic role selection (HashSet order is random)
        String role = resolvePrimaryRole(user);

        String token = jwtUtil.generateToken(user.getEmail(), role, user.getId());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(role)
                .userId(user.getId())
                .build();
    }

    /**
     * Prefer ADMIN > TECHNICIAN > USER
     * so users with multiple roles always get the correct UI dashboard.
     */
    private String resolvePrimaryRole(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return Role.USER.name();
        }
        if (user.getRoles().contains(Role.ADMIN)) {
            return Role.ADMIN.name();
        }
        if (user.getRoles().contains(Role.TECHNICIAN)) {
            return Role.TECHNICIAN.name();
        }
        return Role.USER.name();
    }
}