import React from 'react'

interface IndustryCardProps {
  icon: React.ReactNode
  label: string
  gradientFrom: string
  gradientTo: string
}

export default function IndustryCard({
  icon,
  label,
  gradientFrom,
  gradientTo,
}: IndustryCardProps) {
  return (
    <div
      className="group relative aspect-[1/1.2] rounded-2xl overflow-hidden cursor-pointer transition-transform duration-400 ease-out hover:scale-[1.03]"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <div className="absolute inset-0 bg-[rgba(26,24,20,0)] group-hover:bg-[rgba(26,24,20,0.1)] transition-colors duration-400" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[rgba(255,255,255,0.9)]">{icon}</div>
      </div>
      <span className="absolute bottom-6 left-6 font-body text-lg font-semibold text-[#f5f3ef]">
        {label}
      </span>
    </div>
  )
}
