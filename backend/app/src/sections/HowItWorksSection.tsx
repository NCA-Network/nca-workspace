import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeader from '../components/SectionHeader'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: '01',
    title: 'Connect WhatsApp',
    description: 'Link your WhatsApp Business API account with a single click. Secure, encrypted, and instant.',
  },
  {
    number: '02',
    title: 'Upload Your Catalog',
    description: 'Import products, set prices, add descriptions. Your AI learns your business in real time.',
  },
  {
    number: '03',
    title: 'Go Live',
    description: 'Your assistant starts answering customers immediately. Watch conversations flow while you focus on growth.',
  },
]

export default function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const stepEls = containerRef.current.querySelectorAll('.step-item')

    gsap.fromTo(
      stepEls,
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: containerRef })

  return (
    <section id="how-it-works" className="bg-[#1a1814] py-[120px]">
      <div className="content-container">
        <SectionHeader
          label="HOW IT WORKS"
          heading="Set Up in Minutes, Not Days"
          subtext="Connect your WhatsApp Business account and let AI handle the rest."
          dark
        />

        <div
          ref={containerRef}
          className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-12 mt-20"
        >
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-6 lg:gap-8 flex-1">
              <div className="step-item flex-1">
                <span
                  className="font-display text-[rgba(212,165,116,0.15)] block"
                  style={{
                    fontSize: 'clamp(64px, 8vw, 96px)',
                    fontWeight: 400,
                    lineHeight: 0.9,
                  }}
                >
                  {step.number}
                </span>
                <h3 className="font-body text-2xl font-semibold text-[#f5f3ef] mt-4">
                  {step.title}
                </h3>
                <p className="font-body text-base font-normal text-[#8a8580] mt-3 max-w-[320px] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden lg:flex items-center flex-shrink-0 self-center mt-[-40px]">
                  <div className="relative w-24">
                    <div className="h-px bg-[rgba(245,243,239,0.1)] w-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#d4a574]" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
