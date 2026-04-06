import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Key } from 'lucide-react'
import logo from '../assets/logo.png'

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

export default function AuthPage() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'signup')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const from = location.state?.from || '/'

  useEffect(() => {
    setError('')
  }, [isLogin])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSignupSuccess(false)
    setLoading(true)

    try {
      if (isLogin) {
        await login(form.email, form.password)
        navigate(from, { replace: true })
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row selection:bg-purple-500/30 overflow-hidden text-white font-sans">
      
      {/* ── Left Column: Form Section ────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-16 py-12 relative z-20"
      >
        {/* Brand Logo */}
        <div className="absolute top-8 left-6 md:left-12 flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
           <img 
             src={logo} 
             alt="DevTUBE Logo" 
             className="w-9 h-9 object-contain rounded-lg shadow-2xl shadow-brand-500/20 group-hover:scale-105 transition-all duration-300"
           />
           <span className="text-white font-black tracking-tighter text-xl group-hover:text-brand-300 transition-colors">DevTUBE</span>
        </div>

        {/* Form Container with Neon Underglow */}
        <div className="relative max-w-md w-full mx-auto lg:mr-auto lg:ml-12 lg:mt-12">
          {/* Underglow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl rounded-[40px] -z-10" />

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 text-white">
                {signupSuccess ? 'Almost There.' : isLogin ? 'Welcome Back.' : 'Join the Future.'}
              </h1>
              <p className="text-white/40 text-sm font-medium italic">
                {signupSuccess 
                  ? 'Please login with your new credentials.'
                  : isLogin ? 'Sign in to access your dashboard.' 
                  : 'Start your journey with 84k+ creators worldwide.'}
              </p>
            </header>

            {/* Glass Tab Switcher */}
            {!signupSuccess && (
              <LayoutGroup>
                <div className="bg-white/5 border border-white/5 p-1 rounded-xl flex relative mb-8 backdrop-blur-xl">
                  <button 
                    onClick={() => setIsLogin(true)}
                    className={`relative z-10 flex-1 py-2 text-[11px] font-black tracking-[0.2em] uppercase transition-colors duration-300 ${isLogin ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
                  >
                    Sign In
                    {isLogin && (
                      <motion.div 
                        layoutId="authTab"
                        className="absolute inset-0 bg-brand-500/10 rounded-lg -z-10 border border-brand-500/20 shadow-glow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                  <button 
                    onClick={() => setIsLogin(false)}
                    className={`relative z-10 flex-1 py-2 text-[11px] font-black tracking-[0.2em] uppercase transition-colors duration-300 ${!isLogin ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
                  >
                    Sign Up
                    {!isLogin && (
                      <motion.div 
                        layoutId="authTab"
                        className="absolute inset-0 bg-brand-500/10 rounded-lg -z-10 border border-brand-500/20 shadow-glow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                </div>
              </LayoutGroup>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold uppercase tracking-wider rounded-xl px-4 py-3 flex items-center gap-3 mb-6"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                variants={containerVariants} 
                initial="hidden" 
                animate="visible"
                key={isLogin ? "login" : "signup"}
                className="space-y-4"
              >
                {!isLogin && (
                  <motion.div variants={itemVariants}>
                    <input
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="input-glass"
                    />
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="input-glass"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <input
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="input-glass"
                  />
                </motion.div>

                {!isLogin && (
                  <motion.div variants={itemVariants} className="relative">
                    <select 
                      name="role" 
                      value={form.role} 
                      onChange={handleChange}
                      className="input-glass appearance-none cursor-pointer"
                    >
                      <option value="student" className="bg-black text-white">Learn (Student)</option>
                      <option value="instructor" className="bg-black text-white">Teach (Instructor)</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </motion.div>
                )}

                {isLogin && (
                  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="w-4 h-4 rounded-md border border-white/20 bg-black/40 group-hover:border-purple-500 transition-colors relative flex items-center justify-center">
                        <input type="checkbox" className="sr-only peer" />
                        <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Remember me</span>
                    </label>
                    <button type="button" className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors">
                      Forgot Password?
                    </button>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="pt-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    animate={loading ? { opacity: [1, 0.6, 1], scale: [1, 1.02, 1] } : {}}
                    transition={loading ? { repeat: Infinity, duration: 1.5 } : {}}
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full shadow-glow-brand"
                  >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
                    {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                  </motion.button>
                </motion.div>
                
                <motion.div variants={itemVariants} className="pt-4">
                  <div className="relative flex items-center mb-6">
                     <div className="flex-grow border-t border-white/10" />
                     <span className="shrink-0 px-4 text-[9px] font-black uppercase tracking-widest text-gray-500">Or continue with</span>
                     <div className="flex-grow border-t border-white/10" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group">
                      <GoogleIcon />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">Google</span>
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group">
                      <GithubIcon />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">GitHub</span>
                    </button>
                  </div>
                </motion.div>

              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* ── Right Column: Visual Section ──────────────────────── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-screen border-l border-white/5 flex items-center justify-center overflow-hidden"
      >
        {/* Breathing Gradients */}
        <motion.div
           animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
           className="absolute inset-0 flex items-center justify-center mix-blend-screen"
        >
           <div className="absolute w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[100px] translate-x-1/4 -translate-y-1/4" />
           <div className="absolute w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[90px] -translate-x-1/4" />
           <div className="absolute w-[400px] h-[400px] bg-brand-500/20 rounded-full blur-[80px] translate-y-1/3" />
        </motion.div>

        {/* Floating Anti-gravity Element */}
        <motion.div
            animate={{ 
              y: [0, -20, 0], 
              rotateX: [0, 10, -5, 0],
              rotateY: [0, 15, -10, 0] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ perspective: 1000 }}
            className="relative z-10 w-48 h-48 md:w-64 md:h-64 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-glow-brand flex items-center justify-center group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
            <Key className="w-16 h-16 md:w-24 md:h-24 text-white/50 group-hover:text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-colors duration-500" />
            <div className="absolute -bottom-6 text-[10px] font-black tracking-[0.4em] uppercase text-white/30">
              Gateway
            </div>
        </motion.div>
        
        {/* Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }} />
      </motion.div>

    </div>
  )
}
