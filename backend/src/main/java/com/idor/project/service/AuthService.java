package com.idor.project.service;

import com.idor.project.payload.LoginRequest;
import com.idor.project.payload.LoginResponse;
import com.idor.project.payload.RegisterRequest;
import com.idor.project.payload.User;
import com.idor.project.repository.UserRepository;
import com.idor.project.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public User registerUser(RegisterRequest registerRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        // Create new user
        User user = new User(
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getFirstName(),
                registerRequest.getLastName(),
                "USER"
        );

        return userRepository.save(user);
    }

    public LoginResponse loginUser(LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT Token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getFirstName(), user.getLastName());
    }
}
