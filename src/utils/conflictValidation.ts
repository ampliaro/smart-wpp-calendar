import { Appointment } from '../types'
import { parseISO, isBefore, isAfter } from 'date-fns'

/**
 * Verifica se dois slots de tempo se sobrepõem
 */
function timeSlotsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseISO(`2000-01-01T${start1}:00`)
  const e1 = parseISO(`2000-01-01T${end1}:00`)
  const s2 = parseISO(`2000-01-01T${start2}:00`)
  const e2 = parseISO(`2000-01-01T${end2}:00`)

  return isBefore(s1, e2) && isAfter(e1, s2)
}

/**
 * Valida se paciente já tem agendamento no mesmo dia/horário
 */
export function validatePatientConflict(
  patientId: string,
  date: string,
  startTime: string,
  endTime: string,
  appointments: Appointment[],
  excludeAppointmentId?: string
): { valid: boolean; conflictingAppointment?: Appointment; error?: string } {
  const conflict = appointments.find((apt) => {
    // Ignora o appointment que está sendo editado
    if (apt.id === excludeAppointmentId) return false

    // Ignora cancelados
    if (apt.status === 'cancelado') return false

    // Verifica se é o mesmo paciente
    if (apt.patientId !== patientId) return false

    // Verifica se é o mesmo dia
    if (apt.date !== date) return false

    // Verifica sobreposição de horários
    return timeSlotsOverlap(startTime, endTime, apt.startTime, apt.endTime)
  })

  if (conflict) {
    return {
      valid: false,
      conflictingAppointment: conflict,
      error: `Conflito: o paciente já possui agendamento às ${conflict.startTime} nesta data`,
    }
  }

  return { valid: true }
}

/**
 * Valida se profissional já tem agendamento no mesmo horário
 */
export function validateProfessionalConflict(
  professionalId: string,
  date: string,
  startTime: string,
  endTime: string,
  appointments: Appointment[],
  excludeAppointmentId?: string
): { valid: boolean; conflictingAppointment?: Appointment; error?: string } {
  const conflict = appointments.find((apt) => {
    // Ignora o appointment que está sendo editado
    if (apt.id === excludeAppointmentId) return false

    // Ignora cancelados
    if (apt.status === 'cancelado') return false

    // Verifica se é o mesmo profissional
    if (apt.professionalId !== professionalId) return false

    // Verifica se é o mesmo dia
    if (apt.date !== date) return false

    // Verifica sobreposição de horários
    return timeSlotsOverlap(startTime, endTime, apt.startTime, apt.endTime)
  })

  if (conflict) {
    return {
      valid: false,
      conflictingAppointment: conflict,
      error: `Conflito: o profissional já possui agendamento às ${conflict.startTime}`,
    }
  }

  return { valid: true }
}

/**
 * Busca agendamentos futuros de um paciente
 */
export function getPatientFutureAppointments(
  patientId: string,
  appointments: Appointment[]
): Appointment[] {
  const now = new Date()

  return appointments
    .filter((apt) => {
      if (apt.patientId !== patientId) return false
      if (apt.status === 'cancelado' || apt.status === 'concluido') return false

      const aptDateTime = parseISO(`${apt.date}T${apt.startTime}:00`)
      return isAfter(aptDateTime, now)
    })
    .sort((a, b) => {
      const dateA = parseISO(`${a.date}T${a.startTime}:00`)
      const dateB = parseISO(`${b.date}T${b.startTime}:00`)
      return dateA.getTime() - dateB.getTime()
    })
}

/**
 * Verifica duplicatas de pacientes (por telefone)
 */
export function deduplicatePatientsByPhone<T extends { phone: string }>(
  patients: T[]
): T[] {
  const seen = new Set<string>()
  const unique: T[] = []

  patients.forEach((patient) => {
    const normalizedPhone = patient.phone.replace(/\D/g, '') // Remove não-dígitos
    if (!seen.has(normalizedPhone)) {
      seen.add(normalizedPhone)
      unique.push(patient)
    } else {
      console.warn('⚠️ Paciente duplicado removido:', patient)
    }
  })

  return unique
}
