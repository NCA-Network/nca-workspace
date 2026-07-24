import React, { useRef } from 'react'
import gsap from 'gsap'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

export default function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  const answerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)

  const handleToggle = () => {
    onToggle()
  }

  React.useEffect(() => {
    if (!answerRef.current || !iconRef.current) return

    if (isOpen) {
      gsap.to(answerRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      })
      gsap.to(iconRef.current, {
        rotation: 45,
        duration: 0.3,
      })
    } else {
      gsap.to(answerRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
      gsap.to(iconRef.current, {
        rotation: 0,
        duration: 0.3,
      })
    }
  }, [isOpen])

  return (
    <div className="border-b border-[#e0dcd6] py-6">
      <button
        className="w-full flex items-center justify-between text-left cursor-pointer group"
        onClick={handleToggle}
      >
        <span className="font-body text-lg font-medium text-[#1a1814] pr-8">
          {question}
        </span>
        <span
          ref={iconRef}
          className="font-body text-2xl font-light text-[#8a8580] flex-shrink-0"
        >
          +
        </span>
      </button>
      <div
        ref={answerRef}
        className="overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        <p className="font-body text-base font-normal text-[#8a8580] leading-relaxed pt-4">
          {answer}
        </p>
      </div>
    </div>
  )
}
