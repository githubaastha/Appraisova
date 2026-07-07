package com.project.AppraisalSystem.controller;

import com.project.AppraisalSystem.dto.*;
import com.project.AppraisalSystem.entity.RefreshToken;
import com.project.AppraisalSystem.entity.User;
import com.project.AppraisalSystem.exception.BadRequestException;
import com.project.AppraisalSystem.repository.UserRepository;
import com.project.AppraisalSystem.security.JwtService;
import com.project.AppraisalSystem.service.RefreshTokenService;
import com.project.AppraisalSystem.service.implementation.EmailService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.project.AppraisalSystem.exception.ResourceNotFoundException;

import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDateTime;

import java.util.Optional;
import java.util.UUID;


@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;


    private String capitalizeWords(String input) {
        if (input == null || input.isBlank()) {
            return input;
        }
        String[] words = input.trim().toLowerCase().split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1))
                        .append(" ");
            }
        }
        return result.toString().trim();
    }

    @Transactional
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new AccessDeniedException("Your account has been deactivated. Please contact HR.");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getUserId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        boolean isFirstLogin = Boolean.TRUE.equals(user.getFirstLogin());

        if (isFirstLogin) {
            user.setFirstLogin(false);
            userRepository.save(user);
        }

        return ResponseEntity.ok(new AuthResponseDTO(
                token,
                refreshToken.getToken(),
                user.getUserId(),
                user.getEmail(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName(),
                user.getManager() != null ? user.getManager().getUserId() : null,
                user.getDepartment() != null ? user.getDepartment().getDeptName() : null,
                isFirstLogin
        ));
    }



    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequestDTO request) {

        Optional<RefreshToken> refreshTokenOpt = refreshTokenService.findByToken(request.getRefreshToken());
        if (refreshTokenOpt.isEmpty()) {
            throw new BadRequestException("Refresh token not found. Please log in again.");
        }

        RefreshToken refreshToken = refreshTokenService.verifyExpiration(refreshTokenOpt.get());

        User user = refreshToken.getUser();

        String newAccessToken = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getUserId()
        );
        return ResponseEntity.ok(new AuthResponseDTO(
                newAccessToken,
                request.getRefreshToken(),
                user.getUserId(),
                user.getEmail(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName(),
                user.getManager() != null ? user.getManager().getUserId() : null,
                user.getDepartment() != null ? user.getDepartment().getDeptName() : null,
                false
        ));
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenRequestDTO request) {

        Optional<RefreshToken> refreshTokenOpt = refreshTokenService.findByToken(request.getRefreshToken());

        if (refreshTokenOpt.isPresent()) {
            User user = refreshTokenOpt.get().getUser();
            refreshTokenService.deleteByUser(user);
        }

        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/invite/{token}")
    public ResponseEntity<?> getInviteDetails(@PathVariable String token) {
        User user = userRepository.findByInviteToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired invite link"));

        if (user.getInviteTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This invite link has expired. Please contact HR for a new one.");
        }

        return ResponseEntity.ok(new InviteDetailsDTO(
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getDesignation()
        ));
    }

    @PostMapping("/invite/{token}/activate")
    public ResponseEntity<?> activateAccount(@PathVariable String token,
                                             @RequestBody ActivateAccountDTO dto) {
        User user = userRepository.findByInviteToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired invite link"));

        if (user.getInviteTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This invite link has expired. Please contact HR for a new one.");
        }

        if (dto.getFirstName() == null || dto.getFirstName().isBlank()) {
            throw new BadRequestException("First name cannot be empty");
        }
        if (dto.getLastName() == null || dto.getLastName().isBlank()) {
            throw new BadRequestException("Last name cannot be empty");
        }
        if (dto.getPassword() == null || dto.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        user.setFirstName(capitalizeWords(dto.getFirstName().trim()));
        user.setLastName(capitalizeWords(dto.getLastName().trim()));

        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            user.setPhone(dto.getPhone().trim());
        }

        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setInviteToken(null);
        user.setInviteTokenExpiry(null);

        userRepository.save(user);

        return ResponseEntity.ok("Account activated successfully. You can now log in.");
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail().trim()).orElse(null);


        if (user != null) {
            String resetToken = UUID.randomUUID().toString();
            user.setResetPasswordToken(resetToken);
            user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), resetToken);
        }

        return ResponseEntity.ok("If that email exists, a reset link has been sent.");
    }

    @PostMapping("/reset-password/{token}")
    public ResponseEntity<?> resetPassword(@PathVariable String token,
                                           @RequestBody ResetPasswordDTO dto) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired reset link"));

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset link has expired. Please request a new one.");
        }

        if (dto.getNewPassword() == null || dto.getNewPassword().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully. You can now log in.");
    }
}