interface Props {
    goalTitle: string
    onClose: () => void
    onConfirm: (status: 'COMPLETED' | 'NOT_COMPLETED') => void
}

export default function ReviewGoalModal({ goalTitle, onClose, onConfirm }: Props) {
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4 shadow-lg">

                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Review: {goalTitle}</p>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium text-gray-400">Employee's response</p>
                    <p className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Marked as completed
                    </p>
                </div>

                <p className="text-xs text-gray-500">Confirm the final status for this goal:</p>

                <div className="flex gap-3 pt-1">
                    <button
                        onClick={() => onConfirm('COMPLETED')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Mark Completed
                    </button>
                    <button
                        onClick={() => onConfirm('NOT_COMPLETED')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Not Completed
                    </button>
                </div>

            </div>
        </div>
    )
}