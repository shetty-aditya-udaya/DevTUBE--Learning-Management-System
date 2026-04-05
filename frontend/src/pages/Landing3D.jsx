import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuthGate } from '../hooks/useAuthGate'
import { useNavigate, Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Terminal, User } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Landing3D() {
  const { gate } = useAuthGate()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  const frameCount = 192
  const currentFrame = (index) => 
    `/assets/DevTUBE sequence/_MConverter.eu_DevTUBEvideo-${index + 1}.jpg`

  // Preload images
  useEffect(() => {
    const loadedImages = []
    let loadedCount = 0

    const preloadImages = () => {
      for (let i = 0; i < frameCount; i++) {
        const img = new Image()
        img.src = currentFrame(i)
        img.onload = () => {
          loadedCount++
          setProgress(Math.floor((loadedCount / frameCount) * 100))
          if (loadedCount === frameCount) {
            setImages(loadedImages)
            setLoading(false)
          }
        }
        loadedImages[i] = img
      }
    }

    preloadImages()
  }, [])

  // Canvas Logic
  useEffect(() => {
    if (loading || images.length === 0) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    const render = (index) => {
      if (!images[index]) return
      
      const img = images[index]
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const imgWidth = img.width
      const imgHeight = img.height

      // Object-fit: cover logic
      const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight)
      const x = (canvasWidth - imgWidth * ratio) / 2
      const y = (canvasHeight - imgHeight * ratio) / 2
      
      context.clearRect(0, 0, canvasWidth, canvasHeight)
      context.drawImage(img, 0, 0, imgWidth, imgHeight, x, y, imgWidth * ratio, imgHeight * ratio)
    }

    // Initialize first frame
    render(0)

    // GSAP ScrollTrigger
    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const frameIndex = Math.min(
          frameCount - 1,
          Math.floor(self.progress * frameCount)
        )
        requestAnimationFrame(() => render(frameIndex))
      }
    })

    // Resize Handler
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      render(Math.floor(scrollTrigger.progress * (frameCount - 1)))
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      scrollTrigger.kill()
      window.removeEventListener('resize', handleResize)
    }
  }, [loading, images])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute inset-y-0 left-0 bg-brand-500"
          />
        </div>
        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          Initializing Engine... {progress}%
        </span>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative bg-black min-h-[400vh]">
      {/* Background Canvas */}
      <div className="fixed inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10">
        
        {/* Section 1: Hero */}
        <section className="h-screen flex items-center justify-center sticky top-0">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center space-y-8 px-6"
          >
            <h1 className="text-6xl md:text-[140px] font-black tracking-tighter leading-none text-white mix-blend-difference">
              MASTER<br />
              <span className="italic opacity-50">YOUR FLOW.</span>
            </h1>
            <p className="max-w-xl mx-auto text-white/60 text-lg font-medium tracking-tight">
              DevTUBE is a weightless learning environment for modern builders. 
              Engineering evolution, delivered with cinematic precision.
            </p>
            <div className="pt-8">
              <button 
                onClick={() => gate('/courses', 'signup')}
                className="px-12 py-5 bg-white text-black text-sm font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-white/10"
              >
                Start Learning →
              </button>
            </div>
          </motion.div>
        </section>

        {/* Section 2: Empty space for scroll animation progress */}
        <section className="h-[200vh] pointer-events-none" />

        {/* Section 3: Static Content Integration */}
        {/* This will be handled in the main LandingPage.jsx by wrapping these sections */}
      </div>
    </div>
  )
}
