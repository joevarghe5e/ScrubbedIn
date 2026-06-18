interface Props {
  pct: number
  color?: string
  height?: string
}

export function AnimatedBar({ pct, color = '#14B8A6', height = '6px' }: Props) {
  return (
    <div className="w-full rounded-full overflow-hidden bg-[#162035]" style={{ height }}>
      <div
        className="h-full rounded-full animate-progress"
        style={{ width: `${Math.min(pct, 100)}%`, background: color, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </div>
  )
}
