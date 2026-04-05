import { useRef, lazy } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAuthGate } from '../hooks/useAuthGate'
import { Play, Code, Terminal, User } from 'lucide-react'
import Landing3D from './Landing3D'

// ─── Data ────────────────────────────────────────────────────────────────────

const COURSES = [
  {
    id: 1,
    tag: 'ENGINEERING',
    title: 'System Design Mastery',
    desc: 'Design distributed systems that scale to millions of users.',
    icon: '⚙️',
    students: '12.4k',
    speed: 0.2,
    accent: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/30',
    glow: 'group-hover:shadow-blue-500/40',
  },
  {
    id: 2,
    tag: 'AI & ML',
    title: 'Build with LLMs',
    desc: 'Prompt engineering, RAG, and production-grade AI pipelines.',
    icon: '🤖',
    students: '9.1k',
    speed: 0.1,
    accent: 'from-purple-500/20 to-fuchsia-500/20',
    border: 'border-purple-500/30',
    glow: 'group-hover:shadow-purple-500/40',
  },
  {
    id: 3,
    tag: 'FRONTEND',
    title: 'React — The Deep Dive',
    desc: 'Hooks, performance, patterns, and the React compiler.',
    icon: '⚛️',
    students: '21.7k',
    speed: 0.15,
    accent: 'from-sky-500/20 to-cyan-500/20',
    border: 'border-sky-500/30',
    glow: 'group-hover:shadow-sky-500/40',
  },
  {
    id: 4,
    tag: 'DEVOPS',
    title: 'Kubernetes in Production',
    desc: 'Orchestrate containers, manage clusters, ship with confidence.',
    icon: '☸️',
    students: '7.3k',
    speed: 0.12,
    accent: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
    glow: 'group-hover:shadow-emerald-500/40',
  },
  {
    id: 5,
    tag: 'BACKEND',
    title: 'APIs at Scale',
    desc: 'REST, GraphQL, gRPC. Auth, caching, and observability baked in.',
    icon: '🔌',
    students: '14.9k',
    speed: 0.18,
    accent: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/30',
    glow: 'group-hover:shadow-rose-500/40',
  },
  {
    id: 6,
    tag: 'SECURITY',
    title: 'Secure by Design',
    desc: 'Build systems that are resilient to real-world attack vectors.',
    icon: '🛡️',
    students: '5.8k',
    speed: 0.14,
    accent: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
    glow: 'group-hover:shadow-amber-500/40',
  },
]

// ─── Magnetic Button ──────────────────────────────────────────────────────────

function MagneticButton({ children, className, ...props }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 100, damping: 30 })
  const springY = useSpring(y, { stiffness: 100, damping: 30 })

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * 0.35)
    y.set((e.clientY - cy) * 0.35)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// ─── Floating Text ──────────────────────────────────────────────────────────

