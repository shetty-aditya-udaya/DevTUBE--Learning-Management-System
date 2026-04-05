import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VideoPlayer({ youtubeUrl, title }) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Reset loading state when URL changes
  useEffect(() => {
    setIsLoaded(false)
  }, [youtubeUrl])

  if (!youtubeUrl) {
    return (
      <div className="w-full aspect-video bg-black/40 border border-white/10 border-dashed flex items-center justify-center rounded-[32px] backdrop-blur-md">
        <p className="text-white/20 font-black uppercase tracking-[0.2em] text-xs">Awaiting Stream Connection…</p>
      </div>
    )
  }

  // Parse raw youtube URLs into embed URLs
  const getEmbedUrl = (url) => {
    let videoId = ''
    try {
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0]
      } else if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search)
        videoId = urlParams.get('v')
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1].split('?')[0]
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1` : url
    } catch {
      return url
    }
  }

  const embedUrl = getEmbedUrl(youtubeUrl)

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full aspect-video rounded-[36px] overflow-hidden bg-zinc-900 border border-white/10 relative group shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
    >
      {/* Loading Shimmer */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-zinc-900 flex flex-col items-center justify-center gap-6"
          >
            <div className="w-16 h-16 border-4 border-white/5 border-t-brand-500 rounded-full animate-spin" />
            <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                animate={{ x: [-200, 200] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10" />
      
      <iframe
        src={embedUrl}
        title={title || 'Lesson Video'}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full relative z-0"
        frameBorder="0"
      />
    </motion.div>
  )
}
