package com.project.AppraisalSystem.dto;



import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DepartmentRequestDTO {

    @NotBlank(message = "Department name is required")
    private String deptName;

    private String deptDescription;
}