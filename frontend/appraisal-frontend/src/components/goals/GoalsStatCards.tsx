

interface Props {
    total: number
    completed: number
    inProgress: number
    notStarted: number
}

export default function GoalsStatCards({ total, completed, inProgress, notStarted }: Props) {
    const cards = [
        { label: 'Total Goals',  value: total,      color: 'text-gray-700' },
        { label: 'Completed',    value: completed,  color: 'text-[#1089D3]' },
        { label: 'In Progress',  value: inProgress, color: 'text-cyan-600' },
        { label: 'Not Started',  value: notStarted, color: 'text-gray-400' },
    ]

    return (
        <div className="grid grid-cols-4 gap-4">
            {cards.map(card => (
                <div
                    key={card.label}
                    className="bg-white border border-gray-200 rounded-xl px-5 py-4"
                >
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