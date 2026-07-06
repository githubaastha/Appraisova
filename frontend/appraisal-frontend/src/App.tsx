import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getLoggedInUser } from "./utils/auth";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Appraisal from "./pages/Appraisal";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import AppraisalGuide from "./pages/AppraisalGuide";
import SampleForm from "./pages/SampleForm";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import TeamGoals from "./pages/manager/TeamGoals";
import TeamReport from "./pages/manager/TeamReport";
import MyTeam from "./pages/manager/MyTeam";
import ReviewAppraisal from "./pages/manager/ReviewAppraisal";
import MyGoals from "./pages/manager/MyGoals";
import MyAppraisals from "./pages/manager/MyAppraisals";
import ManagerAppraisalDetail from "./pages/manager/ManagerAppraisalDetail";
import AppraisalDetail from "./pages/AppraisalDetail";
import HRDashboard from "./pages/hr/HRDashboard";
import Users from "./pages/hr/Users";
import Departments from "./pages/hr/Departments";
import CreateAppraisal from "./pages/hr/CreateAppraisal";
import ManageAppraisals from "./pages/hr/ManageAppraisal";
import Reports from "./pages/hr/Reports";
import SetupAccount from "./pages/auth/SetupAccount";
import ManagerProfile from "./pages/manager/ManagerProfile";
import ResetPassword from "./pages/auth/ResetPassword";
import ForgotPassword from "./pages/auth/ForgotPassword";

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
        </BrowserRouter>
    )
}

export default App;