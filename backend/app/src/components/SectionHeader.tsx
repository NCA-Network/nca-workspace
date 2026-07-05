import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

interface SectionHeaderProps {
  label: string
  heading: string
  subtext?: string
  dark?: boolean
  narrow?: boolean
  className?: string
}

export default function SectionHeader({
  label,
  heading,
  subtext,
  dark = false,
  narrow = false,
  className = '',
}: SectionHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    tl.fromTo(
      labelRef.current,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    )
      .fromTo(
        headingRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.2'
      )

    if (subtextRef.current) {
      tl.fromTo(
        subtextRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
    }
  }, { scope: containerRef })

  const labelColor = dark ? 'text-[#d4a574]' : 'text-[#d4a574]'
  const headingColor = dark ? 'text-[#f5f3ef]' : 'text-[#1a1814]'
  const subtextColor = dark ? 'text-[#8a8580]' : 'text-[#8a8580]'

  return (
    <div ref={containerRef} className={className}>
      <p
        ref={labelRef}
        className={`label-text ${labelColor} mb-4`}
      >
        {label}
      </p>
      <h2
        ref={headingRef}
        className={`font-display ${headingColor} ${
          narrow ? 'max-w-[700px]' : ''
        }`}
        style={{
          fontSize: 'clamp(36px, 4vw, 64px)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
        }}
      >
        {heading}
      </h2>
      {subtext && (
        <p
          ref={subtextRef}
          className={`font-body text-lg font-normal ${subtextColor} mt-4 ${
            narrow ? 'max-w-[480px]' : ''
          }`}
          style={{ lineHeight: 1.6 }}
        >
          {subtext}
        </p>
      )}
    </div>
  )
}
