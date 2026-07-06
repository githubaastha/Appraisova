import { useState, useEffect } from 'react'
import { createUser } from '../../../api/usersApi'
import { getDepartments } from '../../../api/departmentApi'
import type { DepartmentResponseDTO } from '../../../types'


interface Props {
    managers: {
        userId: number;
        name: string;
        deptId: number | null;
    }[];
    onClose: () => void;
    onAdded: () => void;
}

export default function AddUserModal({
    managers,
    onClose,
    onAdded,
}: Props) {
    const [departments, setDepartments] = useState<DepartmentResponseDTO[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("EMPLOYEE");
    const [jobTitle, setJobTitle] = useState("");
    const [deptId, setDeptId] = useState<number | "">("");
    const [managerId, setManagerId] = useState<number | "">("");
    const [error, setError] = useState("");

    useEffect(() => {
        getDepartments()
            .then(setDepartments)
            .catch((err) =>
                console.error("Failed to load departments:", err)
            );
    }, []);

    const showManagerField = role === "EMPLOYEE" || role === "MANAGER";
    const managerRequired = role === "EMPLOYEE";

    const filteredManagers =
        role === "HR"
            ? []
            : deptId === ""
                ? []
                : managers.filter((m) => m.deptId === deptId);

    const handleSubmit = async () => {
        if (!name.trim()) return setError("Name cannot be empty");
        if (!email.trim()) return setError("Email cannot be empty");
        if (!jobTitle.trim()) return setError("Job title cannot be empty");

        if (phone.trim() && !/^[6-9]\d{9}$/.test(phone.trim())) {
            return setError("Enter a valid 10-digit phone number, or leave it blank");
        }

        if (role !== "HR" && !deptId) {
            return setError("Please select a department");
        }

        if (managerRequired && !managerId) {
            return setError(
                "Please select a manager — every employee must report to someone"
            );
        }

        const [firstName, ...rest] = name.trim().split(" ");
        const lastName = rest.join(" ") || '';

        try {
            await createUser({
                firstName,
                lastName,
                email,
                phone: phone.trim(),
                role: role as any,
                designation: jobTitle,
                managerId:
                    managerId === "" ? undefined : Number(managerId),
                ...(role !== "HR" && {
                    deptId: Number(deptId),
                }),
                
            });

            onAdded();
            onClose();
        } catch (err) {
            setError("Failed to create user — check console for details");
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4 shadow-lg">

                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">
                        Add New User
                    </p>

                    <button
                        onClick={onClose}
                        className="text-gray-700 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">
                        Full Name
                    </label>

                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1089D3] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john.doe@company.com"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1089D3] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">
                        Phone
                    </label>

                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter phone number"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1089D3] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600">
                        Role
                    </label>

                    <select
                        value={role}
                        onChange={(e) => {
                            const selectedRole = e.target.value;

                            setRole(selectedRole);
                            setDeptId("");
                            setManagerId("");
                        }}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1089D3] transition-all"
                    >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                        <option value="HR">HR</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">
                        Job Title
                    </label>

                    <input
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1089D3] transition-all"
                    />
                </div>

                {role !== "HR" && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-700">
                            Department
                        </label>

                        <select
                            value={deptId}
                            onChange={(e) => {
                                const value =
                                    e.target.value === ""
                                        ? ""
                                        : Number(e.target.value);

                                setDeptId(value);
                                setManagerId("");
                            }}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1089D3] transition-all"
                        >
                            <option value="">
                                Select a department
                            </option>

                            {departments.map((d) => (
                                <option
                                    key={d.deptId}
                                    value={d.deptId}
                                >
                                    {d.deptName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {showManagerField && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-700">
                            Manager
                            {managerRequired ? "" : " (optional)"}
                        </label>

                        <select
                            value={managerId}
                            disabled={deptId === ""}
                            onChange={(e) =>
                                setManagerId(
                                    e.target.value === ""
                                        ? ""
                                        : Number(e.target.value)
                                )
                            }
                            className={`border border-gray-200 rounded-lg px-3 py-2 text-sm ${deptId === ""
                                ? "bg-gray-100 cursor-not-allowed text-gray-700"
                                : "text-gray-700"
                                }`}
                        >
                            <option value="">
                                {deptId === ""
                                    ? "Select department first"
                                    : managerRequired
                                        ? "Select a manager"
                                        : "No manager"}
                            </option>

                            {filteredManagers.map((m) => (
                                <option
                                    key={m.userId}
                                    value={m.userId}
                                >
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg border text-gray-600"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-2 rounded-lg bg-[#1089D3] text-white"
                    >
                        Add User
                    </button>
                </div>
            </div>
        </div>
    );
}