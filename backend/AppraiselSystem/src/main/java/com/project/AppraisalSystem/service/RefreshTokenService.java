package com.project.AppraisalSystem.service;


import com.project.AppraisalSystem.entity.RefreshToken;
import com.project.AppraisalSystem.entity.User;

import java.util.Optional;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    Optional<RefreshToken> findByToken(String token);

    RefreshToken verifyExpiration(RefreshToken token);

    void deleteByUser(User user);
}