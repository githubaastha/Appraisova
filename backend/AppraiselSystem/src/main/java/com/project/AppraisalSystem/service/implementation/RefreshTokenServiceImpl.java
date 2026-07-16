package com.project.AppraisalSystem.service.implementation;

import com.project.AppraisalSystem.entity.RefreshToken;
import com.project.AppraisalSystem.entity.User;
import com.project.AppraisalSystem.exception.BadRequestException;
import com.project.AppraisalSystem.repository.RefreshTokenRepository;
import com.project.AppraisalSystem.service.RefreshTokenService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh.expiration}")
    private long refreshTokenDurationMs;

    @Override
    public RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.findByUser(user)
                .ifPresent(existing -> {
                    refreshTokenRepository.delete(existing);
                    refreshTokenRepository.flush();
                });

        RefreshToken refreshToken = new RefreshToken(
                null,
                UUID.randomUUID().toString(),
                user,
                Instant.now().plusMillis(refreshTokenDurationMs)
        );

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException("Refresh token expired. Please log in again.");
        }
        return token;
    }

    @Override
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}