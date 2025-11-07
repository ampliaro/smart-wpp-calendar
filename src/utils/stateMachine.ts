import { AppointmentStatus } from '../types'

export const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  disponivel: ['reservado_pendente'],
  reservado_pendente: ['confirmado', 'disponivel', 'cancelado'],
  confirmado: ['lembrado', 'cancelado', 'no_show', 'concluido'],
  lembrado: ['concluido', 'no_show', 'cancelado'],
  concluido: [],
  no_show: [],
  cancelado: [],
}

export function canTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

export function transitionAppointment(
  currentStatus: AppointmentStatus,
  newStatus: AppointmentStatus
): AppointmentStatus {
  if (canTransition(currentStatus, newStatus)) {
    return newStatus
  }
  console.warn(`Invalid transition from ${currentStatus} to ${newStatus}`)
  return currentStatus
}
