import { Patient, Appointment, Professional } from '../types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getProfile } from '../config/profiles'

/**
 * Cria contexto consistente para mensagens
 * Garante que o nome usado seja SEMPRE do paciente correto
 */
export function createMessageContext(
  patient: Patient,
  appointment: Appointment,
  professional: Professional,
  profileId: string
): Record<string, string> {
  const profile = getProfile(profileId)
  const service = profile.services.find((s) => s.id === appointment.serviceId)

  // VALIDAÇÃO: Garante que estamos usando o paciente correto do appointment
  if (patient.id !== appointment.patientId) {
    console.error('❌ ERRO: Paciente não corresponde ao appointment!', {
      patientId: patient.id,
      appointmentPatientId: appointment.patientId,
    })
  }

  return {
    nome: patient.name.split(' ')[0], // Primeiro nome DESTE paciente
    servico: service?.name || 'consulta',
    profissional: professional.name.split(' ').slice(0, 2).join(' '),
    hora: appointment.startTime,
    data: format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR }),
  }
}

/**
 * Valida que os dados estão corretos antes de gerar mensagem
 */
export function validateMessageData(
  patientId: string,
  appointment: Appointment,
  context: Record<string, string>
): boolean {
  if (patientId !== appointment.patientId) {
    console.error('❌ IDs de paciente não batem:', {
      messagePatientId: patientId,
      appointmentPatientId: appointment.patientId,
      contextNome: context.nome,
    })
    return false
  }
  return true
}
