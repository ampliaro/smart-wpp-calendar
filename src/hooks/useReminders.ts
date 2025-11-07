import { useEffect } from 'react'
import { useAppointmentStore } from '../stores/appointmentStore'
import { useMessageStore } from '../stores/messageStore'
import { useSettingsStore } from '../stores/settingsStore'
import { format, parseISO, subDays, subHours, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getRandomMessage, addTimeVariation } from '../config/messageTemplates'
import { createMessageContext } from '../utils/messageHelpers'

/**
 * Hook para processar e enviar lembretes automáticos
 */
export function useReminders() {
  const { appointments, updateAppointmentStatus } = useAppointmentStore()
  const { addMessage } = useMessageStore()
  const { profile } = useSettingsStore()

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()

      appointments.forEach((apt) => {
        if (apt.status !== 'confirmado' && apt.status !== 'lembrado') return

        const appointmentDateTime = parseISO(`${apt.date}T${apt.startTime}:00`)

        // Lembrete D-1 (às 18h do dia anterior)
        if (!apt.reminderD1Sent && isTomorrow(appointmentDateTime)) {
          const currentHour = now.getHours()
          if (currentHour >= 18) {
            sendReminderD1(apt.id, apt.patientId, apt.startTime)
          }
        }

        // Lembrete H-3 (3 horas antes)
        if (!apt.reminderH3Sent && apt.status === 'confirmado') {
          const threeHoursBefore = subHours(appointmentDateTime, 3)
          if (now >= threeHoursBefore && now < appointmentDateTime) {
            sendReminderH3(apt.id, apt.patientId, apt.startTime)
          }
        }
      })
    }

    const sendReminderD1 = (aptId: string, patientId: string, _time: string) => {
      const apt = appointments.find((a) => a.id === aptId)
      if (!apt) return

      const patient = useAppointmentStore
        .getState()
        .patients.find((p) => p.id === patientId)
      const professional = useAppointmentStore
        .getState()
        .professionals.find((p) => p.id === apt.professionalId)

      if (!patient || !professional) {
        console.error('❌ Dados faltando para lembrete D-1:', { aptId, patientId })
        return
      }

      // VALIDAÇÃO: Garante que o patient ID bate com o appointment
      if (patient.id !== apt.patientId) {
        console.error('❌ ERRO CRÍTICO: IDs não batem!', {
          patientId: patient.id,
          aptPatientId: apt.patientId,
          patientName: patient.name,
        })
        return
      }

      const context = createMessageContext(patient, apt, professional, profile.id)

      const message = getRandomMessage('reminderD1', context)

      addMessage({
        patientId,
        appointmentId: aptId,
        direction: 'outbound',
        content: message,
        read: true,
        type: 'reminder',
      })

      // Atualiza appointment para marcar lembrete enviado
      useAppointmentStore.setState((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === aptId ? { ...a, reminderD1Sent: true } : a
        ),
      }))

      // Simula resposta do paciente (70% respondem)
      if (Math.random() > 0.3) {
        setTimeout(
          () => {
            const patientReply = getRandomMessage(
              'patientReplies',
              context,
              patient?.gender
            )
            addMessage({
              patientId,
              appointmentId: aptId,
              direction: 'inbound',
              content: patientReply,
              read: true,
              type: 'chat',
            })
          },
          5000 + Math.random() * 10000
        ) // Entre 5-15 segundos
      }
    }

    const sendReminderH3 = (aptId: string, patientId: string, _time: string) => {
      const apt = appointments.find((a) => a.id === aptId)
      if (!apt) return

      const patient = useAppointmentStore
        .getState()
        .patients.find((p) => p.id === patientId)
      const professional = useAppointmentStore
        .getState()
        .professionals.find((p) => p.id === apt.professionalId)

      if (!patient || !professional) {
        console.error('❌ Dados faltando para lembrete H-3:', { aptId, patientId })
        return
      }

      // VALIDAÇÃO: Garante que o patient ID bate com o appointment
      if (patient.id !== apt.patientId) {
        console.error('❌ ERRO CRÍTICO: IDs não batem!', {
          patientId: patient.id,
          aptPatientId: apt.patientId,
          patientName: patient.name,
        })
        return
      }

      const context = createMessageContext(patient, apt, professional, profile.id)

      const message = getRandomMessage('reminderH3', context)

      addMessage({
        patientId,
        appointmentId: aptId,
        direction: 'outbound',
        content: message,
        read: true,
        type: 'reminder',
      })

      // Atualiza status para "lembrado" e marca lembrete H-3 enviado
      updateAppointmentStatus(aptId, 'lembrado')

      useAppointmentStore.setState((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === aptId ? { ...a, reminderH3Sent: true } : a
        ),
      }))
    }

    // Verifica lembretes a cada minuto
    checkReminders()
    const interval = setInterval(checkReminders, 60000)

    return () => clearInterval(interval)
  }, [appointments, profile, addMessage, updateAppointmentStatus])
}
