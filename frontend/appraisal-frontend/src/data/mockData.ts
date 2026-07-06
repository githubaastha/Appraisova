import type { GoalStatus, AppraisalStatus } from '../types'

export const mockEmployee = {
    name: 'John Smith',
    initials: 'JS',
    department: 'Java',
    role: 'Employee',
}

export const mockCurrentAppraisal = {
    appraisalId: 1,
    cycleName: '2026 Annual Review',
    cycleStartDate: '2026-01-01',
    cycleEndDate: '2026-07-02',
    managerName: 'Priya Sharma',
    managerEmail: 'priya@gmail.com',
    status: 'PENDING' as AppraisalStatus,
}

export const mockGoals = [
    { goalId: 1, title: 'Complete Spring Boot project',       dueDate: '2026-06-30', appraisalName: '2026 Annual Review', status: 'IN_PROGRESS' as GoalStatus },
    { goalId: 2, title: 'Learn React and TypeScript',         dueDate: '2026-07-15', appraisalName: '2026 Annual Review', status: 'NOT_STARTED' as GoalStatus },
    { goalId: 3, title: 'Write unit tests for API',           dueDate: '2026-06-20', appraisalName: '2026 Annual Review', status: 'EMPLOYEE_SUBMITTED' as GoalStatus },
    { goalId: 4, title: 'Complete appraisal self assessment', dueDate: '2026-07-02', appraisalName: '2026 Annual Review', status: 'NOT_STARTED' as GoalStatus },
    { goalId: 5, title: 'Complete backend documentation',     dueDate: '2026-05-30', appraisalName: '2026 Annual Review', status: 'COMPLETED' as GoalStatus },
    { goalId: 6, title: 'Improve code coverage to 80%',       dueDate: '2026-05-15', appraisalName: '2026 Annual Review', status: 'NOT_COMPLETED' as GoalStatus },
    { goalId: 7, title: 'Attend leadership training',         dueDate: '2026-04-30', appraisalName: '2026 Annual Review', status: 'CANCELLED' as GoalStatus },
]
export const mockManagerPriya = {
    name: 'Priya Sharma',
    initials: 'PS',
    role: 'Manager',
    managerId: null
}
export const mockManagerRohan = {
    name: 'Rohan Sharma',
    initials: 'RS',
    role: 'Manager',
    managerId: 1  
}

export const mockManagerOwnAppraisals = [
    {
        appraisalId: 101,
        cycleName: '2026 Annual Review',
        cycleStartDate: '2026-01-01',
        cycleEndDate: '2026-07-02',
        managerName: 'Rajesh Kumar',
        status: 'EMPLOYEE_DRAFT' as AppraisalStatus,
    },
    {
        appraisalId: 102,
        cycleName: '2025 Annual Review',
        cycleStartDate: '2025-01-01',
        cycleEndDate: '2025-12-31',
        managerName: 'Rajesh Kumar',
        status: 'ACKNOWLEDGED' as AppraisalStatus,
    },
]


export const mockTeamAppraisals = [
    { appraisalId: 1, employeeId: 1, employeeName: 'John Smith',    cycleName: '2026 Annual Review', status: 'SELF_SUBMITTED' as AppraisalStatus, selfRating: 4, managerRating: null },
    { appraisalId: 2, employeeId: 2, employeeName: 'Sarah Johnson', cycleName: '2026 Annual Review', status: 'ACKNOWLEDGED' as AppraisalStatus,  selfRating: 5, managerRating: 4 },
    { appraisalId: 3, employeeId: 3, employeeName: 'Mike Chen',     cycleName: '2026 Annual Review', status: 'SELF_SUBMITTED' as AppraisalStatus, selfRating: 3, managerRating: null },
    { appraisalId: 4, employeeId: 4, employeeName: 'Anita Desai',   cycleName: '2026 Annual Review', status: 'PENDING' as AppraisalStatus,        selfRating: null, managerRating: null },
    { appraisalId: 5, employeeId: 1, employeeName: 'John Smith',    cycleName: '2025 Annual Review', status: 'APPROVED' as AppraisalStatus,       selfRating: 4, managerRating: 4 },
]
export const mockTeamMembers = [
    { employeeId: 1, name: 'John Smith',    department: 'Java' },
    { employeeId: 2, name: 'Sarah Johnson', department: 'Java' },
    { employeeId: 3, name: 'Mike Chen',     department: 'Java' },
    { employeeId: 4, name: 'Anita Desai',   department: 'Java' },
]

