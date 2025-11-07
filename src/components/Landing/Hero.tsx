import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import ChatMockCard from './ChatMockCard'
import Footer from '../Footer/Footer'

export default function Hero() {
  const { scrollY } = useScroll()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Parallax effect
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Track mouse for gradient movement
  useEffect(() => {
    if (prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [prefersReducedMotion])

  const handleCTA = (profile: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('profile', profile)
    url.searchParams.set('mode', 'light')
    url.searchParams.set('app', 'true')

    // Map profile to theme
    const themeMap: Record<string, string> = {
      odonto: 'clinicaClean',
      barbearia: 'barbeariaClassic',
      pilates: 'pilatesZen',
    }
    url.searchParams.set('theme', themeMap[profile] || 'clinicaClean')

    window.location.href = url.toString()
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-theme">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-30 transition-all duration-700"
        style={{
          background: prefersReducedMotion
            ? 'radial-gradient(circle at 50% 50%, var(--accent) 0%, transparent 70%)'
            : `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, var(--accent) 0%, transparent 70%)`,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Text content */}
            <motion.div
              style={{ y: prefersReducedMotion ? 0 : y1 }}
              className="text-center lg:text-left space-y-8"
            >
              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-theme leading-tight"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Agenda Inteligente
                  <br />
                  <span className="text-accent">por WhatsApp</span>
                </h1>

                <p
                  className="text-lg md:text-xl text-muted max-w-2xl mx-auto lg:mx-0"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Confirmações, lembretes e relatórios para reduzir no-show e organizar
                  sua agenda.
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <SuperButton
                  onClick={() => handleCTA('odonto')}
                  icon="🦷"
                  variant="odonto"
                >
                  Abrir Demo (Odonto)
                </SuperButton>

                <SuperButton
                  onClick={() => handleCTA('barbearia')}
                  icon="💈"
                  variant="barbearia"
                >
                  Abrir Demo (Barbearia)
                </SuperButton>
              </motion.div>

              {/* Secondary link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center lg:text-left"
              >
                <button
                  onClick={() => handleCTA('pilates')}
                  className="pilates-link text-sm underline underline-offset-4 transition-colors font-medium"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Ou veja a demo para Pilates →
                </button>
              </motion.div>
            </motion.div>

            {/* Right side - Chat mock card */}
            <motion.div
              style={{ y: prefersReducedMotion ? 0 : y2 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ChatMockCard />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Super button with animated gradient border
function SuperButton({
  children,
  onClick,
  icon,
  variant = 'odonto',
}: {
  children: React.ReactNode
  onClick: () => void
  icon?: string
  variant?: 'odonto' | 'barbearia' | 'pilates'
}) {
  return (
    <button
      onClick={onClick}
      className={`super-button super-button--${variant}`}
      style={{
        fontFamily: 'var(--font-body)',
      }}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span>{children}</span>
      <svg fill="none" viewBox="0 0 24 24" className="arrow">
        <path
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth="2"
          stroke="currentColor"
          d="M5 12h14M13 6l6 6-6 6"
        />
      </svg>
    </button>
  )
}
