import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import CourseDetailPage from './pages/CourseDetailPage'
import LearningPage from './pages/LearningPage'
import AuthPage from './pages/AuthPage'
import Auth3D from './pages/Auth3D'
import Dashboard from './pages/Dashboard'
import InstructorsPage from './pages/InstructorsPage'
import PricingPage from './pages/PricingPage'
import BlogPage from './pages/BlogPage'
import SmoothScroll from './components/SmoothScroll'
import DevTUBEAssistant from './components/DevTUBEAssistant'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400 font-black uppercase tracking-[0.4em] text-[10px]">Syncing Identity…</div>
  if (!user) return <Navigate to="/auth" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SmoothScroll>
          <div className="min-h-screen flex flex-col bg-black text-white selection:bg-brand-500/30">
            <Routes>
              {/* Landing, Auth — Full screen layouts */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<GuestRoute><Auth3D /></GuestRoute>} />

              {/* App shell routes — share Navbar */}
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/courses" element={<HomePage />} />
                        <Route path="/courses/:id" element={<CourseDetailPage />} />
                        <Route path="/instructors" element={<InstructorsPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route
                          path="/learn/:courseId"
                          element={<ProtectedRoute><LearningPage /></ProtectedRoute>}
                        />
                        <Route
                          path="/learn/:courseId/lesson/:lessonId"
                          element={<ProtectedRoute><LearningPage /></ProtectedRoute>}
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </>
                }
              />
            </Routes>
          </div>
        </SmoothScroll>

        {/* ── DevTUBE AI Assistant — globally mounted ── */}
        <DevTUBEAssistant />

      </BrowserRouter>
    </AuthProvider>
  )
}
