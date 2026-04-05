import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, User, ShieldCheck } from 'lucide-react'
import api from '../api/api'

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "m";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return Math.floor(seconds) + "s";
}

export default function PostCard({ post, onUpdate }) {
  const [liked, setLiked] = useState(post.has_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)

  const handleLike = async () => {
    try {
      const res = await api.post(`/community/posts/${post.id}/like`)
      setLiked(res.data.has_liked)
      setLikesCount(prev => res.data.has_liked ? prev + 1 : prev - 1)
    } catch (err) {
      console.error("Like failed", err)
    }
  }

  const fetchComments = async () => {
    if (showComments) {
       setShowComments(false)
       return
    }
    setShowComments(true)
    setLoadingComments(true)
    try {
      const res = await api.get(`/community/posts/${post.id}/comments`)
      setComments(res.data.data)
    } catch (err) {
      console.error("Fetch comments failed", err)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    try {
      const res = await api.post(`/community/posts/${post.id}/comments`, { content: commentText })
      setComments(prev => [...prev, res.data.data])
      setCommentText('')
    } catch (err) {
      console.error("Add comment failed", err)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden hover:bg-white/[0.07] transition-all duration-500"
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden bg-brand-500/10 flex items-center justify-center">
              <img 
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user.name}`} 
                alt={post.user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tight">{post.user.name}</span>
                {post.user.role === 'instructor' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-500/20 text-brand-400 text-[8px] font-black uppercase tracking-widest border border-brand-500/30">
                    <ShieldCheck className="w-2 h-2" />
                    Instructor
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
                {timeAgo(post.created_at)} ago
              </span>
            </div>
          </div>
          <button className="text-white/20 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <p className="text-white/70 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          
          {post.image_url && (
            <div className="rounded-[24px] overflow-hidden border border-white/10 bg-black/40">
              <img 
                src={post.image_url} 
                alt="Post attachment" 
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}

          {post.course_id && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
               <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">📚</div>
               <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-500">Related Course</span>
                  <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">Course Linked Reference</span>
               </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 group transition-colors ${liked ? 'text-rose-500' : 'text-white/40 hover:text-rose-400'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${liked ? 'bg-rose-500/20 border border-rose-500/30' : 'bg-white/5 group-hover:bg-rose-500/10'}`}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[11px] font-black tracking-widest">{likesCount}</span>
            </button>

            <button 
              onClick={fetchComments}
              className="flex items-center gap-2 group text-white/40 hover:text-brand-400 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-500/10">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black tracking-widest">{post.comments_count}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
             <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <Bookmark className="w-4 h-4" />
             </button>
             <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <Share2 className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-8 border-t border-white/5 space-y-6"
            >
              {loadingComments ? (
                <div className="py-10 text-center text-[10px] font-black uppercase tracking-widest text-white/20 animate-pulse">Syncing Discussions...</div>
              ) : (
                <>
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg border border-white/10 overflow-hidden shrink-0">
                          <img 
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.user.name}`} 
                            alt={comment.user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{comment.user.name}</span>
                            <span className="text-[9px] font-medium text-white/20 uppercase tracking-widest">{timeAgo(comment.created_at)} ago</span>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-4 mt-8">
                    <div className="flex-1 relative">
                       <input 
                         type="text" 
                         value={commentText}
                         onChange={(e) => setCommentText(e.target.value)}
                         placeholder="Write a reply..."
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-6 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all placeholder:text-white/20"
                       />
                    </div>
                    <button 
                      type="submit"
                      className="px-6 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                      Post
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
