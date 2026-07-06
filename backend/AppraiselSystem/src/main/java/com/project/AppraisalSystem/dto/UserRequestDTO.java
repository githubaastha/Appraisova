package com.project.AppraisalSystem.dto;


import com.project.AppraisalSystem.entity.enums.Roles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Roles role;
    private String designation;
    private Long managerId;
    private Long deptId;
}