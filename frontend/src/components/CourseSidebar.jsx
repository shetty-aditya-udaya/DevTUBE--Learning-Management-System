import ProgressBar from './ProgressBar'

export default function Sidebar({ sections, currentLessonId, onSelectLesson, progressData }) {
  const lessonMap = {}
  if (progressData?.lessons) {
    progressData.lessons.forEach((l) => {
      lessonMap[l.id] = l
    })
  }

  return (
    <aside className="w-full h-full bg-transparent flex flex-col">
      {/* Header */}
      <div className="p-8 space-y-6">
        <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Course Content</h2>
        
        {progressData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">{progressData.progress_percent}%</span>
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                {progressData.completed_lessons}/{progressData.total_lessons} COMPLETE
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-1000" 
                style={{ width: `${progressData.progress_percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sections & Lessons */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-10 scrollbar-hide">
        {sections?.map((section) => (
          <div key={section.id} className="space-y-3">
            {/* Section header */}
            <div className="px-4">
              <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] italic">
                {section.order_number}. {section.title}
              </p>
            </div>

            {/* Lessons */}
            <div className="space-y-1">
              {section.lessons?.map((lesson) => {
                const lp = lessonMap[lesson.id]
                const isUnlocked = lp?.is_unlocked ?? true
                const isCompleted = lp?.is_completed ?? false
                const isCurrent = lesson.id === currentLessonId

                return (
                  <button
                    key={lesson.id}
                    onClick={() => isUnlocked && onSelectLesson(lesson.id)}
                    disabled={!isUnlocked}
                    className={`
                      w-full text-left px-4 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 group relative overflow-hidden
                      ${isCurrent
                        ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)] scale-[1.02] z-10'
                        : isUnlocked
                          ? 'text-white/40 hover:text-white hover:bg-white/5'
                          : 'text-white/10 cursor-not-allowed'}
                    `}
                  >
                    {/* Active Lesson Glow (Lit from behind) */}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-purple-500/10 blur-xl -z-10" />
                    )}

                    {/* Status icon */}
                    <div className={`
                      w-8 h-8 rounded-xl flex items-center justify-center text-[10px] flex-shrink-0 transition-all duration-500 border
                      ${isCurrent 
                        ? 'bg-black text-white border-black scale-110 shadow-lg shadow-black/20' 
                        : isCompleted 
                          ? 'bg-brand-500/10 text-brand-500 border-brand-500/20' 
                          : isUnlocked 
                            ? 'bg-white/5 text-white/20 border-white/10 group-hover:border-white/40' 
                            : 'bg-transparent text-white/5 border-white/5'}
                    `}>
                      {isCompleted ? '✓' : isUnlocked ? (isCurrent ? '▶' : '•') : '🔒'}
                    </div>

                    <div className="flex flex-col min-w-0 relative z-10">
                      <span className={`text-[11px] leading-tight truncate tracking-tight ${isCurrent ? 'font-black' : 'font-bold'}`}>
                        {lesson.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] mt-1 text-black/40">Streaming Now</span>
                      )}
                    </div>

                    {/* Active/Completion Indicators */}
                    {isCurrent ? (
                      <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                    ) : isCompleted && (
                      <div className="absolute right-4 w-1 h-1 rounded-full bg-brand-500/40" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
