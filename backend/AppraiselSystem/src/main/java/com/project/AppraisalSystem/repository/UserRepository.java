package com.project.AppraisalSystem.repository;

import com.project.AppraisalSystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findAllByDepartment_DeptId(Long deptId);
    List<User> findAllByManager_UserId(Long managerId);
    Optional<User> findByInviteToken(String inviteToken);
    Optional<User> findByResetPasswordToken(String resetPasswordToken);
}
