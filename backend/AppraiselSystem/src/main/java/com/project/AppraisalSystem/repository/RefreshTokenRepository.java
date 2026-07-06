package com.project.AppraisalSystem.repository;


import com.project.AppraisalSystem.entity.RefreshToken;
import com.project.AppraisalSystem.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUser(User user);


    @Transactional
    @Modifying
    void deleteByUser(User user);
}