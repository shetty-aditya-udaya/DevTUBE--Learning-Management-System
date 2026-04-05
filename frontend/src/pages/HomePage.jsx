import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'
import api from '../api/api'
import CourseCard from '../components/CourseCard'

// ─── Component: Empty State ──────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center space-y-8 relative overflow-hidden"
    >
      {/* Nebula Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      
      {/* Bobbing Icon */}
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="w-24 h-24 bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[32px] flex items-center justify-center shadow-2xl"
      >
        <Search className="w-10 h-10 text-white/20" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="space-y-3"
      >
        <h3 className="text-2xl font-black text-white tracking-tight italic">Lost in space?</h3>
        <p className="text-white/40 text-sm font-medium tracking-wide">
          We couldn't find that course.<br />
          Try a different <span className="text-brand-400">coordinate</span> (keyword).
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component: HomePage ────────────────────────────────────────────────

export default function HomePage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/courses')
      .then((res) => {
        // Ensure data exists and is flattened as expected
        const fetchedCourses = res.data.data.courses || []
        setCourses(fetchedCourses)
      })
      .catch(() => setError('Could not load courses'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden selection:bg-brand-500/20">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-full h-screen bg-[radial-gradient(circle_at_80%_20%,#1a1a1a_0%,#000000_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 relative z-10">
        {/* Anti-Gravity Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 py-16"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
            Learn to <span className="italic bg-gradient-to-r from-white via-white/50 to-transparent bg-clip-text text-transparent">BUILD.</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto font-medium">
            Expert-led video courses for developers. Watch, learn, and build real projects in space.
          </p>
          
          <div className="max-w-md mx-auto mt-8 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/30 to-purple-500/30 blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <input
              type="search"
              placeholder="Search coordinates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="relative w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 focus:shadow-[0_0_25px_rgba(255,255,255,0.08)] backdrop-blur-3xl transition-all"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-white/40 transition-colors" />
          </div>
        </motion.div>

        {/* Dynamic Gallery */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/5 animate-pulse rounded-[32px] aspect-[4/5] border border-white/5" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div key="error" className="py-20 text-center space-y-4">
              <p className="text-rose-500 font-bold uppercase tracking-widest text-xs">Navigation System Error</p>
              <p className="text-white/40 text-sm">{error}</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <EmptyState key="empty" />
          ) : (
            <motion.div 
              key="grid"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32"
            >
              {filtered.map((course, idx) => (
                <motion.div
                  key={course.id}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { type: "spring", stiffness: 100, damping: 20 }
                    }
                  }}
                  animate={{ 
                    y: [0, -8, 0],
                  }}
                  transition={{
                    y: {
                      duration: 4 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.2
                    }
                  }}
                  className="relative"
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
