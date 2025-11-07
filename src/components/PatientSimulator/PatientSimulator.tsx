import { useState, useMemo, useContext } from 'react'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useMessageStore } from '../../stores/messageStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { format, addDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  generateAvailableSlots,
  validateLeadTime,
} from '../../utils/appointmentValidation'
import {
  validatePatientConflict,
  validateProfessionalConflict,
  getPatientFutureAppointments,
} from '../../utils/conflictValidation'
import { getRandomMessage } from '../../config/messageTemplates'
import { createMessageContext } from '../../utils/messageHelpers'
import { ToastContext } from '../../App'
import { Calendar, Clock, User, CheckCircle, XCircle, Search } from 'lucide-react'

type Step =
  | 'patient'
  | 'service'
  | 'professional'
  | 'date'
  | 'time'
  | 'confirm'
  | 'result'

export default function PatientSimulator() {
  const { profile } = useSettingsStore()
  const { appointments, professionals, patients, addAppointment } = useAppointmentStore()
  const { addMessage } = useMessageStore()
  const toast = useContext(ToastContext)

  const [currentStep, setCurrentStep] = useState<Step>('patient')
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appointmentResult, setAppointmentResult] = useState<{
    success: boolean
    message: string
    appointmentId?: string
  } | null>(null)

  // Filtrar pacientes por busca
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients
    const term = searchTerm.toLowerCase()
    return patients.filter(
      (p) => p.name.toLowerCase().includes(term) || p.phone.includes(term)
    )
  }, [patients, searchTerm])

  // Gera próximos 7 dias
  const availableDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i + 1)
      return {
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, "EEEE, d 'de' MMMM", { locale: ptBR }),
      }
    })
  }, [])

  // Gera slots disponíveis
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedServiceId || !selectedProfessionalId) {
      return []
    }

    const service = profile.services.find((s) => s.id === selectedServiceId)
    if (!service) {
      return []
    }

    const slots = generateAvailableSlots(
      selectedDate,
      service.duration,
      profile.businessHours,
      profile.holidays,
      appointments,
      selectedProfessionalId
    )

    return slots
  }, [selectedDate, selectedServiceId, selectedProfessionalId, profile, appointments])

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const selectedService = profile.services.find((s) => s.id === selectedServiceId)
  const selectedProfessional = professionals.find((p) => p.id === selectedProfessionalId)

  const handleConfirmAppointment = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (
        !selectedPatientId ||
        !selectedServiceId ||
        !selectedProfessionalId ||
        !selectedDate ||
        !selectedTime
      ) {
        toast?.error('Por favor, preencha todos os campos')
        setIsSubmitting(false)
        return
      }

      const service = profile.services.find((s) => s.id === selectedServiceId)
      if (!service) {
        setIsSubmitting(false)
        return
      }

      // Calcula horário de fim
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const endMinutes = minutes + service.duration
      const endHours = hours + Math.floor(endMinutes / 60)
      const endTime = `${endHours.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`

      // 1. Valida antecedência mínima
      const leadTimeValidation = validateLeadTime(
        selectedDate,
        selectedTime,
        profile.policy
      )
      if (!leadTimeValidation.valid) {
        toast?.error(leadTimeValidation.error || 'Erro na validação')
        setIsSubmitting(false)
        return
      }

      // 2. Valida conflito de paciente
      const patientConflict = validatePatientConflict(
        selectedPatientId,
        selectedDate,
        selectedTime,
        endTime,
        appointments
      )

      if (!patientConflict.valid) {
        toast?.error(patientConflict.error || 'Conflito de horário do paciente')
        setIsSubmitting(false)
        return
      }

      // 3. Valida conflito de profissional
      const professionalConflict = validateProfessionalConflict(
        selectedProfessionalId,
        selectedDate,
        selectedTime,
        endTime,
        appointments
      )

      if (!professionalConflict.valid) {
        toast?.error(professionalConflict.error || 'Conflito de horário do profissional')
        setIsSubmitting(false)
        return
      }

      // Cria agendamento com status reservado_pendente
      const appointment = addAppointment({
        patientId: selectedPatientId,
        professionalId: selectedProfessionalId,
        serviceId: selectedServiceId,
        date: selectedDate,
        startTime: selectedTime,
        endTime,
        status: 'reservado_pendente',
      })

      // Envia mensagem de convite
      const patient = patients.find((p) => p.id === selectedPatientId)
      const professional = professionals.find((p) => p.id === selectedProfessionalId)

      if (!patient || !professional) {
        console.error('❌ Paciente ou profissional não encontrado')
        toast?.error('Dados não encontrados')
        setIsSubmitting(false)
        return
      }

      // Context usando helper para garantir nome correto
      const context = createMessageContext(patient, appointment, professional, profile.id)

      const inviteMessage = getRandomMessage('invite', context)

      addMessage({
        patientId: selectedPatientId,
        appointmentId: appointment.id,
        direction: 'outbound',
        content: inviteMessage,
        read: true,
        type: 'invite',
      })

      // Simula confirmação do paciente (após 2 segundos)
      setTimeout(() => {
        // Paciente responde ao convite
        const patientGender = patient?.gender || 'M'
        const patientReply = getRandomMessage('patientReplies', context, patientGender)
        addMessage({
          patientId: selectedPatientId,
          appointmentId: appointment.id,
          direction: 'inbound',
          content: patientReply,
          read: true,
          type: 'chat',
        })

        // Sistema confirma (depois da resposta do paciente)
        setTimeout(() => {
          useAppointmentStore
            .getState()
            .updateAppointmentStatus(appointment.id, 'confirmado')

          const confirmMessage = getRandomMessage('confirm', context)
          addMessage({
            patientId: selectedPatientId,
            appointmentId: appointment.id,
            direction: 'outbound',
            content: confirmMessage,
            read: true,
            type: 'confirmation',
          })

          // Toast de sucesso
          toast?.success(
            `Agendado: ${service.name} — ${format(parseISO(selectedDate), 'dd/MM', { locale: ptBR })} às ${selectedTime} com ${professional.name.split(' ')[0]}`
          )

          setIsSubmitting(false)
        }, 1500)
      }, 2000)

      setAppointmentResult({
        success: true,
        message: 'Agendamento criado com sucesso! As mensagens estão sendo enviadas...',
        appointmentId: appointment.id,
      })
      setCurrentStep('result')
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast?.error('Erro ao criar agendamento')
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setCurrentStep('patient')
    setSelectedPatientId('')
    setSelectedServiceId('')
    setSelectedProfessionalId('')
    setSelectedDate('')
    setSelectedTime('')
    setAppointmentResult(null)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'patient':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="card-title text-theme flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Selecione o Cliente
              </h3>
              <p className="text-small text-muted">{filteredPatients.length} clientes</p>
            </div>

            {/* Busca */}
            <div className="relative">
              <label htmlFor="patient-search" className="sr-only">
                Buscar paciente por nome ou telefone
              </label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                id="patient-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou telefone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-theme border border-theme bg-surface text-theme"
                aria-label="Buscar paciente"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {filteredPatients.map((patient) => {
                const futureAppointments = getPatientFutureAppointments(
                  patient.id,
                  appointments
                )
                const hasAppointment = futureAppointments.length > 0

                return (
                  <button
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatientId(patient.id)
                      setCurrentStep('service')
                    }}
                    className={`p-4 border-2 rounded-theme transition-all text-left relative ${
                      selectedPatientId === patient.id
                        ? 'border-accent bg-accent/5'
                        : 'border-theme hover:border-muted'
                    }`}
                  >
                    <p className="font-semibold text-theme">{patient.name}</p>
                    <p className="text-sm text-muted">{patient.phone}</p>

                    <div className="flex items-center gap-2 mt-2">
                      {patient.lgpdConsent && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          ✓ LGPD
                        </span>
                      )}

                      {hasAppointment && (
                        <span className="appointment-badge">
                          📅 Agendado{' '}
                          {futureAppointments.length > 1 &&
                            `(${futureAppointments.length})`}
                        </span>
                      )}
                    </div>

                    {hasAppointment && (
                      <div className="mt-2 p-2 bg-theme rounded text-xs text-muted">
                        <p className="font-medium">Próximo:</p>
                        <p>
                          {format(parseISO(futureAppointments[0].date), 'dd/MM', {
                            locale: ptBR,
                          })}{' '}
                          às {futureAppointments[0].startTime}
                        </p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 'service':
        return (
          <div className="space-y-4">
            <h3 className="card-title text-theme">Escolha o Serviço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedServiceId(service.id)
                    setCurrentStep('professional')
                  }}
                  className={`p-4 border-2 rounded-theme transition-all text-left ${
                    selectedServiceId === service.id
                      ? 'border-accent bg-accent/5'
                      : 'border-theme hover:border-muted'
                  }`}
                >
                  <p className="font-semibold text-theme">{service.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                    <span>⏱️ {service.duration} min</span>
                    {service.price && <span>💰 R$ {service.price}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 'professional':
        return (
          <div className="space-y-4">
            <h3 className="card-title text-theme">Escolha o Profissional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {professionals.map((professional) => (
                <button
                  key={professional.id}
                  onClick={() => {
                    setSelectedProfessionalId(professional.id)
                    setCurrentStep('date')
                  }}
                  className={`p-4 border-2 rounded-theme transition-all text-left ${
                    selectedProfessionalId === professional.id
                      ? 'border-accent bg-accent/5'
                      : 'border-theme hover:border-muted'
                  }`}
                >
                  <p className="font-semibold text-theme">{professional.name}</p>
                  {professional.specialty && (
                    <p className="text-sm text-muted">{professional.specialty}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )

      case 'date':
        return (
          <div className="space-y-4">
            <h3 className="card-title text-theme flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Escolha a Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableDates.map(({ date, label }) => (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date)
                    setCurrentStep('time')
                  }}
                  className={`p-4 border-2 rounded-theme transition-all text-left ${
                    selectedDate === date
                      ? 'border-accent bg-accent/5'
                      : 'border-theme hover:border-muted'
                  }`}
                >
                  <p className="font-semibold capitalize text-theme">{label}</p>
                </button>
              ))}
            </div>
          </div>
        )

      case 'time':
        return (
          <div className="space-y-4">
            <h3 className="card-title text-theme flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Escolha o Horário
            </h3>
            {availableTimeSlots.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-2 text-muted opacity-50" />
                <p className="text-muted">Não há horários disponíveis para esta data</p>
                <button
                  onClick={() => setCurrentStep('date')}
                  className="mt-4 btn btn-primary"
                >
                  Escolher outra data
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time)
                      setCurrentStep('confirm')
                    }}
                    className={`p-3 border-2 rounded-theme transition-all text-center font-semibold ${
                      selectedTime === time
                        ? 'border-accent bg-accent text-accent-contrast'
                        : 'border-theme hover:border-muted text-theme'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )

      case 'confirm':
        return (
          <div className="space-y-6">
            <h3 className="card-title text-theme">Confirmar Agendamento</h3>

            <div className="bg-theme rounded-theme p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <span className="text-muted">Paciente</span>
                <span className="font-semibold text-theme">{selectedPatient?.name}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <span className="text-muted">Serviço</span>
                <span className="font-semibold text-theme">{selectedService?.name}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <span className="text-muted">Profissional</span>
                <span className="font-semibold text-theme">
                  {selectedProfessional?.name}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <span className="text-muted">Data</span>
                <span className="font-semibold text-theme">
                  {format(parseISO(selectedDate), "d 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Horário</span>
                <span className="font-semibold text-theme">{selectedTime}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmAppointment}
                className="flex-1 btn btn-primary"
              >
                Confirmar Agendamento
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border-2 border-theme rounded-theme font-medium hover:bg-theme text-theme transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )

      case 'result':
        return (
          <div className="space-y-6 text-center">
            {appointmentResult?.success ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="h2 text-green-600">Agendamento Criado!</h3>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="h2 text-red-600">Erro no Agendamento</h3>
              </>
            )}

            <p className="text-muted">{appointmentResult?.message}</p>

            <button onClick={handleReset} className="btn btn-primary">
              Fazer Novo Agendamento
            </button>
          </div>
        )

      default:
        return null
    }
  }

  const steps = ['patient', 'service', 'professional', 'date', 'time', 'confirm']
  const currentStepIndex = steps.indexOf(currentStep)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🗓️</span>
        <div>
          <h1 className="h1 text-theme mb-0">Central de Agendamentos</h1>
          <p className="text-small text-muted">
            Agende consultas de forma rápida e organizada
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {currentStep !== 'result' && (
        <div className="card">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    index <= currentStepIndex
                      ? 'bg-accent text-accent-contrast'
                      : 'bg-theme text-muted'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      index < currentStepIndex ? 'bg-accent' : 'bg-theme'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="card">{renderStepContent()}</div>

      {/* Navigation */}
      {currentStep !== 'patient' && currentStep !== 'result' && (
        <div className="flex justify-between">
          <button
            onClick={() => {
              const prevIndex = Math.max(0, currentStepIndex - 1)
              setCurrentStep(steps[prevIndex] as Step)
            }}
            className="px-6 py-2 border-2 border-theme rounded-theme font-medium hover:bg-theme text-theme transition-colors"
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  )
}
