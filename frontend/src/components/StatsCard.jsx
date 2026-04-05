import { motion } from 'framer-motion'

export default function StatsCard({ userName, weeklyProgress = 0, activityByDay = {"Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0} }) {
  
  // Need to map 0-100 weeklyProgress to strokeDashoffset 502-0
  const offset = 502 - (502 * weeklyProgress) / 100
  // Convert activity count to bar heights (0 to max)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxActivity = Math.max(...Object.values(activityByDay), 1) // prevent division by zero

  return (
    <section className="bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 blur-[100px] pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-base font-black text-white uppercase tracking-[0.2em] opacity-40">Statistic</h3>
        <button className="text-white/20 hover:text-white transition-colors">•••</button>
      </div>

      {/* Circular Progress */}
      <div className="relative flex flex-col items-center py-4">
        <div className="relative w-48 h-48">
           {/* SVG Circle */}
           <svg className="w-full h-full rotate-[-90deg] drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
              <circle 
                cx="96" cy="96" r="80" 
                className="stroke-white/5 fill-none" 
                strokeWidth="14" 
              />
              <motion.circle 
                cx="96" cy="96" r="80" 
                stroke="url(#progressGradient)"
                className="fill-none" 
                strokeWidth="14" 
                strokeLinecap="round"
                initial={{ strokeDasharray: "502", strokeDashoffset: "502" }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 2, ease: "circOut" }}
              />
           </svg>
           {/* Inner Avatar */}
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-white/10 shadow-2xl overflow-hidden p-1.5 bg-white/5 group-hover:scale-105 transition-transform duration-700">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt={userName} className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                 <div className="absolute top-2 right-2 bg-white text-black text-[10px] font-black p-1.5 rounded-full border border-white/10 shadow-2xl">{weeklyProgress}%</div>
              </div>
           </div>
        </div>
        
        <div className="text-center mt-10 space-y-3 relative z-10">
            <h4 className="text-xl font-black text-white tracking-tight">Good Morning {userName.split(' ')[0]} ✨</h4>
            <p className="text-xs text-white/40 font-medium px-4 leading-relaxed uppercase tracking-widest">Achieve your weekly target today!</p>
        </div>
      </div>

      {/* Weekly Activity Chart Tracker */}
      <div className="pt-10 border-t border-white/5 relative z-10">
        <div className="flex items-end justify-between h-28 px-4 gap-3">
           {days.map((day, i) => {
             const activity = activityByDay[day] || 0
             const heightPercent = activity > 0 ? (activity / maxActivity) * 100 : 10 // scale down correctly but keep 10% min height
             return (
               <div key={i} className="flex flex-col items-center gap-4 group w-full">
                  <div className="relative w-full flex flex-col items-center">
                      <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${heightPercent}%` }}
                         transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                         className={`w-full max-w-[10px] rounded-full transition-all group-hover:scale-x-125 ${activity > 0 ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-white/10 group-hover:bg-white/30'}`}
                      />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activity > 0 ? 'text-brand-400' : 'text-white/20 group-hover:text-white/60'}`}>
                      {day.substring(0, 2)}
                  </span>
               </div>
             )
           })}
        </div>
      </div>
    </section>
  )
}
