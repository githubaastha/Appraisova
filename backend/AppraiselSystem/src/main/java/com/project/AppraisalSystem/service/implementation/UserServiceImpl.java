package com.project.AppraisalSystem.service.implementation;

import com.project.AppraisalSystem.dto.BulkUserUploadResultDTO;
import com.project.AppraisalSystem.dto.UserRequestDTO;
import com.project.AppraisalSystem.dto.UserResponseDTO;
import com.project.AppraisalSystem.entity.Department;
import com.project.AppraisalSystem.entity.User;
import com.project.AppraisalSystem.entity.enums.Roles;
import com.project.AppraisalSystem.exception.BadRequestException;
import com.project.AppraisalSystem.exception.DuplicateResourceException;
import com.project.AppraisalSystem.exception.ResourceNotFoundException;
import com.project.AppraisalSystem.repository.DepartmentRepository;
import com.project.AppraisalSystem.repository.UserRepository;
import com.project.AppraisalSystem.service.UserService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import java.util.ArrayList;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFDataValidationHelper;
import org.apache.poi.xssf.usermodel.XSSFSheet;


@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private UserResponseDTO toResponseDTO(User user) {
        UserResponseDTO dto = modelMapper.map(user, UserResponseDTO.class);
        if (user.getManager() != null) {
            dto.setManagerId(user.getManager().getUserId());
            dto.setManagerName(user.getManager().getFirstName()
                    + " " + user.getManager().getLastName());
        }
        if (user.getDepartment() != null) {
            dto.setDeptId(user.getDepartment().getDeptId());
            dto.setDeptName(user.getDepartment().getDeptName());
        }
        dto.setPendingActivation(user.getInviteToken() != null);
        return dto;
    }

    private String getCell(Row row, int cellIndex, DataFormatter formatter) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return "";
        return formatter.formatCellValue(cell).trim();
    }

    private boolean isRowBlank(Row row, DataFormatter formatter) {
        for (int i = 0; i < 8; i++) {
            if (!getCell(row, i, formatter).isBlank()) return false;
        }
        return true;
    }

    private String capitalizeWords(String input) {
        if (input == null || input.isBlank()) {
            return input;
        }
        String[] words = input.trim().toLowerCase().split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1))
                        .append(" ");
            }
        }
        return result.toString().trim();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> findAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO findUserById(Long userId) {
        return userRepository.findById(userId)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO findUserByEmail(String email) {
        return userRepository.findByEmail(email.trim())
                .map(this::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> findAllUsersByDepartment(Long deptId) {
        departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id: " + deptId));
        return userRepository.findAllByDepartment_DeptId(deptId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> findAllUsersByManager(Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Manager not found with id: " + managerId));
        if (!manager.getRole().equals(Roles.MANAGER)) {
            throw new BadRequestException(
                    "User with id: " + managerId + " is not a manager");
        }
        return userRepository.findAllByManager_UserId(managerId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }
    @Override
    @Transactional
    public UserResponseDTO createUser(UserRequestDTO dto) {
        userRepository.findByEmail(dto.getEmail())
                .ifPresent(existing -> {
                    throw new DuplicateResourceException(
                            "User already exists with email: " + dto.getEmail());
                });
        User user = modelMapper.map(dto, User.class);

        user.setFirstName(capitalizeWords(dto.getFirstName()));
        user.setLastName(capitalizeWords(dto.getLastName()));
        user.setDesignation(capitalizeWords(dto.getDesignation()));

        if (dto.getDeptId() != null) {
            Department department = departmentRepository.findById(dto.getDeptId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department not found with id: " + dto.getDeptId()));
            user.setDepartment(department);
        }
        if (dto.getManagerId() != null) {
            User manager = userRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Manager not found with id: " + dto.getManagerId()));
            if (!manager.getRole().equals(Roles.MANAGER)) {
                throw new BadRequestException(
                        "User with id: " + dto.getManagerId() + " is not a manager");
            }
            user.setManager(manager);
        }
        user.setIsActive(true);
        user.setFirstLogin(true);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

        String inviteToken = UUID.randomUUID().toString();
        user.setInviteToken(inviteToken);
        user.setInviteTokenExpiry(LocalDateTime.now().plusHours(12));

        User savedUser = userRepository.save(user);

        emailService.sendInviteEmail(savedUser.getEmail(), savedUser.getFirstName(), inviteToken);

        return toResponseDTO(savedUser);
    }



    @Override
    @Transactional
    public UserResponseDTO updateFirstName(Long id, String firstName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));
        user.setFirstName(capitalizeWords(firstName.trim()));
        return toResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDTO updateLastName(Long id, String lastName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));
        user.setLastName(capitalizeWords(lastName.trim()));
        return toResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDTO updatePhone(Long id, String phone) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));

        if (phone == null || phone.isBlank()) {
            throw new BadRequestException("Phone number cannot be empty");
        }
        if (!phone.matches("^[6-9]\\d{9}$")) {
            throw new BadRequestException("Enter a valid 10-digit phone number");
        }

        user.setPhone(phone.trim());
        return toResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public String updatePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        emailService.sendPasswordChangedEmail(user.getEmail(), user.getFirstName());

        return "Password updated successfully";
    }

    @Override
    @Transactional
    public String updateStatus(Long id, Boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));
        user.setIsActive(isActive);
        userRepository.save(user);
        return isActive ? "User activated successfully"
                : "User deactivated successfully";
    }

    @Override
    @Transactional
    public UserResponseDTO updateManager(Long userId, Long managerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Manager not found with id: " + managerId));
        if (!manager.getRole().equals(Roles.MANAGER)) {
            throw new BadRequestException(
                    "User with id: " + managerId + " is not a manager");
        }
        user.setManager(manager);
        return toResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public String resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return "Password reset successfully";
    }

    @Override
    @Transactional
    public UserResponseDTO updateDesignation(Long id, String designation) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));

        user.setDesignation(capitalizeWords(designation.trim()));
        return toResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public String deleteById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));
        userRepository.delete(user);
        return "User deleted successfully";
    }

    @Override
    @Transactional
    public String deleteByEmail(String email) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + email));
        userRepository.delete(user);
        return "User deleted successfully";
    }

    @Override
    public byte[] generateUserUploadTemplate() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Users");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {
                    "First Name", "Last Name", "Email", "Phone",
                    "Role", "Designation", "Manager Email", "Department Name"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            Row exampleRow = sheet.createRow(1);
            String[] example = {
                    "Jane", "Doe", "jane.doe@company.com", "9876543210",
                    "EMPLOYEE", "Software Engineer", "manager@company.com", "Engineering"
            };
            for (int i = 0; i < example.length; i++) {
                exampleRow.createCell(i).setCellValue(example[i]);
            }

            DataValidationHelper validationHelper = new XSSFDataValidationHelper((XSSFSheet) sheet);
            CellRangeAddressList roleColumnRange = new CellRangeAddressList(1, 500, 4, 4);
            DataValidationConstraint roleConstraint = validationHelper.createExplicitListConstraint(
                    new String[]{"EMPLOYEE", "MANAGER", "HR"});
            DataValidation roleValidation = validationHelper.createValidation(roleConstraint, roleColumnRange);
            roleValidation.setSuppressDropDownArrow(false);
            roleValidation.setShowErrorBox(true);
            roleValidation.createErrorBox("Invalid Role", "Please select EMPLOYEE, MANAGER, or HR from the dropdown.");
            sheet.addValidationData(roleValidation);

            CellRangeAddressList phoneColumnRange = new CellRangeAddressList(1, 500, 3, 3);
            DataValidationConstraint phoneConstraint = validationHelper.createCustomConstraint(
                    "AND(LEN(D2)=10,ISNUMBER(VALUE(D2)),VALUE(LEFT(D2,1))>=6,VALUE(LEFT(D2,1))<=9)");
            DataValidation phoneValidation = validationHelper.createValidation(phoneConstraint, phoneColumnRange);
            phoneValidation.setShowErrorBox(true);
            phoneValidation.createErrorBox("Invalid Phone Number", "Phone number must be a valid 10-digit number starting with 6-9.");
            sheet.addValidationData(phoneValidation);

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate upload template", e);
        }
    }


    @Override
    @Transactional
    public BulkUserUploadResultDTO bulkUploadUsers(MultipartFile file) {
        List<UserResponseDTO> createdUsers = new ArrayList<>();
        List<BulkUserUploadResultDTO.RowError> errors = new ArrayList<>();

        DataFormatter formatter = new DataFormatter();
        int totalRows = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int rowIdx = 1; rowIdx <= sheet.getLastRowNum(); rowIdx++) {
                Row row = sheet.getRow(rowIdx);
                if (row == null || isRowBlank(row, formatter)) {
                    continue;
                }

                totalRows++;
                int displayRowNumber = rowIdx + 1; // 1-indexed, matches what HR sees in Excel

                String firstName = getCell(row, 0, formatter);
                String lastName = getCell(row, 1, formatter);
                String email = getCell(row, 2, formatter);
                String phone = getCell(row, 3, formatter);
                String roleStr = getCell(row, 4, formatter);
                String designation = getCell(row, 5, formatter);
                String managerEmail = getCell(row, 6, formatter);
                String deptName = getCell(row, 7, formatter);

                try {
                    if (email.isBlank()) {
                        throw new BadRequestException("Email is required");
                    }
                    if (!phone.isBlank() && !phone.matches("[6-9]\\d{9}")) {
                        throw new BadRequestException("Phone number must be a valid 10-digit number starting with 6-9");
                    }

                    Roles role;
                    try {
                        role = Roles.valueOf(roleStr.trim().toUpperCase());
                    } catch (IllegalArgumentException ex) {
                        throw new BadRequestException(
                                "Invalid role '" + roleStr + "'. Must be one of: EMPLOYEE, MANAGER, HR");
                    }

                    Long deptId = null;
                    if (role != Roles.HR) {
                        if (deptName.isBlank()) {
                            throw new BadRequestException("Department is required for role: " + role);
                        }
                        Department department = departmentRepository.findAll().stream()
                                .filter(d -> d.getDeptName().equalsIgnoreCase(deptName.trim()))
                                .findFirst()
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Department not found: " + deptName));
                        deptId = department.getDeptId();
                    }

                    Long managerId = null;
                    if (role == Roles.EMPLOYEE && managerEmail.isBlank()) {
                        throw new BadRequestException(
                                "Manager email is required — every employee must report to someone");
                    }
                    if (!managerEmail.isBlank()) {
                        User manager = userRepository.findByEmail(managerEmail.trim())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Manager not found with email: " + managerEmail));
                        if (!manager.getRole().equals(Roles.MANAGER)) {
                            throw new BadRequestException(
                                    "User with email " + managerEmail + " is not a manager");
                        }
                        managerId = manager.getUserId();
                    }

                    UserRequestDTO dto = UserRequestDTO.builder()
                            .firstName(firstName.trim())
                            .lastName(lastName.trim())
                            .email(email.trim())
                            .phone(phone.trim())
                            .role(role)
                            .designation(designation.trim())
                            .managerId(managerId)
                            .deptId(deptId)
                            .build();

                    createdUsers.add(createUser(dto));

                } catch (Exception ex) {
                    errors.add(BulkUserUploadResultDTO.RowError.builder()
                            .rowNumber(displayRowNumber)
                            .email(email.isBlank() ? "(blank)" : email)
                            .reason(ex.getMessage())
                            .build());
                }
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded file — make sure it's a valid .xlsx file", e);
        }

        return BulkUserUploadResultDTO.builder()
                .totalRows(totalRows)
                .successCount(createdUsers.size())
                .failureCount(errors.size())
                .createdUsers(createdUsers)
                .errors(errors)
                .build();
    }
}