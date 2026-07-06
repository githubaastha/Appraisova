package com.project.AppraisalSystem.service.implementation;

import com.project.AppraisalSystem.dto.*;
import com.project.AppraisalSystem.entity.Appraisals;
import com.project.AppraisalSystem.entity.User;
import com.project.AppraisalSystem.entity.enums.AppraisalStatus;
import com.project.AppraisalSystem.entity.enums.CycleStatus;
import com.project.AppraisalSystem.entity.enums.NotificationType;
import com.project.AppraisalSystem.entity.enums.Roles;
import com.project.AppraisalSystem.exception.BadRequestException;
import com.project.AppraisalSystem.exception.DuplicateResourceException;
import com.project.AppraisalSystem.exception.ResourceNotFoundException;
import com.project.AppraisalSystem.repository.AppraisalsRepository;
import com.project.AppraisalSystem.repository.UserRepository;
import com.project.AppraisalSystem.service.AppraisalsService;
import com.project.AppraisalSystem.service.NotificationService;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@AllArgsConstructor
@Transactional
public class AppraisalsServiceImpl implements AppraisalsService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final AppraisalsRepository appraisalsRepository;
    private final NotificationService notificationService;

    private AppraisalsSummaryDTO toSummaryDTO(Appraisals appraisal) {
        AppraisalsSummaryDTO dto = modelMapper.map(appraisal, AppraisalsSummaryDTO.class);
        if (appraisal.getEmployee() != null) {
            dto.setEmployeeEmail(appraisal.getEmployee().getEmail());
            dto.setEmployeeName(appraisal.getEmployee().getFirstName()
                    + " " + appraisal.getEmployee().getLastName());
        }
        if (appraisal.getManager() != null) {
            dto.setManagerEmail(appraisal.getManager().getEmail());
            dto.setManagerName(appraisal.getManager().getFirstName()
                    + " " + appraisal.getManager().getLastName());
            dto.setManagerId(appraisal.getManager().getUserId());
        }
        if (appraisal.getEmployee() != null && appraisal.getEmployee().getDepartment() != null) {
            dto.setDepartment(appraisal.getEmployee().getDepartment().getDeptName());
        }
        dto.setSelfRating(appraisal.getSelfRating());
        dto.setManagerRating(appraisal.getManagerRating());
        return dto;
    }

    private AppraisalsByEmployeeDTO toEmployeeDTO(Appraisals appraisal) {
        AppraisalsByEmployeeDTO dto = modelMapper.map(appraisal, AppraisalsByEmployeeDTO.class);
        if (appraisal.getManager() != null) {
            dto.setManagerEmail(appraisal.getManager().getEmail());
            dto.setManagerName(
                    appraisal.getManager().getFirstName() + " " +
                            appraisal.getManager().getLastName()
            );
        }
        return dto;
    }

    private AppraisalsByManagerDTO toManagerDTO(Appraisals appraisal) {
        AppraisalsByManagerDTO dto = modelMapper.map(appraisal, AppraisalsByManagerDTO.class);

        if (appraisal.getEmployee() != null) {
            dto.setEmployeeEmail(appraisal.getEmployee().getEmail());
            dto.setEmployeeName(
                    appraisal.getEmployee().getFirstName() + " " +
                            appraisal.getEmployee().getLastName()
            );
            dto.setEmployeeId(appraisal.getEmployee().getUserId());
        }

        dto.setSelfRating(appraisal.getSelfRating());
        dto.setManagerRating(appraisal.getManagerRating());

        return dto;
    }
    private EmployeeAppraisalResponseDTO toEmployeeResponseDTO(Appraisals appraisal) {
        EmployeeAppraisalResponseDTO dto = modelMapper.map(appraisal, EmployeeAppraisalResponseDTO.class);
        if (appraisal.getManager() != null) {
            dto.setManagerEmail(appraisal.getManager().getEmail());
            dto.setManagerName(appraisal.getManager().getFirstName()
                    + " " + appraisal.getManager().getLastName());
        }
        if (appraisal.getAppraisalStatus() != AppraisalStatus.APPROVED &&
                appraisal.getAppraisalStatus() != AppraisalStatus.ACKNOWLEDGED) {
            dto.setManagerStrengths(null);
            dto.setManagerImprove(null);
            dto.setManagerComments(null);
            dto.setManagerRating(null);
            dto.setApprovedAt(null);
        }
        return dto;
    }

    private ManagerAppraisalResponseDTO toManagerResponseDTO(Appraisals appraisal) {
        ManagerAppraisalResponseDTO dto = modelMapper.map(appraisal, ManagerAppraisalResponseDTO.class);
        if (appraisal.getEmployee() != null) {
            dto.setEmployeeEmail(appraisal.getEmployee().getEmail());
            dto.setEmployeeName(appraisal.getEmployee().getFirstName()
                    + " " + appraisal.getEmployee().getLastName());
        }
        if (appraisal.getAppraisalStatus() == AppraisalStatus.PENDING ||
                appraisal.getAppraisalStatus() == AppraisalStatus.EMPLOYEE_DRAFT) {
            dto.setWhatWentWell(null);
            dto.setWhatToImprove(null);
            dto.setAchievements(null);
            dto.setSelfRating(null);
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppraisalsSummaryDTO> findAllAppraisals() {
        return appraisalsRepository.findAll()
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeAppraisalResponseDTO findAppraisalDetailById(Long appraisalId) {
        Appraisals appraisal = appraisalsRepository.findById(appraisalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found with id: " + appraisalId));
        return toEmployeeResponseDTO(appraisal);
    }

    @Override
    public ManagerAppraisalResponseDTO findAppraisalForManager(Long appraisalId) {
        Appraisals appraisal = appraisalsRepository.findById(appraisalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found with id: " + appraisalId));
        return toManagerResponseDTO(appraisal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppraisalsByEmployeeDTO> findAppraisalsByEmployee_Id(Long employeeId) {
        userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with id: " + employeeId));
        return appraisalsRepository.findAllByEmployee_UserId(employeeId)
                .stream()
                .map(this::toEmployeeDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppraisalsByEmployeeDTO> findAppraisalsByEmployeeEmail(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with email: " + email));
        return appraisalsRepository.findAllByEmployee_Email(email)
                .stream()
                .map(this::toEmployeeDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppraisalsByManagerDTO> findAppraisalsByManager_Id(Long managerId) {
        userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Manager not found with id: " + managerId));
        return appraisalsRepository.findAllByManager_UserId(managerId)
                .stream()
                .map(this::toManagerDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppraisalsByManagerDTO> findAppraisalsByManagerEmail(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Manager not found with email: " + email));
        return appraisalsRepository.findAllByManager_Email(email)
                .stream()
                .map(this::toManagerDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppraisalsSummaryDTO> findAppraisalsByCycle(String cycleName) {
        return appraisalsRepository.findAllByCycleName(cycleName.trim())
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppraisalsSummaryDTO> findAppraisalsByStatus(AppraisalStatus status) {
        return appraisalsRepository.findAllByAppraisalStatus(status)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppraisalsSummaryDTO> findAppraisalsByCycleStatus(CycleStatus cycleStatus) {
        return appraisalsRepository.findAllByCycleStatus(cycleStatus)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }


    @Override
    public AppraisalsSummaryDTO createAppraisal(AppraisalsRequestDTO dto) {
        User employee = userRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with id: " + dto.getEmployeeId()));

        User manager = userRepository.findById(dto.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Manager not found with id: " + dto.getManagerId()));

        if (!manager.getRole().equals(Roles.MANAGER)) {
            throw new BadRequestException(
                    "User with id: " + dto.getManagerId() + " is not a manager");
        }

        if (appraisalsRepository.existsByCycleNameAndEmployee_UserId(
                dto.getCycleName(), dto.getEmployeeId())) {
            throw new DuplicateResourceException(
                    "Appraisal already exists for employee: "
                            + dto.getEmployeeId() + " in cycle: " + dto.getCycleName());
        }


        List<Appraisals> existingForEmployee = appraisalsRepository.findAllByEmployee_UserId(dto.getEmployeeId());

        for (Appraisals existing : existingForEmployee) {
            boolean overlaps = !dto.getCycleStartDate().isAfter(existing.getCycleEndDate())
                    && !existing.getCycleStartDate().isAfter(dto.getCycleEndDate());

            if (overlaps) {
                throw new BadRequestException(
                        String.format(
                                "Unable to create the appraisal cycle because the employee is already assigned to '%s' (%s to %s). Please choose a non-overlapping appraisal period.",
                                existing.getCycleName(),
                                existing.getCycleStartDate(),
                                existing.getCycleEndDate()
                        )
                );
            }
        }

        if (!dto.getCycleStartDate().isBefore(dto.getCycleEndDate())) {
            throw new BadRequestException(
                    "Cycle start date must be before end date");
        }

        Appraisals appraisal = Appraisals.builder()
                .cycleName(dto.getCycleName().trim())
                .cycleStartDate(dto.getCycleStartDate())
                .cycleEndDate(dto.getCycleEndDate())
                .employee(employee)
                .manager(manager)
                .build();

        notificationService.createNotification(NotificationRequestDTO.builder()
                .userId(employee.getUserId())
                .title("New Appraisal Cycle Started")
                .message("A new appraisal cycle has been created for you: " + dto.getCycleName())
                .type(NotificationType.CYCLE_STARTED)
                .build());
        return toSummaryDTO(appraisalsRepository.save(appraisal));
    }
    @Override
    public List<AppraisalsSummaryDTO> createBulkAppraisals(List<AppraisalsRequestDTO> dto) {
        return dto.stream()
                .map(this::createAppraisal)
                .collect(Collectors.toList());
    }
    @Override
    public EmployeeAppraisalResponseDTO saveSelfAssessmentDraft(Long appraisalId, SelfAssessmentDTO dto) {
        Appraisals appraisal = appraisalsRepository.findById(appraisalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found with id: " + appraisalId));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.PENDING &&
                appraisal.getAppraisalStatus() != AppraisalStatus.EMPLOYEE_DRAFT) {
            throw new BadRequestException(
                    "Cannot edit appraisal in status: " + appraisal.getAppraisalStatus());
        }

        appraisal.setWhatWentWell(dto.getWhatWentWell());
        appraisal.setWhatToImprove(dto.getWhatToImprove());
        appraisal.setAchievements(dto.getAchievements());
        appraisal.setSelfRating(dto.getSelfRating());
        appraisal.setAppraisalStatus(AppraisalStatus.EMPLOYEE_DRAFT);

        return toEmployeeResponseDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    public EmployeeAppraisalResponseDTO saveSelfAssessmentDraftByEmployeeEmail(
            String employeeEmail, String cycleName, SelfAssessmentDTO dto) {
        Appraisals appraisal = appraisalsRepository
                .findByCycleNameAndEmployee_Email(cycleName.trim(), employeeEmail.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found for email: " + employeeEmail
                                + " in cycle: " + cycleName));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.PENDING &&
                appraisal.getAppraisalStatus() != AppraisalStatus.EMPLOYEE_DRAFT) {
            throw new BadRequestException(
                    "Cannot edit appraisal in status: " + appraisal.getAppraisalStatus());
        }

        appraisal.setWhatWentWell(dto.getWhatWentWell());
        appraisal.setWhatToImprove(dto.getWhatToImprove());
        appraisal.setAchievements(dto.getAchievements());
        appraisal.setSelfRating(dto.getSelfRating());
        appraisal.setAppraisalStatus(AppraisalStatus.EMPLOYEE_DRAFT);

        return toEmployeeResponseDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    public EmployeeAppraisalResponseDTO submitSelfAssessment(Long appraisalId, SelfAssessmentDTO dto) {
        Appraisals appraisal = appraisalsRepository.findById(appraisalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found with id: " + appraisalId));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.PENDING &&
                appraisal.getAppraisalStatus() != AppraisalStatus.EMPLOYEE_DRAFT) {
            throw new BadRequestException(
                    "Cannot submit appraisal in status: " + appraisal.getAppraisalStatus());
        }

        if (dto.getWhatWentWell() == null || dto.getWhatWentWell().isBlank()) {
            throw new BadRequestException("What went well cannot be empty");
        }
        if (dto.getWhatToImprove() == null || dto.getWhatToImprove().isBlank()) {
            throw new BadRequestException("What to improve cannot be empty");
        }
        if (dto.getAchievements() == null || dto.getAchievements().isBlank()) {
            throw new BadRequestException("Achievements cannot be empty");
        }
        if (dto.getSelfRating() == null) {
            throw new BadRequestException("Self rating cannot be empty");
        }
        if (dto.getSelfRating() < 1 || dto.getSelfRating() > 5) {
            throw new BadRequestException("Self rating must be between 1 and 5");
        }

        appraisal.setWhatWentWell(dto.getWhatWentWell());
        appraisal.setWhatToImprove(dto.getWhatToImprove());
        appraisal.setAchievements(dto.getAchievements());
        appraisal.setSelfRating(dto.getSelfRating());
        appraisal.setAppraisalStatus(AppraisalStatus.SELF_SUBMITTED);
        appraisal.setSubmittedAt(LocalDateTime.now());

        notificationService.createNotification(NotificationRequestDTO.builder()
                .userId(appraisal.getManager().getUserId())
                .title("Self Assessment Submitted")
                .message(appraisal.getEmployee().getFirstName() + " " + appraisal.getEmployee().getLastName() + " has submitted their self assessment for: " + appraisal.getCycleName())
                .type(NotificationType.SELF_ASSESSMENT_SUBMITTED)
                .build());

        return toEmployeeResponseDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    public EmployeeAppraisalResponseDTO submitSelfAssessmentByEmployeeEmail(
            String employeeEmail, String cycleName, SelfAssessmentDTO dto) {
        Appraisals appraisal = appraisalsRepository
                .findByCycleNameAndEmployee_Email(cycleName.trim(), employeeEmail.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found for email: " + employeeEmail
                                + " in cycle: " + cycleName));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.PENDING &&
                appraisal.getAppraisalStatus() != AppraisalStatus.EMPLOYEE_DRAFT) {
            throw new BadRequestException(
                    "Cannot submit appraisal in status: " + appraisal.getAppraisalStatus());
        }

        if (dto.getWhatWentWell() == null || dto.getWhatWentWell().isBlank()) {
            throw new BadRequestException("What went well cannot be empty");
        }
        if (dto.getWhatToImprove() == null || dto.getWhatToImprove().isBlank()) {
            throw new BadRequestException("What to improve cannot be empty");
        }
        if (dto.getAchievements() == null || dto.getAchievements().isBlank()) {
            throw new BadRequestException("Achievements cannot be empty");
        }
        if (dto.getSelfRating() == null) {
            throw new BadRequestException("Self rating cannot be empty");
        }
        if (dto.getSelfRating() < 1 || dto.getSelfRating() > 5) {
            throw new BadRequestException("Self rating must be between 1 and 5");
        }

        appraisal.setWhatWentWell(dto.getWhatWentWell());
        appraisal.setWhatToImprove(dto.getWhatToImprove());
        appraisal.setAchievements(dto.getAchievements());
        appraisal.setSelfRating(dto.getSelfRating());
        appraisal.setAppraisalStatus(AppraisalStatus.SELF_SUBMITTED);
        appraisal.setSubmittedAt(LocalDateTime.now());

        return toEmployeeResponseDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    public ManagerAppraisalResponseDTO saveManagerReviewDraft(Long appraisalId, ManagerReviewDTO dto) {
        Appraisals appraisal = appraisalsRepository.findById(appraisalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found with id: " + appraisalId));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.SELF_SUBMITTED &&
                appraisal.getAppraisalStatus() != AppraisalStatus.MANAGER_DRAFT) {
            throw new BadRequestException(
                    "Cannot edit appraisal in status: " + appraisal.getAppraisalStatus());
        }

        appraisal.setManagerStrengths(dto.getManagerStrengths());
        appraisal.setManagerImprove(dto.getManagerImprove());
        appraisal.setManagerComments(dto.getManagerComments());
        appraisal.setManagerRating(dto.getManagerRating());
        appraisal.setAppraisalStatus(AppraisalStatus.MANAGER_DRAFT);

        return toManagerResponseDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    public ManagerAppraisalResponseDTO saveManagerReviewDraftByEmployeeEmail(
            String employeeEmail, String cycleName, ManagerReviewDTO dto) {
        Appraisals appraisal = appraisalsRepository
                .findByCycleNameAndEmployee_Email(cycleName.trim(), employeeEmail.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found for email: " + employeeEmail
                                + " in cycle: " + cycleName));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.SELF_SUBMITTED &&
                appraisal.getAppraisalStatus() != AppraisalStatus.MANAGER_DRAFT) {
            throw new BadRequestException(
                    "Cannot edit appraisal in status: " + appraisal.getAppraisalStatus());
        }

        appraisal.setManagerStrengths(dto.getManagerStrengths());
        appraisal.setManagerImprove(dto.getManagerImprove());
        appraisal.setManagerComments(dto.getManagerComments());
        appraisal.setManagerRating(dto.getManagerRating());
        appraisal.setAppraisalStatus(AppraisalStatus.MANAGER_DRAFT);

        return toManagerResponseDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    public ManagerAppraisalResponseDTO submitManagerReview(Long appraisalId, ManagerReviewDTO dto) {
        Appraisals appraisal = appraisalsRepository.findById(appraisalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found with id: " + appraisalId));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.SELF_SUBMITTED &&
                appraisal.getAppraisalStatus() != AppraisalStatus.MANAGER_DRAFT) {
            throw new BadRequestException(
                    "Cannot submit appraisal in status: " + appraisal.getAppraisalStatus());
        }

        if (dto.getManagerStrengths() == null || dto.getManagerStrengths().isBlank()) {
            throw new BadRequestException("Manager strengths cannot be empty");
        }
        if (dto.getManagerImprove() == null || dto.getManagerImprove().isBlank()) {
            throw new BadRequestException("Manager improvements cannot be empty");
        }
        if (dto.getManagerRating() == null) {
            throw new BadRequestException("Manager rating cannot be empty");
        }
        if (dto.getManagerRating() < 1 || dto.getManagerRating() > 5) {
            throw new BadRequestException("Manager rating must be between 1 and 5");
        }

        appraisal.setManagerStrengths(dto.getManagerStrengths());
        appraisal.setManagerImprove(dto.getManagerImprove());
        appraisal.setManagerComments(dto.getManagerComments());
        appraisal.setManagerRating(dto.getManagerRating());
        appraisal.setAppraisalStatus(AppraisalStatus.MANAGER_REVIEWED);

        notificationService.createNotification(NotificationRequestDTO.builder()
                .userId(appraisal.getEmployee().getUserId())
                .title("Manager Review Completed")
                .message("Your manager has reviewed your appraisal for: " + appraisal.getCycleName())
                .type(NotificationType.MANAGER_REVIEW_DONE)
                .build());

        return toManagerResponseDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    public ManagerAppraisalResponseDTO submitManagerReviewByEmployeeEmail(
            String employeeEmail, String cycleName, ManagerReviewDTO dto) {
        Appraisals appraisal = appraisalsRepository
                .findByCycleNameAndEmployee_Email(cycleName.trim(), employeeEmail.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found for email: " + employeeEmail
                                + " in cycle: " + cycleName));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.SELF_SUBMITTED &&
                appraisal.getAppraisalStatus() != AppraisalStatus.MANAGER_DRAFT) {
            throw new BadRequestException(
                    "Cannot submit appraisal in status: " + appraisal.getAppraisalStatus());
        }

        if (dto.getManagerStrengths() == null || dto.getManagerStrengths().isBlank()) {
            throw new BadRequestException("Manager strengths cannot be empty");
        }
        if (dto.getManagerImprove() == null || dto.getManagerImprove().isBlank()) {
            throw new BadRequestException("Manager improvements cannot be empty");
        }
        if (dto.getManagerRating() == null) {
            throw new BadRequestException("Manager rating cannot be empty");
        }
        if (dto.getManagerRating() < 1 || dto.getManagerRating() > 5) {
            throw new BadRequestException("Manager rating must be between 1 and 5");
        }

        appraisal.setManagerStrengths(dto.getManagerStrengths());
        appraisal.setManagerImprove(dto.getManagerImprove());
        appraisal.setManagerComments(dto.getManagerComments());
        appraisal.setManagerRating(dto.getManagerRating());
        appraisal.setAppraisalStatus(AppraisalStatus.MANAGER_REVIEWED);

        return toManagerResponseDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    public AppraisalsSummaryDTO approveAppraisal(Long appraisalId) {
        Appraisals appraisal = appraisalsRepository.findById(appraisalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found with id: " + appraisalId));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.MANAGER_REVIEWED) {
            throw new BadRequestException(
                    "Cannot approve appraisal in status: " + appraisal.getAppraisalStatus());
        }

        appraisal.setAppraisalStatus(AppraisalStatus.APPROVED);
        appraisal.setApprovedAt(LocalDateTime.now());
        notificationService.createNotification(NotificationRequestDTO.builder()
                .userId(appraisal.getEmployee().getUserId())
                .title("Appraisal Approved")
                .message("Your appraisal for " + appraisal.getCycleName() + " has been approved by HR.")
                .type(NotificationType.APPRAISAL_APPROVED)
                .build());

        return toSummaryDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    public EmployeeAppraisalResponseDTO acknowledgeAppraisal(Long appraisalId) {
        Appraisals appraisal = appraisalsRepository.findById(appraisalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found with id: " + appraisalId));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.APPROVED) {
            throw new BadRequestException(
                    "Cannot acknowledge appraisal in status: " + appraisal.getAppraisalStatus());
        }

        appraisal.setAppraisalStatus(AppraisalStatus.ACKNOWLEDGED);

        return toEmployeeResponseDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    public String deleteAppraisal(Long appraisalId) {
        Appraisals appraisal = appraisalsRepository.findById(appraisalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found with id: " + appraisalId));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.PENDING) {
            throw new BadRequestException(
                    "Cannot delete appraisal in status: " + appraisal.getAppraisalStatus()
                            + ". Only PENDING appraisals can be deleted");
        }

        appraisalsRepository.delete(appraisal);
        return "Appraisal deleted successfully";
    }

    @Override
    public AppraisalsSummaryDTO updateAppraisal(Long appraisalId, AppraisalUpdateDTO dto) {
        Appraisals appraisal = appraisalsRepository.findById(appraisalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appraisal not found with id: " + appraisalId));

        if (appraisal.getAppraisalStatus() != AppraisalStatus.PENDING) {
            throw new BadRequestException(
                    "Cannot update appraisal in status: " + appraisal.getAppraisalStatus()
                            + ". Only PENDING appraisals can be updated");
        }

        if (dto.getManagerId() != null) {
            User manager = userRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Manager not found with id: " + dto.getManagerId()));
            if (!manager.getRole().equals(Roles.MANAGER)) {
                throw new BadRequestException(
                        "User with id: " + dto.getManagerId() + " is not a manager");
            }
            appraisal.setManager(manager);
        }

        String newCycleName = dto.getCycleName() != null && !dto.getCycleName().isBlank()
                ? dto.getCycleName().trim() : appraisal.getCycleName();
        var newStart = dto.getCycleStartDate() != null ? dto.getCycleStartDate() : appraisal.getCycleStartDate();
        var newEnd = dto.getCycleEndDate() != null ? dto.getCycleEndDate() : appraisal.getCycleEndDate();

        if (!newStart.isBefore(newEnd)) {
            throw new BadRequestException("Cycle start date must be before end date");
        }

        if (!newCycleName.equalsIgnoreCase(appraisal.getCycleName())
                && appraisalsRepository.existsByCycleNameAndEmployee_UserId(
                newCycleName, appraisal.getEmployee().getUserId())) {
            throw new DuplicateResourceException(
                    "Appraisal already exists for employee: " + appraisal.getEmployee().getUserId()
                            + " in cycle: " + newCycleName);
        }

        List<Appraisals> existingForEmployee =
                appraisalsRepository.findAllByEmployee_UserId(appraisal.getEmployee().getUserId());

        for (Appraisals existing : existingForEmployee) {
            if (existing.getAppraisalId().equals(appraisal.getAppraisalId())) {
                continue;
            }

            boolean overlaps = !newStart.isAfter(existing.getCycleEndDate())
                    && !existing.getCycleStartDate().isAfter(newEnd);

            if (overlaps) {
                throw new BadRequestException(
                        "Employee already has an appraisal cycle (" + existing.getCycleName()
                                + ", " + existing.getCycleStartDate() + " to " + existing.getCycleEndDate()
                                + ") that overlaps with this period.");
            }
        }

        appraisal.setCycleName(newCycleName);
        appraisal.setCycleStartDate(newStart);
        appraisal.setCycleEndDate(newEnd);

        return toSummaryDTO(appraisalsRepository.save(appraisal));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateReportExcel(String cycleName) {
        List<AppraisalsSummaryDTO> appraisals = findAppraisalsByCycle(cycleName);

        if (appraisals.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No appraisals found for cycle: " + cycleName);
        }

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Appraisal Report");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {
                    "Employee Name", "Department", "Manager Name", "Cycle Name",
                    "Status", "Self Rating", "Manager Rating", "Created At"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (AppraisalsSummaryDTO a : appraisals) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(a.getEmployeeName());
                row.createCell(1).setCellValue(a.getDepartment());
                row.createCell(2).setCellValue(a.getManagerName());
                row.createCell(3).setCellValue(a.getCycleName());
                row.createCell(4).setCellValue(a.getAppraisalStatus() != null
                        ? a.getAppraisalStatus().toString() : "");

                if (a.getSelfRating() != null) {
                    row.createCell(5).setCellValue(a.getSelfRating());
                }
                if (a.getManagerRating() != null) {
                    row.createCell(6).setCellValue(a.getManagerRating());
                }

                row.createCell(7).setCellValue(a.getCreatedAt() != null
                        ? a.getCreatedAt().toString() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate appraisal report for cycle: " + cycleName, e);
        }
    }
    @Override
    @Transactional(readOnly = true)
    public byte[] generateTeamReportExcel(Long managerId, String cycleName) {
        List<AppraisalsByManagerDTO> teamAppraisals = findAppraisalsByManager_Id(managerId)
                .stream()
                .filter(a -> a.getCycleName() != null
                        && a.getCycleName().equalsIgnoreCase(cycleName.trim()))
                .collect(Collectors.toList());

        if (teamAppraisals.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No appraisals found for manager: " + managerId + " in cycle: " + cycleName);
        }

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Team Report");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {
                    "Employee Name", "Employee Email", "Cycle Name",
                    "Status", "Self Rating", "Manager Rating", "Created At"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (AppraisalsByManagerDTO a : teamAppraisals) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(a.getEmployeeName());
                row.createCell(1).setCellValue(a.getEmployeeEmail());
                row.createCell(2).setCellValue(a.getCycleName());
                row.createCell(3).setCellValue(a.getAppraisalStatus() != null
                        ? a.getAppraisalStatus().toString() : "");

                if (a.getSelfRating() != null) {
                    row.createCell(4).setCellValue(a.getSelfRating());
                }
                if (a.getManagerRating() != null) {
                    row.createCell(5).setCellValue(a.getManagerRating());
                }

                row.createCell(6).setCellValue(a.getCreatedAt() != null
                        ? a.getCreatedAt().toString() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to generate team report for manager: " + managerId + " in cycle: " + cycleName, e);
        }
    }
}