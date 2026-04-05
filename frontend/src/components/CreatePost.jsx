import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, Link2, Send, X, Globe, User } from 'lucide-react'
import api from '../api/api'

export default function CreatePost({ user, onPostCreated }) {
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [courseId, setCourseId] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showImageInput, setShowImageInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/community/posts', {
        content,
        image_url: imageUrl,
        course_id: courseId
      })
      onPostCreated(res.data.data)
      setContent('')
      setImageUrl('')
      setCourseId(null)
      setIsExpanded(false)
      setShowImageInput(false)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-10 mb-12 shadow-cinematic relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 via-transparent to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />

      <div className="flex gap-6">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl border border-white/10 overflow-hidden shrink-0 bg-brand-500/10">
          <img
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'user'}`}
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Share your thoughts, learning, or ideas..."
              className="w-full bg-transparent border-none text-xl md:text-2xl font-black text-white placeholder:text-white/20 focus:ring-0 resize-none min-h-[40px] px-0 py-2 no-scrollbar"
              rows={isExpanded ? 3 : 1}
              maxLength={280}
            />
            {isExpanded && (
              <div className="absolute bottom-2 right-0 text-[10px] font-black text-white/10 uppercase tracking-widest">
                {content.length} / 280
              </div>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                {/* Optional Image Input */}
                {showImageInput && (
                  <div className="relative group/input">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image URL here..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all placeholder:text-white/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowImageInput(false)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Metadata & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImageInput(prev => !prev)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showImageInput ? 'bg-brand-500/20 border-brand-500/30 text-brand-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
                    >
                      <Image className="w-3 h-3" />
                      Image
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <Link2 className="w-3 h-3" />
                      Tag Course
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !content.trim()}
                      className="flex items-center gap-3 px-10 py-3.5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-glow-sm"
                    >
                      {loading ? 'Posting...' : (
                        <>
                          Share Thought
                          <Send className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {error && <p className="mt-4 text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}
    </div>
  )
}
