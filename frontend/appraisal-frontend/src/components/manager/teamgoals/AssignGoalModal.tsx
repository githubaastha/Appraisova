import { useState } from "react";
interface Employee {
    employeeId: number;
    name: string;
}
interface Props {
    employees: Employee[]
    cycleName: string
    cycles: string[]
    assigning: boolean
    onClose: () => void
    onAssign: (data: {
        employeeId: number | 'ALL'
        title: string
        description: string
        dueDate: string
        cycleName: string
    }) => void
}

export default function AssignGoalModal({
    employees,
    cycleName,
    cycles,
    assigning,
    onClose,
    onAssign
}: Props) {
    const [employeeId, setEmployeeId] = useState<number | 'ALL'>('ALL')
    const [selectedCycle, setSelectedCycle] = useState(cycleName)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = () => {

        if (!title.trim()) return setError('Goal title cannot be empty')
        if (!description.trim()) return setError('Description cannot be empty')
        if (!dueDate) return setError('Please select a due date')
        if (!selectedCycle) return setError('Please select a cycle')

        onAssign({ employeeId, title, description, dueDate, cycleName: selectedCycle })
        onClose()
    }


    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4 shadow-lg">

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Assign New Goal</p>
                        <p className="text-xs text-gray-400 mt-0.5">{selectedCycle}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                {error && <p className="text-xs text-red-500">{error}</p>}

                {/* Cycle Dropdown */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">
                        Cycle
                    </label>

                    <select
                        value={selectedCycle}
                        onChange={(e) => setSelectedCycle(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all"
                    >
                        {cycles.length > 0 ? (
                            cycles.map((cycle) => (
                                <option key={cycle} value={cycle}>
                                    {cycle}
                                </option>
                            ))
                        ) : (
                            <option value="">No cycles available</option>
                        )}
                    </select>
                </div>

                {/* Employee Dropdown */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">Employee</label>
                    <select
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all"
                    >
                        <option value="ALL">All Employees</option>
                        {employees.map(emp => (
                            <option key={emp.employeeId} value={emp.employeeId}>{emp.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">Goal Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Complete API documentation"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe the goal in detail..."
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#1089D3] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">Due Date</label>
                    <input
                        type="date"
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all"
                    />
                </div>

                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={assigning}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {assigning ? "Assigning..." : "Assign Goal"}
                    </button>
                </div>

            </div>
        </div>
    )
}