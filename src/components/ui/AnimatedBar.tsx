interface Props {
  pct: number
  color?: string
  height?: string
}

export function AnimatedBar({ pct, color = '#1B2B6B', height = '6px' }: Props) {
  return (
    <div className="w-full rounded-full overflow-hidden bg-[#EEF2FF]" style={{ height }}>
      <div
        className="h-full rounded-full animate-progress"
        style={{ width: `${Math.min(pct, 100)}%`, background: color, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </div>
  )
}
