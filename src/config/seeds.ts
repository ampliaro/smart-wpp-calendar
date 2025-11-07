import { faker } from '@faker-js/faker/locale/pt_BR'
import { Professional, Patient, Appointment, WhatsAppMessage } from '../types'
import { format, addDays, subDays, addMinutes, parseISO } from 'date-fns'
import { PROFILES } from './profiles'
import { getRandomMessage, addTimeVariation } from './messageTemplates'
import { createMessageContext, validateMessageData } from '../utils/messageHelpers'
import { deduplicatePatientsByPhone } from '../utils/conflictValidation'

faker.seed(123) // Para resultados consistentes

export function generateProfessionals(profileId: string): Professional[] {
  const profile = PROFILES[profileId]

  const professionalsByProfile: Record<string, Professional[]> = {
    odonto: [
      {
        id: 'prof-1',
        name: 'Dra. Ana Silva',
        specialty: 'Ortodontia',
        avatar: '👩‍⚕️',
      },
      {
        id: 'prof-2',
        name: 'Dr. Carlos Mendes',
        specialty: 'Endodontia',
        avatar: '👨‍⚕️',
      },
      {
        id: 'prof-3',
        name: 'Dr. Roberto Lima',
        specialty: 'Periodontia',
        avatar: '👨‍⚕️',
      },
    ],
    barbearia: [
      {
        id: 'prof-1',
        name: 'Marcos "Tesoura de Ouro"',
        specialty: 'Cortes Modernos',
        avatar: '✂️',
      },
      {
        id: 'prof-2',
        name: 'João Barbeiro',
        specialty: 'Barba e Bigode',
        avatar: '💈',
      },
      {
        id: 'prof-3',
        name: 'Pedro Estilista',
        specialty: 'Cortes Clássicos',
        avatar: '✂️',
      },
    ],
    pilates: [
      {
        id: 'prof-1',
        name: 'Marina Costa',
        specialty: 'Pilates Terapêutico',
        avatar: '🧘‍♀️',
      },
      {
        id: 'prof-2',
        name: 'Lucas Ferreira',
        specialty: 'Pilates Funcional',
        avatar: '🧘‍♂️',
      },
      {
        id: 'prof-3',
        name: 'Juliana Santos',
        specialty: 'Mat Pilates',
        avatar: '🧘‍♀️',
      },
    ],
  }

  return professionalsByProfile[profileId] || professionalsByProfile.odonto
}

export function generatePatients(count: number = 25): Patient[] {
  const patients: Patient[] = []
  const usedPhones = new Set<string>()

  for (let i = 0; i < count; i++) {
    // Alterna entre masculino e feminino
    const sex = i % 2 === 0 ? 'male' : 'female'
    const firstName = faker.person.firstName(sex)
    const lastName = faker.person.lastName()

    // Gera telefone único
    let phone = faker.helpers.fromRegExp(/\([0-9]{2}\) [0-9]{5}-[0-9]{4}/)
    let attempts = 0
    while (usedPhones.has(phone) && attempts < 10) {
      phone = faker.helpers.fromRegExp(/\([0-9]{2}\) [0-9]{5}-[0-9]{4}/)
      attempts++
    }
    usedPhones.add(phone)

    patients.push({
      id: `patient-${i + 1}`,
      name: `${firstName} ${lastName}`,
      phone,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      gender: sex === 'male' ? 'M' : 'F',
      lgpdConsent: Math.random() > 0.1, // 90% deram consentimento
      lgpdConsentDate: faker.date.past({ years: 1 }).toISOString(),
    })
  }

  // Dedupe por segurança
  const deduped = deduplicatePatientsByPhone(patients)

  // Deduplicação silenciosa - apenas retorna pacientes únicos

  return deduped
}

