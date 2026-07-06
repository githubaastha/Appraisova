import { useState, useEffect, useMemo } from 'react'
import { getUsers } from '../../../api/usersApi'
import type { UserResponseDTO } from '../../../types'

type FiscalStartMonth = 1 | 4
type CycleType = 'HALF_YEARLY' | 'ANNUAL' | ''
type Half = 'H1' | 'H2' | ''

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const pad = (n: number) => String(n).padStart(2, '0')

const toISODate = (year: number, month: number, day: number) =>
    `${year}-${pad(month)}-${pad(day)}`

const lastDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 0).getDate()

const formatDisplayDate = (iso: string) => {
    if (!iso) return ''
    const [y, m, d] = iso.split('-').map(Number)
    return `${pad(d)}-${MONTHS[m - 1]}-${y}`
}

const resolveFiscalMonth = (fyYear: number, fiscalStartMonth: FiscalStartMonth, offset: number) => {
    const absoluteMonthIndex = (fiscalStartMonth - 1) + offset
    const year = fyYear + Math.floor(absoluteMonthIndex / 12)
    const month = (absoluteMonthIndex % 12) + 1
    return { year, month }
}

const periodLabel = (fiscalStartMonth: FiscalStartMonth, startOffset: number, endOffset: number) => {
    const startName = MONTHS[(fiscalStartMonth - 1 + startOffset) % 12]
    const endName = MONTHS[(fiscalStartMonth - 1 + endOffset) % 12]
    return `${startName} - ${endName}`
}

const HALF_OFFSETS: Record<Exclude<Half, ''>, [number, number]> = {
    H1: [0, 5],
    H2: [6, 11]
}

const halfLabels = (fiscalStartMonth: FiscalStartMonth): Record<Exclude<Half, ''>, string> => ({
    H1: `H1 (${periodLabel(fiscalStartMonth, ...HALF_OFFSETS.H1)})`,
    H2: `H2 (${periodLabel(fiscalStartMonth, ...HALF_OFFSETS.H2)})`
})

const fiscalYearLabel = (fyYear: number, fiscalStartMonth: FiscalStartMonth) =>
    fiscalStartMonth === 1 ? `${fyYear}` : `${fyYear}-${String(fyYear + 1).slice(-2)}`

/**
 * Reverse-engineers {cycleType, year, half, fiscalStartMonth} from an existing
 * cycle's start date, since that's not stored separately. The start month alone
 * is enough to uniquely identify the pattern, given only two supported fiscal
 * start months (Jan=1, Apr=4):
 *   month 1  -> Jan-start, H1     month 7  -> Jan-start, H2
 *   month 4  -> Apr-start, H1     month 10 -> Apr-start, H2
 * Annual always starts in month 1 or 4 directly.
 * Falls back to a sensible default (April-start Annual) for anything else,
 * e.g. leftover data from before Quarterly was removed.
 */
function inferCycleConfig(startDateISO: string, endDateISO: string): {
    cycleType: CycleType
    year: number
    half: Half
    fiscalStartMonth: FiscalStartMonth
} {
    const [startYear, startMonth] = startDateISO.split('-').map(Number)
    const [endYear, endMonth] = endDateISO.split('-').map(Number)
    const monthSpan = (endYear - startYear) * 12 + (endMonth - startMonth) + 1

    if (monthSpan >= 11 && (startMonth === 1 || startMonth === 4)) {
        return { cycleType: 'ANNUAL', year: startYear, half: '', fiscalStartMonth: startMonth as FiscalStartMonth }
    }

    const halfMap: Record<number, { fsm: FiscalStartMonth; half: Half }> = {
        1: { fsm: 1, half: 'H1' },
        7: { fsm: 1, half: 'H2' },
        4: { fsm: 4, half: 'H1' },
        10: { fsm: 4, half: 'H2' }
    }

    if (halfMap[startMonth]) {
        const { fsm, half } = halfMap[startMonth]
        return { cycleType: 'HALF_YEARLY', year: startYear, half, fiscalStartMonth: fsm }
    }

    // fallback for anything unrecognized (e.g. legacy Quarterly-era data)
    return { cycleType: 'ANNUAL', year: startYear, half: '', fiscalStartMonth: 4 }
}

interface AppraisalRow {
    appraisalId: number
    employeeName: string
    department: string
    managerName: string
    managerId: number
    cycleName: string
    cycleStartDate: string
    cycleEndDate: string
    status: string
    createdAt: string
}

interface Props {
    appraisal: AppraisalRow
    onClose: () => void
    onSave: (payload: {
        cycleName: string
        cycleStartDate: string
        cycleEndDate: string
        managerId: number
    }) => Promise<void>
}

