package com.project.AppraisalSystem.controller;
import com.project.AppraisalSystem.dto.*;
import com.project.AppraisalSystem.entity.enums.AppraisalStatus;
import com.project.AppraisalSystem.entity.enums.CycleStatus;
import com.project.AppraisalSystem.security.CurrentUserService;
import com.project.AppraisalSystem.service.AppraisalsService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/appraisals")
@AllArgsConstructor
public class AppraisalsController {

    private final AppraisalsService appraisalsService;
    private final CurrentUserService currentUserService;

    @PreAuthorize("hasRole('HR')")
    @GetMapping
    public ResponseEntity<List<AppraisalsSummaryDTO>> findAllAppraisals() {
        return ResponseEntity.ok(appraisalsService.findAllAppraisals());
    }

    @GetMapping("/my")
    public ResponseEntity<List<AppraisalsByEmployeeDTO>> getMyAppraisals() {
        Long employeeId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(
                appraisalsService.findAppraisalsByEmployee_Id(employeeId)
        );
    }

    @GetMapping("/{appraisalId}")
    public ResponseEntity<EmployeeAppraisalResponseDTO> findAppraisalById(@PathVariable Long appraisalId) {
        return ResponseEntity.ok(appraisalsService.findAppraisalDetailById(appraisalId));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/{appraisalId}/manager-view")
    public ResponseEntity<ManagerAppraisalResponseDTO> findAppraisalForManager(@PathVariable Long appraisalId) {
        return ResponseEntity.ok(appraisalsService.findAppraisalForManager(appraisalId));
    }

    @PreAuthorize("hasRole('HR')")
    @GetMapping("/cycle/{cycleName}")
    public ResponseEntity<List<AppraisalsSummaryDTO>> findAppraisalsByCycle(
            @PathVariable String cycleName) {
        return ResponseEntity.ok(appraisalsService.findAppraisalsByCycle(cycleName));
    }

    @PreAuthorize("hasRole('HR')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AppraisalsSummaryDTO>> findAppraisalsByStatus(
            @PathVariable AppraisalStatus status) {
        return ResponseEntity.ok(appraisalsService.findAppraisalsByStatus(status));
    }

    @PreAuthorize("hasRole('HR')")
    @GetMapping("/cycle-status/{cycleStatus}")
    public ResponseEntity<List<AppraisalsSummaryDTO>> findAppraisalsByCycleStatus(
            @PathVariable CycleStatus cycleStatus) {
        return ResponseEntity.ok(appraisalsService.findAppraisalsByCycleStatus(cycleStatus));
    }

    @PreAuthorize("hasRole('HR')")
    @PostMapping
    public ResponseEntity<AppraisalsSummaryDTO> createAppraisal(
            @RequestBody AppraisalsRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appraisalsService.createAppraisal(dto));
    }

