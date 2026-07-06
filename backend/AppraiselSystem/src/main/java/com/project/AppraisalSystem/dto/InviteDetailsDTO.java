package com.project.AppraisalSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InviteDetailsDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private String designation;
}