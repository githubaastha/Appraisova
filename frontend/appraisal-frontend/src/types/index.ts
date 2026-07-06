// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export type AppraisalStatus =
  | 'PENDING'
  | 'EMPLOYEE_DRAFT'
  | 'SELF_SUBMITTED'
  | 'MANAGER_DRAFT'
  | 'MANAGER_REVIEWED'
  | 'APPROVED'
  | 'ACKNOWLEDGED'

export type CycleStatus = 'ACTIVE' | 'CLOSED' | 'UPCOMING'

export type GoalStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'EMPLOYEE_SUBMITTED'
  | 'COMPLETED'
  | 'NOT_COMPLETED'
  | 'CANCELLED'

export type Roles = 'EMPLOYEE' | 'MANAGER' | 'HR'

// ─────────────────────────────────────────────────────────────────────────────
// User DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface UserResponseDTO {
  userId: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: Roles
  designation: string | null
  managerId: number | null
  managerName: string | null
  deptId: number | null
  deptName: string | null
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
  pendingActivation: boolean;
}

export interface UserRequestDTO {
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: Roles
  designation?: string
  managerId?: number
  deptId?: number
 
}

// ─────────────────────────────────────────────────────────────────────────────
// Appraisal DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface AppraisalsByEmployeeDTO {
  appraisalId: number
  cycleName: string
  cycleStartDate: string
  cycleEndDate: string
  cycleStatus: CycleStatus
  managerName: string
  managerEmail: string
  appraisalStatus: AppraisalStatus
  createdAt: string
}
export interface AppraisalsSummaryDTO {
    appraisalId: number
    cycleName: string
    cycleStartDate: string
    cycleEndDate: string
    cycleStatus: CycleStatus

    employeeName: string
    employeeEmail: string

    managerName: string
    managerEmail: string
    managerId: number

    department: string  

    appraisalStatus: AppraisalStatus
    createdAt: string
    selfRating: number | null
    managerRating: number | null
}

export interface EmployeeAppraisalResponseDTO {
  appraisalId: number
  cycleName: string
  cycleStartDate: string
  cycleEndDate: string
  cycleStatus: CycleStatus
  managerEmail: string
  managerName: string
  whatWentWell: string | null
  whatToImprove: string | null
  achievements: string | null
  selfRating: number | null
  managerStrengths: string | null
  managerImprove: string | null
  managerComments: string | null
  managerRating: number | null
  appraisalStatus: AppraisalStatus
  submittedAt: string | null
  approvedAt: string | null
  createdAt: string
}

export interface SelfAssessmentDTO {
  whatWentWell: string
  whatToImprove: string
  achievements: string
  selfRating: number| null
}

export interface ManagerReviewDTO {
  managerStrengths: string
  managerImprove: string
  managerComments: string
  managerRating: number | null 
}

export interface AppraisalsByManagerDTO {
  appraisalId: number
  employeeId: number
  cycleName: string
  cycleStartDate: string
  cycleEndDate: string
  cycleStatus: CycleStatus
  employeeName: string
  employeeEmail: string
  appraisalStatus: AppraisalStatus
  selfRating: number | null
  managerRating: number | null
  createdAt: string
  
}

export interface AppraisalsRequestDTO {
  cycleName: string
  cycleStartDate: string
  cycleEndDate: string
  employeeId: number
  managerId: number
}
export interface ManagerAppraisalResponseDTO {
    appraisalId: number
    cycleName: string
    cycleStartDate: string
    cycleEndDate: string
    cycleStatus: CycleStatus
    employeeEmail: string
    employeeName: string
    whatWentWell: string | null
    whatToImprove: string | null
    achievements: string | null
    selfRating: number | null
    managerStrengths: string | null
    managerImprove: string | null
    managerComments: string | null
    managerRating: number | null
    appraisalStatus: AppraisalStatus
    approvedAt: string | null
    createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Goal DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface GoalResponseDTO {
  goalId: number
  appraisalId: number
  employeeId: number
  employeeEmail: string
  employeeName: string
  title: string
  description: string
  progressPercent: number
  status: GoalStatus
  employeeCompleted: boolean
  employeeNote: string | null
  dueDate: string
  cycleName: string
}

export interface GoalSummaryDTO {
  goalId: number
  appraisalId: number
  employeeEmail: string
  employeeName: string
  title: string
  status: GoalStatus
  dueDate: string
}

export interface GoalStatusDTO {
  goalId: number
  title: string
  employeeEmail: string
  employeeName: string
  status: GoalStatus
  employeeCompleted: boolean | null
  employeeNote: string | null
}

export interface GoalRequestDTO {
  appraisalId: number
  employeeId: number
  title: string
  description: string
  dueDate: string
}

export interface DepartmentResponseDTO {
  deptId: number
  deptName: string
  deptDescription: string | null
}

export interface DepartmentRequestDTO {
  deptName: string
  deptDescription?: string
}

export interface BulkUserUploadResult {
    totalRows: number;
    successCount: number;
    failureCount: number;
    createdUsers: UserResponseDTO[];
    errors: {
        rowNumber: number;
        email: string;
        reason: string;
    }[];
}

export interface InviteDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    designation: string;
}