    @PreAuthorize("hasRole('HR')")
    @PostMapping("/bulk")
    public ResponseEntity<List<AppraisalsSummaryDTO>> createBulkAppraisals(
            @RequestBody List<AppraisalsRequestDTO> dtos) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appraisalsService.createBulkAppraisals(dtos));
    }

    @PreAuthorize("hasRole('HR')")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<AppraisalsSummaryDTO> approveAppraisal(@PathVariable Long id) {
        return ResponseEntity.ok(appraisalsService.approveAppraisal(id));
    }

    @PreAuthorize("hasRole('HR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAppraisal(@PathVariable Long id) {
        return ResponseEntity.ok(appraisalsService.deleteAppraisal(id));
    }

    @PreAuthorize("hasAnyRole('HR', 'MANAGER') or @currentUserService.getCurrentUserId() == #employeeId")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AppraisalsByEmployeeDTO>> findAppraisalsByEmployee(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(appraisalsService.findAppraisalsByEmployee_Id(employeeId));
    }

    @PreAuthorize("hasAnyRole('HR', 'MANAGER')")
    @GetMapping("/employee/email/{employeeEmail}")
    public ResponseEntity<List<AppraisalsByEmployeeDTO>> findAppraisalsByEmployeeEmail(
            @PathVariable String employeeEmail) {
        return ResponseEntity.ok(appraisalsService.findAppraisalsByEmployeeEmail(employeeEmail));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
    @PutMapping("/{id}/self-assessment/draft")
    public ResponseEntity<EmployeeAppraisalResponseDTO> saveSelfAssessmentDraft(
            @PathVariable Long id,
            @RequestBody SelfAssessmentDTO dto) {
        return ResponseEntity.ok(appraisalsService.saveSelfAssessmentDraft(id, dto));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
    @PutMapping("/self-assessment/draft/email")
    public ResponseEntity<EmployeeAppraisalResponseDTO> saveSelfAssessmentDraftByEmail(
            @RequestParam String employeeEmail,
            @RequestParam String cycleName,
            @RequestBody SelfAssessmentDTO dto) {
        return ResponseEntity.ok(appraisalsService
                .saveSelfAssessmentDraftByEmployeeEmail(employeeEmail, cycleName, dto));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
    @PutMapping("/{id}/self-assessment/submit")
    public ResponseEntity<EmployeeAppraisalResponseDTO> submitSelfAssessment(
            @PathVariable Long id,
            @RequestBody SelfAssessmentDTO dto) {
        return ResponseEntity.ok(appraisalsService.submitSelfAssessment(id, dto));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
    @PutMapping("/self-assessment/submit/email")
    public ResponseEntity<EmployeeAppraisalResponseDTO> submitSelfAssessmentByEmail(
            @RequestParam String employeeEmail,
            @RequestParam String cycleName,
            @RequestBody SelfAssessmentDTO dto) {
        return ResponseEntity.ok(appraisalsService
                .submitSelfAssessmentByEmployeeEmail(employeeEmail, cycleName, dto));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<EmployeeAppraisalResponseDTO> acknowledgeAppraisal(
            @PathVariable Long id) {
        return ResponseEntity.ok(appraisalsService.acknowledgeAppraisal(id));
    }

    @PreAuthorize("hasAnyRole('HR', 'MANAGER')")
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<AppraisalsByManagerDTO>> findAppraisalsByManager(
            @PathVariable Long managerId) {
        return ResponseEntity.ok(appraisalsService.findAppraisalsByManager_Id(managerId));
    }

    @PreAuthorize("hasAnyRole('HR', 'MANAGER')")
    @GetMapping("/manager/email/{managerEmail}")
    public ResponseEntity<List<AppraisalsByManagerDTO>> findAppraisalsByManagerEmail(
            @PathVariable String managerEmail) {
        return ResponseEntity.ok(appraisalsService.findAppraisalsByManagerEmail(managerEmail));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/{id}/manager-review/draft")
    public ResponseEntity<ManagerAppraisalResponseDTO> saveManagerReviewDraft(
            @PathVariable Long id,
            @RequestBody ManagerReviewDTO dto) {
        return ResponseEntity.ok(appraisalsService.saveManagerReviewDraft(id, dto));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/manager-review/draft/email")
    public ResponseEntity<ManagerAppraisalResponseDTO> saveManagerReviewDraftByEmail(
            @RequestParam String employeeEmail,
            @RequestParam String cycleName,
            @RequestBody ManagerReviewDTO dto) {
        return ResponseEntity.ok(appraisalsService
                .saveManagerReviewDraftByEmployeeEmail(employeeEmail, cycleName, dto));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/{id}/manager-review/submit")
    public ResponseEntity<ManagerAppraisalResponseDTO> submitManagerReview(
            @PathVariable Long id,
            @RequestBody ManagerReviewDTO dto) {
        return ResponseEntity.ok(appraisalsService.submitManagerReview(id, dto));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/manager-review/submit/email")
    public ResponseEntity<ManagerAppraisalResponseDTO> submitManagerReviewByEmail(
            @RequestParam String employeeEmail,
            @RequestParam String cycleName,
            @RequestBody ManagerReviewDTO dto) {
        return ResponseEntity.ok(appraisalsService
                .submitManagerReviewByEmployeeEmail(employeeEmail, cycleName, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppraisalsSummaryDTO> updateAppraisal(
            @PathVariable Long id,
            @RequestBody AppraisalUpdateDTO dto) {
        return ResponseEntity.ok(appraisalsService.updateAppraisal(id, dto));
    }


    @GetMapping("/report/export")
    public ResponseEntity<byte[]> exportReport(@RequestParam String cycleName) throws IOException {
        byte[] excelBytes = appraisalsService.generateReportExcel(cycleName);

        String filename = cycleName.replaceAll("\\s+", "_") + "_Report.xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
    @GetMapping("/manager/{managerId}/report/export")
    public ResponseEntity<byte[]> exportTeamReport(
            @PathVariable Long managerId,
            @RequestParam String cycleName) {

        byte[] excelBytes = appraisalsService.generateTeamReportExcel(managerId, cycleName);

        String filename = cycleName.replaceAll("\\s+", "_") + "_Team_Report.xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}