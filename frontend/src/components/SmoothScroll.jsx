import { ReactLenis } from '@studio-freight/react-lenis'

export default function SmoothScroll({ children }) {
  const lenisOptions = {
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  }

  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  )
}
