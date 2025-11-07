import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  }

  const colors = {
    success: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
    error: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
    warning: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
    info: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  }

  const style = colors[type]

  return (
    <div
      className="fixed top-6 right-6 z-50 rounded-theme shadow-lg p-4 flex items-center gap-3 animate-slide-in max-w-md"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderLeft: `4px solid ${style.border}`,
      }}
    >
      <div style={{ color: style.border }}>{icons[type]}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-xl leading-none opacity-70 hover:opacity-100 transition-opacity"
        style={{ color: style.text }}
      >
        ×
      </button>
    </div>
  )
}
