import {
  addHours,
  addMinutes,
  isBefore,
  isAfter,
  parseISO,
  format,
  parse,
} from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
import { Appointment } from '../types'
import { Policy, BusinessHours } from '../config/profiles'

const TIMEZONE = 'America/Sao_Paulo'

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Valida se o agendamento atende a antecedência mínima
 */
export function validateLeadTime(
  appointmentDate: string,
  appointmentTime: string,
  policy: Policy
): ValidationResult {
  const now = new Date()
  const appointmentDateTime = parseISO(`${appointmentDate}T${appointmentTime}:00`)
  const minimumTime = addMinutes(now, policy.leadTimeMinutes)

  if (isBefore(appointmentDateTime, minimumTime)) {
    return {
      valid: false,
      error: `É necessário agendar com pelo menos ${policy.leadTimeMinutes / 60} horas de antecedência`,
    }
  }

  return { valid: true }
}

/**
 * Valida se o reagendamento está dentro do prazo permitido
 */
export function validateRescheduling(
  currentAppointmentDate: string,
  currentAppointmentTime: string,
  policy: Policy
): ValidationResult {
  const now = new Date()
  const appointmentDateTime = parseISO(
    `${currentAppointmentDate}T${currentAppointmentTime}:00`
  )
  const reschedulingDeadline = addHours(
    appointmentDateTime,
    -policy.reschedulingHoursBefore
  )

  if (isAfter(now, reschedulingDeadline)) {
    return {
      valid: false,
      error: `Reagendamento deve ser feito com pelo menos ${policy.reschedulingHoursBefore} horas de antecedência`,
    }
  }

  return { valid: true }
}

/**
 * Verifica se há conflito com outro agendamento
 */
export function hasSlotConflict(
  date: string,
  startTime: string,
  endTime: string,
  professionalId: string,
  appointments: Appointment[],
  excludeAppointmentId?: string
): boolean {
  const newStart = parse(startTime, 'HH:mm', new Date())
  const newEnd = parse(endTime, 'HH:mm', new Date())

  return appointments.some((apt) => {
    if (apt.id === excludeAppointmentId) return false
    if (apt.date !== date) return false
    if (apt.professionalId !== professionalId) return false
    if (['cancelado', 'no_show'].includes(apt.status)) return false

    const existingStart = parse(apt.startTime, 'HH:mm', new Date())
    const existingEnd = parse(apt.endTime, 'HH:mm', new Date())

    // Verifica sobreposição
    return (
      (isBefore(newStart, existingEnd) && isAfter(newEnd, existingStart)) ||
      (isBefore(existingStart, newEnd) && isAfter(existingEnd, newStart))
    )
  })
}

/**
 * Valida se o horário está dentro do horário comercial
 */
export function validateBusinessHours(
  date: string,
  startTime: string,
  endTime: string,
  businessHours: BusinessHours,
  holidays: string[]
): ValidationResult {
  // Verifica se é feriado
  if (holidays.includes(date)) {
    return {
      valid: false,
      error: 'Não há atendimento em feriados',
    }
  }

  // Obtém o dia da semana usando getDay() (mais confiável)
  const dateObj = parseISO(date)
  const dayOfWeekNum = dateObj.getDay()
  const dayMap = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  const dayKey = dayMap[dayOfWeekNum]

  const businessDay = businessHours[dayKey]

  if (!businessDay) {
    return {
      valid: false,
      error: 'Não há atendimento neste dia da semana',
    }
  }

  const start = parse(startTime, 'HH:mm', new Date())
  const end = parse(endTime, 'HH:mm', new Date())
  const businessStart = parse(businessDay.start, 'HH:mm', new Date())
  const businessEnd = parse(businessDay.end, 'HH:mm', new Date())

  if (isBefore(start, businessStart) || isAfter(end, businessEnd)) {
    return {
      valid: false,
      error: `Horário comercial: ${businessDay.start} às ${businessDay.end}`,
    }
  }

  return { valid: true }
}

/**
 * Verifica se deveria aplicar no-show
 */
export function shouldMarkAsNoShow(
  appointmentDate: string,
  appointmentTime: string,
  policy: Policy
): boolean {
  const now = new Date()
  const appointmentDateTime = parseISO(`${appointmentDate}T${appointmentTime}:00`)
  const noShowThreshold = addMinutes(appointmentDateTime, policy.noShowDelayMinutes)

  return isAfter(now, noShowThreshold)
}

/**
 * Gera slots disponíveis para um dia
 */
export function generateAvailableSlots(
  date: string,
  serviceDuration: number,
  businessHours: BusinessHours,
  holidays: string[],
  existingAppointments: Appointment[],
  professionalId: string
): string[] {
  // Verifica se é feriado
  if (holidays.includes(date)) {
    return []
  }

  // Mapeia dia da semana (date-fns retorna em inglês no formato EEEE)
  const dateObj = parseISO(date)
  const dayOfWeekNum = dateObj.getDay() // 0 = domingo, 6 = sábado

  const dayMap = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  const dayKey = dayMap[dayOfWeekNum]

  const businessDay = businessHours[dayKey]
  if (!businessDay) {
    return []
  }

  const slots: string[] = []
  const startParts = businessDay.start.split(':')
  const endParts = businessDay.end.split(':')

  let currentTime = new Date()
  currentTime.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0)

  const endTime = new Date()
  endTime.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0)

  while (isBefore(currentTime, endTime)) {
    const slotStart = format(currentTime, 'HH:mm')
    const slotEnd = format(addMinutes(currentTime, serviceDuration), 'HH:mm')

    // Verifica se o slot termina antes do fim do expediente
    const slotEndTime = addMinutes(currentTime, serviceDuration)
    if (isBefore(slotEndTime, endTime) || slotEndTime.getTime() === endTime.getTime()) {
      // Verifica conflitos
      if (
        !hasSlotConflict(date, slotStart, slotEnd, professionalId, existingAppointments)
      ) {
        slots.push(slotStart)
      }
    }

    currentTime = addMinutes(currentTime, 30) // Incrementa em intervalos de 30 min
  }

  return slots
}

/**
 * Previne buracos na agenda reagendando slots
 */
export function suggestOptimalSlots(
  availableSlots: string[],
  existingAppointments: Appointment[],
  date: string,
  professionalId: string
): string[] {
  // Prioriza slots adjacentes a agendamentos existentes
  const dayAppointments = existingAppointments
    .filter(
      (apt) =>
        apt.date === date &&
        apt.professionalId === professionalId &&
        !['cancelado', 'no_show'].includes(apt.status)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  if (dayAppointments.length === 0) {
    return availableSlots.slice(0, 5) // Retorna primeiros 5 slots
  }

  const optimal: string[] = []

  // Busca slots adjacentes
  for (const apt of dayAppointments) {
    // Slot logo após
    const nextSlot = availableSlots.find((slot) => slot === apt.endTime)
    if (nextSlot && !optimal.includes(nextSlot)) {
      optimal.push(nextSlot)
    }
  }

  // Completa com slots regulares
  for (const slot of availableSlots) {
    if (!optimal.includes(slot)) {
      optimal.push(slot)
    }
    if (optimal.length >= 5) break
  }

  return optimal
}
