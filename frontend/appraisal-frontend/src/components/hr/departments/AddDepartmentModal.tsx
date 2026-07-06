import { useState } from "react";

interface Props {
    onClose: () => void;
    onSave: (data: {
        deptName: string;
        deptDescription: string;
    }) => void;
}

export default function AddDepartmentModal({ onClose, onSave }: Props) {
    const [deptName, setDeptName] = useState("");
    const [deptDescription, setDeptDescription] = useState("");
    const [error, setError] = useState("");

    function handleSave() {
        if (!deptName.trim()) {
            setError("Department name is required.");
            return;
        }

        onSave({
            deptName: deptName.trim(),
            deptDescription: deptDescription.trim(),
        });

        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4 shadow-lg">

                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">
                        Add Department
                    </p>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">
                        Department Name
                        <span className="text-red-400">*</span>
                    </label>

                    <input
                        type="text"
                        value={deptName}
                        onChange={(e) => {
                            setDeptName(e.target.value);
                            setError("");
                        }}
                        placeholder="e.g. Engineering"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] focus:ring-1 focus:ring-[#1089D3]"
                    />

                    {error && (
                        <p className="text-[11px] text-red-500">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500">
                        Description
                        <span className="text-gray-300"> (optional)</span>
                    </label>

                    <textarea
                        value={deptDescription}
                        onChange={(e) => setDeptDescription(e.target.value)}
                        rows={3}
                        placeholder="Brief description..."
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#1089D3] focus:ring-1 focus:ring-[#1089D3]"
                    />
                </div>

                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf]"
                    >
                        Add Department
                    </button>
                </div>

            </div>
        </div>
    );
}