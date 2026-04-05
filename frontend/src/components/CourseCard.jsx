import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// ─── Component: Mesh Gradient Fallback ───────────────────────────────────────

function MeshGradient({ category }) {
  return (
    <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center overflow-hidden">
      {/* Animated Mesh Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-brand-500/30 blur-[60px] rounded-full"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-accent-purple/30 blur-[60px] rounded-full"
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="px-5 py-2.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-3xl shadow-2xl">
          <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">{category || 'Course'}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component: CourseCard ──────────────────────────────────────────────

export default function CourseCard({ course }) {
  const [imgError, setImgError] = useState(false)

  // Many missing YouTube thumbnails load a 120px gray placeholder successfully
  const handleImageLoad = (e) => {
    if (e.target.naturalWidth <= 120) {
      setImgError(true)
    }
  }

  // Dynamic Hover Glow
  const getGlowClass = (cat) => {
    if (!cat) return 'hover:shadow-glow-brand'
    const c = cat.toLowerCase()
    if (c.includes('engineering') || c.includes('backend')) return 'hover:shadow-glow-green'
    if (c.includes('front') || c.includes('react')) return 'hover:shadow-glow-cyan'
    if (c.includes('ai') || c.includes('ml')) return 'hover:shadow-glow-purple'
    return 'hover:shadow-glow-brand'
  }

  return (
    <Link 
      to={`/courses/${course.id}`} 
      className={`block card-glass ${getGlowClass(course.category)} group`}
    >
      <div className="aspect-video relative overflow-hidden bg-zinc-900 border-b border-white/5">
        {imgError || !course.thumbnail ? (
          <MeshGradient category={course.category} />
        ) : (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            onLoad={handleImageLoad}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110 grayscale-[0.2] group-hover:grayscale-0" 
          />
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-700" />
        
        <div className="absolute top-5 left-5">
          <span className="px-3 py-1 rounded-xl bg-brand-500/10 backdrop-blur-2xl border border-brand-500/20 text-[9px] font-black uppercase tracking-widest text-brand-400">
            {course.category}
          </span>
        </div>
      </div>

      <div className="p-7 space-y-4 relative">
        <h3 className="text-xl font-bold text-white tracking-tight leading-7 group-hover:text-brand-400 transition-colors line-clamp-2 min-h-[3.5rem]">
          {course.title}
        </h3>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] italic font-black">
            {course.instructor_name?.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-white/40 tracking-tight">{course.instructor_name}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-400/5 border border-amber-400/10 text-amber-400">
             <span className="text-xs font-black">{course.rating || '4.8'}</span>
             <span className="text-[10px]">★</span>
          </div>
          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
            ({Math.floor(Math.random() * 500) + 100} Enrollments)
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white/30 uppercase tracking-tighter">
              {course.duration || '24h 15m'}
            </span>
            <span className="text-base font-black text-white tracking-tighter italic">FREE</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all transform group-hover:rotate-6">
            ↗
          </div>
        </div>
      </div>
    </Link>
  )
}
