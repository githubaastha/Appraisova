interface Props {
    deptName: string
    employeeCount: number  // ← add this
    onClose: () => void
    onConfirm: () => void
}

export default function DeleteDepartmentModal({ deptName, employeeCount, onClose, onConfirm }: Props) {
    const hasUsers = employeeCount > 0

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm flex flex-col gap-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Delete Department</p>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                {hasUsers ? (
                    // ← blocked state
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-red-600 font-medium">Cannot delete this department</p>
                        <p className="text-xs text-gray-500">
                            <span className="font-semibold text-gray-800">{deptName}</span> has{' '}
                            <span className="font-semibold text-red-500">{employeeCount} user{employeeCount !== 1 ? 's' : ''}</span> assigned.
                            Reassign or remove them before deleting this department.
                        </p>
                    </div>
                ) : (
                    // ← normal delete confirmation
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-gray-800">{deptName}</span>?
                        </p>
                        <p className="text-xs text-gray-400">This action cannot be undone.</p>
                    </div>
                )}

                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        {hasUsers ? 'Close' : 'Cancel'}
                    </button>
                    {!hasUsers && (
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}