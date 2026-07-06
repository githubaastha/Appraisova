interface Props {
    teamSize: number
    activeReviews: number
    awaitingReview: number
    completed: number
}

export default function ManagerStatCards({ teamSize, activeReviews, awaitingReview, completed }: Props) {
    const cards = [
        { label: 'Team Size',         value: teamSize,       color: 'text-gray-700' },
        { label: 'Active Reviews',    value: activeReviews,  color: 'text-[#1089D3]' },
        { label: 'Awaiting My Review', value: awaitingReview, color: 'text-orange-500' },
        { label: 'Completed',         value: completed,      color: 'text-green-600' },
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