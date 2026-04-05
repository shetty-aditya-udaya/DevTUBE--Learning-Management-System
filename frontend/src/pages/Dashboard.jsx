import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CourseProgressCard from '../components/CourseProgressCard'
import ContinueWatchingCard from '../components/ContinueWatchingCard'
import StatsCard from '../components/StatsCard'
import MentorList from '../components/MentorList'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'


export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/')
        setDashboardData(res.data.data || res.data)
      } catch (e) {
        console.error("Error fetching dashboard", e)
        setError(e.response?.data?.message || "Network error connecting to API.")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [navigate, logout])

  if (loading) {
     return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-brand-500 font-bold tracking-widest uppercase">Initializing...</div>
  }

  if (error || !dashboardData) {
     return (
       <div className="min-h-screen bg-[#000000] flex flex-col gap-4 items-center justify-center text-white">
          <p className="text-red-500 font-bold tracking-widest uppercase">{error || "Dashboard Data Unavailable"}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-all font-bold tracking-widest uppercase text-xs">Retry</button>
       </div>
     )
  }

  const { enrolledCourses = [], continueWatching = [], allEnrolledLessons = [], weeklyProgress = 0, activityByDay = {} } = dashboardData

  return (
    <div className="bg-[#000000] text-white font-sans selection:bg-brand-500/20 relative overflow-x-hidden min-h-[calc(100vh-68px)]">
      {/* Background Radial Gradient for Depth */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#1a1a1a_0%,#000000_50%)] pointer-events-none" />
      
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-10 md:px-10 grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Dashboard Content */}
          <div className="xl:col-span-8 space-y-10 md:space-y-12">
            
            {/* Hero Card - Updated with Neo-Futuristic Gradient */}
            <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 p-12 text-white shadow-2xl shadow-brand-600/10 border border-white/10 group">
               <div className="relative z-10 max-w-lg space-y-6">
                  <span className="inline-flex px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-widest border border-white/5">Online Course</span>
                  <h1 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight">
                    Sharpen Your Skills with Professional Online Courses
                  </h1>
                  <button onClick={() => navigate('/courses')} className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl text-sm font-black hover:scale-105 active:scale-95 transition-all group/btn shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    Join Now
                    <span className="text-lg group-hover/btn:translate-x-1 transition-transform">→</span>
                  </button>
               </div>
               {/* Decorative icons */}
               <div className="absolute top-10 right-10 text-9xl opacity-5 rotate-12 select-none group-hover:rotate-45 transition-transform duration-1000">✨</div>
               <div className="absolute -bottom-10 -right-10 text-[200px] opacity-[0.03] -rotate-6 select-none group-hover:-rotate-12 transition-transform duration-1000">💎</div>
            </section>

            {/* Course Progress Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {enrolledCourses.length === 0 ? (
                 <div className="col-span-3 text-white/40 font-medium py-10 text-center bg-white/5 rounded-[32px] border border-white/10">You have not enrolled in any courses yet.</div>
               ) : (
                 enrolledCourses.map((course, i) => (
                   <CourseProgressCard key={course.id} title={course.title} watched={course.completed_lessons} total={course.total_lessons} icon={['🎨', '🏷️', '⚛️', '💻'][i%4]} color="bg-white/5 text-brand-500" />
                 ))
               )}
            </div>

            {/* Continue Watching */}
            <section className="space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white tracking-tight">Continue Watching</h2>
                  <div className="flex gap-2">
                     <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all shadow-sm">←</button>
                     <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg shadow-white/5 active:scale-90 transition-all">→</button>
                  </div>
               </div>
               <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                  {continueWatching.length === 0 ? (
                    <div className="w-full text-white/40 font-medium py-10 text-center bg-white/5 rounded-[32px] border border-white/10">No lessons yet</div>
                  ) : (
                    continueWatching.map((lesson) => (
                      <div key={lesson.lessonId} className="snap-start" onClick={() => navigate(`/learn/${lesson.courseId}/${lesson.lessonId}`)}>
                        <ContinueWatchingCard lesson={lesson} />
                      </div>
                    ))
                  )}
               </div>
            </section>

            {/* Lesson Table */}
            <section className="space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white tracking-tight">Your Lesson</h2>
               </div>
               <div className="bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                           <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest">Course</th>
                           <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest text-center">Type</th>
                           <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest">Lesson Focus</th>
                           <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        {allEnrolledLessons.length === 0 ? (
                          <tr><td colSpan="4" className="text-center py-10 text-white/40 font-medium tracking-wide">No scheduled lessons available.</td></tr>
                        ) : (
                          allEnrolledLessons.map((lesson, i) => (
                            <tr key={i} className="group hover:bg-white/[0.03] transition-colors border-b border-white/[0.02] last:border-0 cursor-pointer" onClick={() => navigate(`/learn/${lesson.courseId}/${lesson.lessonId}`)}>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl border border-white/10 shadow-2xl overflow-hidden bg-white/5 hidden md:block">
                                      <img src={lesson.thumbnail || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lesson.instructorName}`} alt={lesson.instructorName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-sm font-black text-white leading-tight tracking-tight line-clamp-1">{lesson.courseTitle}</span>
                                      <span className="text-[10px] font-medium text-white/40 mt-1 uppercase tracking-widest hidden md:block">Instructor: {lesson.instructorName}</span>
                                   </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className="px-3 py-1 rounded-lg bg-white/5 text-white/60 text-[9px] font-black uppercase tracking-widest border border-white/10">
                                    Video
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-xs font-bold text-white/60 truncate max-w-[150px] md:max-w-xs group-hover:text-brand-400 transition-colors">{lesson.lessonTitle}</p>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button className="w-8 h-8 rounded-full border border-white/10 text-white/20 hover:bg-white hover:text-black hover:border-white transition-all shadow-sm">
                                    ▶
                                 </button>
                              </td>
                            </tr>
                          ))
                        )}
                     </tbody>
                  </table>
               </div>
            </section>
          </div>

          {/* Right Panel */}
          <div className="xl:col-span-4 space-y-8">
            <StatsCard userName={user?.name || 'Aditya Guest'} weeklyProgress={weeklyProgress} activityByDay={activityByDay} />
            <MentorList />
          </div>

        </main>
    </div>
  )
}

