package com.project.AppraisalSystem.service;

import com.project.AppraisalSystem.dto.*;
import com.project.AppraisalSystem.entity.enums.AppraisalStatus;
import com.project.AppraisalSystem.entity.enums.CycleStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AppraisalsService {

    //-------------------Get Method ----------------------------------------------------------------------

    Page<AppraisalsSummaryDTO> findAllAppraisals(Pageable pageable);
    EmployeeAppraisalResponseDTO findAppraisalDetailById(Long appraisalId);
    ManagerAppraisalResponseDTO findAppraisalForManager(Long appraisalId);
    List<AppraisalsByEmployeeDTO> findAppraisalsByEmployee_Id(Long employeeId);
    List<AppraisalsByEmployeeDTO> findAppraisalsByEmployeeEmail(String email);
    Page<AppraisalsByManagerDTO> findAppraisalsByManager_Id(Long managerId, Pageable pageable);
    List<AppraisalsByManagerDTO> findAppraisalsByManagerEmail(String email);
    Page<AppraisalsSummaryDTO> findAppraisalsByCycle(String cycleName, Pageable pageable);
    Page<AppraisalsSummaryDTO> findAppraisalsByStatus(AppraisalStatus status, Pageable pageable);
    Page<AppraisalsSummaryDTO> findAppraisalsByCycleStatus(CycleStatus cycleStatus, Pageable pageable);


    //-------------------------Create-----------------------------------------------------
    AppraisalsSummaryDTO createAppraisal(AppraisalsRequestDTO dto);
    List<AppraisalsSummaryDTO> createBulkAppraisals(List<AppraisalsRequestDTO> dtos);

    //------------------------------SELF ASSESMENT -----------------------------------
    EmployeeAppraisalResponseDTO saveSelfAssessmentDraft(Long appraisalId, SelfAssessmentDTO dto);
    EmployeeAppraisalResponseDTO saveSelfAssessmentDraftByEmployeeEmail(String employeeEmail, String cycleName, SelfAssessmentDTO dto);
    EmployeeAppraisalResponseDTO submitSelfAssessment(Long appraisalId, SelfAssessmentDTO dto);
    EmployeeAppraisalResponseDTO submitSelfAssessmentByEmployeeEmail(String employeeEmail, String cycleName, SelfAssessmentDTO dto);

    // ---------------------- MANAGER REVIEW-------------------------------------------------
    ManagerAppraisalResponseDTO saveManagerReviewDraft(Long appraisalId, ManagerReviewDTO dto);
    ManagerAppraisalResponseDTO submitManagerReview(Long appraisalId, ManagerReviewDTO dto);
    ManagerAppraisalResponseDTO saveManagerReviewDraftByEmployeeEmail(String employeeEmail, String cycleName, ManagerReviewDTO dto);
    ManagerAppraisalResponseDTO submitManagerReviewByEmployeeEmail(String employeeEmail, String cycleName, ManagerReviewDTO dto);
  
    // -----------------------------------HR ----------------------------------------------
    AppraisalsSummaryDTO approveAppraisal(Long appraisalId);

    // -------------------------------------- ---------------------------------------------
      EmployeeAppraisalResponseDTO acknowledgeAppraisal(Long appraisalId);
    // -------------------------------------------DELETE-------------------------------------------
    String deleteAppraisal(Long appraisalId);

    AppraisalsSummaryDTO updateAppraisal(Long appraisalId, AppraisalUpdateDTO dto);

    byte[] generateReportExcel(String cycleName);
    byte[] generateTeamReportExcel(Long managerId, String cycleName);

    boolean isOwner(Long appraisalId, Long employeeId);


}