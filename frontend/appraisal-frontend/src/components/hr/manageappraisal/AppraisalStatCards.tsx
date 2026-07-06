interface Props {
    total: number
    pending: number
    selfSubmitted: number
    managerReviewed: number
    approved: number
    acknowledged: number
}

export default function AppraisalStatCards({
    total, pending, selfSubmitted, managerReviewed, approved, acknowledged
}: Props) {
    const cards = [
        { label: 'Total',            value: total,           color: 'text-gray-800',  border: '#1089D3' },
        { label: 'Pending',          value: pending,         color: 'text-amber-600', border: '#EF9F27' },
        { label: 'Self Submitted',   value: selfSubmitted,   color: 'text-purple-600',border: '#7C3AED' },
        { label: 'Manager Reviewed', value: managerReviewed, color: 'text-[#1089D3]', border: '#1089D3' },
        { label: 'Approved',         value: approved,        color: 'text-green-600', border: '#639922' },
        { label: 'Acknowledged',     value: acknowledged,    color: 'text-gray-500',  border: '#9CA3AF' },
    ]

    return (
        <div className="grid grid-cols-6 gap-3">
            {cards.map(card => (
                <div
                    key={card.label}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                    style={{ borderLeft: `3px solid ${card.border}`, borderRadius: '0 12px 12px 0' }}
                >
                    <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                        {card.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                        {card.value}
                    </p>
                </div>
            ))}
        </div>
    )
}