function FloatingWord({ word, index }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      animate={{ 
        y: [0, -12, 0],
        rotate: [0, index % 2 === 0 ? 2 : -2, 0]
      }}
      transition={{ 
        duration: 4, 
        delay: index * 0.1, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="inline-block mx-2 hover:text-brand-400 transition-colors duration-500 cursor-default"
    >
      {word}
    </motion.span>
  )
}

// ─── Bento Card ───────────────────────────────────────────────────────────────

function BentoCard({ course, index, scrollYProgress, onOpen }) {
  const yRange = useTransform(scrollYProgress, [0, 1], [0, course.speed * 1500])
  const y = useSpring(yRange, { stiffness: 100, damping: 30 })

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [10, -10]), { stiffness: 100, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-10, 10]), { stiffness: 100, damping: 30 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - (rect.left + rect.width / 2))
    mouseY.set(e.clientY - (rect.top + rect.height / 2))
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      onClick={onOpen}
      style={{ y, rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative group overflow-hidden rounded-[32px] p-8 cursor-pointer
        bg-white/5 border border-white/10 backdrop-blur-2xl
        shadow-2xl transition-all duration-500
        hover:border-white/40 ${course.glow}
      `}
    >
      <div className={`absolute -inset-px bg-gradient-to-br ${course.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
      
      <span className={`inline-block text-[10px] font-bold tracking-[0.2em] mb-6 uppercase px-3 py-1 rounded-full bg-white/10 text-white`}>
        {course.tag}
      </span>

      <div className="text-4xl mb-4 drop-shadow-2xl">{course.icon}</div>
      <h3 className="text-white font-bold text-xl leading-tight mb-3">{course.title}</h3>
      <p className="text-white/40 text-sm leading-relaxed mb-6 font-medium">{course.desc}</p>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
        <span className="text-xs font-bold text-white/30 tracking-widest uppercase">{course.students} learners</span>
        <motion.div whileHover={{ x: 5 }} className="text-white text-xl">→</motion.div>
      </div>
    </motion.div>
  )
}

// ─── Feature Previews (Simplified for brevity) ──────────────────────────

function VideoPreview() {
  return (
    <div className="absolute inset-12 bg-slate-900/40 rounded-2xl border border-white/10 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2128&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-[2px]" />
      <div className="absolute inset-0 flex items-center justify-center">
         <Play fill="white" className="text-white w-8 h-8 opacity-50" />
      </div>
    </div>
  )
}

function CodePreview() {
  return (
    <div className="absolute inset-12 bg-[#0d1117] rounded-2xl border border-white/10 overflow-hidden p-6 font-mono text-[10px] space-y-2 opacity-60">
      <div className="text-sky-400">export default function DevTUBE() {'{'}</div>
      <div className="text-purple-400 pl-4">return {'<Canvas />'}</div>
      <div className="text-sky-400">{'}'}</div>
    </div>
  )
}

function FeedbackPreview() {
  return (
     <div className="absolute inset-12 bg-slate-900/40 rounded-2xl border border-white/10 p-6 flex items-center justify-center opacity-60">
        <div className="text-white/20 uppercase tracking-[0.2em] font-black text-xs">Live Feedback Active</div>
     </div>
  )
}

// ─── Horizontal Showcase ─────────────────────────────────────────────────────

function HorizontalShowcase() {
  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: targetRef })
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-45%"])
  const { gate } = useAuthGate()

  const slides = [
    { id: 1, title: "Interactive Video", desc: "Timestamp notes and AI summaries.", color: "from-blue-600 to-indigo-600", Preview: VideoPreview },
    { id: 2, title: "Live Code Editor", desc: "Build in the browser, ship to prod.", color: "from-purple-600 to-fuchsia-600", Preview: CodePreview },
    { id: 3, title: "Mentor Feedback", desc: "Real-time reviews on your code.", color: "from-emerald-600 to-teal-600", Preview: FeedbackPreview },
    { id: 4, title: "Global Community", desc: "Learn with creators worldwide.", color: "from-rose-600 to-pink-600", Preview: VideoPreview },
  ]

  return (
    <section ref={targetRef} className="relative h-[180vh] bg-black">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-12 px-12">
          {slides.map((slide) => (
            <div 
              key={slide.id} 
              onClick={() => gate(`/features/${slide.id}`)}
              className="group relative cursor-pointer w-[650px] h-[450px] shrink-0 rounded-[48px] overflow-hidden bg-white/5 border border-white/10 backdrop-blur-3xl p-12 flex flex-col justify-end"
            >
              <div className={`absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-br ${slide.color} opacity-20 blur-[80px] -z-10 group-hover:scale-110 transition-transform duration-1000`} />
              <div className="space-y-4 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Feature {slide.id}</span>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{slide.title}</h3>
                <p className="text-white/40 text-lg font-medium">{slide.desc}</p>
              </div>
              <slide.Preview />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useAuth()
  const { gate } = useAuthGate()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  
  return (
    <div ref={containerRef} className="bg-black min-h-screen overflow-x-hidden selection:bg-brand-500/20 text-white relative">
      
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-transparent border-b border-white/5 backdrop-blur-xl"
      >
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="DevTUBE Logo" 
            className="w-9 h-9 object-contain rounded-lg shadow-2xl shadow-brand-500/20 group-hover:scale-105 transition-all duration-300"
          />
          <span className="text-white font-black tracking-tighter text-xl group-hover:text-brand-300 transition-colors">DevTUBE</span>
        </Link>

        <div className="hidden lg:flex items-center gap-10 text-white/40 text-[11px] font-black uppercase tracking-[0.2em]">
          <button onClick={() => gate('/courses')} className="hover:text-white transition-colors duration-300">Courses</button>
          <button onClick={() => gate('/dashboard')} className="hover:text-white transition-colors duration-300">Dashboard</button>
          {['Instructors', 'Pricing', 'Blog'].map((item) => (
            <button key={item} onClick={() => gate(`/${item.toLowerCase()}`)} className="hover:text-white transition-colors duration-300">{item}</button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/dashboard')}
                className="relative group px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest overflow-hidden transition-all border border-white/10 hover:border-white/40 shadow-2xl shadow-white/5"
              >
                Go to App
              </button>
              <div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden cursor-pointer hover:scale-105 transition-transform bg-brand-500/20">
                <img 
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'user'}`} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/auth" className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Log In</Link>
              <MagneticButton
                onClick={() => gate('/courses', 'signup')}
                className="px-6 py-2.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
              >
                Join Free
              </MagneticButton>
            </div>
          )}
        </div>
      </motion.nav>

      {/* ── 3D Canvas Scroll Section ───────────────────────────── */}
      <Landing3D />

      {/* ── Bento Grid Section ─────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-32 max-w-7xl mx-auto z-10 bg-black">
        <div className="text-center mb-32">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
            {"Curated paths for every engineer".split(" ").map((word, i) => (
              <FloatingWord key={i} word={word} index={i} />
            ))}
          </h2>
          <p className="text-white/30 text-lg mt-8 font-medium italic">Built by engineers, for the next generation of creators.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COURSES.map((course, i) => (
            <BentoCard 
              key={course.id} 
              course={course} 
              index={i} 
              scrollYProgress={scrollYProgress} 
              onOpen={() => gate(`/courses/${course.id}`)}
            />
          ))}
        </div>
      </section>

      {/* ── Horizontal Showcase Section ────────────────────────── */}
      <div className="relative z-10 bg-black">
         <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 bg-black">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-500">The Path to Mastery</span>
            <h2 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter mt-4">
              THE FULL-STACK<br />EVOLUTION.
            </h2>
         </div>
         <HorizontalShowcase />
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-24 bg-black relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">

          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
            <span className="text-2xl font-black text-white tracking-widest">DEVTUBE.</span>
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
              © 2026 Aditya Shetty
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
            {[
              {
                label: 'GitHub',
                href: 'https://github.com/shetty-aditya-udaya/DevTUBE--Learning-Management-System',
                aria: 'Visit GitHub repository',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/shetty-aditya-udaya/',
                aria: 'Visit LinkedIn profile',
              },
              {
                label: 'X / Twitter',
                href: '#',
                aria: 'Visit X / Twitter profile',
              },
            ].map(({ label, href, aria }) => (
              <a
                key={label}
                href={href}
                target={href !== '#' ? '_blank' : undefined}
                rel={href !== '#' ? 'noopener noreferrer' : undefined}
                aria-label={aria}
                className="
                  relative text-white/40 hover:text-white transition-colors duration-300
                  after:absolute after:left-0 after:-bottom-0.5
                  after:h-px after:w-0 after:bg-white/50
                  after:transition-all after:duration-300
                  hover:after:w-full
                "
              >
                {label}
              </a>
            ))}
          </div>

        </div>
      </footer>

      {/* Cinematic Noise Layer */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay overflow-hidden">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

    </div>
  )
}
