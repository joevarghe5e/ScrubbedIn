interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full card-premium rounded-b-none animate-slide-up max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          {title && <h2 className="font-semibold text-slate-200">{title}</h2>}
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 text-xl leading-none">✕</button>
        </div>
        <div className="px-5 pb-8">{children}</div>
      </div>
    </div>
  )
}
