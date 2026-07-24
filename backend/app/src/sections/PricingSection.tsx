import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeader from '../components/SectionHeader'
import PricingCard from '../components/PricingCard'

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    plan: 'Starter',
    price: '$0',
    period: '/month',
    features: [
      '100 AI conversations/month',
      '1 team member',
      'Basic product catalog',
      'FAQ automation',
      'Email support',
    ],
    ctaText: 'Start Free',
    ctaVariant: 'primary' as const,
    featured: false,
  },
  {
    plan: 'Pro',
    price: '$49',
    period: '/month',
    features: [
      'Unlimited AI conversations',
      '5 team members',
      'Full product catalog',
      'Advanced FAQ & custom flows',
      'Human handoff',
      'Priority support',
    ],
    ctaText: 'Start Pro Trial',
    ctaVariant: 'accent' as const,
    featured: true,
    badge: 'Most Popular',
  },
  {
    plan: 'Business',
    price: '$149',
    period: '/month',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom AI training',
      'API access',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    ctaText: 'Contact Sales',
    ctaVariant: 'outline-dark' as const,
    featured: false,
  },
]

export default function PricingSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const cards = containerRef.current.querySelectorAll('.pricing-card')

    // Side cards
    gsap.fromTo(
      [cards[0], cards[2]],
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )

    // Center card with scale
    gsap.fromTo(
      cards[1],
      { opacity: 0, scale: 0.95, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: -12,
        duration: 0.7,
        ease: 'back.out(1.2)',
        delay: 0.15,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: containerRef })

  return (
    <section id="pricing" className="bg-[#ece9e4] py-[120px]">
      <div className="content-container-pricing">
        <SectionHeader
          label="PRICING"
          heading="Simple, Transparent Pricing"
          subtext="Start free. Scale as you grow. No hidden fees."
        />

        <div
          ref={containerRef}
          className="flex flex-col md:flex-row items-stretch justify-center gap-6 mt-16"
        >
          {plans.map((plan, i) => (
            <div key={i} className="pricing-card flex justify-center">
              <PricingCard
                plan={plan.plan}
                price={plan.price}
                period={plan.period}
                features={plan.features}
                ctaText={plan.ctaText}
                ctaVariant={plan.ctaVariant}
                featured={plan.featured}
                badge={plan.badge}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
