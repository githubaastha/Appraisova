import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ManagerSidebar from '../../components/ManagerSidebar'
import { getLoggedInUser } from '../../utils/auth'
import { getAppraisalsByEmployee, saveManagerReviewDraft, submitManagerReview, getAppraisalForManager } from '../../api/appraisalApi'
import type { ManagerAppraisalResponseDTO } from '../../types'
import Topbar from '@/components/Topbar'

export default function ReviewAppraisal() {
    const { employeeId } = useParams()
    const navigate = useNavigate()
    const { name, initials, role, managerId } = getLoggedInUser()

    const [managerStrengths, setManagerStrengths] = useState('')
    const [managerImprove, setManagerImprove] = useState('')
    const [managerComments, setManagerComments] = useState('')
    const [managerRating, setManagerRating] = useState<number | null>(null)
    const [hoveredRating, setHoveredRating] = useState<number | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [showSavedMessage, setShowSavedMessage] = useState(false)
    const [appraisal, setAppraisal] = useState<ManagerAppraisalResponseDTO | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                if (!employeeId) return
                const appraisals = await getAppraisalsByEmployee(Number(employeeId))
                const active = appraisals.find(
                    a => a.appraisalStatus === 'SELF_SUBMITTED' || a.appraisalStatus === 'MANAGER_DRAFT'
                ) ?? appraisals[0] ?? null
                if (!active) { setAppraisal(null); return }

                const detail = await getAppraisalForManager(active.appraisalId)
                setAppraisal(detail)
                setManagerStrengths(detail.managerStrengths ?? '')
                setManagerImprove(detail.managerImprove ?? '')
                setManagerComments(detail.managerComments ?? '')
                setManagerRating(detail.managerRating ?? null)
            } catch (err) {
                console.error(err)
                setError('Failed to load appraisal')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [employeeId])

    useEffect(() => {
        if (showSavedMessage) {
            const timer = setTimeout(() => setShowSavedMessage(false), 2500)
            return () => clearTimeout(timer)
        }
    }, [showSavedMessage])

    if (loading) return (
        <div className="flex min-h-screen bg-gray-50">
            <ManagerSidebar name={name} initials={initials} role={role} activePage="My Team" hasManager={!!managerId} />
            <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1089D3] rounded-full animate-spin" />
            </div>
        </div>
    )

    if (error) return (
        <div className="flex min-h-screen bg-gray-50">
            <ManagerSidebar name={name} initials={initials} role={role} activePage="My Team" hasManager={!!managerId} />
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-red-500">{error}</p>
            </div>
        </div>
    )

    if (!appraisal) return (
        <div className="flex min-h-screen bg-gray-50">
            <ManagerSidebar name={name} initials={initials} role={role} activePage="My Team" hasManager={!!managerId} />
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-400">No submitted appraisal found for this employee yet.</p>
            </div>
        </div>
    )

    const alreadyReviewed = appraisal.appraisalStatus === 'ACKNOWLEDGED'
        || appraisal.appraisalStatus === 'APPROVED'
        || appraisal.appraisalStatus === 'MANAGER_REVIEWED'

    const isLocked = alreadyReviewed || submitted

    const handleSaveDraft = async () => {
        setFormError(null)
        try {
            await saveManagerReviewDraft(appraisal.appraisalId, {
                managerStrengths,
                managerImprove,
                managerComments,
                managerRating
            })
            setShowSavedMessage(true)
        } catch (err) {
            console.error(err)
            setFormError('Failed to save draft. Please try again.')
        }
    }

    const handleSubmitReview = async () => {
        setFormError(null)
        if (!managerStrengths.trim()) return setFormError('Please fill in strengths')
        if (!managerImprove.trim()) return setFormError('Please fill in areas to improve')
        if (!managerComments.trim()) return setFormError('Please add comments')
        if (!managerRating) return setFormError('Please give a rating')

        try {
            await submitManagerReview(appraisal.appraisalId, {
                managerStrengths,
                managerImprove,
                managerComments,
                managerRating
            })
            setSubmitted(true)
        } catch (err) {
            console.error(err)
            setFormError('Failed to submit review. Please try again.')
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ManagerSidebar name={name} initials={initials} role={role} activePage="My Team" hasManager={!!managerId} />

            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-auto">
                <Topbar/>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: '#111827' }}>
                            {alreadyReviewed ? 'View Review' : 'Review Appraisal'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">{appraisal.cycleName}</p>
                    </div>
                    <button onClick={() => navigate('/manager/team')} className="text-xs text-[#1089D3] font-medium hover:underline">
                        ← Back to My Team
                    </button>
                </div>

                {/* Employee Self Assessment */}
                <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-4">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Employee Self Assessment</p>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-semibold text-gray-600">What Went Well</p>
                        <p className="text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">{appraisal.whatWentWell ?? '—'}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-semibold text-gray-600">What To Improve</p>
                        <p className="text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">{appraisal.whatToImprove ?? '—'}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-semibold text-gray-600">Achievements</p>
                        <p className="text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">{appraisal.achievements ?? '—'}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-semibold text-gray-600">Self Rating</p>
                        <div className="flex gap-1 text-xl">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={star <= (appraisal.selfRating ?? 0) ? 'text-[#1089D3]' : 'text-gray-200'}>★</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Manager Review Form */}
                <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-5">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        {alreadyReviewed ? 'Your Submitted Review' : 'Your Review'}
                    </p>

                    {formError && (
                        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                            <p className="text-xs text-red-600">{formError}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Strengths</label>
                        <textarea value={managerStrengths} onChange={(e) => setManagerStrengths(e.target.value)} disabled={isLocked} rows={3} placeholder="What did this employee do well this cycle?" className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#1089D3] disabled:bg-gray-50 disabled:text-gray-400 transition-all" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Areas to Improve</label>
                        <textarea value={managerImprove} onChange={(e) => setManagerImprove(e.target.value)} disabled={isLocked} rows={3} placeholder="What should this employee focus on improving?" className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#1089D3] disabled:bg-gray-50 disabled:text-gray-400 transition-all" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Comments</label>
                        <textarea value={managerComments} onChange={(e) => setManagerComments(e.target.value)} disabled={isLocked} rows={3} placeholder="Any additional comments..." className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#1089D3] disabled:bg-gray-50 disabled:text-gray-400 transition-all" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Manager Rating</label>
                        <div className="flex gap-2 items-center">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} disabled={isLocked} onClick={() => setManagerRating(star)} onMouseEnter={() => !isLocked && setHoveredRating(star)} onMouseLeave={() => !isLocked && setHoveredRating(null)} className="text-2xl transition-all disabled:cursor-not-allowed">
                                    {star <= (hoveredRating ?? managerRating ?? 0) ? '★' : '☆'}
                                </button>
                            ))}
                            {managerRating && <span className="text-xs text-gray-400 ml-2">{managerRating} out of 5</span>}
                        </div>
                    </div>

                    {!isLocked ? (
                        <div className="flex items-center gap-3">
                            <button onClick={handleSaveDraft} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-[#1089D3] text-[#1089D3] hover:bg-blue-50 transition-all">
                                Save Draft
                            </button>
                            <button onClick={handleSubmitReview} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all">
                                Submit Review
                            </button>
                            {showSavedMessage && (
                                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium animate-pulse">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    Draft saved
                                </span>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-green-600 bg-green-50 px-4 py-3 rounded-lg font-medium">
                            ✓ {alreadyReviewed ? 'This review has already been completed.' : 'Review submitted successfully.'}
                        </p>
                    )}
                </div>

            </div>
        </div>
    )
}