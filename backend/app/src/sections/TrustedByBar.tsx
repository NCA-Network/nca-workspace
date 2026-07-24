import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const logos = ['SHOPIFY', 'WOOCOMMERCE', 'MAGENTO', 'BIGCOMMERCE', 'SQUARESPACE', 'WIX']

export default function TrustedByBar() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: containerRef })

  return (
    <section className="bg-[#f5f3ef] py-12">
      <div ref={containerRef} className="content-container">
        <p className="caption-text text-[#8a8580] text-center tracking-[0.1em]">
          Trusted by businesses worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 mt-6">
          {logos.map((logo) => (
            <span
              key={logo}
              className="font-body text-base font-semibold text-[#c8c4be] opacity-60 hover:opacity-90 hover:text-[#8a8580] transition-all duration-300 cursor-default select-none"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
