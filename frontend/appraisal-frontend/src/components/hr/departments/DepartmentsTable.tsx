import type { DepartmentResponseDTO } from '../../../types'

interface Props {
    departments: DepartmentResponseDTO[]
    employeeCountByDept: Record<string, number>
    onEdit: (dept: DepartmentResponseDTO) => void
    onDelete: (dept: DepartmentResponseDTO) => void
}

const DEPT_STYLES: Record<string, { bg: string; emoji: string }> = {
    Java:   { bg: '#E6F1FB', emoji: '🖥️' },
    Python: { bg: '#EAF3DE', emoji: '🐍' },
    DevOps: { bg: '#FAEEDA', emoji: '⚙️' },
    QA:     { bg: '#F3E8FF', emoji: '🧪' },
}

function getDeptStyle(name: string) {
    return DEPT_STYLES[name] ?? { bg: '#F3F4F6', emoji: '🏢' }
}

export default function DepartmentsTable({ departments, employeeCountByDept, onEdit, onDelete }: Props) {
    if (departments.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center">
                <p className="text-sm text-gray-400">No departments found</p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3 w-10">#</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Department</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Description</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Employees</th>
                        <th className="text-left text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map((dept, index) => {
                        const style    = getDeptStyle(dept.deptName)
                        const empCount = employeeCountByDept[dept.deptName] ?? 0

                        return (
                            <tr key={dept.deptId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">

                                {/* # */}
                                <td className="px-6 py-4 text-xs text-gray-400">{index + 1}</td>

                                {/* Department */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                            style={{ background: style.bg }}
                                        >
                                            {style.emoji}
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">{dept.deptName}</span>
                                    </div>
                                </td>

                                {/* Description */}
                                <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">
                                    {dept.deptDescription
                                        ? dept.deptDescription
                                        : <span className="text-gray-300 italic">No description</span>
                                    }
                                </td>

                                {/* Employee count */}
                                <td className="px-6 py-4">
                                    <span
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: '#E6F1FB', color: '#1089D3' }}
                                    >
                                        {empCount} {empCount === 1 ? 'member' : 'members'}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEdit(dept)}
                                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#1089D3] hover:bg-blue-50 hover:border-[#1089D3] transition-all"
                                            title="Edit"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(dept)}
                                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-300 transition-all"
                                            title="Delete"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}