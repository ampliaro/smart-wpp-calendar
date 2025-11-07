import { useEffect } from 'react'
import { useAppointmentStore } from '../stores/appointmentStore'

/**
 * Hook para detectar e marcar no-shows automaticamente
 */
export function useNoShow() {
  const { checkNoShows } = useAppointmentStore()

  useEffect(() => {
    // Verifica no-shows a cada minuto
    const interval = setInterval(() => {
      checkNoShows()
    }, 60000)

    // Verifica imediatamente ao montar
    checkNoShows()

    return () => clearInterval(interval)
  }, [checkNoShows])
}
