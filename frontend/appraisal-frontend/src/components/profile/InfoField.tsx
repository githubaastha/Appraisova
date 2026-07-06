interface InfoFieldProps {
  label: string
  value: string
  valueClassName?: string
}

export default function InfoField({ label, value, valueClassName = '' }: InfoFieldProps) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-1 flex flex-col gap-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`text-sm font-medium text-gray-800 ${valueClassName}`}>{value}</p>
    </div>
  )
}