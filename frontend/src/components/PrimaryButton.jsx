import { motion } from 'framer-motion'

/**
 * PrimaryButton — DevTUBE Cinematic Design System
 *
 * Variants:
 *   - "solid"   : filled indigo with glow (default)
 *   - "ghost"   : transparent with border
 *   - "white"   : solid white / black text
 *   - "danger"  : rose-tinted
 *
 * Usage:
 *   <PrimaryButton>Start Learning</PrimaryButton>
 *   <PrimaryButton variant="ghost" icon={<ArrowRight />}>Explore</PrimaryButton>
 */
export default function PrimaryButton({
  children,
  variant = 'solid',
  icon,
  iconPosition = 'right',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const base = `
    relative inline-flex items-center justify-center gap-2.5
    font-black text-[10px] uppercase tracking-widest
    overflow-hidden rounded-2xl
    transition-all duration-300 ease-expo
    active:scale-95 select-none
    disabled:opacity-40 disabled:pointer-events-none
  `

  const sizes = {
    sm: 'py-2 px-5',
    md: 'py-3.5 px-8',
    lg: 'py-4.5 px-12 text-[11px]',
  }

  const variants = {
    solid: `
      bg-brand-500 hover:bg-brand-400
      text-white
      shadow-glow-sm hover:shadow-glow-brand
      hover:-translate-y-0.5
    `,
    ghost: `
      bg-white/5 hover:bg-white/10
      border border-white/15 hover:border-white/30
      text-white/70 hover:text-white
      hover:-translate-y-0.5
    `,
    white: `
      bg-white hover:bg-white/90
      text-black
      shadow-[0_8px_32px_rgba(255,255,255,0.15)]
      hover:shadow-[0_12px_40px_rgba(255,255,255,0.2)]
      hover:-translate-y-0.5
    `,
    danger: `
      bg-rose-500/10 hover:bg-rose-500/20
      border border-rose-500/20 hover:border-rose-500/40
      text-rose-400 hover:text-rose-300
      hover:-translate-y-0.5
    `,
  }

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Shimmer overlay on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />

      {/* Loading spinner */}
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}

      {/* Icon left */}
      {icon && iconPosition === 'left' && !loading && (
        <span className="flex-shrink-0">{icon}</span>
      )}

      {/* Label */}
      <span className="relative z-10">{children}</span>

      {/* Icon right */}
      {icon && iconPosition === 'right' && !loading && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </motion.button>
  )
}
