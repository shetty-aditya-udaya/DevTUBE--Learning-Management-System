import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Play, Clock, Star, Zap, Globe, Shield, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/api'

export default function PricingPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/courses')
      .then(res => {
        setCourses(res.data.data.courses || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching courses:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/5 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 relative overflow-hidden bg-black">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/5 blur-[160px] rounded-full -z-10 animate-pulse" />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-accent-purple/5 blur-[140px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-8"
          >
            <Zap className="w-4 h-4 text-brand-400 fill-brand-400" />
            <span className="text-[10px] font-black uppercase text-brand-400 tracking-[0.3em]">Open Knowledge Platform</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-8"
          >
            FREE ACCESS. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-purple to-brand-300">NO SUBSCRIPTION.</span>
          </motion.h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[11px] leading-relaxed">
            DevTUBE is built on the philosophy of open education. All YouTube-based courses are 100% free forever. Pay only with your time.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {[
            { icon: Globe, title: "Public domain", desc: "Access 1000+ hours of video content." },
            { icon: Shield, title: "No hidden fees", desc: "No credit card required for open courses." },
            { icon: Terminal, title: "Dev-Focused", desc: "Curated content for modern engineering." }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center group hover:bg-white/8 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center mb-6 border border-brand-500/30 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">{feature.title}</h3>
              <p className="text-[11px] font-medium text-white/30 tracking-wide uppercase">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Course Marketplace Grid */}
        <div className="mb-16 flex items-center justify-between px-4">
           <h2 className="text-[12px] font-black uppercase text-white/30 tracking-[0.5em]">Current Catalog</h2>
           <span className="text-[10px] font-black uppercase text-brand-400 tracking-widest">{courses.length} Active Nodes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              <div className="absolute -inset-px rounded-[32px] bg-gradient-to-r from-emerald-500/20 to-brand-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
              
              <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden flex flex-col h-full hover:bg-black/60 transition-all duration-500">
                {/* Thumbnail */}
                <div className="relative aspect-video">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* FREE Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/90 backdrop-blur-md border border-emerald-400/40 shadow-lg">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">FREE</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="text-[9px] font-black uppercase tracking-widest text-brand-400 px-2 py-1 bg-brand-500/10 rounded-lg border border-brand-500/20">{course.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-white mb-4 line-clamp-2 tracking-tight group-hover:text-brand-300 transition-colors">{course.title}</h3>
                  
                  <div className="flex items-center gap-6 mb-8 mt-auto">
                    <div className="flex items-center gap-2 opacity-40">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-black tracking-wider">{course.rating} Rating</span>
                    </div>
                  </div>

                  <Link 
                    to={`/courses/${course.id}`}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-brand-500 group-hover:border-brand-500 text-white transition-all duration-300 shadow-xl"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Start Learning</span>
                    <Play className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
