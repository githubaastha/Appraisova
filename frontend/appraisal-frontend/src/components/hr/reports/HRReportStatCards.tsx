interface Props {
    totalEmployees: number
    completionRate: number
    inProgress: number
    approvedRatio: string
}

export default function HRReportStatCards({ totalEmployees, completionRate, inProgress, approvedRatio }: Props) {
    const cards = [
        { label: 'Total Employees', value: totalEmployees,        color: 'text-gray-700' },
        { label: 'Completed',       value: `${completionRate}%`,  color: 'text-green-600' },
        { label: 'In Progress',     value: inProgress,            color: 'text-[#1089D3]' },
        { label: 'Approved',        value: approvedRatio,         color: 'text-purple-600' },
    ]

    return (
        <div className="grid grid-cols-4 gap-4">
            {cards.map(card => (
                <div key={card.label} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        {card.label}
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${card.color}`}>
                        {card.value}
                    </p>
                </div>
            ))}
        </div>
    )
}