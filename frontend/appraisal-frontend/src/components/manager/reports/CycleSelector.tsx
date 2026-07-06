import { useState, useRef, useEffect } from 'react'

interface Props {
    cycles: string[]
    selectedCycle: string | null
    onSelect: (cycle: string) => void
}

export default function CycleSelector({ cycles, selectedCycle, onSelect }: Props) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredCycles = cycles.filter(c => c.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="flex flex-col gap-1.5 w-56" ref={wrapperRef}>
            <label className="text-xs font-medium text-gray-500">Select Cycle</label>
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white hover:border-[#1089D3] transition-all"
                >
                    {selectedCycle || 'Choose a cycle...'}
                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                {open && (
                    <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search cycles..."
                            autoFocus
                            className="w-full px-3 py-2 text-sm border-b border-gray-100 focus:outline-none"
                        />
                        <div className="max-h-48 overflow-y-auto">
                            {filteredCycles.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-3">No cycles found</p>
                            ) : (
                                filteredCycles.map(cycle => (
                                    <div
                                        key={cycle}
                                        onClick={() => {
                                            onSelect(cycle)
                                            setOpen(false)
                                            setSearch('')
                                        }}
                                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-all"
                                    >
                                        {cycle}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}