import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getLoggedInUser } from '../utils/auth'



// Example filled assessment — for learning purposes only, read only
const sampleAssessment = {
  employee: 'Alex Johnson',
  manager: 'Sarah Chen',
  department: 'Engineering',
  whatWentWell:
    'Led the JWT authentication migration on time, completing it within the sprint. Collaborated closely with the backend team to ensure zero downtime. Mentored 2 junior developers on REST API best practices, improving code review turnaround by 30%.',
  whatToImprove:
    'Underestimated task complexity twice this cycle — both times by about 2 days. Going forward I\'ll break large tasks into sub-tasks and add a 20% time buffer to my estimates.',
  achievements: [
    'Delivered JWT auth module (Q1 sprint goal)',
    'Reduced API response time by 35% through query optimization',
    'Completed AWS Cloud Practitioner certification',
    'Resolved 12 critical backlog bugs',
    'Onboarded and mentored 2 new team members',
  ],
  selfRating: 4,
  ratingNote: 'Choose 4 because I delivered all goals but had estimation issues that caused minor delays.',
}

function StarRow({ count }: { count: number }) {
  return (
    <span className="text-amber-400 text-lg">
      {'★'.repeat(count)}
      <span className="text-gray-200">{'★'.repeat(5 - count)}</span>
    </span>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  )
}

export default function SampleForm() {
  const navigate = useNavigate()
const { name, initials, department, role } = getLoggedInUser()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
                name={name}
                initials={initials}
                department={department ?? '—'}
                role={role}
                activePage="Sample Form"
            />

      <div className="flex-1 px-8 py-8 flex flex-col gap-6 max-w-270">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/guide')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1089D3] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Appraisal Guide
            </button>
            <span className="text-gray-200">/</span>
            <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Sample Form</h2>
          </div>
          <span className="text-[17px] font-semibold px-3 py-1 rounded-md bg-gray-100 text-gray-500">
            Example only — read only
          </span>
        </div>

        {/* ── Sample Card ── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Top bar accent */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #1089D3, #12B1D1)' }} />

          <div className="px-6 py-5 flex flex-col gap-6">

            {/* Identity row */}
            <div className="grid grid-cols-3 gap-6 pb-4 border-b border-gray-100">
              <InfoChip label="Employee"   value={sampleAssessment.employee} />
              <InfoChip label="Manager"    value={sampleAssessment.manager} />
              <InfoChip label="Department" value={sampleAssessment.department} />
            </div>

            {/* What Went Well */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1089D3]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">What Went Well</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                {sampleAssessment.whatWentWell}
              </p>
            </div>

            {/* What To Improve */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">What To Improve</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                {sampleAssessment.whatToImprove}
              </p>
            </div>

            {/* Key Achievements */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">Key Achievements</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex flex-col gap-1.5">
                {sampleAssessment.achievements.map(a => (
                  <div key={a} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Self Rating */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">Self Rating</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <StarRow count={sampleAssessment.selfRating} />
                  <span className="text-sm font-semibold text-gray-700">{sampleAssessment.selfRating} / 5</span>
                  <span className="text-xs text-gray-400">— Exceeds expectations</span>
                </div>
                <p className="text-xs text-gray-500 italic">{sampleAssessment.ratingNote}</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── What works / Avoid ── */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-green-700 mb-3">✓ What works here</p>
            <div className="flex flex-col gap-2 text-xs text-green-700">
              <div className="flex items-start gap-2"><span>✓</span><span>Specific numbers — "30%", "35%", "12 bugs"</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Honest about weakness with a concrete fix</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Rating is backed by evidence</span></div>
              <div className="flex items-start gap-2"><span>✓</span><span>Achievements are bullet-pointed and scannable</span></div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-red-600 mb-3">✗ Avoid these</p>
            <div className="flex flex-col gap-2 text-xs text-red-600">
              <div className="flex items-start gap-2"><span>✗</span><span>"I worked hard" — too vague</span></div>
              <div className="flex items-start gap-2"><span>✗</span><span>"I did my best" — no evidence</span></div>
              <div className="flex items-start gap-2"><span>✗</span><span>Rating 5/5 with no explanation</span></div>
              <div className="flex items-start gap-2"><span>✗</span><span>Leaving any field blank</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}