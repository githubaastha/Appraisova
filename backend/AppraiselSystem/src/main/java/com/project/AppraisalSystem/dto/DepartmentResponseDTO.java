package com.project.AppraisalSystem.dto;



import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DepartmentResponseDTO {
    private Long deptId;
    private String deptName;
    private String deptDescription;
}