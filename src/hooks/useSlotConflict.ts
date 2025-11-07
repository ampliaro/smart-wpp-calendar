import { useMemo } from 'react'
import { useAppointmentStore } from '../stores/appointmentStore'
import { hasSlotConflict as checkSlotConflict } from '../utils/appointmentValidation'

/**
 * Hook para verificar conflitos de slots
 */
export function useSlotConflict(
  date: string,
  startTime: string,
  endTime: string,
  professionalId: string,
  excludeAppointmentId?: string
) {
  const { appointments } = useAppointmentStore()

  const hasConflict = useMemo(() => {
    return checkSlotConflict(
      date,
      startTime,
      endTime,
      professionalId,
      appointments,
      excludeAppointmentId
    )
  }, [date, startTime, endTime, professionalId, appointments, excludeAppointmentId])

  return hasConflict
}
