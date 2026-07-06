import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "../api/axios"

interface Props {
  name: string;
  initials: string;
  department: string;
  role: string;
  activePage: string;
}

export default function Sidebar({
  name,
  initials,
  department,
  role,
  activePage,
}: Props) {
  const navigate = useNavigate();

  const [openGuide, setOpenGuide] = useState(
    activePage === "Guide" || activePage === "Sample Form"
  );

  const links = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "My Appraisal", path: "/appraisal" },
    { label: "My Goals", path: "/goals" },
    { label: "Profile", path: "/profile" },
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
    <div className="w-56 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col px-4 py-3 gap-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="h-15 w-18" />
      </div>

      {/* Employee Info */}
      <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-full bg-[#1089D3] flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{department}</p>
          <p className="text-xs text-[#1089D3]">{role}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1">

        {/* Appraisal Guide Dropdown */}
        <div>
          <div
            onClick={() => setOpenGuide(!openGuide)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${
              activePage === "Guide" || activePage === "Sample Form"
                ? "bg-blue-50 text-[#1089D3]"
                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            }`}
          >
            <span>Appraisal Guide</span>

            <span
              className={`transition-transform duration-300 ${
                openGuide ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </div>

          {openGuide && (
            <div className="ml-6 mt-1 pl-3 border-l border-gray-200 flex flex-col gap-1">

              <div
                onClick={() => navigate("/guide")}
                className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition-all ${
                  activePage === "Guide"
                    ? "bg-blue-50 text-[#1089D3] font-medium"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                Appraisal Guide
              </div>

              <div
                onClick={() => navigate("/sample-form")}
                className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition-all ${
                  activePage === "Sample Form"
                    ? "bg-blue-50 text-[#1089D3] font-medium"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                Sample Form
              </div>

            </div>
          )}
        </div>

        {/* Main Menu */}
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

      {/* Bottom — Logout only now, notifications moved to Topbar */}
      <div className="mt-auto flex flex-col gap-1">
        <div
          onClick={handleLogout}
          className="px-3 py-2.5 rounded-lg cursor-pointer text-gray-400 hover:bg-gray-50 hover:text-red-500 transition-all"
        >
          <span className="text-sm font-medium">Logout</span>
        </div>
      </div>
    </div>
  );
}