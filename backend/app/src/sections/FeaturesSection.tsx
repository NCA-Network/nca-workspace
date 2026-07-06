import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeader from '../components/SectionHeader'
import FeatureCard from '../components/FeatureCard'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5f3ef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Instant Replies',
    description: 'Answer customer inquiries in seconds, 24/7. Never miss a message or lose a lead to slow response times.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5f3ef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 0-8 8c0 3.866 3.134 7 7 7h2c3.866 0 7-3.134 7-7a8 8 0 0 0-8-8z" />
        <path d="M9.5 10a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z" />
        <path d="M14.5 10a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z" />
        <path d="M10 14c.5 1 1.5 1.5 2 1.5s1.5-.5 2-1.5" />
        <path d="M12 2v2" />
        <path d="M12 18v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6.34 17.66l-1.41 1.41" />
        <path d="M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
    title: 'Smart Understanding',
    description: 'AI that truly understands context, intent, and natural language. Handles complex requests with ease.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5f3ef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'Product Catalog',
    description: 'Showcase your full inventory with rich media, descriptions, and pricing — right inside the chat.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5f3ef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
    title: 'FAQ Automation',
    description: 'Automatically answer common questions about hours, delivery, payments, and policies.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5f3ef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Human Handoff',
    description: 'Seamlessly transfer complex conversations to your team when AI needs a human touch.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5f3ef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
    title: 'Analytics & Insights',
    description: 'Track conversations, response times, popular products, and customer satisfaction trends.',
  },
]

export default function FeaturesSection() {
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!gridRef.current) return

    const cards = gridRef.current.querySelectorAll('.feature-card')

    gsap.fromTo(
      cards,
      { opacity: 0, y: 50, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: gridRef })

  return (
    <section id="features" className="bg-[#ece9e4] py-[120px]">
      <div className="content-container">
        <SectionHeader
          label="FEATURES"
          heading="Everything Your Customers Need"
          subtext="One platform. Infinite conversations. Your AI assistant handles it all."
          narrow
        />

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16"
        >
          {features.map((feature, i) => (
            <div key={i} className="feature-card">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
