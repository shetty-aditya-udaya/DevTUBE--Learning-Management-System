export default function ProgressBar({ percent }) {
  const clamped = Math.min(100, Math.max(0, percent || 0))

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span>Course Progress</span>
        <span className="text-brand-600">{clamped}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
