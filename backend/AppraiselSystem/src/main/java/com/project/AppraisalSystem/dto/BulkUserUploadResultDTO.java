package com.project.AppraisalSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BulkUserUploadResultDTO {
    private int totalRows;
    private int successCount;
    private int failureCount;
    private List<UserResponseDTO> createdUsers;
    private List<RowError> errors;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class RowError {
        private int rowNumber;
        private String email;
        private String reason;
    }
}