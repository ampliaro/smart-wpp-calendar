export type AppointmentStatus =
  | 'disponivel'
  | 'reservado_pendente'
  | 'confirmado'
  | 'lembrado'
  | 'concluido'
  | 'no_show'
  | 'cancelado'

export interface Professional {
  id: string
  name: string
  specialty?: string
  avatar?: string
}

export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  gender: 'M' | 'F'
  lgpdConsent: boolean
  lgpdConsentDate?: string
}

export interface Appointment {
  id: string
  patientId: string
  professionalId: string
  serviceId: string
  date: string // ISO format
  startTime: string // HH:mm
  endTime: string // HH:mm
  status: AppointmentStatus
  createdAt: string
  updatedAt: string
  reservedUntil?: string // para TTL
  reminderD1Sent?: boolean
  reminderH3Sent?: boolean
  notes?: string
}

export interface WhatsAppMessage {
  id: string
  patientId: string
  appointmentId?: string
  direction: 'inbound' | 'outbound'
  content: string
  timestamp: string
  read: boolean
  type:
    | 'invite'
    | 'confirmation'
    | 'reminder'
    | 'csat'
    | 'cancellation'
    | 'rescheduling'
    | 'chat'
}

export interface Metrics {
  totalAppointments: number
  confirmedAppointments: number
  noShows: number
  cancellations: number
  utilizationRate: number // porcentagem
  averageConfirmationTime: number // minutos
}
