package com.project.AppraisalSystem.dto;
import com.project.AppraisalSystem.entity.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationRequestDTO {
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
}