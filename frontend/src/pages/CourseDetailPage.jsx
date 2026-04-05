import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

export default function CourseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [error, setError] = useState('')
  const [enrollError, setEnrollError] = useState('')

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then((res) => setCourse(res.data.data.course))
      .catch(() => setError('Course not found'))
      .finally(() => setLoading(false))
  }, [id])

  // Check if already enrolled
  useEffect(() => {
    if (!user) return
    api.get('/enrollments/me')
      .then((res) => {
        const ids = res.data.data.enrollments.map((e) => e.course_id)
        setEnrolled(ids.includes(Number(id)))
      })
      .catch(() => {})
  }, [user, id])

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return }
    setEnrolling(true); setEnrollError('')
    try {
      await api.post('/enrollments', { course_id: Number(id) })
      setEnrolled(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Enrollment failed'
      if (msg.includes('Already')) setEnrolled(true)
      else setEnrollError(msg)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 animate-pulse">
      <div className="h-10 bg-slate-100 rounded-lg w-2/3" />
      <div className="aspect-video bg-slate-100 rounded-3xl" />
    </div>
  )

  if (error) return <p className="text-center py-20 text-red-400">{error}</p>

  const totalLessons = course.sections?.reduce(
    (acc, s) => acc + (s.lessons?.length || 0), 0
  ) || 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Course header */}
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {course.category && (
            <span className="inline-block px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold uppercase tracking-widest text-[10px]">
              {course.category}
            </span>
          )}
          
          <h1 className="text-4xl md:text-6xl font-black leading-tight text-white tracking-tight">
            {course.title}
          </h1>
          
          <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-2xl">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 py-4 border-y border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">{course.rating || '4.8'}</span>
              <div className="flex text-amber-400 text-sm">
                {'★'}{'★'}{'★'}{'★'}{'★'}
              </div>
              <span className="text-slate-500 text-sm">(1,240 ratings)</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <span>Created by</span>
              <span className="text-brand-400 font-bold underline decoration-brand-400/30 underline-offset-4 cursor-pointer hover:text-brand-300 transition-colors">
                {course.instructor_name}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
               <span>Last updated 3/2026</span>
            </div>
          </div>
        </div>

        {/* Enrollment card (Glassmorphic) */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 space-y-8 h-fit shadow-2xl sticky top-24">
          {course.thumbnail && (
            <div className="relative group overflow-hidden rounded-2xl aspect-video shadow-2xl">
              <img src={course.thumbnail} alt={course.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                 <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-2xl pl-1 group-hover:scale-110 transition-transform cursor-pointer">
                   ▶
                 </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">Free</span>
              <span className="text-sm text-slate-500 line-through">₹4,999</span>
            </div>
            
            {enrollError && (
              <p className="text-rose-400 text-sm font-medium bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{enrollError}</p>
            )}
            
            {enrolled ? (
              <button
                onClick={() => navigate(`/learn/${id}`)}
                className="w-full py-5 bg-brand-600 hover:bg-brand-500 text-white font-black text-lg rounded-2xl shadow-2xl shadow-brand-600/20 transition-all hover:-translate-y-1 active:scale-95"
              >
                Go to Course
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-5 bg-white text-black hover:bg-slate-100 font-black text-lg rounded-2xl shadow-2xl shadow-white/10 transition-all hover:-translate-y-1 active:scale-95"
              >
                {enrolling ? 'Enrolling…' : 'Enroll Now'}
              </button>
            )}
            
            <div className="pt-4 space-y-3">
              <h4 className="text-sm font-bold text-white tracking-tight">This course includes:</h4>
              <ul className="space-y-2 text-sm text-slate-400 font-medium">
                <li className="flex items-center gap-3">
                  <span className="text-brand-500 text-xs text-lg">📁</span> {totalLessons} modules on-demand
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-brand-500 text-xs text-lg">♾️</span> Full lifetime access
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-brand-500 text-xs text-lg">🏆</span> Certificate of completion
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-3xl space-y-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Course Content</h2>
        <div className="space-y-4">
          {course.sections?.map((section) => (
            <div
              key={section.id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="px-8 py-6 flex justify-between items-center font-bold text-white cursor-pointer hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-4 text-lg">
                  <span className="text-brand-500 opacity-50 font-black">#0{section.order_number}</span>
                  {section.title}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{section.lessons?.length} lessons</span>
              </div>
              <ul className="bg-black/20 border-t border-white/5">
                {section.lessons?.map((lesson) => (
                  <li key={lesson.id}
                    className="px-8 py-5 flex items-center justify-between group hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4 text-base font-medium text-slate-300 group-hover:text-white">
                      <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all">▶</span>
                      <span>{lesson.title}</span>
                    </div>
                    {lesson.duration && (
                      <span className="text-sm font-medium text-slate-500 tracking-tighter">
                        {Math.floor(lesson.duration / 60)}:00
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
