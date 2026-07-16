package com.project.AppraisalSystem.scheduler;

import com.project.AppraisalSystem.dto.NotificationRequestDTO;
import com.project.AppraisalSystem.entity.Goals;
import com.project.AppraisalSystem.entity.enums.GoalStatus;
import com.project.AppraisalSystem.entity.enums.NotificationType;
import com.project.AppraisalSystem.repository.GoalsRepository;
import com.project.AppraisalSystem.service.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;


@Component
@AllArgsConstructor
public class NotificationScheduler {

    private final GoalsRepository goalsRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 9 * * *")
    public void sendGoalDueReminders() {
        LocalDate sevenDaysLater = LocalDate.now().plusDays(7);

        List<GoalStatus> excludedStatuses = List.of(
                GoalStatus.COMPLETED,
                GoalStatus.CANCELLED,
                GoalStatus.NOT_COMPLETED
        );

        List<Goals> dueSoon = goalsRepository.findAllByDueDateAndStatusNotIn(
                sevenDaysLater, excludedStatuses);

        for (Goals goal : dueSoon) {
            notificationService.createNotification(
                    NotificationRequestDTO.builder()
                            .userId(goal.getEmployee().getUserId())
                            .title("Goal Due Soon")
                            .message("Your goal '" + goal.getTitle() + "' is due in 7 days.")
                            .type(NotificationType.APPRAISAL_DUE)
                            .build()
            );
        }
    }

}