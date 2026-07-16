import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getLoggedInUser } from "./utils/auth";
import { lazy, Suspense } from "react";

const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Appraisal = lazy(() => import("./pages/Appraisal"));
const Goals = lazy(() => import("./pages/Goals"));
const Profile = lazy(() => import("./pages/Profile"));
const AppraisalGuide = lazy(() => import("./pages/AppraisalGuide"));
const SampleForm = lazy(() => import("./pages/SampleForm"));
const ManagerDashboard = lazy(() => import("./pages/manager/ManagerDashboard"));
const TeamGoals = lazy(() => import("./pages/manager/TeamGoals"));
const TeamReport = lazy(() => import("./pages/manager/TeamReport"));
const MyTeam = lazy(() => import("./pages/manager/MyTeam"));
const ReviewAppraisal = lazy(() => import("./pages/manager/ReviewAppraisal"));
const MyGoals = lazy(() => import("./pages/manager/MyGoals"));
const MyAppraisals = lazy(() => import("./pages/manager/MyAppraisals"));
const ManagerAppraisalDetail = lazy(() => import("./pages/manager/ManagerAppraisalDetail"));
const AppraisalDetail = lazy(() => import("./pages/AppraisalDetail"));
const HRDashboard = lazy(() => import("./pages/hr/HRDashboard"));
const Users = lazy(() => import("./pages/hr/Users"));
const Departments = lazy(() => import("./pages/hr/Departments"));
const CreateAppraisal = lazy(() => import("./pages/hr/CreateAppraisal"));
const ManageAppraisals = lazy(() => import("./pages/hr/ManageAppraisal"));
const Reports = lazy(() => import("./pages/hr/Reports"));
const SetupAccount = lazy(() => import("./pages/auth/SetupAccount"));
const ManagerProfile = lazy(() => import("./pages/manager/ManagerProfile"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const user = getLoggedInUser()

    if (!isLoggedIn || !user) return <Navigate to="/login" />
    if (!allowedRoles.includes(user.role)) return <Navigate to="/login" />

    return <>{children}</>
}

function App() {
    return (
        <BrowserRouter>
         <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                </div>
            }>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Employee Routes */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Dashboard /></ProtectedRoute>} />
                <Route path="/appraisal" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Appraisal /></ProtectedRoute>} />
                <Route path="/appraisal/:appraisalId" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><AppraisalDetail /></ProtectedRoute>} />
                <Route path="/goals" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Goals /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Profile /></ProtectedRoute>} />
                <Route path="/guide" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><AppraisalGuide /></ProtectedRoute>} />
                <Route path="/sample-form" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><SampleForm /></ProtectedRoute>} />

                {/* Manager Routes */}
                <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
                <Route path="/manager/team" element={<ProtectedRoute allowedRoles={['MANAGER']}><MyTeam /></ProtectedRoute>} />
                <Route path="/manager/goals" element={<ProtectedRoute allowedRoles={['MANAGER']}><TeamGoals /></ProtectedRoute>} />
                <Route path="/manager/report" element={<ProtectedRoute allowedRoles={['MANAGER']}><TeamReport /></ProtectedRoute>} />
                <Route path="/manager/review/:employeeId" element={<ProtectedRoute allowedRoles={['MANAGER']}><ReviewAppraisal /></ProtectedRoute>} />
                <Route path="/manager/my-appraisals" element={<ProtectedRoute allowedRoles={['MANAGER']}><MyAppraisals /></ProtectedRoute>} />
                <Route path="/manager/my-goals" element={<ProtectedRoute allowedRoles={['MANAGER']}><MyGoals /></ProtectedRoute>} />
                <Route path="/manager/my-appraisals/:appraisalId" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerAppraisalDetail /></ProtectedRoute>} />
                <Route path="/manager/profile" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerProfile /></ProtectedRoute>} />


                {/* HR Routes */}
                <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['HR']}><HRDashboard /></ProtectedRoute>} />
                <Route path="/hr/users" element={<ProtectedRoute allowedRoles={['HR']}><Users /></ProtectedRoute>} />
                <Route path="/hr/departments" element={<ProtectedRoute allowedRoles={['HR']}><Departments /></ProtectedRoute>} />
                <Route path="/hr/manage-appraisals" element={<ProtectedRoute allowedRoles={['HR']}><ManageAppraisals /></ProtectedRoute>} />
                <Route path="/hr/create-appraisal" element={<ProtectedRoute allowedRoles={['HR']}><CreateAppraisal /></ProtectedRoute>} />
                <Route path="/hr/reports" element={<ProtectedRoute allowedRoles={['HR']}><Reports /></ProtectedRoute>} />

                <Route path="/setup-account" element={<SetupAccount />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App;