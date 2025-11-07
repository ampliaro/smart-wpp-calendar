import { useState, useMemo } from 'react'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function WeeklyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { appointments, professionals } = useAppointmentStore()
  const { profile } = useSettingsStore()

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 0 }),
    [currentDate]
  )

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const timeSlots = useMemo(() => {
    // Gera slots de 30 min das 7h às 21h
    const slots: string[] = []
    for (let hour = 7; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }, [])

  const getAppointmentsForDayAndSlot = (day: Date, timeSlot: string) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return appointments.filter((apt) => {
      if (apt.date !== dateStr) return false
      return apt.startTime === timeSlot
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; border: string }> = {
      disponivel: { bg: '#F3F4F6', border: '#D1D5DB' },
      reservado_pendente: { bg: '#FEF3C7', border: '#FDE047' },
      confirmado: { bg: '#DBEAFE', border: '#93C5FD' },
      lembrado: { bg: '#D1FAE5', border: '#86EFAC' },
      concluido: { bg: '#A7F3D0', border: '#6EE7B7' },
      no_show: { bg: '#FEE2E2', border: '#FCA5A5' },
      cancelado: { bg: '#E5E7EB', border: '#9CA3AF' },
    }
    return colors[status] || colors.disponivel
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="h1 text-theme mb-1">Agenda Semanal</h2>
          <p className="text-small text-muted">
            {format(weekStart, "d 'de' MMMM", { locale: ptBR })} -{' '}
            {format(addDays(weekStart, 6), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
            className="p-2 rounded-theme hover:bg-theme text-theme transition-colors"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn btn-primary"
            aria-label="Ir para hoje"
          >
            Hoje
          </button>
          <button
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 rounded-theme hover:bg-theme text-theme transition-colors"
            aria-label="Próxima semana"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface rounded-theme shadow-sm border border-theme overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-theme sticky top-0 bg-surface">
            <div className="p-3 border-r border-theme">
              <span className="text-small font-semibold text-muted uppercase tracking-wide">
                Horário
              </span>
            </div>
            {weekDays.map((day) => {
              const isCurrentDay = isSameDay(day, new Date())
              return (
                <div
                  key={day.toISOString()}
                  className={`p-3 text-center border-r border-theme relative ${
                    isCurrentDay ? 'bg-accent/10' : ''
                  }`}
                >
                  {isCurrentDay && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
                  )}
                  <div
                    className={`text-small uppercase tracking-wide ${
                      isCurrentDay ? 'text-accent font-bold' : 'text-muted'
                    }`}
                  >
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div
                    className={`text-lg font-semibold ${isCurrentDay ? 'text-accent' : 'text-theme'}`}
                  >
                    {format(day, 'd')}
                  </div>
                  {isCurrentDay && (
                    <div className="text-xs text-accent font-bold mt-1">HOJE</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Time Slots */}
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {timeSlots.map((slot) => (
              <div key={slot} className="grid grid-cols-8">
                <div className="p-2 border-r border-theme text-small text-muted text-center">
                  {slot}
                </div>
                {weekDays.map((day) => {
                  const dayAppointments = getAppointmentsForDayAndSlot(day, slot)
                  const isCurrentDay = isSameDay(day, new Date())

                  return (
                    <div
                      key={`${day.toISOString()}-${slot}`}
                      className={`p-1 border-r border-theme min-h-[80px] space-y-2 ${
                        isCurrentDay ? 'bg-accent/5' : ''
                      }`}
                    >
                      {dayAppointments.map((apt) => {
                        const service = profile.services.find(
                          (s) => s.id === apt.serviceId
                        )
                        const professional = professionals.find(
                          (p) => p.id === apt.professionalId
                        )
                        const patient = useAppointmentStore
                          .getState()
                          .patients.find((p) => p.id === apt.patientId)
                        const colors = getStatusColor(apt.status)

                        return (
                          <div
                            key={apt.id}
                            className={`p-2.5 rounded text-xs flex flex-col transition-all ${
                              isCurrentDay
                                ? 'border-2 border-accent shadow-lg'
                                : 'border-l-4 shadow-sm'
                            }`}
                            style={{
                              backgroundColor: colors.bg,
                              borderLeftColor: isCurrentDay ? undefined : colors.border,
                              minHeight: '75px',
                              transform: isCurrentDay ? 'scale(1.02)' : 'scale(1)',
                            }}
                            title={`${patient?.name || 'Cliente'} - ${service?.name} - ${professional?.name} - ${apt.status}`}
                          >
                            <div
                              className="font-bold truncate mb-0.5"
                              style={{ color: '#1F2937', fontSize: '0.75rem' }}
                            >
                              {service?.name}
                            </div>
                            <div
                              className="font-medium truncate mb-1"
                              style={{ color: '#4B5563', fontSize: '0.7rem' }}
                            >
                              {professional?.name.split(' ').slice(0, 2).join(' ')}
                            </div>
                            <div
                              className="truncate mt-auto pt-1 border-t"
                              style={{
                                color: '#6B7280',
                                fontSize: '0.7rem',
                                borderColor: 'rgba(0,0,0,0.1)',
                              }}
                            >
                              👤{' '}
                              {patient?.name.split(' ').slice(0, 2).join(' ') ||
                                'Cliente'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <p className="text-small text-theme font-semibold mb-3">Legenda:</p>
        <div className="flex flex-wrap gap-4 text-small">
          {[
            { status: 'reservado_pendente', label: 'Pendente (10min TTL)' },
            { status: 'confirmado', label: 'Confirmado' },
            { status: 'lembrado', label: 'Lembrado' },
            { status: 'concluido', label: 'Concluído' },
            { status: 'no_show', label: 'No-Show' },
            { status: 'cancelado', label: 'Cancelado' },
          ].map((item) => {
            const colors = getStatusColor(item.status)
            return (
              <div key={item.status} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border-l-4"
                  style={{
                    backgroundColor: colors.bg,
                    borderLeftColor: colors.border,
                  }}
                />
                <span className="text-theme">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
