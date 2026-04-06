import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, GraduationCap, ChevronRight, ArrowLeft } from 'lucide-react'
import logo from '../assets/logo.png'

// ─── Social Icons ─────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

const GithubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
)

// ─── Canvas Animation Constants ───────────────────────────────────────────────

const FRAME_COUNT = 192
const BASE_PATH = '/assets/DevTUBE auth sequence/_MConverter.eu_DevTUBE auth-'
const EXTENSION = '.jpg'

// ─── Input Field ─────────────────────────────────────────────────────────────

function Field({ icon: Icon, ...props }) {
  return (
    <div className="relative group/field">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-white/20 group-focus-within/field:text-brand-400 transition-colors duration-300 pointer-events-none" />
      <input
        {...props}
        className="w-full h-11 bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-brand-500/40 focus:bg-brand-500/[0.04] rounded-xl pl-10 pr-4 text-white text-sm font-medium placeholder:text-white/20 outline-none transition-all duration-300 shadow-inner"
      />
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Auth3D() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // ── Auth state ────────────────────────────────────────────────────────────
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'signup')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  // ── Canvas animation ─────────────────────────────────────────────────────
  const canvasRef  = useRef(null)
  const [images, setImages]           = useState([])
  const [isPreloading, setIsPreloading] = useState(true)
  const [preloadProgress, setPreloadProgress] = useState(0)
  const frameIndex = useRef(1)
  const requestRef = useRef()

  // Preload frames
  useEffect(() => {
    let loadedCount = 0
    const loadedImages = []

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image()
      img.src = `${BASE_PATH}${i}${EXTENSION}`
      img.onload = () => {
        loadedCount++
        setPreloadProgress(Math.floor((loadedCount / FRAME_COUNT) * 100))
        if (loadedCount === FRAME_COUNT) {
          setImages(loadedImages)
          setIsPreloading(false)
        }
      }
      loadedImages[i] = img
    }

    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current) }
  }, [])

  // Animation loop
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || images.length === 0) return

    const ctx = canvas.getContext('2d')
    const img = images[frameIndex.current]

    if (img) {
      const ca = canvas.width / canvas.height
      const ia = img.width   / img.height
      let dw, dh, ox, oy
      if (ca > ia) { dw = canvas.width;  dh = canvas.width / ia;  ox = 0; oy = -(dh - canvas.height) / 2 }
      else         { dw = canvas.height * ia; dh = canvas.height; ox = -(dw - canvas.width) / 2; oy = 0 }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, ox, oy, dw, dh)
    }

    frameIndex.current = frameIndex.current < FRAME_COUNT ? frameIndex.current + 1 : 1
    requestRef.current = requestAnimationFrame(renderFrame)
  }, [images])

  useEffect(() => {
    if (!isPreloading && images.length > 0)
      requestRef.current = requestAnimationFrame(renderFrame)
  }, [isPreloading, images, renderFrame])

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width  = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }
    window.addEventListener('resize', resize)
    resize()
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── Form handlers ─────────────────────────────────────────────────────────
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSignupSuccess(false)
    setLoading(true)

    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }
        await signup(form.name, form.email, form.password, form.role)
        setSignupSuccess(true)
        setIsLogin(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || `${isLogin ? 'Login' : 'Signup'} failed`)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden selection:bg-brand-500/20">

      {/* ── Background canvas ──────────────────────────────────────────── */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-75" />

      {/* ── Ambient gradients (matching landing) ───────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-brand-600/8 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-accent-purple/8 blur-[140px] animate-pulse" />
      </div>

      {/* ── Preloader ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPreloading && (
          <motion.div
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-8"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
              <motion.div
                className="absolute inset-0 border-2 border-t-brand-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/30 tracking-widest">
                {preloadProgress}%
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Preparing experience</p>
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">Optimising visuals…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top-left logo — exact match to landing navbar ────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-5">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="DevTUBE"
            className="w-9 h-9 object-contain rounded-lg shadow-2xl shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300"
          />
          <span className="text-white font-black tracking-tighter text-xl group-hover:text-brand-300 transition-colors duration-300">
            DevTUBE
          </span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/30 hover:text-white transition-colors duration-300 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </button>
      </div>

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isPreloading ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[1080px] flex flex-col lg:flex-row items-center gap-16 lg:gap-28"
        >

          {/* ── Left: cinematic animated greeting ───────────────────── */}
          <div className="hidden lg:flex flex-col gap-8 flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={isPreloading ? { opacity: 0 } : { opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8 relative"
            >
              {/* Neon glow orb — sits behind the text */}
              <div className="absolute -top-12 -left-8 w-72 h-72 bg-brand-500/15 blur-[90px] rounded-full pointer-events-none" />
              <div className="absolute top-8 left-16 w-48 h-48 bg-accent-purple/10 blur-[70px] rounded-full pointer-events-none" />

              {/* Eyebrow label */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={isPreloading ? { opacity: 0 } : { opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                className="block text-[10px] font-black uppercase tracking-[0.35em] text-brand-500"
              >
                Welcome to DevTUBE
              </motion.span>

              {/* "Hello Learner" — curly font, word-by-word horizontal slide */}
              <div className="flex flex-col gap-0 overflow-hidden">
                {[
                  { word: 'Hello,',  delay: 0.65 },
                  { word: 'Learner', delay: 1.1  },
                ].map(({ word, delay }) => (
                  <div key={word} className="overflow-hidden">
                    <motion.div
                      initial={{ opacity: 0, x: -70 }}
                      animate={isPreloading
                        ? { opacity: 0, x: -70 }
                        : { opacity: 1, x: 0 }
                      }
                      transition={{
                        delay,
                        duration: 0.85,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <motion.span
                        className="block text-transparent bg-clip-text select-none leading-[1.05]"
                        style={{
                          fontFamily: "'Dancing Script', cursive",
                          fontSize: 'clamp(72px, 9vw, 108px)',
                          fontWeight: 700,
                          backgroundImage:
                            'linear-gradient(135deg, #a78bfa 0%, #7c3aed 35%, #ec4899 70%, #c4b5fd 100%)',
                          backgroundSize: '200% 200%',
                        }}
                        animate={isPreloading ? {} : {
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          opacity: [1, 0.9, 1],
                        }}
                        transition={{
                          backgroundPosition: {
                            delay: delay + 1,
                            duration: 6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          opacity: {
                            delay: delay + 1,
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                        }}
                      >
                        {word}
                      </motion.span>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Sub-copy */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={isPreloading ? { opacity: 0 } : { opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.9, ease: 'easeOut' }}
                className="max-w-sm text-white/35 text-[11px] font-bold uppercase tracking-[0.18em] leading-relaxed"
              >
                Join 84k+ developers mastering their craft with cinematic precision.
              </motion.p>
            </motion.div>

            {/* Social proof row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isPreloading ? { opacity: 0 } : { opacity: 1 }}
              transition={{ delay: 1.9, duration: 0.8 }}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-black bg-brand-500/20 overflow-hidden"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=user${i}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Active globally
              </span>
            </motion.div>


          </div>

          {/* ── Right: auth card ───────────────────────────────────────────── */}
          <div className="w-full max-w-[420px] relative group/card flex-shrink-0">

            {/* hover glow — brand consistent */}
            <div className="absolute -inset-px bg-gradient-to-r from-brand-600/20 via-accent-purple/20 to-brand-400/20 rounded-[36px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 blur-xl -z-10" />

            <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden">

              {/* subtle internal ambient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/8 blur-[80px] -z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent-purple/8 blur-[80px] -z-10 pointer-events-none" />

              {/* grain texture */}
              <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
              />

              {/* ── Card header ──────────────────────────────────────────── */}
              <header className="mb-7">
                <LayoutGroup>
                  <motion.h2
                    layoutId="authTitle"
                    className="text-3xl font-black tracking-tighter text-white leading-tight mb-1.5"
                  >
                    {signupSuccess ? 'Account created.' : isLogin ? 'Welcome back.' : 'Create account.'}
                  </motion.h2>
                </LayoutGroup>
                <p className="text-white/35 text-[10px] font-bold uppercase tracking-[0.22em]">
                  {isLogin ? 'Sign in to access your platform' : 'Start your journey today'}
                </p>
              </header>

              {/* ── Tab switcher ─────────────────────────────────────────── */}
              {!signupSuccess && (
                <div className="bg-white/[0.04] border border-white/8 p-1 rounded-xl flex relative mb-6">
                  <LayoutGroup>
                    {[
                      { label: 'Sign In',  active: isLogin,  onClick: () => setIsLogin(true) },
                      { label: 'Sign Up',  active: !isLogin, onClick: () => setIsLogin(false) },
                    ].map(({ label, active, onClick }) => (
                      <button
                        key={label}
                        onClick={onClick}
                        className={`relative z-10 flex-1 py-2.5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-300 rounded-lg ${
                          active ? 'text-white' : 'text-white/25 hover:text-white/50'
                        }`}
                      >
                        {label}
                        {active && (
                          <motion.div
                            layoutId="tabIndicator"
                            className="absolute inset-0 bg-white/8 border border-white/12 rounded-lg -z-10"
                          />
                        )}
                      </button>
                    ))}
                  </LayoutGroup>
                </div>
              )}

              {/* ── Form ─────────────────────────────────────────────────── */}
              <form onSubmit={handleSubmit} className="space-y-3">

                {/* Error banner */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      className="flex items-center gap-2.5 bg-rose-500/8 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2.5 rounded-xl"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Fields */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? 'login-fields' : 'signup-fields'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3"
                  >
                    {!isLogin && (
                      <Field icon={User} name="name" type="text" placeholder="Full name" required={!isLogin} value={form.name} onChange={handleChange} />
                    )}
                    <Field icon={Mail} name="email" type="email" placeholder="Email address" required value={form.email} onChange={handleChange} />
                    <Field icon={Lock} name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} />

                    {!isLogin && (
                      <div className="relative group/field">
                        <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-white/20 group-focus-within/field:text-brand-400 transition-colors duration-300 pointer-events-none" />
                        <select
                          name="role"
                          value={form.role}
                          onChange={handleChange}
                          className="w-full h-11 bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-brand-500/40 focus:bg-brand-500/[0.04] rounded-xl pl-10 pr-4 text-white text-sm font-medium outline-none transition-all duration-300 appearance-none cursor-pointer"
                        >
                          <option value="student"    className="bg-neutral-950">Student</option>
                          <option value="instructor" className="bg-neutral-950">Instructor</option>
                        </select>
                        <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 rotate-90 pointer-events-none" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* ── Primary CTA — matches landing's white button ──────── */}
                <div className="pt-1">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-11 rounded-xl bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-white/10 hover:shadow-white/20 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none relative overflow-hidden group"
                  >
                    {/* shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/8 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    {loading
                      ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Processing…</span>
                      : isLogin ? 'Sign in' : 'Create account'
                    }
                  </motion.button>
                </div>

                {/* divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-black/20 backdrop-blur-sm px-4 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                      or continue with
                    </span>
                  </div>
                </div>

                {/* social buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <GoogleIcon />, label: 'Google' },
                    { icon: <GithubIcon />, label: 'GitHub' },
                  ].map(({ icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      className="flex items-center justify-center gap-2.5 h-10 rounded-xl bg-white/[0.04] border border-white/8 hover:border-white/20 hover:bg-white/8 transition-all duration-300 group"
                    >
                      <span className="text-white/40 group-hover:text-white transition-colors duration-300">{icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/70 transition-colors duration-300">{label}</span>
                    </button>
                  ))}
                </div>

              </form>

              {/* switch mode link */}
              {!signupSuccess && (
                <p className="mt-6 text-center text-[10px] text-white/25 font-bold uppercase tracking-[0.15em]">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-brand-400 hover:text-brand-300 transition-colors duration-300 underline underline-offset-2"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Film-grain overlay matching landing ─────────────────────────────── */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.025] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="authNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#authNoise)" />
        </svg>
      </div>

    </div>
  )
}
