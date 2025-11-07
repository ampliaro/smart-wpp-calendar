import { Appointment, Metrics } from '../types'
import { differenceInMinutes, parseISO } from 'date-fns'

/**
 * Calcula métricas gerais dos agendamentos
 */
export function calculateMetrics(appointments: Appointment[]): Metrics {
  const total = appointments.length
  const confirmed = appointments.filter((apt) =>
    ['confirmado', 'lembrado', 'concluido'].includes(apt.status)
  ).length
  const noShows = appointments.filter((apt) => apt.status === 'no_show').length
  const cancellations = appointments.filter((apt) => apt.status === 'cancelado').length

  // Taxa de utilização: agendamentos concluídos / total de slots disponíveis
  const completed = appointments.filter((apt) => apt.status === 'concluido').length
  const utilizationRate = total > 0 ? (completed / total) * 100 : 0

  // Tempo médio até confirmação (em minutos)
  const confirmedAppointments = appointments.filter((apt) =>
    ['confirmado', 'lembrado', 'concluido'].includes(apt.status)
  )

  let totalConfirmationTime = 0
  confirmedAppointments.forEach((apt) => {
    const created = parseISO(apt.createdAt)
    const updated = parseISO(apt.updatedAt)
    totalConfirmationTime += differenceInMinutes(updated, created)
  })

  const averageConfirmationTime =
    confirmedAppointments.length > 0
      ? totalConfirmationTime / confirmedAppointments.length
      : 0

  return {
    totalAppointments: total,
    confirmedAppointments: confirmed,
    noShows,
    cancellations,
    utilizationRate,
    averageConfirmationTime,
  }
}

/**
 * Calcula taxa de no-show
 */
export function calculateNoShowRate(appointments: Appointment[]): number {
  const eligible = appointments.filter((apt) =>
    ['concluido', 'no_show'].includes(apt.status)
  ).length

  if (eligible === 0) return 0

  const noShows = appointments.filter((apt) => apt.status === 'no_show').length
  return (noShows / eligible) * 100
}

/**
 * Calcula taxa de confirmação
 */
export function calculateConfirmationRate(appointments: Appointment[]): number {
  const pending = appointments.filter((apt) => apt.status === 'reservado_pendente').length
  const confirmed = appointments.filter((apt) =>
    ['confirmado', 'lembrado', 'concluido'].includes(apt.status)
  ).length

  const total = pending + confirmed
  if (total === 0) return 0

  return (confirmed / total) * 100
}

/**
 * Agrupa agendamentos por dia
 */
export function groupAppointmentsByDay(
  appointments: Appointment[]
): Record<string, Appointment[]> {
  return appointments.reduce(
    (acc, apt) => {
      if (!acc[apt.date]) {
        acc[apt.date] = []
      }
      acc[apt.date].push(apt)
      return acc
    },
    {} as Record<string, Appointment[]>
  )
}

/**
 * Agrupa agendamentos por profissional
 */
export function groupAppointmentsByProfessional(
  appointments: Appointment[]
): Record<string, Appointment[]> {
  return appointments.reduce(
    (acc, apt) => {
      if (!acc[apt.professionalId]) {
        acc[apt.professionalId] = []
      }
      acc[apt.professionalId].push(apt)
      return acc
    },
    {} as Record<string, Appointment[]>
  )
}
