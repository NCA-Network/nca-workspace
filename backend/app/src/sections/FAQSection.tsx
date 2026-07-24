import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeader from '../components/SectionHeader'
import FAQItem from '../components/FAQItem'

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    question: 'How does the AI understand my products?',
    answer:
      'BusinessAI learns from your catalog import — descriptions, prices, categories, and images. It uses this knowledge to recommend the right products and answer detailed questions about availability, sizing, specifications, and more.',
  },
  {
    question: 'Can I customize the conversation flows?',
    answer:
      'Yes. Pro and Business plans allow you to create custom conversation paths, set up conditional responses, and define when conversations should be handed off to your human team.',
  },
  {
    question: 'Is WhatsApp Business API required?',
    answer:
      'Yes, you need a verified WhatsApp Business API account. We guide you through the setup process — it typically takes under 30 minutes.',
  },
  {
    question: 'What happens when the AI cannot answer?',
    answer:
      'The AI is trained to recognize its limitations. When a question is too complex or requires human judgment, it seamlessly transfers the conversation to your team with full context.',
  },
  {
    question: 'Is my customer data secure?',
    answer:
      'Absolutely. All conversations are encrypted end-to-end. We are GDPR compliant and never store or share your customer data with third parties.',
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Of course. You can upgrade, downgrade, or cancel your plan at any time from your dashboard. No long-term contracts, no penalties.',
  },
]

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!listRef.current) return

    const items = listRef.current.querySelectorAll('.faq-item')

    gsap.fromTo(
      items,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: listRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: listRef })

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section id="faq" className="bg-[#f5f3ef] py-[120px]">
      <div className="content-container-narrow">
        <SectionHeader
          label="FAQ"
          heading="Questions? Answered."
        />

        <div ref={listRef} className="mt-14">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={activeIndex === i}
                onToggle={() => handleToggle(i)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
