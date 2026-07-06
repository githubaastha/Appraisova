import { useState, useEffect, useMemo } from 'react'
import HRSidebar from '../../components/HRSidebar'
import ScopeSelector from '../../components/hr/createappraisal/ScopeSelector'
import { getLoggedInUser } from '../../utils/auth'
import { getUsers } from '../../api/usersApi'
import { createBulkAppraisals } from '../../api/appraisalApi'
import type {
    UserResponseDTO,
    AppraisalsRequestDTO
} from '../../types'
import axios from 'axios';

type ScopeType = 'SINGLE' | 'DEPARTMENT' | 'ALL'
type CycleType = 'HALF_YEARLY' | 'ANNUAL' | ''
type Half = 'H1' | 'H2' | ''

type FiscalStartMonth = 1 | 4 // 1 = January (calendar year), 4 = April (Indian FY)

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

interface CycleDetails {
    cycleName: string
    startDate: string
    endDate: string
    displayDuration: string
}

export default function CreateAppraisal() {
    const { name, initials, role } = getLoggedInUser()
    const [users, setUsers] = useState<UserResponseDTO[]>([])
    const [loadingUsers, setLoadingUsers] = useState(true)

    const [scope, setScope] = useState<ScopeType>('SINGLE')

 
    const currentYear = new Date().getFullYear()
    const [fiscalStartMonth, setFiscalStartMonth] = useState<FiscalStartMonth>(4) // default: April (Indian FY)

    const today = new Date()
    const currentFiscalYear =
        (today.getMonth() + 1) >= fiscalStartMonth
            ? currentYear
            : currentYear - 1

    const [cycleType, setCycleType] = useState<CycleType>('')
    const [year, setYear] = useState<number | ''>('')
    const [half, setHalf] = useState<Half>('')

    const [employeeId, setEmployeeId] = useState<number | ''>('')
    const [department, setDepartment] = useState('')
    const [managerId, setManagerId] = useState<number | 'ALL' | ''>('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            setLoadingUsers(true)
            const data = await getUsers()
            setUsers(data.filter(u => u.isActive))
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingUsers(false)
        }
    }

    const appraisableUsers = users.filter(
        u =>
            u.role !== 'HR' &&
            u.managerId != null
    )
    const employees = appraisableUsers

    const managers = users.filter(
        u => u.role === 'MANAGER'
    )

    const selectedEmployee = appraisableUsers.find(
        u => u.userId === employeeId
    )

    const departments = [
        ...new Set(
            appraisableUsers
                .map(u => u.deptName ?? '')
                .filter(d => d !== '')
        )
    ]

    // current fiscal year + next 5 — future-only, so past (fiscal) years are never selectable
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentFiscalYear + i)

    const handleScopeChange = (newScope: ScopeType) => {
        setScope(newScope)
        setEmployeeId('')
        setDepartment('')
        setManagerId('')
        setError('')
    }

    const handleCycleTypeChange = (value: CycleType) => {
        setCycleType(value)
        setHalf('')
        setError('')
    }

    const handleFiscalStartChange = (value: FiscalStartMonth) => {
        setFiscalStartMonth(value)
      
        setHalf('')
        setError('')
    }

    // ---- derived: auto-generated cycle name + dates ----
    const cycleDetails: CycleDetails | null = useMemo(() => {
        if (!cycleType || !year) return null

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

    const affectedCount = (() => {
        if (scope === 'ALL') {
            return appraisableUsers.length
        }

        if (scope === 'DEPARTMENT') {
            return appraisableUsers.filter(
                u =>
                    u.deptName === department &&
                    (
                        managerId === 'ALL' ||
                        managerId === '' ||
                        u.managerId === managerId
                    )
            ).length
        }
        if (scope === 'SINGLE') {
            return employeeId ? 1 : 0
        }

        return 0
    })()

    // ---- validation ----
    const scopeIsValid =
        (scope === 'SINGLE' && employeeId !== '') ||
        (scope === 'DEPARTMENT' && department !== '' && affectedCount > 0) ||
        (scope === 'ALL' && affectedCount > 0)

    const cycleIsValid =
        !!cycleType &&
        year !== '' &&
        (cycleType !== 'HALF_YEARLY' || half !== '') &&
        cycleDetails !== null &&
        (year as number) >= currentFiscalYear

    const isFormValid = cycleIsValid && scopeIsValid

    const validationMessage = (() => {
        if (!cycleType) return 'Select a cycle type to continue.'
        if (year === '') return 'Select a year for the appraisal cycle.'
        if ((year as number) < currentFiscalYear) return 'Appraisal cycles cannot be created for a fiscal year that has already ended.'
        if (cycleType === 'HALF_YEARLY' && !half) return 'Select a half-year period.'
        if (scope === 'SINGLE' && !employeeId) return 'Select an employee.'
        if (scope === 'DEPARTMENT' && !department) return 'Select a department.'
        if (scope === 'DEPARTMENT' && affectedCount === 0) return 'No employees found for the selected department and manager.'
        return ''
    })()

    const handleSubmit = async () => {
        setError('')

        if (!cycleDetails) {
            setError('Complete the cycle configuration before creating.')
            return
        }

        if (!isFormValid) {
            setError(validationMessage || 'Please complete all required fields.')
            return
        }

        try {
            setSubmitting(true)

            const { cycleName, startDate, endDate } = cycleDetails
            let payload: AppraisalsRequestDTO[] = []

            if (scope === 'SINGLE') {
                const employee = appraisableUsers.find(
                    u => u.userId === employeeId
                )

                if (!employee) {
                    setError('Select employee')
                    return
                }

                payload.push({
                    cycleName,
                    cycleStartDate: startDate,
                    cycleEndDate: endDate,
                    employeeId: employee.userId,
                    managerId: employee.managerId!
                })
            }

            else if (scope === 'DEPARTMENT') {
                const deptEmployees = appraisableUsers.filter(
                    u =>
                        u.deptName === department &&
                        (
                            managerId === 'ALL' ||
                            managerId === '' ||
                            u.managerId === managerId
                        )
                )

                payload = deptEmployees.map(emp => ({
                    cycleName,
                    cycleStartDate: startDate,
                    cycleEndDate: endDate,
                    employeeId: emp.userId,
                    managerId: emp.managerId!
                }))
            }

            else if (scope === 'ALL') {
                const allEmployees = appraisableUsers

                payload = allEmployees.map(emp => ({
                    cycleName,
                    cycleStartDate: startDate,
                    cycleEndDate: endDate,
                    employeeId: emp.userId,
                    managerId: emp.managerId!
                }))
            }

            await createBulkAppraisals(payload)

            setSuccess(true)
            setError('')
        }  catch (err) {
    console.error(err);

    if (axios.isAxiosError(err)) {
        setError(err.response?.data || 'Failed to create appraisal');
    } else {
        setError('Failed to create appraisal');
    }
} finally {
    setSubmitting(false);
}
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <HRSidebar
                name={name}
                initials={initials}
                role={role}
                activePage="Create Appraisal"
            />

            {loadingUsers ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="pb-4 border-b pt-5 border-gray-200">
                        <h2 className="text-lg font-bold" style={{ color: '#111827' }}>Create Appraisal</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Start a new appraisal cycle</p>
                    </div>

                    {/* Scope Selector */}
                    <ScopeSelector activeScope={scope} onChange={handleScopeChange} />

                    {/* Cycle Configuration Card */}
                    <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                Cycle Configuration
                            </p>
                            {cycleDetails && (
                                <span className="text-[10px] font-medium text-[#1089D3] bg-blue-50 px-2.5 py-1 rounded-full">
                                    {cycleDetails.cycleName}
                                </span>
                            )}
                        </div>

                        {error && (
                            <p className="text-xs text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                                {error}
                            </p>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-500">Fiscal Year Starts</label>
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
                                <label className="text-xs font-medium text-gray-500">Cycle Type</label>
                                <select
                                    value={cycleType}
                                    onChange={(e) => handleCycleTypeChange(e.target.value as CycleType)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all bg-white"
                                >
                                    <option value="">Select cycle type</option>
                                    <option value="HALF_YEARLY">Half-Yearly</option>
                                    <option value="ANNUAL">Annual</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-500">
                                    {fiscalStartMonth === 1 ? 'Year' : 'Fiscal Year (Start Year)'}
                                </label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all bg-white"
                                >
                                    <option value="">Select year</option>
                                    {yearOptions.map(y => (
                                        <option key={y} value={y}>{fiscalYearLabel(y, fiscalStartMonth)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {cycleType === 'HALF_YEARLY' && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-500">Half</label>
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

                        {/* Read-only generated fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-500">Cycle Name</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 min-h-9.5 flex items-center">
                                    {cycleDetails?.cycleName ?? (
                                        <span className="text-gray-300">Auto-generated</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-500">Duration</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 min-h-9.5 flex items-center">
                                    {cycleDetails?.displayDuration ?? (
                                        <span className="text-gray-300">Auto-generated</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scope Details Card */}
                    <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-4">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            Appraisal Scope
                        </p>

                        {scope === 'SINGLE' && (
                            <>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-gray-500">Employee</label>
                                    <select
                                        value={employeeId}
                                        onChange={(e) => setEmployeeId(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all bg-white"
                                    >
                                        <option value="">Select employee</option>

                                        {employees.map(e => (
                                            <option key={e.userId} value={e.userId}>
                                                {e.firstName} {e.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-gray-500">
                                        Assigned Manager
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={selectedEmployee?.managerName ?? ''}
                                        placeholder="Manager will appear automatically"
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-700"
                                    />
                                </div>
                            </>
                        )}

                        {scope === 'DEPARTMENT' && (
                            <div className="grid gap-4">

                                {/* Department */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-gray-500">Department</label>
                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all bg-white"
                                    >
                                        <option value="">Select department</option>

                                        {departments.map(d => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Manager */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-gray-500">Manager</label>
                                    <select
                                        value={managerId}
                                        onChange={(e) => {
                                            const value = e.target.value

                                            if (value === '') {
                                                setManagerId('')
                                            } else if (value === 'ALL') {
                                                setManagerId('ALL')
                                            } else {
                                                setManagerId(Number(value))
                                            }
                                        }}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1089D3] transition-all bg-white"
                                    >
                                        <option value="">Select manager</option>
                                        <option value="ALL">All Managers</option>

                                        {managers.map(m => (
                                            <option key={m.userId} value={m.userId}>
                                                {m.firstName} {m.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        )}

                        {scope === 'ALL' && (
                            <p className="text-[10px] text-gray-400">
                                Every employee's review will go to their own assigned manager.
                            </p>
                        )}

                        {scope === 'DEPARTMENT' && department && (
                            affectedCount === 0 ? (
                                <p className="text-xs text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                                    No employees found for the selected department and manager.
                                </p>
                            ) : (
                                <p className="text-xs text-[#1089D3] bg-blue-50 px-4 py-2.5 rounded-lg">
                                    This cycle will be created for <strong>{affectedCount} employee{affectedCount !== 1 ? 's' : ''}</strong>.
                                </p>
                            )
                        )}

                        {scope === 'ALL' && (
                            <p className="text-xs text-[#1089D3] bg-blue-50 px-4 py-2.5 rounded-lg">
                                This cycle will be created for <strong>{affectedCount} employee{affectedCount !== 1 ? 's' : ''}</strong>.
                            </p>
                        )}
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-4">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            Summary
                        </p>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Cycle Name</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {cycleDetails?.cycleName ?? '—'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Cycle Type</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {cycleType === 'HALF_YEARLY' && 'Half-Yearly'}
                                    {cycleType === 'ANNUAL' && 'Annual'}
                                    {!cycleType && '—'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Duration</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {cycleDetails?.displayDuration ?? '—'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Employees Affected</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {affectedCount}
                                </span>
                            </div>
                        </div>

                        {!isFormValid && validationMessage && (
                            <p className="text-xs text-amber-600 bg-amber-50 px-4 py-2.5 rounded-lg">
                                {validationMessage}
                            </p>
                        )}

                        {!success ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!isFormValid || submitting}
                                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    !isFormValid || submitting
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#1089D3] text-white hover:bg-[#0e7abf]'
                                }`}
                            >
                                {submitting ? 'Creating…' : 'Create Appraisal'}
                            </button>
                        ) : (
                            <p className="text-xs text-green-600 bg-green-50 px-4 py-3 rounded-lg font-medium">
                                ✓ Appraisal cycle created successfully.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}