import { useState, useCallback } from 'react'

export interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((type: ToastData['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback(
    (message: string) => showToast('success', message),
    [showToast]
  )
  const error = useCallback((message: string) => showToast('error', message), [showToast])
  const warning = useCallback(
    (message: string) => showToast('warning', message),
    [showToast]
  )
  const info = useCallback((message: string) => showToast('info', message), [showToast])

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