export function generateAppointments(
  profileId: string,
  professionals: Professional[],
  patients: Patient[]
): Appointment[] {
  const profile = PROFILES[profileId]
  const appointments: Appointment[] = []
  const today = new Date()

  // Gera agendamentos para os últimos 3 dias e próximos 4 dias
  for (let dayOffset = -3; dayOffset <= 4; dayOffset++) {
    const date = addDays(today, dayOffset)
    const dateStr = format(date, 'yyyy-MM-dd')

    // Verifica se é dia útil
    const dayOfWeek = format(date, 'EEEE').toLowerCase()
    const dayMap: Record<string, string> = {
      sunday: 'sunday',
      monday: 'monday',
      tuesday: 'tuesday',
      wednesday: 'wednesday',
      thursday: 'thursday',
      friday: 'friday',
      saturday: 'saturday',
    }

    const businessDay = profile.businessHours[dayMap[dayOfWeek]]
    if (!businessDay) continue

    // Gera 5-10 agendamentos por dia
    const appointmentsCount = Math.floor(Math.random() * 6) + 5

    for (let i = 0; i < appointmentsCount; i++) {
      const professional = professionals[Math.floor(Math.random() * professionals.length)]
      const patient = patients[Math.floor(Math.random() * patients.length)]
      const service =
        profile.services[Math.floor(Math.random() * profile.services.length)]

      // Gera horário aleatório dentro do horário comercial
      const [startHour, startMin] = businessDay.start.split(':').map(Number)
      const [endHour, endMin] = businessDay.end.split(':').map(Number)

      const totalMinutesStart = startHour * 60 + startMin
      const totalMinutesEnd = endHour * 60 + endMin - service.duration

      const randomMinutes = Math.floor(
        Math.random() * (totalMinutesEnd - totalMinutesStart) + totalMinutesStart
      )

      // Arredonda para múltiplos de 30 minutos
      const roundedMinutes = Math.floor(randomMinutes / 30) * 30
      const hours = Math.floor(roundedMinutes / 60)
      const minutes = roundedMinutes % 60

      const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

      const endMinutes = roundedMinutes + service.duration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`

      // Determina o status baseado na data
      let status: Appointment['status']
      if (dayOffset < 0) {
        // Passado: 80% concluído, 15% no-show, 5% cancelado
        const rand = Math.random()
        if (rand < 0.8) status = 'concluido'
        else if (rand < 0.95) status = 'no_show'
        else status = 'cancelado'
      } else if (dayOffset === 0) {
        // Hoje: 70% lembrado, 20% confirmado, 10% pendente
        const rand = Math.random()
        if (rand < 0.7) status = 'lembrado'
        else if (rand < 0.9) status = 'confirmado'
        else status = 'reservado_pendente'
      } else {
        // Futuro: 60% confirmado, 30% pendente, 10% cancelado
        const rand = Math.random()
        if (rand < 0.6) status = 'confirmado'
        else if (rand < 0.9) status = 'reservado_pendente'
        else status = 'cancelado'
      }

      const createdAt = subDays(date, Math.floor(Math.random() * 7) + 1).toISOString()

      appointments.push({
        id: `apt-${dateStr}-${i + 1}`,
        patientId: patient.id,
        professionalId: professional.id,
        serviceId: service.id,
        date: dateStr,
        startTime,
        endTime,
        status,
        createdAt,
        updatedAt: createdAt,
        reminderD1Sent: dayOffset <= 0 && status !== 'reservado_pendente',
        reminderH3Sent:
          dayOffset <= 0 && ['lembrado', 'concluido', 'no_show'].includes(status),
      })
    }
  }

  return appointments
}

export function generateMessages(
  appointments: Appointment[],
  patients: Patient[],
  professionals: Professional[],
  profile: (typeof PROFILES)[keyof typeof PROFILES]
): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = []
  let messageId = 1

  appointments.forEach((apt) => {
    const patient = patients.find((p) => p.id === apt.patientId)
    const professional = professionals.find((p) => p.id === apt.professionalId)
    const service = profile.services.find((s) => s.id === apt.serviceId)

    if (!patient || !professional || !service) {
      return
    }

    // Context usando helper para garantir consistência
    const context = createMessageContext(patient, apt, professional, profile.id)

    // Validação de segurança
    if (!validateMessageData(patient.id, apt, context)) {
      return
    }

    // Fluxo realista de conversa
    let currentTimestamp = parseISO(apt.createdAt)

    // 1. Mensagem de convite (apenas se não for reserva pendente)
    if (apt.status !== 'reservado_pendente') {
      const inviteContent = getRandomMessage('invite', context)
      const inviteTime = addTimeVariation(currentTimestamp.toISOString())
      messages.push({
        id: `msg-${messageId++}`,
        patientId: patient.id,
        appointmentId: apt.id,
        direction: 'outbound',
        content: inviteContent,
        timestamp: inviteTime,
        read: true,
        type: 'invite',
      })
      currentTimestamp = new Date(inviteTime)
    }

    // 2. Paciente responde ao convite (se houver confirmação)
    if (['confirmado', 'lembrado', 'concluido', 'no_show'].includes(apt.status)) {
      const patientReply1 = getRandomMessage('patientReplies', context, patient.gender)
      const replyTime = addTimeVariation(addMinutes(currentTimestamp, 3).toISOString())
      messages.push({
        id: `msg-${messageId++}`,
        patientId: patient.id,
        appointmentId: apt.id,
        direction: 'inbound',
        content: patientReply1,
        timestamp: replyTime,
        read: true,
        type: 'chat',
      })
      currentTimestamp = new Date(replyTime)

      // 3. Sistema confirma o agendamento
      const confirmContent = getRandomMessage('confirm', context)
      const confirmTime = addTimeVariation(addMinutes(currentTimestamp, 2).toISOString())
      messages.push({
        id: `msg-${messageId++}`,
        patientId: patient.id,
        appointmentId: apt.id,
        direction: 'outbound',
        content: confirmContent,
        timestamp: confirmTime,
        read: true,
        type: 'confirmation',
      })
      currentTimestamp = new Date(confirmTime)
    }

    // 4. Lembrete D-1
    if (apt.reminderD1Sent) {
      const reminderD1Time = subDays(parseISO(`${apt.date}T18:00:00`), 1)
      const reminderContent = getRandomMessage('reminderD1', context)
      const reminderTimestamp = addTimeVariation(reminderD1Time.toISOString())

      messages.push({
        id: `msg-${messageId++}`,
        patientId: patient.id,
        appointmentId: apt.id,
        direction: 'outbound',
        content: reminderContent,
        timestamp: reminderTimestamp,
        read: true,
        type: 'reminder',
      })

      // 5. Paciente confirma presença (70% respondem ao lembrete D-1)
      if (Math.random() > 0.3) {
        const confirmReply = getRandomMessage('patientReplies', context, patient.gender)
        messages.push({
          id: `msg-${messageId++}`,
          patientId: patient.id,
          appointmentId: apt.id,
          direction: 'inbound',
          content: confirmReply,
          timestamp: addTimeVariation(
            addMinutes(new Date(reminderTimestamp), 8).toISOString()
          ),
          read: true,
          type: 'chat',
        })
      }
    }

    // 6. Lembrete H-3
    if (apt.reminderH3Sent) {
      const h3Timestamp = parseISO(`${apt.date}T${apt.startTime}:00`)
      const threeHoursBefore = new Date(h3Timestamp)
      threeHoursBefore.setHours(threeHoursBefore.getHours() - 3)

      const reminderContent = getRandomMessage('reminderH3', context)
      messages.push({
        id: `msg-${messageId++}`,
        patientId: patient.id,
        appointmentId: apt.id,
        direction: 'outbound',
        content: reminderContent,
        timestamp: addTimeVariation(threeHoursBefore.toISOString()),
        read: true,
        type: 'reminder',
      })

      // Não precisa resposta ao H-3 (paciente já confirmou no D-1)
    }

    // 7. No-show: Sistema tenta reagendar
    if (apt.status === 'no_show' && Math.random() > 0.5) {
      const noshowContent = getRandomMessage('noshow', context)
      const noshowTime = addMinutes(parseISO(`${apt.date}T${apt.startTime}:00`), 15)
      messages.push({
        id: `msg-${messageId++}`,
        patientId: patient.id,
        appointmentId: apt.id,
        direction: 'outbound',
        content: noshowContent,
        timestamp: addTimeVariation(noshowTime.toISOString()),
        read: true,
        type: 'chat',
      })

      // Paciente responde (alguns respondem, outros não)
      if (Math.random() > 0.4) {
        const noShowReplies = [
          'Desculpa! Esqueci completamente 😔',
          'Nossa, perdi o horário! Pode remarcar?',
          'Puxa, tive um imprevisto. Desculpa!',
          'Sinto muito! Posso agendar de novo?',
        ]
        const reply = noShowReplies[Math.floor(Math.random() * noShowReplies.length)]
        messages.push({
          id: `msg-${messageId++}`,
          patientId: patient.id,
          appointmentId: apt.id,
          direction: 'inbound',
          content: reply,
          timestamp: addTimeVariation(addMinutes(noshowTime, 45).toISOString()),
          read: true,
          type: 'chat',
        })
      }
    }

    // 8. CSAT para concluídos
    if (apt.status === 'concluido' && Math.random() > 0.3) {
      const csatTime = addMinutes(parseISO(`${apt.date}T${apt.endTime}:00`), 30)
      const csatContent = getRandomMessage('csat', context)
      messages.push({
        id: `msg-${messageId++}`,
        patientId: patient.id,
        appointmentId: apt.id,
        direction: 'outbound',
        content: csatContent,
        timestamp: addTimeVariation(csatTime.toISOString()),
        read: true,
        type: 'csat',
      })

      // Paciente avalia (60% respondem)
      if (Math.random() > 0.4) {
        const ratings = [
          '5 ⭐⭐⭐⭐⭐',
          '4 ⭐⭐⭐⭐',
          '5 ⭐',
          'Nota 5! Excelente!',
          '4 estrelas 👍',
        ]
        const rating = ratings[Math.floor(Math.random() * ratings.length)]
        messages.push({
          id: `msg-${messageId++}`,
          patientId: patient.id,
          appointmentId: apt.id,
          direction: 'inbound',
          content: rating,
          timestamp: addTimeVariation(addMinutes(csatTime, 10).toISOString()),
          read: true,
          type: 'chat',
        })
      }
    }

    // 9. Cancelamento: Paciente inicia e sistema confirma
    if (apt.status === 'cancelado' && Math.random() > 0.4) {
      const cancelTime = subDays(parseISO(apt.date), Math.floor(Math.random() * 3) + 1)

      // Paciente pede cancelamento
      const cancelRequest = getRandomMessage(
        'patientCancellation',
        context,
        patient.gender
      )
      messages.push({
        id: `msg-${messageId++}`,
        patientId: patient.id,
        appointmentId: apt.id,
        direction: 'inbound',
        content: cancelRequest,
        timestamp: addTimeVariation(cancelTime.toISOString()),
        read: true,
        type: 'chat',
      })

      // Sistema confirma cancelamento
      const cancelConfirm = getRandomMessage('cancel', context)
      messages.push({
        id: `msg-${messageId++}`,
        patientId: patient.id,
        appointmentId: apt.id,
        direction: 'outbound',
        content: cancelConfirm,
        timestamp: addTimeVariation(addMinutes(cancelTime, 5).toISOString()),
        read: true,
        type: 'cancellation',
      })
    }
  })

  return messages
}

export function initializeSeedData(profileId: string) {
  const professionals = generateProfessionals(profileId)
  const patients = generatePatients(25)
  const appointments = generateAppointments(profileId, professionals, patients)
  const profile = PROFILES[profileId]
  const messages = generateMessages(appointments, patients, professionals, profile)

  return {
    professionals,
    patients,
    appointments,
    messages,
  }
}
