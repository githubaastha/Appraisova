interface Props {
    completed: number
    inProgress: number
    notStarted: number
    submitted: number
    total: number
}

export default function GoalsPieChart({ completed, inProgress, notStarted, submitted, total }: Props) {

    if (total === 0) return null

    const data = [
        { label: 'Completed',   value: completed,  color: '#1089D3' },
        { label: 'In Progress', value: inProgress, color: '#12B1D1' },
        { label: 'Submitted',   value: submitted,  color: '#38bdf8' },
        { label: 'Not Started', value: notStarted, color: '#e2e8f0' },
    ]

    const radius = 32
    const cx = 40
    const cy = 40
    const circumference = 2 * Math.PI * radius
    let cumulativePercent = 0

    function getSlice(value: number) {
        const percent = value / total
        const strokeDasharray = `${percent * circumference} ${circumference}`
        const strokeDashoffset = -cumulativePercent * circumference
        cumulativePercent += percent
        return { strokeDasharray, strokeDashoffset }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-6 flex flex-col gap-4">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Goals Overview
            </p>
            <div className="flex items-center  gap-15">
                <div className="relative shrink-0 px-10">
                    <svg width="90" height="90" viewBox="0 0 80 80">
                        {data.map((item) => {
                            const { strokeDasharray, strokeDashoffset } = getSlice(item.value)
                            return (
                                <circle
                                    key={item.label}
                                    cx={cx}
                                    cy={cy}
                                    r={radius}
                                    fill="none"
                                    stroke={item.color}
                                    strokeWidth="14"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
                                />
                            )
                        })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-lg font-bold text-gray-800">{total}</p>
                        <p className="text-[10px] text-gray-400">Goals</p>
                    </div>
                </div>

                <div className="flex flex-col  w-35">
                    {data.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <p className="text-xs text-gray-500">{item.label}</p>
                            </div>
                            <p className="text-xs font-semibold text-gray-700">{item.value} / {total}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}