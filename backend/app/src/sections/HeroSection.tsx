import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import FluidCanvas from '../components/FluidCanvas'
import { getLenisInstance } from '../components/SmoothScrollProvider'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return

    const tl = gsap.timeline({ delay: 0.3 })

    tl.fromTo(
      line1Ref.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
      .fromTo(
        line2Ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.65'
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )

    // Scroll indicator fade out
    gsap.fromTo(
      scrollIndicatorRef.current,
      { opacity: 1 },
      {
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '500px top',
          scrub: true,
        },
      }
    )
  }, { scope: sectionRef })

  const handleScrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault()
    const lenis = getLenisInstance()
    if (lenis) {
      lenis.scrollTo('#features', { offset: -72 })
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
    >
      {/* Fluid Canvas Background */}
      <FluidCanvas />

      {/* Hero Content */}
      <div
        className="relative z-[1] px-[clamp(24px,6vw,80px)] max-w-[600px]"
        style={{ transform: 'translateY(-10%)' }}
      >
        <h1
          className="font-display text-[#1a1814]"
          style={{
            fontSize: 'clamp(48px, 6vw, 96px)',
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
          }}
        >
          <span ref={line1Ref} className="block" style={{ opacity: 0 }}>
            Your Business,
          </span>
          <span ref={line2Ref} className="block mt-2" style={{ opacity: 0 }}>
            On Autopilot.
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="font-body text-lg font-normal text-[#3a3a3a] mt-6 max-w-[420px] leading-relaxed"
          style={{ opacity: 0 }}
        >
          AI-powered WhatsApp assistant that answers customers, showcases
          products, and drives sales — 24/7.
        </p>

        <div
          ref={ctaRef}
          className="flex items-center gap-4 mt-10 flex-wrap"
          style={{ opacity: 0 }}
        >
          <a
            href="#pricing"
            onClick={handleScrollToFeatures}
            className="inline-flex items-center justify-center rounded-full px-9 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.04em] bg-[#1a1814] text-[#f5f3ef] hover:bg-[#2d2a24] hover:scale-[1.03] transition-all duration-250 ease-out active:scale-[0.98]"
          >
            Start Free Trial
          </a>
          <a
            href="#how-it-works"
            onClick={handleScrollToFeatures}
            className="inline-flex items-center justify-center rounded-full px-9 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.04em] bg-transparent border-[1.5px] border-[#1a1814] text-[#1a1814] hover:bg-[#1a1814] hover:text-[#f5f3ef] transition-all duration-250 ease-out active:scale-[0.98]"
          >
            Watch Demo
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1] scroll-indicator"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1a1814"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  )
}
