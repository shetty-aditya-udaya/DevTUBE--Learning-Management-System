import { motion } from 'framer-motion'

export default function ContinueWatchingCard({ lesson }) {
  const mentorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${lesson.instructorName}`
  return (
    <motion.div 
      whileHover={{ y: -8, shadow: "0 20px 40px rgba(0,0,0,0.6)" }}
      className="min-w-[320px] bg-white/5 backdrop-blur-2xl rounded-[40px] overflow-hidden border border-white/10 group cursor-pointer transition-all duration-700"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={lesson.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400"} 
          alt={lesson.lessonTitle} 
          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-3 hover:bg-white/20 transition-all transform hover:scale-110">
           <span className="text-sm">▶️</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-4">
        <div className="flex items-center gap-2">
            <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 text-white/60 border border-white/10`}>
                {lesson.courseTitle}
            </span>
        </div>
        
        <h3 className="font-black text-white text-base leading-tight group-hover:text-brand-400 transition-colors tracking-tight">
          {lesson.lessonTitle}
        </h3>

        <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/5">
           <div className="w-10 h-10 rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-0.5 bg-white/5">
              <img src={mentorAvatar} alt={lesson.instructorName} className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500" />
           </div>
           <div className="flex flex-col">
              <span className="text-xs font-black text-white leading-none tracking-tight">{lesson.instructorName}</span>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1.5 italic">Instructor</span>
           </div>
        </div>
      </div>
    </motion.div>
  )
}
