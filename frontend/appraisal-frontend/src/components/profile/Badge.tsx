interface BadgeProps {
  label: string
  variant: 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'purple'
}

const VARIANTS = {
  blue:   'bg-blue-50 text-blue-700 border border-blue-100',
  green:  'bg-green-50 text-green-700 border border-green-100',
  amber:  'bg-amber-50 text-amber-700 border border-amber-100',
  red:    'bg-red-50 text-red-700 border border-red-100',
  gray:   'bg-gray-100 text-gray-600 border border-gray-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-100',
}

export default function Badge({ label, variant }: BadgeProps) {
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${VARIANTS[variant]}`}>
      {label}
    </span>
  )
}