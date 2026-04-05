import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, TrendingUp, Users, Radio, Globe, MessageSquare, Terminal } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'

function useSidebarInstructors() {
  const [instructors, setInstructors] = useState([])
  useEffect(() => {
    api.get('/courses').then(res => {
      const courses = res.data.data.courses || []
      const seen = new Set()
      const unique = []
      courses.forEach(c => {
        if (c.instructor_name && !seen.has(c.instructor_name)) {
          seen.add(c.instructor_name)
          unique.push({ name: c.instructor_name, avatar: c.instructor_avatar })
        }
      })
      setInstructors(unique.slice(0, 4))
    }).catch(() => {})
  }, [])
  return instructors
}

const CATEGORIES = [
  { id: 'all', label: 'All Feed', icon: Radio },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'instructors', label: 'Instructors', icon: Sparkles },
  { id: 'courses', label: 'Courses', icon: Terminal },
  { id: 'ideas', label: 'Ideas', icon: Radio },
]

export default function BlogPage() {
  const { user } = useAuth()
  const sidebarInstructors = useSidebarInstructors()
  const [activeCategory, setActiveCategory] = useState('all')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/community/posts?filter=${activeCategory}`)
      setPosts(res.data.data)
    } catch (err) {
      console.error("Fetch posts failed", err)
      setError("Failed to sync community feed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [activeCategory])

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev])
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 relative bg-black overflow-hidden">
      {/* Background Cinematic Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/5 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-purple/5 blur-[150px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Section: Feed & Controls */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Header */}
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl lg:text-8xl font-black tracking-tighter leading-none"
            >
              COMMUNITY. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-purple to-brand-300 uppercase">HUB.</span>
            </motion.h1>
            <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px] leading-relaxed max-w-lg">
              The neural network of modern builders. Share updates, celebrate wins, and learn in the open.
            </p>
          </div>

          {/* Create Post Section */}
          <CreatePost user={user} onPostCreated={handlePostCreated} />

          {/* Filters Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeCategory === cat.id 
                  ? 'bg-brand-500 border-brand-500 text-white shadow-glow-sm' 
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
                }`}
              >
                <cat.icon className="w-3 h-3" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Feed Grid */}
          <div className="space-y-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                 <div className="w-12 h-12 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing Intelligence...</span>
              </div>
            ) : error ? (
              <div className="py-20 text-center text-rose-500 font-bold uppercase tracking-widest italic">{error}</div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-white/5 rounded-[40px] border border-white/10">
                 <MessageSquare className="w-12 h-12 text-white/10 mx-auto" />
                 <p className="text-[11px] font-black uppercase tracking-widest text-white/20 italic">The feed is silent. Be the first to speak.</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} user={user} />
              ))
            )}
          </div>
        </div>

        {/* Right Section: Sidebar */}
        <aside className="lg:col-span-4 space-y-10 hidden lg:block sticky top-32 h-fit">
          
          {/* Trending Topics */}
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 space-y-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Trending Insights</h3>
            </div>
            
            <div className="space-y-6">
              {[
                { tag: '#system-architecture', count: '1.2k' },
                { tag: '#react-19-rc', count: '850' },
                { tag: '#ai-agents', count: '640' },
                { tag: '#cloud-native', count: '520' },
              ].map((item) => (
                <div key={item.tag} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">{item.tag}</span>
                  <span className="text-[10px] font-black text-brand-500/60 bg-brand-500/10 px-2 py-0.5 rounded-lg">{item.count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Active Instructors */}
          <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 space-y-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-accent-purple" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Top Mentors</h3>
            </div>

            <div className="space-y-6">
              {sidebarInstructors.length === 0 ? (
                <p className="text-white/20 text-xs font-bold uppercase tracking-widest text-center py-4">Loading mentors...</p>
              ) : (
                sidebarInstructors.map((inst) => (
                  <div key={inst.name} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl border border-white/10 overflow-hidden bg-brand-500/10 grayscale group-hover:grayscale-0 transition-all">
                       <img src={inst.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${inst.name}`} alt={inst.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-white">{inst.name}</span>
                       <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Instructor</span>
                    </div>
                    <button className="ml-auto w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-brand-500 hover:text-white transition-all">+</button>
                  </div>
                ))
              )}
            </div>
            
            <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white border border-dashed border-white/10 rounded-2xl transition-all">
              Discover All Mentors
            </button>
          </section>

        </aside>

      </div>
    </div>
  )
}