export const mockTeamGoals = [
    { goalId: 1, employeeId: 1, employeeName: 'John Smith',    cycleName: '2026 Annual Review',   title: 'Complete Spring Boot project',        dueDate: '2026-06-30', status: 'IN_PROGRESS' as GoalStatus },
    { goalId: 2, employeeId: 1, employeeName: 'John Smith',    cycleName: '2026 Annual Review',   title: 'Learn React and TypeScript',          dueDate: '2026-07-15', status: 'NOT_STARTED' as GoalStatus },
    { goalId: 3, employeeId: 2, employeeName: 'Sarah Johnson', cycleName: '2026 Annual Review',   title: 'Lead the migration to Spring Boot 3', dueDate: '2026-06-25', status: 'EMPLOYEE_SUBMITTED' as GoalStatus },
    { goalId: 4, employeeId: 3, employeeName: 'Mike Chen',     cycleName: '2026 Annual Review',   title: 'Improve unit test coverage',          dueDate: '2026-07-10', status: 'NOT_STARTED' as GoalStatus },
    { goalId: 5, employeeId: 4, employeeName: 'Anita Desai',   cycleName: '2026 Annual Review',   title: 'Document onboarding process',         dueDate: '2026-06-28', status: 'IN_PROGRESS' as GoalStatus },
    { goalId: 6, employeeId: 1, employeeName: 'John Smith',    cycleName: '2026 Mid-Year Review', title: 'Set up CI/CD pipeline',               dueDate: '2026-03-15', status: 'COMPLETED' as GoalStatus },
    { goalId: 7, employeeId: 2, employeeName: 'Sarah Johnson', cycleName: '2026 Mid-Year Review', title: 'Mentor junior developers',            dueDate: '2026-03-20', status: 'COMPLETED' as GoalStatus },
]

export const mockCycles = ['2026 Annual Review', '2026 Mid-Year Review']
export const mockTeamMembersWithTitles = [
    { employeeId: 1, name: 'John Smith',    jobTitle: 'Software Engineer' },
    { employeeId: 2, name: 'Sarah Johnson', jobTitle: 'Tech Lead' },
    { employeeId: 3, name: 'Mike Chen',     jobTitle: 'Backend Developer' },
    { employeeId: 4, name: 'Anita Desai',   jobTitle: 'QA Engineer' },
]

