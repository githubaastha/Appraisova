interface Props {
    ratings: (number | null)[]
}

export default function RatingDistributionChart({ ratings }: Props) {
    const validRatings = ratings.filter((r): r is number => r !== null)
    const total = validRatings.length

    const counts = [1, 2, 3, 4, 5].map(star => ({
        star,
        count: validRatings.filter(r => r === star).length,
    }))

    const maxCount = Math.max(...counts.map(c => c.count), 1)

    const average =
        total > 0
            ? (validRatings.reduce((a, b) => a + b, 0) / total).toFixed(1)
            : "0"

    if (total === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center">
                <p className="text-sm text-gray-400">
                    No ratings given yet for this cycle
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
                        Rating Distribution
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        Average Rating{" "}
                        <span className="font-semibold text-gray-700">
                            {average}
                        </span>
                    </p>
                </div>

                <span className="text-sm text-gray-400">
                    {total} {total === 1 ? "rating" : "ratings"}
                </span>
            </div>

            {/* Chart */}
            <div className="relative h-44">

                {/* Bottom axis */}
                <div className="absolute bottom-6 left-0 right-0 border-t border-gray-200"></div>

                <div className="flex justify-around items-end h-full pb-6">

                    {counts.map(({ star, count }) => {

                        const height =
                            count === 0
                                ? 4
                                : (count / maxCount) * 110

                        return (
                            <div
                                key={star}
                                className="flex flex-col items-center"
                            >

                                {/* Show count only if > 0 */}
                                <div className="h-5 flex items-center justify-center">
                                    {count > 0 && (
                                        <span className="text-xs font-semibold text-gray-700">
                                            {count}
                                        </span>
                                    )}
                                </div>

                                {/* Bar */}
                                <div className="h-28 flex items-end">
                                    <div
                                        className={`w-12 rounded-t-lg transition-all duration-300 ${
                                            count > 0
                                                ? "bg-[#1089D3]"
                                                : "bg-gray-200"
                                        }`}
                                        style={{
                                            height: `${height}px`,
                                        }}
                                    />
                                </div>

                                {/* Label */}
                                <span className="mt-3 text-xs text-gray-500">
                                    {star}
                                    <span className="text-[#1089D3] ml-0.5">
                                        ★
                                    </span>
                                </span>

                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}