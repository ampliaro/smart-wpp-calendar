export interface Service {
  id: string
  name: string
  duration: number // em minutos
  price?: number
}

export interface MessageTemplates {
  invite: string
  confirmation: string
  reminderD1: string
  reminderH3: string
  csat: string
  cancellation: string
  rescheduling: string
}

export interface Policy {
  leadTimeMinutes: number // antecedência mínima
  reschedulingHoursBefore: number // prazo para reagendamento
  noShowDelayMinutes: number // tempo para considerar no-show
  reservationTTLMinutes: number // TTL de reserva pendente
}

export interface BusinessHours {
  [key: string]: { start: string; end: string } | null
}

export interface Profile {
  id: string
  name: string
  description: string
  icon: string
  services: Service[]
  messageTemplates: MessageTemplates
  policy: Policy
  businessHours: BusinessHours
  holidays: string[] // datas no formato YYYY-MM-DD
}

export const PROFILES: Record<string, Profile> = {
  odonto: {
    id: 'odonto',
    name: 'Clínica Odontológica',
    description: 'Consultório odontológico especializado',
    icon: '🦷',
    services: [
      { id: 'limpeza', name: 'Limpeza', duration: 60, price: 150 },
      { id: 'consulta', name: 'Consulta', duration: 30, price: 80 },
      { id: 'canal', name: 'Canal', duration: 90, price: 400 },
      { id: 'extracao', name: 'Extração', duration: 45, price: 200 },
      { id: 'clareamento', name: 'Clareamento', duration: 60, price: 600 },
    ],
    messageTemplates: {
      invite:
        'Olá {nome}! 🦷 Gostaria de agendar sua consulta na Clínica Odontológica? Temos horários disponíveis essa semana.',
      confirmation:
        'Confirmado! ✅ Sua consulta de {servico} está marcada para {data} às {hora} com Dr(a). {profissional}. Nos vemos em breve!',
      reminderD1:
        'Lembrete: você tem consulta amanhã às {hora} na Clínica Odontológica. Responda SIM para confirmar presença.',
      reminderH3: 'Sua consulta é daqui a 3 horas! 🦷 Até logo.',
      csat: 'Como foi sua experiência hoje? Por favor, avalie de 1 a 5: {link}',
      cancellation:
        'Sua consulta de {servico} em {data} às {hora} foi cancelada. Para reagendar, entre em contato.',
      rescheduling: 'Pronto! Sua consulta foi reagendada para {data} às {hora}. Até lá!',
    },
    policy: {
      leadTimeMinutes: 120, // 2 horas
      reschedulingHoursBefore: 24,
      noShowDelayMinutes: 10,
      reservationTTLMinutes: 10,
    },
    businessHours: {
      monday: { start: '08:00', end: '18:00' },
      tuesday: { start: '08:00', end: '18:00' },
      wednesday: { start: '08:00', end: '18:00' },
      thursday: { start: '08:00', end: '18:00' },
      friday: { start: '08:00', end: '18:00' },
      saturday: { start: '09:00', end: '13:00' },
      sunday: null,
    },
    holidays: ['2025-12-25', '2025-01-01'],
  },

  barbearia: {
    id: 'barbearia',
    name: 'Barbearia Classic',
    description: 'Estilo e tradição em cada corte',
    icon: '💈',
    services: [
      { id: 'corte', name: 'Corte Simples', duration: 30, price: 40 },
      { id: 'corte-barba', name: 'Corte + Barba', duration: 45, price: 60 },
      { id: 'barba', name: 'Barba', duration: 20, price: 25 },
      { id: 'pigmentacao', name: 'Pigmentação', duration: 40, price: 80 },
      { id: 'sobrancelha', name: 'Sobrancelha', duration: 15, price: 20 },
    ],
    messageTemplates: {
      invite:
        'E aí, {nome}! 💈 Bora marcar aquele corte massa? Temos horários livres essa semana na Barbearia Classic.',
      confirmation:
        'Agendado, parceiro! ✂️ Seu {servico} é dia {data} às {hora} com o barbeiro {profissional}. Até lá!',
      reminderD1:
        'Opa! Amanhã às {hora} você tem hora marcada aqui na barbearia. Cola que vai ficar top! 💈',
      reminderH3: 'Te esperamos daqui a 3 horas! ✂️',
      csat: 'E aí, curtiu o corte? Manda um feedback pra gente: {link}',
      cancellation:
        'Beleza! Cancelamos seu {servico} do dia {data} às {hora}. Quando quiser remarcar, é só chamar.',
      rescheduling: 'Fechou! Remarcamos para {data} às {hora}. Até mais!',
    },
    policy: {
      leadTimeMinutes: 120,
      reschedulingHoursBefore: 24,
      noShowDelayMinutes: 10,
      reservationTTLMinutes: 10,
    },
    businessHours: {
      monday: null,
      tuesday: { start: '09:00', end: '20:00' },
      wednesday: { start: '09:00', end: '20:00' },
      thursday: { start: '09:00', end: '20:00' },
      friday: { start: '09:00', end: '21:00' },
      saturday: { start: '09:00', end: '19:00' },
      sunday: { start: '09:00', end: '14:00' },
    },
    holidays: [],
  },

  pilates: {
    id: 'pilates',
    name: 'Studio Pilates Zen',
    description: 'Bem-estar e equilíbrio',
    icon: '🧘',
    services: [
      { id: 'pilates-solo', name: 'Pilates Solo', duration: 60, price: 80 },
      { id: 'pilates-duo', name: 'Pilates Dupla', duration: 60, price: 120 },
      { id: 'mat-pilates', name: 'Mat Pilates', duration: 50, price: 70 },
      { id: 'avaliacao', name: 'Avaliação Física', duration: 40, price: 100 },
      { id: 'alongamento', name: 'Alongamento', duration: 30, price: 50 },
    ],
    messageTemplates: {
      invite:
        'Olá, {nome}! 🧘 Que tal agendar sua próxima sessão de Pilates? Temos horários disponíveis essa semana.',
      confirmation:
        'Namastê! 🙏 Sua sessão de {servico} está confirmada para {data} às {hora} com {profissional}. Te esperamos!',
      reminderD1:
        'Lembrete: amanhã às {hora} você tem sua sessão de Pilates. Confirme sua presença respondendo SIM. 🧘',
      reminderH3: 'Sua sessão começa em 3 horas! Nos vemos em breve. ✨',
      csat: 'Como foi sua sessão hoje? Sua opinião é muito importante: {link}',
      cancellation:
        'Sua sessão de {servico} em {data} às {hora} foi cancelada. Para reagendar, entre em contato conosco.',
      rescheduling: 'Perfeito! Reagendamos sua sessão para {data} às {hora}. Até lá! 🧘',
    },
    policy: {
      leadTimeMinutes: 120,
      reschedulingHoursBefore: 24,
      noShowDelayMinutes: 10,
      reservationTTLMinutes: 10,
    },
    businessHours: {
      monday: { start: '07:00', end: '20:00' },
      tuesday: { start: '07:00', end: '20:00' },
      wednesday: { start: '07:00', end: '20:00' },
      thursday: { start: '07:00', end: '20:00' },
      friday: { start: '07:00', end: '20:00' },
      saturday: { start: '08:00', end: '13:00' },
      sunday: null,
    },
    holidays: ['2025-12-25', '2025-01-01'],
  },
}