export const mockTeamDirectory = [
    { employeeId: 1, name: 'John Smith',    jobTitle: 'Software Engineer',   email: 'john@gmail.com',    department: 'Java' },
    { employeeId: 2, name: 'Sarah Johnson', jobTitle: 'Tech Lead',           email: 'sarah@gmail.com',   department: 'Java' },
    { employeeId: 3, name: 'Mike Chen',     jobTitle: 'Backend Developer',   email: 'mike@gmail.com',    department: 'Java' },
    { employeeId: 4, name: 'Anita Desai',   jobTitle: 'QA Engineer',         email: 'anita@gmail.com',   department: 'Java' },
]
export const mockTeamAppraisalDetails = [
    {
        appraisalId: 1,
        employeeId: 1,
        employeeName: 'John Smith',
        cycleName: '2026 Annual Review',
        status: 'SELF_SUBMITTED' as AppraisalStatus,
        whatWentWell: 'Delivered the Spring Boot migration ahead of schedule and helped onboard two new team members.',
        whatToImprove: 'Want to get better at writing technical documentation for handoffs.',
        achievements: 'Reduced API response time by 25% through query optimization.',
        selfRating: 4,
        managerStrengths: '',
        managerImprove: '',
        managerComments: '',
        managerRating: null,
    },
    {
        appraisalId: 2,
        employeeId: 2,
        employeeName: 'Sarah Johnson',
        cycleName: '2026 Annual Review',
        status: 'ACKNOWLEDGED' as AppraisalStatus,
        whatWentWell: 'Successfully led the Spring Boot 3 migration across the team and mentored two junior developers.',
        whatToImprove: 'Want to improve cross-team communication during sprint planning.',
        achievements: 'Reduced sprint carryover by 30% through better task breakdown.',
        selfRating: 5,
        managerStrengths: 'Outstanding leadership and technical depth this cycle.',
        managerImprove: 'Could delegate more code reviews to free up time for architecture work.',
        managerComments: 'Exceptional performance, ready for more strategic responsibilities.',
        managerRating: 4,
    },
    {
        appraisalId: 3,
        employeeId: 3,
        employeeName: 'Mike Chen',
        cycleName: '2026 Annual Review',
        status: 'SELF_SUBMITTED' as AppraisalStatus,
        whatWentWell: 'Built and shipped the notification service end to end.',
        whatToImprove: 'Need to communicate blockers earlier instead of trying to solve everything alone.',
        achievements: 'Implemented retry logic that reduced failed job rate by 40%.',
        selfRating: 3,
        managerStrengths: '',
        managerImprove: '',
        managerComments: '',
        managerRating: null,
    },
]

   
export const mockManagerAppraisals = [
    {
        appraisalId: 101,
        cycleName: '2026 Annual Review',
        cycleStartDate: '2026-01-01',
        cycleEndDate: '2026-07-02',
        managerName: 'Rajesh Kumar',
        managerEmail: 'rajesh@gmail.com',
        status: 'EMPLOYEE_DRAFT' as AppraisalStatus,
        isClosed: false,
        whatWentWell: 'Led the team through the Q1 sprint successfully.',
        whatToImprove: '',
        achievements: '',
        selfRating: null,
        managerStrengths: '',
        managerImprove: '',
        managerComments: '',
        managerRating: null,
        approvedAt: null,
        goals: [
            { goalId: 201, title: 'Improve team velocity by 15%', dueDate: '2026-06-30', status: 'IN_PROGRESS' as const, employeeNote: null },
        ],
    },
    {
        appraisalId: 102,
        cycleName: '2025 Annual Review',
        cycleStartDate: '2025-01-01',
        cycleEndDate: '2025-12-31',
        managerName: 'Rajesh Kumar',
        managerEmail: 'rajesh@gmail.com',
        status: 'ACKNOWLEDGED' as AppraisalStatus,
        isClosed: true,
        whatWentWell: 'Successfully grew the team from 2 to 4 members and maintained 95% sprint completion rate.',
        whatToImprove: 'Want to delegate more code reviews to senior team members.',
        achievements: 'Led the Spring Boot 3 migration across the entire team.',
        selfRating: 5,
        managerStrengths: 'Excellent leadership and team growth this year.',
        managerImprove: 'Could improve on cross-department collaboration.',
        managerComments: 'Outstanding year overall.',
        managerRating: 5,
        approvedAt: '2025-12-15',
        goals: [
            { goalId: 202, title: 'Grow team to 4 members', dueDate: '2025-09-30', status: 'COMPLETED' as const, employeeNote: 'Hired Mike and Anita this year.' },
        ],
    },
]

export const mockManagerGoals = [
    { goalId: 301, title: 'Improve team velocity by 15%',       dueDate: '2026-06-30', appraisalName: '2026 Annual Review', status: 'IN_PROGRESS' as GoalStatus },
    { goalId: 302, title: 'Complete leadership training',       dueDate: '2026-07-20', appraisalName: '2026 Annual Review', status: 'NOT_STARTED' as GoalStatus },
    { goalId: 303, title: 'Grow team to 4 members',             dueDate: '2025-09-30', appraisalName: '2025 Annual Review', status: 'COMPLETED' as GoalStatus },
]
export const mockHR = {
    name: 'Anjali Mehta',
    initials: 'AM',
    role: 'HR',
}

export const mockHRStats = {
    activeEmployees: 8,
    totalDepartments: 4,
    pendingApproval: 0,
    activeCycles: 2,
}

