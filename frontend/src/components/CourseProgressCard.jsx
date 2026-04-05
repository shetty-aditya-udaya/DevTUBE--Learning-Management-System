import { motion } from 'framer-motion'

export default function CourseProgressCard({ title, watched, total, icon, color }) {
  const percentage = (watched / total) * 100

  return (
    <motion.div 
      whileHover={{ y: -5, shadow: "0 0 20px rgba(255,255,255,0.05)" }}
      className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 flex items-center gap-5 group cursor-pointer transition-all duration-500"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{watched}/{total} LESSONS</span>
          <button className="text-white/20 hover:text-white transition-colors">•••</button>
        </div>
        <h3 className="text-sm font-black text-white tracking-tight group-hover:text-brand-400 transition-colors">
          {title}
        </h3>
        
        {/* Simple Progress Bar */}
        <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className={`h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]`}
          />
        </div>
      </div>
    </motion.div>
  )
}
