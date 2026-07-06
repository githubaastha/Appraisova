
import type { AppraisalsByManagerDTO, GoalResponseDTO } from '../../../types'
import { useNavigate } from 'react-router-dom'

interface Props {
    appraisals: AppraisalsByManagerDTO[]
    goals: GoalResponseDTO[]
    onConfirmGoal: (goal: GoalResponseDTO) => void

}


function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

function daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

type PriorityItem =
     | { type: 'APPRAISAL'; id: number; employeeName: string; cycleName: string; days: number; employeeId: number; status: string }
    | { type: 'GOAL';  id: number; employeeName: string; title: string; dueDate: string; days: number; employeeId: number; overdue: boolean }

export default function ActionRequired({ appraisals, goals, onConfirmGoal }: Props) {
    const navigate = useNavigate()


    // build priority items
    const items: PriorityItem[] = [

        ...appraisals
            .filter(a => a.appraisalStatus === 'SELF_SUBMITTED' || a.appraisalStatus === 'MANAGER_DRAFT')
            .map(a => ({
                type: 'APPRAISAL' as const,
                id: a.appraisalId,
                employeeName: a.employeeName,
                cycleName: a.cycleName,
                days: daysUntil(a.cycleEndDate),
                employeeId: a.employeeId,
                status: a.appraisalStatus
            })),

        // goals needing confirmation
        ...goals
            .filter(g => g.status === 'EMPLOYEE_SUBMITTED')
            .map(g => ({
                type: 'GOAL' as const,
                id: g.goalId,
                employeeName: g.employeeName,
                title: g.title,
                dueDate: g.dueDate,
                days: daysUntil(g.dueDate),
                employeeId: g.employeeId,
                overdue: daysUntil(g.dueDate) < 0
            })),

    ]

    // sort by urgency: overdue first, then by days ascending
    items.sort((a, b) => {
        const daysA = a.type === 'APPRAISAL' ? a.days : a.days
        const daysB = b.type === 'APPRAISAL' ? b.days : b.days
        return daysA - daysB
    })

    const appraisalCount = items.filter(i => i.type === 'APPRAISAL').length
    const goalCount = items.filter(i => i.type === 'GOAL').length


    function getPriorityDot(days: number) {
        if (days < 0) return 'bg-red-500'
        if (days <= 2) return 'bg-red-400'
        if (days <= 5) return 'bg-orange-400'
        return 'bg-yellow-400'
    }

    function getDayLabel(days: number) {
        if (days < 0) return `Overdue by ${Math.abs(days)}d`
        if (days === 0) return 'Due today'
        if (days === 1) return 'Due tomorrow'
        return `${days}d left`
    }

    function getDayColor(days: number) {
        if (days < 0) return 'text-red-500'
        if (days <= 2) return 'text-red-500'
        if (days <= 5) return 'text-orange-500'
        return 'text-yellow-600'
    }

    return (

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        Needs Your Attention
                    </p>
                    <div className="flex items-center gap-3">
                        {appraisalCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#1089D3] bg-blue-50 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1089D3]" />
                                {appraisalCount} Appraisal{appraisalCount > 1 ? 's' : ''}
                            </span>
                        )}
                        {goalCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                {goalCount} Goal{goalCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                    {items.length} item{items.length !== 1 ? 's' : ''} require your attention
                </p>
            </div>

            {/* Empty state */}
            {items.length === 0 ? (
                <div className="px-6 py-12 flex flex-col items-center gap-2">
                  
                    <p className="text-sm font-semibold text-gray-700">Great work!</p>
                    <p className="text-xs text-gray-400 text-center">
                        No pending reviews. All appraisals and goals are up to date.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-gray-50">
                    {items.map((item, idx) => (
                        <div key={`${item.type}-${item.id}-${idx}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-all">

                            {/* Left — avatar + info */}
                            <div className="flex items-center gap-3">
                                {/* Priority dot */}
                                <div className={`w-2 h-2 rounded-full shrink-0 ${getPriorityDot(item.days)}`} />

                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full bg-[#1089D3] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                    {getInitials(item.employeeName)}
                                </div>

                                {/* Info */}
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-800">{item.employeeName}</p>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${item.type === 'APPRAISAL'
                                                ? 'bg-blue-50 text-[#1089D3]'
                                                : 'bg-orange-50 text-orange-500'
                                            }`}>
                                            {item.type === 'APPRAISAL' ? 'APPRAISAL' : 'GOAL'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {item.type === 'APPRAISAL'
                                            ? `${item.cycleName} · ${item.status === 'MANAGER_DRAFT' ? 'Draft in progress' : 'Self Assessment Submitted'}`
                                            : `${item.title} · Due ${formatDate(item.dueDate)}`
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Right — day label + button */}
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-semibold ${getDayColor(item.days)}`}>
                                    {item.type === 'APPRAISAL' ? 'Awaiting review' : getDayLabel(item.days)}
                                </span>
                                <button
                                    onClick={() => {
                                        if (item.type === 'APPRAISAL') {
                                            navigate(`/manager/review/${item.employeeId}`)
                                        } else {
                                            onConfirmGoal(goals.find(g => g.goalId === item.id)!)
                                        }
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all whitespace-nowrap"
                                >
                                    {item.type === 'APPRAISAL' ? 'Review Self Assessment' : 'Approve Goal'}
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}