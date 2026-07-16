package com.project.AppraisalSystem.service.implementation;

import com.project.AppraisalSystem.dto.NotificationRequestDTO;
import com.project.AppraisalSystem.dto.NotificationResponseDTO;
import com.project.AppraisalSystem.dto.NotificationSummaryDTO;
import com.project.AppraisalSystem.entity.Notification;
import com.project.AppraisalSystem.entity.User;
import com.project.AppraisalSystem.entity.enums.NotificationType;
import com.project.AppraisalSystem.exception.BadRequestException;
import com.project.AppraisalSystem.exception.ResourceNotFoundException;
import com.project.AppraisalSystem.repository.NotificationRepository;
import com.project.AppraisalSystem.repository.UserRepository;
import com.project.AppraisalSystem.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final EmailService emailService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private NotificationResponseDTO toResponseDTO(Notification notification) {
        NotificationResponseDTO dto = modelMapper.map(notification, NotificationResponseDTO.class);
        if (notification.getUser() != null) {
            dto.setUserId(notification.getUser().getUserId());
            dto.setUserEmail(notification.getUser().getEmail());
        }
        return dto;
    }

    private NotificationSummaryDTO toSummaryDTO(Notification notification) {
        return modelMapper.map(notification, NotificationSummaryDTO.class);
    }

    private EmailService.EmailSentiment determineSentiment(NotificationType type, String title) {
        String lowerTitle = title == null ? "" : title.toLowerCase();

        return switch (type) {
            case APPRAISAL_APPROVED -> EmailService.EmailSentiment.POSITIVE;
            case GOAL_CONFIRMED -> lowerTitle.contains("not completed")
                    ? EmailService.EmailSentiment.NEGATIVE
                    : EmailService.EmailSentiment.POSITIVE;
            case GENERAL -> lowerTitle.contains("cancel")
                    ? EmailService.EmailSentiment.NEGATIVE
                    : EmailService.EmailSentiment.NEUTRAL;
            default -> EmailService.EmailSentiment.NEUTRAL;
        };
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationSummaryDTO> findAllByUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        return notificationRepository.findAllByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationSummaryDTO> findUnreadByUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        return notificationRepository.findAllByUser_UserIdAndIsRead(userId, false)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationSummaryDTO> findReadByUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        return notificationRepository.findAllByUser_UserIdAndIsRead(userId, true)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponseDTO findById(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId));
    }

    @Override
    @Transactional(readOnly = true)
    public Long countUnreadByUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        return notificationRepository.countByUser_UserIdAndIsRead(userId, false);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationSummaryDTO> findByUserAndType(Long userId, NotificationType type) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        return notificationRepository.findAllByUser_UserIdAndType(userId, type)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationSummaryDTO> findByUserAndCreatedAfter(Long userId, LocalDateTime date) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        return notificationRepository.findAllByUser_UserIdAndCreatedAtAfter(userId, date)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponseDTO createNotification(NotificationRequestDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + dto.getUserId()));

        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new BadRequestException("Notification title cannot be empty");
        }
        if (dto.getMessage() == null || dto.getMessage().isBlank()) {
            throw new BadRequestException("Notification message cannot be empty");
        }
        if (dto.getType() == null) {
            throw new BadRequestException("Notification type cannot be empty");
        }

        Notification notification = Notification.builder()
                .user(user)
                .type(dto.getType())
                .title(dto.getTitle())
                .message(dto.getMessage())
                .isRead(false)
                .build();

        NotificationResponseDTO response = toResponseDTO(notificationRepository.save(notification));

        EmailService.EmailSentiment sentiment = determineSentiment(dto.getType(), dto.getTitle());

        emailService.sendNotificationEmail(
                user.getEmail(),
                user.getFirstName(),
                dto.getTitle(),
                dto.getMessage(),
                sentiment,
                "View in Appraisova",
                frontendUrl + "/dashboard"
        );

        return response;
    }

    @Override
    public String markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId));
        if (notification.getIsRead()) {
            throw new BadRequestException("Notification is already read");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return "Notification marked as read";
    }

    @Override
    public String markAllAsRead(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        List<Notification> unread = notificationRepository
                .findAllByUser_UserIdAndIsRead(userId, false);
        unread.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unread);
        return "All notifications marked as read";
    }

    @Override
    public String markAsUnread(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId));
        if (!notification.getIsRead()) {
            throw new BadRequestException("Notification is already unread");
        }
        notification.setIsRead(false);
        notificationRepository.save(notification);
        return "Notification marked as unread";
    }

    @Override
    public String deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId));
        notificationRepository.delete(notification);
        return "Notification deleted successfully";
    }

    @Override
    public String deleteAllReadByUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        List<Notification> read = notificationRepository
                .findAllByUser_UserIdAndIsRead(userId, true);
        notificationRepository.deleteAll(read);
        return "All read notifications cleared";
    }

    @Override
    public String deleteAllByUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        List<Notification> all = notificationRepository
                .findAllByUser_UserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(all);
        return "All notifications cleared";
    }
}