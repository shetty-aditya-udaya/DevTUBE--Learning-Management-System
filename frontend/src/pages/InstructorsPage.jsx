import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, GraduationCap, ArrowRight, User, Play, Clock, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/api'

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedInstructor, setSelectedInstructor] = useState(null)

  useEffect(() => {
    api.get('/courses')
      .then(res => {
        const courses = res.data.data.courses || []
        // Group by instructor
        const grouped = courses.reduce((acc, course) => {
          const name = course.instructor_name || 'Anonymous'
          if (!acc[name]) {
            acc[name] = {
              name,
              avatar: course.instructor_avatar,
              courses: [],
              totalRating: 0,
              count: 0
            }
          }
          acc[name].courses.push(course)
          acc[name].totalRating += (course.rating || 0)
          acc[name].count += 1
          return acc
        }, {})

        setInstructors(Object.values(grouped))
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching instructors:', err)
        setLoading(false)
      })
  }, [])

  const filteredInstructors = instructors.filter(inst => 
    inst.name.toLowerCase().includes(search.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/5 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 animate-pulse">Syncing Instructors</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-purple/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl lg:text-7xl font-black tracking-tighter mb-4"
            >
              WORLD CLASS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-purple to-brand-300">INSTRUCTORS.</span>
            </motion.h1>
            <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[11px]">
              Learn from the best minds in the industry. Expertly curated courses.
            </p>
          </div>

          <div className="relative group max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Instructors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Instructors Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredInstructors.map((instructor) => (
            <motion.div 
              key={instructor.name}
              variants={cardVariants}
              className="group relative"
            >
              <div className="absolute -inset-px bg-gradient-to-r from-brand-600/20 via-accent-purple/20 to-brand-400/20 rounded-[32px] opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm" />
              
              <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 hover:bg-black/60 transition-all duration-500 overflow-hidden">
                {/* Image & Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl border border-white/10 overflow-hidden bg-white/5 p-1 relative z-10">
                      <img 
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${instructor.name}`} 
                        alt={instructor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -inset-2 bg-brand-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                       <GraduationCap className="w-3 h-3 text-brand-400" />
                       <span className="text-[10px] font-black text-white/60 tracking-wider">{(instructor.totalRating / instructor.count).toFixed(1)} Rating</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-brand-300 transition-colors">{instructor.name}</h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-6">{instructor.count} Published Courses</p>

                {/* Course List Preview */}
                <div className="space-y-4 mb-8">
                   {instructor.courses.slice(0, 3).map((course, idx) => (
                     <div key={idx} className="flex items-center gap-3 group/item">
                       <div className="w-2 h-2 rounded-full bg-white/10 group-hover/item:bg-brand-500 transition-colors" />
                       <span className="text-[10px] font-bold text-white/50 tracking-wide truncate max-w-[200px]">{course.title}</span>
                     </div>
                   ))}
                   {instructor.count > 3 && (
                     <button 
                      onClick={() => setSelectedInstructor(instructor)}
                      className="text-[9px] font-black text-brand-400 uppercase tracking-widest hover:text-white transition-colors"
                     >
                       + {instructor.count - 3} more courses
                     </button>
                   )}
                </div>

                <button 
                  onClick={() => setSelectedInstructor(instructor)}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-brand-500 group-hover:border-brand-500 text-white transition-all duration-300"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">View All Courses</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Instructor Modal */}
      <AnimatePresence>
        {selectedInstructor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInstructor(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-stone-950 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="max-h-[85vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="p-8 lg:p-12 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-3xl border border-white/10 overflow-hidden bg-white/5 shadow-2xl">
                      <img 
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedInstructor.name}`} 
                        alt={selectedInstructor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter">{selectedInstructor.name}</h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                          <Play className="w-3 h-3 text-brand-400" />
                          <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">{selectedInstructor.count} Courses</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                          <Star className="w-3 h-3 text-brand-400" />
                          <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">{(selectedInstructor.totalRating / selectedInstructor.count).toFixed(1)} Instructor Rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses List */}
                <div className="p-8 lg:p-12">
                  <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-8">Published Knowledge</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedInstructor.courses.map((course) => (
                      <Link 
                        key={course.id} 
                        to={`/courses/${course.id}`}
                        onClick={() => setSelectedInstructor(null)}
                        className="group/course relative p-1 rounded-[28px] overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-accent-purple/20 to-transparent opacity-0 group-hover/course:opacity-100 transition-opacity" />
                         <div className="relative bg-white/5 border border-white/5 rounded-[27px] p-4 flex gap-4 transition-all duration-300">
                           <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                             <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover/course:scale-110 transition-transform duration-700" />
                           </div>
                           <div className="flex flex-col justify-between py-1 overflow-hidden">
                             <h5 className="text-sm font-bold text-white tracking-tight leading-snug group-hover/course:text-brand-300 transition-colors truncate">{course.title}</h5>
                             <div className="flex items-center gap-4">
                               <div className="flex items-center gap-1.5 grayscale opacity-40">
                                 <Clock className="w-3 h-3" />
                                 <span className="text-[9px] font-black uppercase tracking-wider">{course.duration}</span>
                               </div>
                               <div className="flex items-center gap-1.5 text-brand-400">
                                 <Star className="w-3 h-3 fill-current" />
                                 <span className="text-[9px] font-black tracking-wider">{course.rating}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
