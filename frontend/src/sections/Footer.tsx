import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { getLenisInstance } from '../components/SmoothScrollProvider'

gsap.registerPlugin(ScrollTrigger)

const footerLinks = [
  {
    group: 'Product',
    links: ['Features', 'Pricing', 'Integrations', 'Changelog'],
  },
  {
    group: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press'],
  },
  {
    group: 'Resources',
    links: ['Documentation', 'API Reference', 'Community', 'Status'],
  },
  {
    group: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'Cookies'],
  },
]

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!footerRef.current) return

    gsap.fromTo(
      footerRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: footerRef })

  const handleLinkClick = (e: React.MouseEvent, target: string) => {
    e.preventDefault()
    const lenis = getLenisInstance()
    if (lenis) {
      lenis.scrollTo(target, { offset: -72 })
    }
  }

  return (
    <footer ref={footerRef} className="bg-[#1a1814] pt-20 pb-10">
      <div className="content-container">
        {/* Footer Top */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12">
          {/* Left Column */}
          <div className="lg:max-w-[280px]">
            <a href="#" className="font-display text-xl tracking-normal">
              <span className="text-[#f5f3ef]">Business</span>
              <span className="text-[#d4a574]">AI</span>
            </a>
            <p className="font-body text-sm font-normal text-[#8a8580] mt-2">
              Intelligent conversations. Infinite growth.
            </p>
          </div>

          {/* Right Columns */}
          <div className="flex flex-wrap gap-12 lg:gap-20">
            {footerLinks.map((group) => (
              <div key={group.group}>
                <h4 className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-[#f5f3ef] mb-4">
                  {group.group}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        onClick={(e) => handleLinkClick(e, '#features')}
                        className="font-body text-sm font-normal text-[#8a8580] hover:text-[#d4a574] transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-16 pt-6 border-t border-[rgba(245,243,239,0.1)]">
          <p className="font-body text-[13px] font-normal text-[#8a8580]">
            2026 BusinessAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {['X', 'in', 'f', 'ig'].map((icon) => (
              <a
                key={icon}
                href="#"
                className="w-8 h-8 rounded-full border border-[rgba(245,243,239,0.15)] flex items-center justify-center font-body text-xs text-[#8a8580] hover:border-[#d4a574] hover:text-[#d4a574] transition-colors duration-200"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
