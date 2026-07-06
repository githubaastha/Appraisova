import { useState, useEffect } from 'react'
import { saveSelfAssessmentDraft, submitSelfAssessment } from '../../api/appraisalApi'

type AppraisalStatus =
    | 'PENDING'
    | 'EMPLOYEE_DRAFT'
    | 'SELF_SUBMITTED'
    | 'MANAGER_DRAFT'
    | 'MANAGER_REVIEWED'
    | 'APPROVED'
    | 'ACKNOWLEDGED'

interface Props {
    appraisalId: number
    status: AppraisalStatus
    initialData?: {
        whatWentWell: string
        whatToImprove: string
        achievements: string
        selfRating: number | null
    }
    onStatusChange?: (
        newStatus: AppraisalStatus,
        data?: {
            whatWentWell: string
            whatToImprove: string
            achievements: string
            selfRating: number | null
        }
    ) => void
}

const MAX_CHARS = 500

export default function SelfAssessmentForm({ appraisalId, status, initialData, onStatusChange }: Props) {
    const [whatWentWell, setWhatWentWell]     = useState(initialData?.whatWentWell || '')
    const [whatToImprove, setWhatToImprove]   = useState(initialData?.whatToImprove || '')
    const [achievements, setAchievements]     = useState(initialData?.achievements || '')
    const [selfRating, setSelfRating]         = useState<number | null>(initialData?.selfRating || null)
    const [hoveredRating, setHoveredRating]   = useState<number | null>(null)
    const [showSavedMessage, setShowSavedMessage] = useState(false)
    const [saving, setSaving] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // sync when initialData loads from API
    useEffect(() => {
        if (initialData) {
            setWhatWentWell(initialData.whatWentWell || '')
            setWhatToImprove(initialData.whatToImprove || '')
            setAchievements(initialData.achievements || '')
            setSelfRating(initialData.selfRating || null)
        }
    }, [initialData])

    const canEdit = status === 'PENDING' || status === 'EMPLOYEE_DRAFT'

    const filledFields = [
        whatWentWell.trim().length > 0,
        whatToImprove.trim().length > 0,
        achievements.trim().length > 0,
        selfRating !== null,
    ].filter(Boolean).length

    useEffect(() => {
        if (showSavedMessage) {
            const timer = setTimeout(() => setShowSavedMessage(false), 2500)
            return () => clearTimeout(timer)
        }
    }, [showSavedMessage])

    const handleSaveDraft = async () => {
        if (saving || submitting) return

        setSaving(true)
        try {
            await saveSelfAssessmentDraft(appraisalId, {
                whatWentWell,
                whatToImprove,
                achievements,
                selfRating
            })
            setShowSavedMessage(true)
        } catch (err) {
            console.error(err)
            alert('Failed to save draft')
        } finally {
            setSaving(false)
        }
    }

    const handleSubmit = async () => {
        if (saving || submitting) return

        if (!whatWentWell.trim()) return alert('What went well cannot be empty')
        if (!whatToImprove.trim()) return alert('What to improve cannot be empty')
        if (!achievements.trim()) return alert('Achievements cannot be empty')
        if (!selfRating) return alert('Self rating cannot be empty')

        setSubmitting(true)
        try {
            await submitSelfAssessment(appraisalId, {
                whatWentWell,
                whatToImprove,
                achievements,
                selfRating
            })
            onStatusChange?.('SELF_SUBMITTED', {
                whatWentWell,
                whatToImprove,
                achievements,
                selfRating
            })
        } catch (err) {
            console.error(err)
            alert('Failed to submit assessment')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-5">

            <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Self Assessment
                </p>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {[0, 1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`w-5 h-1.5 rounded-full transition-all ${
                                    i < filledFields ? 'bg-[#1089D3]' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-400">{filledFields} of 4 completed</span>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-600">What Went Well</label>
                    <span className="text-[10px] text-gray-400">{whatWentWell.length} / {MAX_CHARS}</span>
                </div>
                <textarea
                    value={whatWentWell}
                    onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setWhatWentWell(e.target.value) }}
                    disabled={!canEdit}
                    placeholder="Describe what went well this cycle..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#1089D3] disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-600">What To Improve</label>
                    <span className="text-[10px] text-gray-400">{whatToImprove.length} / {MAX_CHARS}</span>
                </div>
                <textarea
                    value={whatToImprove}
                    onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setWhatToImprove(e.target.value) }}
                    disabled={!canEdit}
                    placeholder="Describe areas you want to improve..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#1089D3] disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-600">Achievements</label>
                    <span className="text-[10px] text-gray-400">{achievements.length} / {MAX_CHARS}</span>
                </div>
                <textarea
                    value={achievements}
                    onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setAchievements(e.target.value) }}
                    disabled={!canEdit}
                    placeholder="List your key achievements this cycle..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#1089D3] disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Self Rating</label>
                <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            disabled={!canEdit}
                            onClick={() => setSelfRating(star)}
                            onMouseEnter={() => canEdit && setHoveredRating(star)}
                            onMouseLeave={() => canEdit && setHoveredRating(null)}
                            className="text-2xl transition-all disabled:cursor-not-allowed"
                        >
                            {star <= (hoveredRating ?? selfRating ?? 0) ? '★' : '☆'}
                        </button>
                    ))}
                    {selfRating && (
                        <span className="text-xs text-gray-400 ml-2">{selfRating} out of 5</span>
                    )}
                </div>
            </div>

            {canEdit && (
                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving || submitting}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 bg-white hover:border-[#1089D3] hover:text-[#1089D3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || submitting}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Assessment'}
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
            )}

            {!canEdit && (
                <p className="text-xs text-gray-400 bg-gray-50 px-4 py-3 rounded-lg">
                    Self assessment has been submitted and cannot be edited.
                </p>
            )}

        </div>
    )
}