interface PillButtonProps {
  children: import('react').ReactNode
  variant?: 'primary' | 'secondary' | 'inverse' | 'outline-inverse' | 'accent' | 'outline-dark'
  className?: string
  onClick?: ((e: import('react').MouseEvent) => void) | (() => void)
  fullWidth?: boolean
}

export default function PillButton({
  children,
  variant = 'primary',
  className = '',
  onClick,
  fullWidth = false,
}: PillButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-full px-9 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.04em] transition-all duration-250 ease-out cursor-pointer select-none active:scale-[0.98]'

  const variantStyles = {
    primary:
      'bg-[#1a1814] text-[#f5f3ef] hover:bg-[#2d2a24] hover:scale-[1.03]',
    secondary:
      'bg-transparent border-[1.5px] border-[#1a1814] text-[#1a1814] hover:bg-[#1a1814] hover:text-[#f5f3ef] hover:scale-[1.03]',
    inverse:
      'bg-[#d4a574] text-[#1a1814] hover:bg-[#c49464] hover:scale-[1.03]',
    'outline-inverse':
      'bg-transparent border-[1.5px] border-[#f5f3ef] text-[#f5f3ef] hover:bg-[#f5f3ef] hover:text-[#1a1814] hover:scale-[1.03]',
    accent:
      'bg-[#d4a574] text-[#1a1814] hover:bg-[#c49464] hover:scale-[1.03]',
    'outline-dark':
      'bg-transparent border-[1.5px] border-[#1a1814] text-[#1a1814] hover:bg-[#1a1814] hover:text-[#f5f3ef] hover:scale-[1.03]',
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
