import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "../api/axios"

interface Props {
  name: string;
  initials: string;
  role: string;
  activePage: string;
}

export default function HRSidebar({
  name,
  initials,
  role,
  activePage,
}: Props) {
  const navigate = useNavigate();

  const links = [
    { label: "Dashboard", path: "/hr/dashboard" },
    { label: "Users", path: "/hr/users" },
    { label: "Departments", path: "/hr/departments" },
    { label: "Manage Appraisals", path: "/hr/manage-appraisals" },
    { label: "Create Appraisal", path: "/hr/create-appraisal" },
    { label: "Reports", path: "/hr/reports" },
  ];

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
  return (
    <div className="w-56 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col px-4 gap-5 shrink-0">

      {/* Logo */}
      <div className="flex items-center pt-2">
        <img src={logo} alt="Logo" className="h-15 w-18" />
      </div>

      {/* HR Info */}
      <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-full bg-[#1089D3] flex items-center justify-center text-white text-sm font-bold">
          {initials}
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">{name}</p>
          <p className="text-xs text-[#1089D3]">{role}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1">
        {links.map((link) => (
          <div
            key={link.label}
            onClick={() => navigate(link.path)}
            className={`px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${
              activePage === link.label
                ? "bg-blue-50 text-[#1089D3]"
                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            }`}
          >
            {link.label}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-auto pb-4">
        <div
          onClick={handleLogout}
          className="px-3 py-2.5 rounded-lg cursor-pointer text-gray-400 hover:bg-gray-50 hover:text-red-500 transition-all"
        >
          <span className="text-sm font-medium ">Logout</span>
        </div>
      </div>

    </div>
  );
}