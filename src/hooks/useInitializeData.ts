import { useEffect } from 'react'
import { useAppointmentStore } from '../stores/appointmentStore'
import { useMessageStore } from '../stores/messageStore'
import { useSettingsStore } from '../stores/settingsStore'
import { initializeSeedData } from '../config/seeds'

/**
 * Hook para inicializar dados simulados na primeira carga
 */
export function useInitializeData() {
  const { profile } = useSettingsStore()
  const {
    appointments,
    professionals,
    patients,
    setProfessionals,
    setPatients,
    setAppointments,
  } = useAppointmentStore()
  const { messages, setMessages } = useMessageStore()

  useEffect(() => {
    // Verifica se já tem dados carregados
    const hasData =
      appointments.length > 0 || professionals.length > 0 || patients.length > 0

    if (!hasData) {
      // Inicializa com dados simulados
      const seedData = initializeSeedData(profile.id)

      setProfessionals(seedData.professionals)
      setPatients(seedData.patients)
      setAppointments(seedData.appointments)
      setMessages(seedData.messages)
    }
  }, []) // Executa apenas uma vez na montagem

  // Quando o perfil mudar, recarrega os profissionais
  useEffect(() => {
    const currentProfileData = professionals.length > 0

    if (currentProfileData) {
      const seedData = initializeSeedData(profile.id)
      setProfessionals(seedData.professionals)
      // Mantém pacientes, mas recria agendamentos e mensagens para o novo perfil
      setAppointments(seedData.appointments)
      setMessages(seedData.messages)
    }
  }, [profile.id])
}
