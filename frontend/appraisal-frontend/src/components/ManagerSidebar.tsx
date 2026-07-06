import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import axios from "../api/axios"
interface Props {
    name: string
    initials: string
    role: string
    activePage: string
    hasManager?: boolean
}

export default function ManagerSidebar({ name, initials, role, activePage, hasManager = false }: Props) {
    const navigate = useNavigate()

    const teamLinks = [
        { label: 'Dashboard', path: '/manager/dashboard' },
        { label: 'My Team', path: '/manager/team' },
        { label: 'Team Goals', path: '/manager/goals' },
        { label: 'Team Report', path: '/manager/report' },
        { label: 'Profile', path: '/manager/profile' },
    ]
    const personalLinks = [
        ...(hasManager ? [{ label: 'My Appraisals', path: '/manager/my-appraisals' }] : []),
        ...(hasManager ? [{ label: 'My Goals', path: '/manager/my-goals' }] : []),
    ]

  const handleLogout = async () => {
    try {
        const stored = localStorage.getItem("loggedInUser");
        const user = stored ? JSON.parse(stored) : null;
        const refreshToken = user?.refreshToken;

        if (refreshToken) {
            await axios.post("http://localhost:8080/api/auth/logout", { refreshToken });
        }
    } catch (err) {
        console.error("Logout API call failed, clearing session locally anyway", err);
    } finally {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
    }
};
    const renderLink = (link: { label: string; path: string }) => (
        <div
            key={link.label}
            onClick={() => navigate(link.path)}
            className={`px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${activePage === link.label
                    ? 'bg-blue-50 text-[#1089D3]'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
        >
            {link.label}
        </div>
    )

    return (
        <div className="w-56 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col px-4  gap-5 shrink-0">

            {/* Logo */}
            <div className="flex items-center pt-2">
                <img src={logo} alt="PS Logo" className="h-15  w-18" />
            </div>

            {/* Manager Info */}
            <div className="flex items-center gap-3 pb-5 pt-0 border-b border-gray-100">
                <div className="w-11 h-11 rounded-full bg-[#1089D3] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {initials}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">{name}</p>
                    <p className="text-xs text-[#1089D3]">{role}</p>
                </div>
            </div>

            {/* Team Nav Links */}
            <div className="flex flex-col gap-1">
                {teamLinks.map(renderLink)}
            </div>

       
            

            {/* Personal Nav Links */}
            {hasManager && (
                <>
               
                    <div className="border-t border-gray-100 -mt-2" />
                    <div className="flex flex-col gap-1 -mt-2">
                        <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider px-3 mb-1">
                            Personal
                        </p>
                        {personalLinks.map(renderLink)}
                    </div>
                </>
            )}

            {/* Bottom — Logout */}
            <div className="mt-auto flex flex-col gap-1 mb-3">
                <div
                    onClick={handleLogout}
                    className="px-3 py-2.5 rounded-lg cursor-pointer text-gray-400 hover:bg-gray-50 hover:text-red-500 transition-all"
                >
                    <span className="text-sm font-medium">Logout</span>
                </div>
            </div>

        </div>
    )
}