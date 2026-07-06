import { useState, useEffect } from "react";
import HRSidebar from "../../components/HRSidebar";
import DepartmentsTable from "../../components/hr/departments/DepartmentsTable";
import AddDepartmentModal from "../../components/hr/departments/AddDepartmentModal";
import EditDepartmentModal from "../../components/hr/departments/EditDepartmentModal";
import DeleteDepartmentModal from "../../components/hr/departments/DeleteDepartmentModal";

import { getUsers } from "../../api/usersApi";
import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "../../api/departmentApi";

import type {
    UserResponseDTO,
    DepartmentResponseDTO,
} from "../../types";

import { getLoggedInUser } from '../../utils/auth'


export default function Departments() {
    const { name, initials, role } = getLoggedInUser()


    const [departments, setDepartments] = useState<DepartmentResponseDTO[]>([]);
    const [users, setUsers] = useState<UserResponseDTO[]>([]);
    const [search, setSearch] = useState("");

    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState<DepartmentResponseDTO | null>(null);
    const [deleting, setDeleting] = useState<DepartmentResponseDTO | null>(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData(true);
    }, []);

    async function loadData(isInitialLoad = false) {
        try {
            if (isInitialLoad) setLoading(true)

            const [departmentData, userData] = await Promise.all([
                getDepartments(),
                getUsers(),
            ])

            setDepartments(departmentData)
            setUsers(userData)
        } catch (error) {
            console.error("Failed to load data:", error)
        } finally {
            if (isInitialLoad) setLoading(false)
        }
    }

    const employeeCountByDept = users.reduce(
        (acc: Record<string, number>, user) => {
            if (user.deptName) {
                acc[user.deptName] = (acc[user.deptName] || 0) + 1;
            }
            return acc;
        },
        {}
    );

    const filtered = departments.filter(
        (d) =>
            d.deptName.toLowerCase().includes(search.toLowerCase()) ||
            (d.deptDescription ?? "")
                .toLowerCase()
                .includes(search.toLowerCase())
    );

    async function handleAdd(data: {
        deptName: string;
        deptDescription: string;
    }) {
        try {
            await createDepartment(data);
            await loadData();
            setShowAdd(false);
        } catch (error) {
            console.error("Failed to create department:", error);
        }
    }

    async function handleEdit(data: {
        deptName: string;
        deptDescription: string;
    }) {
        if (!editing) return;

        try {
            await updateDepartment(editing.deptId, data);
            await loadData();
            setEditing(null);
        } catch (error) {
            console.error("Failed to update department:", error);
        }
    }

    async function handleDelete() {
        if (!deleting) return;

        try {
            await deleteDepartment(deleting.deptId);
            await loadData();
            setDeleting(null);
        } catch (error) {
            console.error("Failed to delete department:", error);
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <HRSidebar
                name={name}
                initials={initials}
                role={role}
                activePage="Departments"
            />

            {showAdd && (
                <AddDepartmentModal
                    onClose={() => setShowAdd(false)}
                    onSave={handleAdd}
                />
            )}

            {editing && (
                <EditDepartmentModal
                    department={editing}
                    onClose={() => setEditing(null)}
                    onSave={handleEdit}
                />
            )}

            {deleting && (
                <DeleteDepartmentModal
                    deptName={deleting.deptName}
                    employeeCount={employeeCountByDept[deleting.deptName] ?? 0}
                    onClose={() => setDeleting(null)}
                    onConfirm={handleDelete}
                />
            )}
            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">

                {/* Header */}
                <div className="flex items-center justify-between pb-3 pt-5 border-b border-gray-200">
                    <div>
                        <h2
                            className="text-sm font-semibold leading-none"
                            style={{ color: "#111827" }}
                        >
                            Departments
                        </h2>

                        <p className="text-gray-400 text-xs mt-1">
                            Manage all departments
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                            />
                        </svg>

                        Add Department
                    </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>

                        <input
                            type="text"
                            placeholder="Search department..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1089D3] focus:ring-1 focus:ring-[#1089D3] transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            {search ? 'No departments match your search' : 'No departments yet'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {search ? 'Try a different search term' : 'Click "Add Department" to create your first one'}
                        </p>
                    </div>
                ) : (
                    <DepartmentsTable
                        departments={filtered}
                        employeeCountByDept={employeeCountByDept}
                        onEdit={setEditing}
                        onDelete={setDeleting}
                    />
                )}
            </div>
        </div>
    );
}