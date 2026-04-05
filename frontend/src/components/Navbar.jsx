import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useAuthGate } from '../hooks/useAuthGate'

// ─── Nav Links Config ─────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Courses',     path: '/courses'     },
  { label: 'Dashboard',   path: '/dashboard'   },
  { label: 'Instructors', path: '/instructors' },
  { label: 'Pricing',     path: '/pricing'     },
  { label: 'Community',   path: '/blog'        },
]

// ─── Scroll Progress Bar ─────────────────────────────────────────────────────
function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="absolute top-0 left-0 right-0 h-[2px] z-[100] overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-brand-500 via-accent-purple to-brand-400 origin-left"
        style={{ scaleX: progress / 100 }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
      />
    </div>
  )
}

// ─── Main Navbar ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, logout } = useAuth()
  const { gate } = useAuthGate()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/[0.06] py-1 relative">
      <ScrollProgressBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <img
            src="/logo.png"
            alt="DevTUBE Logo"
            className="w-9 h-9 object-contain rounded-xl shadow-glow-sm group-hover:scale-105 transition-all duration-300"
          />
          <span className="text-xl font-black tracking-tighter text-white uppercase group-hover:text-brand-300 transition-colors">
            DevTUBE
          </span>
        </Link>

        {/* Nav Links with LayoutGroup sliding indicator */}
        <LayoutGroup id="navbar">
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, path }) => {
              const active = isActive(path)
              const isPublic = ['/courses', '/instructors', '/pricing', '/blog'].includes(path)
              
              return (
                <button
                  key={path}
                  onClick={() => isPublic ? navigate(path) : gate(path)}
                  className="relative px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition-colors duration-300 rounded-xl"
                >
                  {/* Sliding active pill */}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-300 ${active ? 'text-white' : 'text-white/40 hover:text-white'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        {/* Right side: User or Auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10">
                <div className="w-9 h-9 rounded-xl border border-white/10 overflow-hidden shadow-xl bg-white/5 group-hover:border-brand-500/40 transition-colors">
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'user'}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:flex flex-col items-start pr-1">
                  <span className="text-[11px] font-black text-white leading-none tracking-tight">{user.name}</span>
                  <span className="text-[8px] font-black text-brand-400 uppercase tracking-[0.2em] mt-1.5 opacity-70">Active</span>
                </div>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute right-0 top-full mt-3 w-52 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[24px] shadow-cinematic opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60] p-2"
                >
                  <div className="space-y-1">
                    <button
                      onClick={() => gate('/profile')}
                      className="w-full text-left px-5 py-3 text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/8 hover:text-white rounded-2xl transition-all"
                    >
                      Profile Settings
                    </button>
                    <div className="h-px bg-white/5 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-[10px] font-black text-rose-400 uppercase tracking-widest hover:bg-rose-500/10 rounded-2xl transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/auth"
                className="text-[11px] font-black text-white/40 hover:text-white uppercase tracking-[0.18em] transition-colors px-2 py-1"
              >
                Login
              </Link>
              <Link
                to="/auth"
                state={{ mode: 'signup' }}
                className="btn-primary py-2.5 px-6 text-[10px]"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
