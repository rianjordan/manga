import { useToast } from '../../store/toast'
import type { ToastType } from '../../store/toast'

const iconMap: Record<ToastType, string> = {
  success: 'fa-solid fa-circle-check',
  error: 'fa-solid fa-circle-xmark',
  warning: 'fa-solid fa-triangle-exclamation',
  info: 'fa-solid fa-circle-info',
}

const colorMap: Record<ToastType, string> = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  error: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-400',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-[toastSlideIn_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards] ${colorMap[toast.type]}`}
        >
          <i className={`${iconMap[toast.type]} text-lg flex-shrink-0`} />
          <span className="text-sm font-semibold text-white flex-grow">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/40 hover:text-white transition-colors cursor-pointer flex-shrink-0"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      ))}
    </div>
  )
}
