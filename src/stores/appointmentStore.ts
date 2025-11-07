import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Appointment, AppointmentStatus, Professional, Patient } from '../types'
import { transitionAppointment } from '../utils/stateMachine'
import { addMinutes, isAfter, isBefore, parseISO } from 'date-fns'

interface AppointmentState {
  appointments: Appointment[]
  professionals: Professional[]
  patients: Patient[]

  // Getters
  getAppointment: (id: string) => Appointment | undefined
  getAppointmentsByDate: (date: string) => Appointment[]
  getAppointmentsByStatus: (status: AppointmentStatus) => Appointment[]

  // Actions
  addAppointment: (
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ) => Appointment
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void
  cancelAppointment: (id: string) => void
  rescheduleAppointment: (
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ) => void
  checkExpiredReservations: () => void
  checkNoShows: () => void

  // Professional & Patient management
  addProfessional: (professional: Professional) => void
  addPatient: (patient: Patient) => void
  setProfessionals: (professionals: Professional[]) => void
  setPatients: (patients: Patient[]) => void
  setAppointments: (appointments: Appointment[]) => void
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [],
      professionals: [],
      patients: [],

      getAppointment: (id: string) => {
        return get().appointments.find((apt) => apt.id === id)
      },

      getAppointmentsByDate: (date: string) => {
        return get().appointments.filter((apt) => apt.date === date)
      },

      getAppointmentsByStatus: (status: AppointmentStatus) => {
        return get().appointments.filter((apt) => apt.status === status)
      },

      addAppointment: (appointmentData) => {
        const appointment: Appointment = {
          ...appointmentData,
          id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Se for reserva pendente, adicionar TTL
        if (appointment.status === 'reservado_pendente') {
          appointment.reservedUntil = addMinutes(new Date(), 10).toISOString()
        }

        set((state) => ({
          appointments: [...state.appointments, appointment],
        }))

        return appointment
      },

      updateAppointmentStatus: (id: string, newStatus: AppointmentStatus) => {
        set((state) => ({
          appointments: state.appointments.map((apt) => {
            if (apt.id === id) {
              const validatedStatus = transitionAppointment(apt.status, newStatus)
              return {
                ...apt,
                status: validatedStatus,
                updatedAt: new Date().toISOString(),
              }
            }
            return apt
          }),
        }))
      },

      cancelAppointment: (id: string) => {
        get().updateAppointmentStatus(id, 'cancelado')
      },

      rescheduleAppointment: (
        id: string,
        newDate: string,
        newStartTime: string,
        newEndTime: string
      ) => {
        set((state) => ({
          appointments: state.appointments.map((apt) => {
            if (apt.id === id) {
              return {
                ...apt,
                date: newDate,
                startTime: newStartTime,
                endTime: newEndTime,
                updatedAt: new Date().toISOString(),
              }
            }
            return apt
          }),
        }))
      },

      checkExpiredReservations: () => {
        const now = new Date()
        set((state) => ({
          appointments: state.appointments.map((apt) => {
            if (
              apt.status === 'reservado_pendente' &&
              apt.reservedUntil &&
              isAfter(now, parseISO(apt.reservedUntil))
            ) {
              return {
                ...apt,
                status: 'disponivel' as AppointmentStatus,
                reservedUntil: undefined,
                updatedAt: new Date().toISOString(),
              }
            }
            return apt
          }),
        }))
      },

      checkNoShows: () => {
        const now = new Date()
        set((state) => ({
          appointments: state.appointments.map((apt) => {
            // Se está confirmado ou lembrado e já passou 10min do horário
            if (apt.status === 'confirmado' || apt.status === 'lembrado') {
              const appointmentDateTime = parseISO(`${apt.date}T${apt.startTime}:00`)
              const noShowThreshold = addMinutes(appointmentDateTime, 10)

              if (isAfter(now, noShowThreshold)) {
                return {
                  ...apt,
                  status: 'no_show' as AppointmentStatus,
                  updatedAt: new Date().toISOString(),
                }
              }
            }
            return apt
          }),
        }))
      },

      addProfessional: (professional: Professional) => {
        set((state) => ({
          professionals: [...state.professionals, professional],
        }))
      },

      addPatient: (patient: Patient) => {
        set((state) => ({
          patients: [...state.patients, patient],
        }))
      },

      setProfessionals: (professionals: Professional[]) => {
        set({ professionals })
      },

      setPatients: (patients: Patient[]) => {
        set({ patients })
      },

      setAppointments: (appointments: Appointment[]) => {
        set({ appointments })
      },
    }),
    {
      name: 'appointment-storage',
    }
  )
)
