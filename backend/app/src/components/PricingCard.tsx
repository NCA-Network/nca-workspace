import PillButton from './PillButton'

interface PricingCardProps {
  plan: string
  price: string
  period: string
  features: string[]
  ctaText: string
  ctaVariant: 'primary' | 'accent' | 'outline-dark'
  featured?: boolean
  badge?: string
}

export default function PricingCard({
  plan,
  price,
  period,
  features,
  ctaText,
  ctaVariant,
  featured = false,
  badge,
}: PricingCardProps) {
  if (featured) {
    return (
      <div className="relative flex-1 max-w-[360px] -translate-y-3">
        {badge && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="inline-block font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1a1814] bg-[#d4a574] px-3 py-1 rounded-full">
              {badge}
            </span>
          </div>
        )}
        <div
          className="bg-[#1a1814] rounded-2xl p-12 pb-9 shadow-[0_24px_64px_rgba(26,24,20,0.2)]"
        >
          <p className="label-text text-[#d4a574]">{plan}</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span
              className="font-display text-[#f5f3ef]"
              style={{ fontSize: 'clamp(40px, 3vw, 56px)', fontWeight: 400 }}
            >
              {price}
            </span>
            <span className="font-body text-base font-normal text-[#8a8580]">
              {period}
            </span>
          </div>
          <div className="border-t border-[rgba(245,243,239,0.1)] my-6" />
          <ul className="space-y-1">
            {features.map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-3 font-body text-base font-normal text-[rgba(245,243,239,0.85)] leading-[2.2]"
              >
                <svg
                  className="w-4 h-4 text-[#2d6b6b] mt-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <PillButton variant="accent" fullWidth>
              {ctaText}
            </PillButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-[360px]">
      <div className="bg-[#f5f3ef] rounded-2xl border border-[#e0dcd6] p-12 pb-9">
        <p className="label-text text-[#8a8580]">{plan}</p>
        <div className="mt-3 flex items-baseline gap-1">
          <span
            className="font-display text-[#1a1814]"
            style={{ fontSize: 'clamp(40px, 3vw, 56px)', fontWeight: 400 }}
          >
            {price}
          </span>
          <span className="font-body text-base font-normal text-[#8a8580]">
            {period}
          </span>
        </div>
        <div className="border-t border-[#e0dcd6] my-6" />
        <ul className="space-y-1">
          {features.map((feature, i) => (
            <li
              key={i}
              className="flex items-start gap-3 font-body text-base font-normal text-[#3a3a3a] leading-[2.2]"
            >
              <svg
                className="w-4 h-4 text-[#2d6b6b] mt-2 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <PillButton variant={ctaVariant} fullWidth>
            {ctaText}
          </PillButton>
        </div>
      </div>
    </div>
  )
}
