import { useEffect } from 'react'
import { useAppointmentStore } from '../stores/appointmentStore'

/**
 * Hook para verificar e expirar reservas com TTL vencido
 */
export function useExpiredReservations() {
  const { checkExpiredReservations } = useAppointmentStore()

  useEffect(() => {
    // Verifica a cada 30 segundos
    const interval = setInterval(() => {
      checkExpiredReservations()
    }, 30000)

    // Verifica imediatamente ao montar
    checkExpiredReservations()

    return () => clearInterval(interval)
  }, [checkExpiredReservations])
}