export const CLINIC_NAME_PATTERNS = [
  'Clínica',
  'Consultório',
  'Centro',
  'Espaço',
  'Studio',
  'Barbearia',
  'Salão',
  'Academia',
  'Instituto',
  'Policlínica',
  'Laboratório',
  'Spa',
  'Wellness',
  'Fisioterapia',
  'Odonto',
  'Dental',
  'Medical',
  'Pilates',
  'Yoga',
  'Estética',
  'Beauty',
  'Care',
  'Health',
]

export function validateClinicName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 3) {
    return { valid: false, error: 'Nome muito curto (mínimo 3 caracteres)' }
  }

  if (name.trim().length > 50) {
    return { valid: false, error: 'Nome muito longo (máximo 50 caracteres)' }
  }

  // Verifica se contém pelo menos um padrão de clínica
  const hasValidPattern = CLINIC_NAME_PATTERNS.some((pattern) =>
    name.toLowerCase().includes(pattern.toLowerCase())
  )

  if (!hasValidPattern) {
    return {
      valid: false,
      error:
        'O nome deve conter palavras como "Clínica", "Consultório", "Studio", "Centro", etc.',
    }
  }

  return { valid: true }
}

export const getProfile = (profileId: string): Profile => {
  return PROFILES[profileId] || PROFILES.odonto
}
