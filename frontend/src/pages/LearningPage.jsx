import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'
import CourseSidebar from '../components/CourseSidebar'
import VideoPlayer from '../components/VideoPlayer'

export default function LearningPage() {
  const { courseId, lessonId: urlLessonId } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [marking, setMarking] = useState(false)
  const [loadingLesson, setLoadingLesson] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  // Stable ref to accumulate watch time across re-renders (C4 fix)
  const secondsWatchedRef = useRef(0)

  // --- Load course structure + progress in parallel ---
  const loadData = useCallback(async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/progress/${courseId}`),
      ])
      const courseData = courseRes.data.data.course
      const progress = progressRes.data.data

      setCourse(courseData)
      setProgressData(progress)

      // Determine which lesson to load
      const targetId = urlLessonId
        ? parseInt(urlLessonId)
        : progress.resume_lesson_id

      // Only load if it's different from what's currently showing
      if (targetId && currentLesson?.id !== targetId) {
        await loadLesson(targetId, progress)
      } else if (!targetId && progress.lessons?.length) {
        await loadLesson(progress.lessons[0].id, progress)
      }
    } catch (err) {
      if (err.response?.status === 403) setError('You are not enrolled in this course.')
      else setError('Failed to load course data.')
    } finally {
      setPageLoading(false)
    }
  }, [courseId, urlLessonId]) // W6 fix: removed currentLesson?.id to prevent re-render loop

  useEffect(() => { loadData() }, [loadData])

  // --- Load a single lesson by id ---
  const loadLesson = async (id, progress) => {
    const pd = progress || progressData
    const lessonEntry = pd?.lessons?.find((l) => l.id === id)
    if (lessonEntry && !lessonEntry.is_unlocked) return // blocked

    setLoadingLesson(true)
    try {
      const res = await api.get(`/lessons/${id}`)
      setCurrentLesson(res.data.data.lesson)
      // Only navigate if the URL is different
      if (parseInt(urlLessonId) !== id) {
        navigate(`/learn/${courseId}/lesson/${id}`, { replace: true })
      }
    } catch {
      // If 403 just don't load
    } finally {
      setLoadingLesson(false)
    }
  }

  //Select lesson from sidebar
  const handleSelectLesson = (lessonId) => {
    loadLesson(lessonId, progressData)
  }

  // --- Mark current lesson complete ---
  const handleMarkComplete = async () => {
    if (!currentLesson || marking) return
    setMarking(true)
    try {
      await api.post('/progress', { lesson_id: currentLesson.id })

      // Re-fetch progress to update unlock states
      const res = await api.get(`/progress/${courseId}`)
      const newProgress = res.data.data
      setProgressData(newProgress)

      // Auto-advance to next unlocked lesson
      const lessons = newProgress.lessons || []
      const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id)
      const next = lessons.slice(currentIndex + 1).find((l) => l.is_unlocked)
      if (next) {
        await loadLesson(next.id, newProgress)
      }
    } catch (err) {
      console.error('Could not mark complete', err)
    } finally {
      setMarking(false)
    }
  }

  // --- Video Progress Heartbeat (C4 fix: useRef persists across re-renders) ---
  useEffect(() => {
    const lessonMeta = progressData?.lessons?.find((l) => l.id === currentLesson?.id)
    if (!currentLesson || lessonMeta?.is_completed) return

    // Reset counter when switching to a new lesson
    secondsWatchedRef.current = 0

    const interval = setInterval(() => {
      secondsWatchedRef.current += 5
      api.post('/progress/update', {
        lessonId: currentLesson.id,
        progress_seconds: secondsWatchedRef.current
      }).catch(err => console.error('Heartbeat sync failed:', err))
    }, 5000)

    return () => clearInterval(interval)
  }, [currentLesson?.id, progressData])

  // --- Guards ---
  if (pageLoading)
    return (
      <div className="flex h-[calc(100vh-68px)] items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-white/5 border-t-white rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Initializing Learning Environment</span>
        </div>
      </div>
    )

  if (error) return (
    <div className="flex h-[calc(100vh-56px)] items-center justify-center flex-col gap-4">
      <p className="text-red-400 text-lg font-bold tracking-tight mb-2">Access Denied</p>
      <p className="text-white/40 text-sm max-w-sm text-center mb-8">{error}</p>
      <div className="flex gap-4">
        <button onClick={() => navigate(`/courses/${courseId}`)} className="px-8 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
          Try Re-enrolling
        </button>
        <button onClick={() => navigate('/courses')} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
          Browse Catalog
        </button>
      </div>
    </div>
  )

  const lessonMeta = progressData?.lessons?.find((l) => l.id === currentLesson?.id)
  const isCompleted = lessonMeta?.is_completed
  
  // Navigation helpers
  const lessons = progressData?.lessons || []
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
  const isNextLocked = nextLesson && !nextLesson.is_unlocked

  return (
    <div className="flex h-[calc(100vh-68px)] overflow-hidden bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#1a1a1a_0%,#000000_100%)] pointer-events-none" />
      
      {/* Sidebar */}
      <div className="hidden md:flex w-85 flex-shrink-0 flex-col border-r border-white/5 bg-white/[0.02] backdrop-blur-3xl relative z-20">
        <CourseSidebar
          sections={course?.sections}
          currentLessonId={currentLesson?.id}
          onSelectLesson={handleSelectLesson}
          progressData={progressData}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          
          {/* Header breadcrumbs / metadata */}
          <div className="space-y-3">
             <div className="flex items-center gap-3">
               <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                 {course?.category}
               </span>
               <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">•</span>
               <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{course?.title}</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                {loadingLesson ? (
                  <span className="opacity-20 animate-pulse">Loading lesson content…</span>
                ) : (
                  currentLesson?.title || 'Gateway to Mastery'
                )}
             </h1>
          </div>

          {/* Video Player Section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-brand-500/20 rounded-[36px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative">
              {loadingLesson ? (
                <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-[32px] animate-pulse flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Decrypting Stream</span>
                  </div>
                </div>
              ) : (
                <VideoPlayer youtubeUrl={currentLesson?.youtube_url} title={currentLesson?.title} />
              )}
            </div>
          </div>

          {/* Controls & Engagement */}
          {currentLesson && !loadingLesson && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Actions */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-2xl">
                    🎬
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight leading-none mb-2">{currentLesson.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                        Lesson {currentIndex + 1} of {lessons.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 w-full sm:w-auto">
                  {isCompleted ? (
                    <div className="flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-white/10">
                      <span className="text-sm">✓</span>
                      <span>Lesson Mastered</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleMarkComplete}
                      disabled={marking}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/5 disabled:opacity-50 disabled:scale-100"
                    >
                      {marking ? 'Syncing Progress…' : 'Mark as Complete'}
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-4 flex flex-col gap-2">
                <button
                  onClick={() => prevLesson && handleSelectLesson(prevLesson.id)}
                  disabled={!prevLesson}
                  className="flex-1 flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white transition-all disabled:opacity-10 disabled:pointer-events-none"
                >
                  <span>← Previous</span>
                </button>
                <button
                  onClick={() => nextLesson && !isNextLocked && handleSelectLesson(nextLesson.id)}
                  disabled={!nextLesson || isNextLocked}
                  className={`
                    flex-1 flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${!nextLesson || isNextLocked 
                      ? 'bg-white/5 text-white/10 cursor-not-allowed' 
                      : 'bg-white text-black hover:scale-[1.02] shadow-2xl shadow-white/5'
                    }
                  `}
                >
                  <span>{isNextLocked ? '🔒 Locked' : 'Next Lesson →'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
