import React from 'react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group bg-[#f5f3ef] rounded-2xl border border-[#e0dcd6] p-10 pb-8 transition-all duration-300 ease-out hover:border-[#d4a574] hover:shadow-[0_8px_32px_rgba(26,24,20,0.06)] hover:-translate-y-1">
      <div className="w-12 h-12 bg-[#1a1814] rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-body text-xl font-semibold text-[#1a1814] mt-6">
        {title}
      </h3>
      <p className="font-body text-base font-normal text-[#8a8580] mt-3 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
