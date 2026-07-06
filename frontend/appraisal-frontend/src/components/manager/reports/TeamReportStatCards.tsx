interface Props {
    teamMembers: number
    avgRating: number | null
    cycleName: string
}

export default function TeamReportStatCards({ teamMembers, avgRating, cycleName }: Props) {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Team Members</p>
                <p className="text-3xl font-bold mt-2 text-gray-700">{teamMembers}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Avg Rating</p>
                <p className="text-3xl font-bold mt-2 text-[#1089D3]">
                    {avgRating !== null ? avgRating.toFixed(1) : '—'}
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Cycle</p>
                <p className="text-sm font-semibold mt-3 text-gray-700">{cycleName}</p>
            </div>
        </div>
    )
}