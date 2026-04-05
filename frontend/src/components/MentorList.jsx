import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../api/api'

export default function MentorList() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get('/dashboard/mentors')
        setMentors(res.data.data || [])
      } catch (err) {
        console.error("Error fetching mentors:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMentors()
  }, [])

  return (
    <section className="bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[48px] border border-white/10 shadow-2xl space-y-10 relative group overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-base font-black text-white uppercase tracking-[0.2em] text-xs opacity-40">Your Mentors</h3>
        <button className="w-10 h-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all font-light">+</button>
      </div>

      <div className="space-y-8 relative z-10 min-h-[150px]">
        {loading ? (
           <div className="flex items-center justify-center h-20">
              <span className="text-white/20 font-black tracking-widest text-xs uppercase animate-pulse">Scanning Network...</span>
           </div>
        ) : mentors.length === 0 ? (
           <div className="flex items-center justify-center h-20 text-center">
              <span className="text-white/40 font-medium text-xs">Complete lessons to discover mentors.</span>
           </div>
        ) : (
          mentors.map((mentor) => (
            <div key={mentor.id} className="flex items-center justify-between group/item">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-0.5 bg-white/5 relative group-hover/item:scale-110 transition-transform duration-500">
                   <img src={mentor.avatar} alt={mentor.name} className="w-full h-full rounded-2xl object-cover grayscale group-hover/item:grayscale-0 transition-all duration-500" />
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white leading-none tracking-tight group-hover/item:text-brand-400 transition-colors">{mentor.name}</span>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1.5">{mentor.coursesWatched} {mentor.coursesWatched === 1 ? 'Course' : 'Courses'} Watched</span>
                </div>
              </div>
              <button className="px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-white text-black hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
                Follow
              </button>
            </div>
          ))
        )}
      </div>

      <button className="w-full py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border border-white/5 bg-white/5 hover:bg-white hover:text-black hover:border-white rounded-2xl transition-all duration-500 relative z-10">
        See All Mentors
      </button>
    </section>
  )
}
