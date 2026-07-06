package com.project.AppraisalSystem.service;

import com.project.AppraisalSystem.dto.BulkUserUploadResultDTO;
import com.project.AppraisalSystem.dto.UserRequestDTO;
import com.project.AppraisalSystem.dto.UserResponseDTO;

import java.util.List;

public interface UserService {
    // ── FIND ─────────────────────────────────────────────
    List<UserResponseDTO> findAllUsers();
    UserResponseDTO findUserById(Long userId);
    UserResponseDTO findUserByEmail(String email);
    List<UserResponseDTO> findAllUsersByDepartment(Long deptId);
    List<UserResponseDTO> findAllUsersByManager(Long managerId);
    // ── CREATE ────────────────────────────────────────────
    UserResponseDTO createUser(UserRequestDTO dto);
    // ── UPDATE ────────────────────────────────────────────
    UserResponseDTO updateFirstName(Long id, String firstName);
    UserResponseDTO updateLastName(Long id, String lastName);
    UserResponseDTO updatePhone(Long id, String phone);
    String updatePassword(Long id, String oldPassword, String newPassword);
    String updateStatus(Long id, Boolean isActive);
    UserResponseDTO updateManager(Long id, Long managerId);
    String resetPassword(Long id, String newPassword);
    UserResponseDTO updateDesignation(Long id, String designation);
    // ── DELETE ────────────────────────────────────────────
    String deleteById(Long id);
    String deleteByEmail(String email);

    BulkUserUploadResultDTO bulkUploadUsers(org.springframework.web.multipart.MultipartFile file);

    byte[] generateUserUploadTemplate();


}
