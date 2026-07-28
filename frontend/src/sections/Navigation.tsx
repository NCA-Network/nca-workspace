import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenisInstance } from '../components/SmoothScrollProvider'

gsap.registerPlugin(ScrollTrigger)

const navLinks = [
  { label: 'Features', target: '#features' },
  { label: 'How It Works', target: '#how-it-works' },
  { label: 'Industries', target: '#industries' },
  { label: 'Pricing', target: '#pricing' },
]

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: '100vh top',
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    })

    return () => {
      trigger.kill()
    }
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
    const lenis = getLenisInstance()
    if (lenis) {
      lenis.scrollTo(target, { offset: -72 })
    } else {
      const el = document.querySelector(target)
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 72
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
  }

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center transition-shadow duration-300"
      style={{
        backgroundColor: 'rgba(245, 243, 239, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(232, 229, 224, 0.6)',
        boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.05)' : 'none',
      }}
    >
      <div className="content-container w-full flex items-center justify-between">
        {/* Wordmark */}
        <a
          href="#"
          className="font-display text-lg tracking-normal select-none"
          onClick={(e) => {
            e.preventDefault()
            const lenis = getLenisInstance()
            if (lenis) lenis.scrollTo(0)
            else window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <span className="text-[#1a1814]">Business</span>
          <span className="text-[#d4a574]">AI</span>
        </a>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.target}
              onClick={(e) => handleNavClick(e, link.target)}
              className="font-body text-sm font-medium text-[#1a1814] hover:text-[#d4a574] transition-colors duration-250 tracking-[0.02em]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth CTAs */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/login"
            className="font-body text-sm font-medium text-[#1a1814] hover:text-[#d4a574] transition-colors duration-250 tracking-[0.02em]"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="font-body text-sm font-semibold uppercase tracking-[0.04em] text-[#1a1814] bg-[#d4a574] px-7 py-2.5 rounded-full hover:bg-[#c49464] hover:scale-[1.02] transition-all duration-250 ease-out"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
