package com.productivity.backend.service.user_service;

import com.productivity.backend.entity.user_entity.User;
import com.productivity.backend.repository.user_repository.UserRepository;
import com.productivity.backend.DTO.auth_dto.RegisterRequest;
import com.productivity.backend.DTO.auth_dto.AuthenticationRequest;
import com.productivity.backend.DTO.auth_dto.AuthenticationResponse;
import com.productivity.backend.DTO.auth_dto.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public AuthenticationResponse register(RegisterRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // Save user
        user = userRepository.save(user);

        // Generate JWT token
        String token = jwtService.generateToken(user);

        AuthenticationResponse response = new AuthenticationResponse();
        response.setToken(token);
        response.setUser(convertToUserResponse(user));
        return response;
    }

    public AuthenticationResponse login(AuthenticationRequest request) {
        // Find user by username or email
        Optional<User> userOptional = userRepository.findActiveUserByUsernameOrEmail(
                request.getUsername(), request.getUsername());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        String token = jwtService.generateToken(user);

        AuthenticationResponse response = new AuthenticationResponse();
        response.setToken(token);
        response.setUser(convertToUserResponse(user));
        return response;
    }

    public UserResponse getCurrentUser(String token) {
        // Extract username from token
        String username = jwtService.extractUsername(token);

        // Find user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return convertToUserResponse(user);
    }

    public void logout(String token) {
        // In a real implementation, you might want to invalidate the token
        // For now, we'll just log the logout action
        String username = jwtService.extractUsername(token);
        System.out.println("User " + username + " logged out");
    }

    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setCreatedAt(user.getCreatedAt());
        response.setLastLogin(user.getLastLogin());
        response.setIsActive(user.getIsActive());
        return response;
    }
}