export default function EditAppraisalModal({ appraisal, onClose, onSave }: Props) {
    const initial = inferCycleConfig(appraisal.cycleStartDate, appraisal.cycleEndDate)

    const [fiscalStartMonth, setFiscalStartMonth] = useState<FiscalStartMonth>(initial.fiscalStartMonth)
    const [cycleType, setCycleType] = useState<CycleType>(initial.cycleType)
    const [year, setYear] = useState<number>(initial.year)
    const [half, setHalf] = useState<Half>(initial.half)
    const [managerId, setManagerId] = useState<number>(appraisal.managerId)
    const [managers, setManagers] = useState<UserResponseDTO[]>([])
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        getUsers()
            .then(data => setManagers(data.filter(u => u.role === 'MANAGER' && u.isActive)))
            .catch(err => console.error('Failed to load managers:', err))
    }, [])

    const yearOptions = Array.from({ length: 8 }, (_, i) => initial.year - 2 + i)

    const handleCycleTypeChange = (value: CycleType) => {
        setCycleType(value)
        setHalf('')
    }

    const handleFiscalStartChange = (value: FiscalStartMonth) => {
        setFiscalStartMonth(value)
        setHalf('')
    }

    const cycleDetails = useMemo(() => {
        if (!cycleType) return null

        let startOffset: number
        let endOffset: number
        let label: string

        if (cycleType === 'HALF_YEARLY') {
            if (!half) return null
            ;[startOffset, endOffset] = HALF_OFFSETS[half]
            label = half
        } else {
            startOffset = 0
            endOffset = 11
            label = 'Annual'
        }

        const start = resolveFiscalMonth(year, fiscalStartMonth, startOffset)
        const end = resolveFiscalMonth(year, fiscalStartMonth, endOffset)

        const startDate = toISODate(start.year, start.month, 1)
        const endDate = toISODate(end.year, end.month, lastDayOfMonth(end.year, end.month))

        return {
            cycleName: `FY ${fiscalYearLabel(year, fiscalStartMonth)} ${label}`,
            startDate,
            endDate,
            displayDuration: `${formatDisplayDate(startDate)}  →  ${formatDisplayDate(endDate)}`
        }
    }, [cycleType, year, half, fiscalStartMonth])

    const isValid = !!cycleType && (cycleType !== 'HALF_YEARLY' || !!half) && cycleDetails !== null

    const handleSubmit = async () => {
        if (!cycleDetails) return setError('Complete the cycle configuration')

        try {
            setSaving(true)
            setError('')
            await onSave({
                cycleName: cycleDetails.cycleName,
                cycleStartDate: cycleDetails.startDate,
                cycleEndDate: cycleDetails.endDate,
                managerId
            })
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to update appraisal')
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md flex flex-col gap-4 shadow-lg max-h-[85vh] overflow-auto">

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Edit Appraisal Cycle</p>
                        <p className="text-xs text-gray-400 mt-0.5">{appraisal.employeeName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-700 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                {error && (
                    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">Fiscal Year Starts</label>
                    <select
                        value={fiscalStartMonth}
                        onChange={(e) => handleFiscalStartChange(Number(e.target.value) as FiscalStartMonth)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all bg-white"
                    >
                        <option value={1}>January (Calendar Year)</option>
                        <option value={4}>April (Indian Financial Year)</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-700">Cycle Type</label>
                        <select
                            value={cycleType}
                            onChange={(e) => handleCycleTypeChange(e.target.value as CycleType)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all bg-white"
                        >
                            <option value="HALF_YEARLY">Half-Yearly</option>
                            <option value="ANNUAL">Annual</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-700">
                            {fiscalStartMonth === 1 ? 'Year' : 'Fiscal Year (Start Year)'}
                        </label>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all bg-white"
                        >
                            {yearOptions.map(y => (
                                <option key={y} value={y}>{fiscalYearLabel(y, fiscalStartMonth)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {cycleType === 'HALF_YEARLY' && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-700">Half</label>
                        <select
                            value={half}
                            onChange={(e) => setHalf(e.target.value as Half)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all bg-white"
                        >
                            <option value="">Select half</option>
                            {(Object.keys(HALF_OFFSETS) as Array<Exclude<Half, ''>>).map(h => (
                                <option key={h} value={h}>{halfLabels(fiscalStartMonth)[h]}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500">Cycle Name</label>
                        <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 min-h-9.5 flex items-center">
                            {cycleDetails?.cycleName ?? <span className="text-gray-300">—</span>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500">Duration</label>
                        <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 min-h-9.5 flex items-center">
                            {cycleDetails?.displayDuration ?? <span className="text-gray-300">—</span>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">Manager</label>
                    <select
                        value={managerId}
                        onChange={(e) => setManagerId(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all bg-white"
                    >
                        {managers.map(m => (
                            <option key={m.userId} value={m.userId}>
                                {m.firstName} {m.lastName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg border text-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !isValid}
                        className={`flex-1 py-2 rounded-lg text-white transition-all ${
                            saving || !isValid ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#1089D3] hover:bg-[#0e7abf]'
                        }`}
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}