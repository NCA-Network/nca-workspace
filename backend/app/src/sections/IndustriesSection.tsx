import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeader from '../components/SectionHeader'
import IndustryCard from '../components/IndustryCard'

gsap.registerPlugin(ScrollTrigger)

const industries = [
  {
    label: 'E-Commerce',
    gradientFrom: '#5a6b7a',
    gradientTo: '#4a5568',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: 'Restaurants',
    gradientFrom: '#8b6f4e',
    gradientTo: '#7a6244',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v1c0 1 2 1 2 2S3 6 3 7s2 1 2 2-2 1-2 2 2 1 2 2" />
        <path d="M18 2v1c0 1 2 1 2 2s-2 1-2 2 2 1 2 2-2 1-2 2 2 1 2 2" />
        <path d="M8 22V2" />
        <path d="M16 22V2" />
        <path d="M12 22V8" />
        <path d="M12 8a4 4 0 0 1 4-4" />
      </svg>
    ),
  },
  {
    label: 'Fashion',
    gradientFrom: '#7a5a6e',
    gradientTo: '#6b4f60',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
  },
  {
    label: 'Electronics',
    gradientFrom: '#4a6b6b',
    gradientTo: '#3d5a5a',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
      </svg>
    ),
  },
  {
    label: 'Services',
    gradientFrom: '#6b6b5a',
    gradientTo: '#5a5a4d',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    label: 'Health & Wellness',
    gradientFrom: '#5a6e6b',
    gradientTo: '#4d605d',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    label: 'Real Estate',
    gradientFrom: '#6e5a5a',
    gradientTo: '#5a4d4d',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Education',
    gradientFrom: '#5a5a6e',
    gradientTo: '#4d4d5a',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
]

export default function IndustriesSection() {
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!gridRef.current) return

    const cards = gridRef.current.querySelectorAll('.industry-card')

    gsap.fromTo(
      cards,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: gridRef })

  return (
    <section id="industries" className="bg-[#f5f3ef] py-[120px]">
      <div className="content-container">
        <SectionHeader
          label="FOR EVERY BUSINESS"
          heading="Built for Your Industry"
        />

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
        >
          {industries.map((industry, i) => (
            <div key={i} className="industry-card">
              <IndustryCard
                icon={industry.icon}
                label={industry.label}
                gradientFrom={industry.gradientFrom}
                gradientTo={industry.gradientTo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
