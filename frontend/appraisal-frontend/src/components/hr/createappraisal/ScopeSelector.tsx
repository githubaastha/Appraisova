type ScopeType = 'SINGLE' | 'DEPARTMENT' | 'ALL'

interface Props {
    activeScope: ScopeType
    onChange: (scope: ScopeType) => void
}

const SCOPES: { value: ScopeType; label: string; subtitle: string; icon: string }[] = [
    { value: 'SINGLE',     label: 'Single Employee', subtitle: 'One specific employee',     icon: '👤' },
    { value: 'DEPARTMENT', label: 'By Department',   subtitle: 'All employees in a dept',   icon: '🏢' },
    { value: 'ALL',        label: 'All Employees',   subtitle: 'Entire organization',        icon: '🌐' },
]

export default function ScopeSelector({ activeScope, onChange }: Props) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {SCOPES.map(scope => (
                <button
                    key={scope.value}
                    onClick={() => onChange(scope.value)}
                    className={`text-left px-4 py-4 rounded-xl border transition-all
                        ${activeScope === scope.value
                            ? 'border-[#1089D3] bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                >
                    <p className="text-lg">{scope.icon}</p>
                    <p className={`text-sm font-semibold mt-2 ${activeScope === scope.value ? 'text-[#1089D3]' : 'text-gray-700'}`}>
                        {scope.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{scope.subtitle}</p>
                </button>
            ))}
        </div>
    )
}