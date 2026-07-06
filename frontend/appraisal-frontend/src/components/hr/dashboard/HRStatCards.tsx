interface Props {
    activeEmployees: number
    totalDepartments: number
    pendingApproval: number
    activeCycles: number
}

export default function HRStatCards({ activeEmployees, totalDepartments, pendingApproval, activeCycles }: Props) {
    const cards = [
        { label: 'Active Employees', value: activeEmployees,  color: 'text-gray-700' },
        { label: 'Departments',      value: totalDepartments, color: 'text-[#1089D3]' },
        { label: 'Pending Approval', value: pendingApproval,  color: 'text-orange-500' },
        { label: 'Active Cycles',    value: activeCycles,     color: 'text-green-600' },
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