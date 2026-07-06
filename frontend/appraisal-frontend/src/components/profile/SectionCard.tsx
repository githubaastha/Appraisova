interface SectionCardProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}

export default function SectionCard({ title, children, action }: SectionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-6 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
        {action}
      </div>
      <div className="border-t border-gray-100 mb-4" />
      {children}
    </div>
  )
}