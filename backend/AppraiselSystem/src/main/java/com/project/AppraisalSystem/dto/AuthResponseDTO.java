package com.project.AppraisalSystem.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String refreshToken;
    private Long userId;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private Long managerId;
    private String deptName;
    private Boolean firstLogin;
}