export const mockAllAppraisals = [
    { appraisalId: 1, employeeName: 'Mike Chen',     department: 'Java',     managerName: 'Priya Sharma',  cycleName: '2026 Annual Review', status: 'SELF_SUBMITTED' as AppraisalStatus, updatedAt: '2026-06-17' },
    { appraisalId: 2, employeeName: 'Anita Desai',   department: 'Java',     managerName: 'Priya Sharma',  cycleName: '2026 Annual Review', status: 'PENDING' as AppraisalStatus,         updatedAt: '2026-06-17' },
    { appraisalId: 3, employeeName: 'Sarah Johnson', department: 'Java',     managerName: 'Priya Sharma',  cycleName: '2026 Annual Review', status: 'ACKNOWLEDGED' as AppraisalStatus,    updatedAt: '2026-06-18' },
    { appraisalId: 4, employeeName: 'Priya Sharma',  department: 'Java',     managerName: 'Rajesh Kumar',  cycleName: '2026 Annual Review', status: 'EMPLOYEE_DRAFT' as AppraisalStatus,  updatedAt: '2026-06-17' },
    { appraisalId: 5, employeeName: 'John Smith',    department: 'Java',     managerName: 'Priya Sharma',  cycleName: '2026 Annual Review', status: 'SELF_SUBMITTED' as AppraisalStatus,  updatedAt: '2026-06-20' },
    { appraisalId: 6, employeeName: 'Karan Mehta',   department: 'Python',  managerName: 'Rohan Verma',   cycleName: '2026 Mid-Year Review', status: 'EMPLOYEE_DRAFT' as AppraisalStatus, updatedAt: '2026-06-16' },
    { appraisalId: 7, employeeName: 'Neha Kapoor',   department: 'DevOps',  managerName: 'Rohan Verma',   cycleName: '2026 Annual Review', status: 'APPROVED' as AppraisalStatus,          updatedAt: '2026-06-10' },
    { appraisalId: 8, employeeName: 'Arjun Nair',    department: 'QA',      managerName: 'Rohan Verma',   cycleName: '2025 Annual Review', status: 'ACKNOWLEDGED' as AppraisalStatus,   updatedAt: '2025-06-19' },
]
export const mockAllUsers = [
    { userId: 1, name: 'Priya Sharma',  email: 'priya@gmail.com',  role: 'MANAGER',  jobTitle: 'Tech Lead',         department: 'Java',    managerName: 'Rajesh Kumar',  isActive: true },
    { userId: 2, name: 'John Smith',    email: 'john@gmail.com',   role: 'EMPLOYEE', jobTitle: 'Software Engineer', department: 'Java',    managerName: 'Priya Sharma',  isActive: true },
    { userId: 3, name: 'Sarah Johnson', email: 'sarah@gmail.com',  role: 'EMPLOYEE', jobTitle: 'Tech Lead',         department: 'Java',    managerName: 'Priya Sharma',  isActive: true },
    { userId: 4, name: 'Mike Chen',     email: 'mike@gmail.com',   role: 'EMPLOYEE', jobTitle: 'Backend Developer', department: 'Java',    managerName: 'Priya Sharma',  isActive: true },
    { userId: 5, name: 'Anita Desai',   email: 'anita@gmail.com',  role: 'EMPLOYEE', jobTitle: 'QA Engineer',       department: 'Java',    managerName: 'Priya Sharma',  isActive: true },
    { userId: 6, name: 'Rohan Verma',   email: 'rohan@gmail.com',  role: 'MANAGER',  jobTitle: 'Engineering Lead',  department: 'DevOps',  managerName: 'Rajesh Kumar',  isActive: true },
    { userId: 7, name: 'Karan Mehta',   email: 'karan@gmail.com',  role: 'EMPLOYEE', jobTitle: 'Python Developer',  department: 'Python', managerName: 'Rohan Verma',   isActive: true },
    { userId: 8, name: 'Neha Kapoor',   email: 'neha@gmail.com',   role: 'EMPLOYEE', jobTitle: 'DevOps Engineer',   department: 'DevOps',  managerName: 'Rohan Verma',   isActive: true },
    { userId: 9, name: 'Arjun Nair',    email: 'arjun@gmail.com',  role: 'EMPLOYEE', jobTitle: 'QA Analyst',        department: 'QA',      managerName: 'Rohan Verma',   isActive: false },
    { userId: 10, name: 'Anjali Mehta', email: 'anjali@gmail.com', role: 'HR',       jobTitle: 'HR Manager',        department: 'HR',      managerName: '—',             isActive: true },
]
export const mockHRDepartments = ['Java', 'Python', 'DevOps', 'QA']

export const mockAppraisableUsers = mockAllUsers.filter(u => u.managerName !== '—')
export const mockHREmployees = mockAllUsers.filter(u => u.role === 'EMPLOYEE')
export const mockHRManagers = mockAllUsers.filter(u => u.role === 'MANAGER')

