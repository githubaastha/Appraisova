import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getLoggedInUser } from '../utils/auth'



interface GuideSection {
  label: string
  color: string
  description: string
  example: string
}

const sections: GuideSection[] = [
  {
    label: 'What Went Well',
    color: '#1089D3',
    description: 'Your top 2–3 contributions. Focus on impact, not just activity.',
    example: 'e.g. "Led the JWT migration on time, mentored 2 juniors."',
  },
  {
    label: 'What To Improve',
    color: '#EF9F27',
    description: 'One honest area where you fell short. Show you understand the gap.',
    example: 'e.g. "Underestimated task complexity twice — will add 20% buffer going forward."',
  },
  {
    label: 'Key Achievements',
    color: '#639922',
    description: 'Specific wins — features shipped, certs earned, problems solved.',
    example: 'e.g. "Delivered auth module, completed AWS cert, resolved 12 bugs."',
  },
  {
    label: 'Self Rating',
    color: '#7C3AED',
    description: 'Rate yourself honestly. A 4/5 with strong examples beats a 5/5 with none.',
    example: 'e.g. 4 = Exceeds expectations · 3 = Meets expectations',
  },
]

const ratingScale = [
  { stars: 1, label: 'Below expectations' },
  { stars: 2, label: 'Needs improvement' },
  { stars: 3, label: 'Meets expectations' },
  { stars: 4, label: 'Exceeds expectations' },
  { stars: 5, label: 'Outstanding' },
]

const quickTips = [
  'Review your tasks first',
  'Be specific, not vague',
  'Use numbers when possible',
  'Honest beats impressive',
  'Save draft before submitting',
  'Submit only when ready — it locks',
]

const goodPractices = [
  'Specific numbers — "30%", "35%", "12 bugs"',
  'Honest about weakness with a concrete fix',
  'Rating is backed by evidence',
  'Achievements are bullet-pointed and scannable',
]

const avoidPractices = [
  '"I worked hard" — too vague',
  '"I did my best" — no evidence',
  'Rating 5/5 with no explanation',
  'Leaving any field blank',
]

function StarRow({ count }: { count: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(count)}
      <span className="text-gray-200">{'★'.repeat(5 - count)}</span>
    </span>
  )
}

export default function AppraisalGuide() {
  const navigate = useNavigate()
  const { name, initials, department, role } = getLoggedInUser()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        name={name}
        initials={initials}
        department={department ?? '—'}
        role={role}
        activePage="Guide"
      />
      <div className="flex-1 px-8 py-8 flex flex-col gap-6 max-w-270">

        {/* ── Page Header ── */}
        <div className="pb-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold leading-none" style={{ color: '#111827' }}>
            Welcome, {name.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-400 text-xs mt-1">Read this guide before filling your self assessment</p>
        </div>

        {/* ── Intro ── */}
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex items-center justify-between">
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            A self assessment is your chance to tell your manager what you did, what you learned, and where you want to grow —
            <span className="font-semibold text-gray-800"> before they write their review.</span>{' '}
            Be honest and specific. Managers use this to calibrate their rating.
          </p>
          <button
            onClick={() => navigate('/sample-form')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[#1089D3] text-white hover:bg-[#0e7abf] transition-all whitespace-nowrap"
          >
            See Sample Form
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </button>
        </div>

        {/* ── Section Cards ── */}
        <div className="grid grid-cols-2 gap-4">
          {sections.map(section => (
            <div
              key={section.label}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-2"
              style={{ borderLeft: `3px solid ${section.color}` }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: section.color }} />
                <p className="text-sm font-semibold text-gray-800">{section.label}</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{section.description}</p>
              <p className="text-xs text-gray-400 italic">{section.example}</p>
            </div>
          ))}
        </div>

        {/* ── Rating Scale ── */}
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-4">Rating Scale</p>
          <div className="grid grid-cols-5 gap-3">
            {ratingScale.map(r => (
              <div key={r.stars} className="flex flex-col gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-3">
                <StarRow count={r.stars} />
                <p className="text-[11px] text-gray-500">{r.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Tips ── */}
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Tips</p>
          <div className="grid grid-cols-3 gap-3">
            {quickTips.map(tip => (
              <div key={tip} className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-[#1089D3] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* ── What works / Avoid ── */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-green-700 mb-3">✓ What works here</p>
            <div className="flex flex-col gap-2">
              {goodPractices.map(p => (
                <div key={p} className="flex items-start gap-2 text-xs text-green-700">
                  <span className="mt-0.5">✓</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-red-600 mb-3">✗ Avoid these</p>
            <div className="flex flex-col gap-2">
              {avoidPractices.map(p => (
                <div key={p} className="flex items-start gap-2 text-xs text-red-600">
                  <span className="mt-0.5">✗</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}