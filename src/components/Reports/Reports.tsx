import { useMemo } from 'react'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useFinancialStore } from '../../stores/financialStore'
import {
  calculateMetrics,
  calculateNoShowRate,
  calculateConfirmationRate,
  groupAppointmentsByDay,
} from '../../utils/metrics'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

export default function Reports() {
  const { appointments, professionals } = useAppointmentStore()
  const financialStore = useFinancialStore()

  const metrics = useMemo(() => calculateMetrics(appointments), [appointments])
  const noShowRate = useMemo(() => calculateNoShowRate(appointments), [appointments])
  const confirmationRate = useMemo(
    () => calculateConfirmationRate(appointments),
    [appointments]
  )

  const economiaEstimada = useMemo(() => {
    return financialStore.calculateEconomia(appointments.length, metrics.noShows)
  }, [appointments.length, metrics.noShows, financialStore])
  const appointmentsByDay = useMemo(
    () => groupAppointmentsByDay(appointments),
    [appointments]
  )

  // Estatísticas por profissional
  const professionalStats = useMemo(() => {
    return professionals.map((prof) => {
      const profAppointments = appointments.filter(
        (apt) => apt.professionalId === prof.id
      )
      const completed = profAppointments.filter(
        (apt) => apt.status === 'concluido'
      ).length
      const noShows = profAppointments.filter((apt) => apt.status === 'no_show').length
      const cancelled = profAppointments.filter(
        (apt) => apt.status === 'cancelado'
      ).length

      return {
        professional: prof,
        total: profAppointments.length,
        completed,
        noShows,
        cancelled,
        noShowRate:
          profAppointments.length > 0 ? (noShows / profAppointments.length) * 100 : 0,
      }
    })
  }, [professionals, appointments])

  // Agendamentos por dia (últimos 7 dias)
  const recentDays = useMemo(() => {
    const sortedDates = Object.keys(appointmentsByDay).sort()
    return sortedDates.slice(-7).map((date) => ({
      date,
      dateLabel: format(parseISO(date), "d 'de' MMM", { locale: ptBR }),
      appointments: appointmentsByDay[date],
      confirmed: appointmentsByDay[date].filter((apt) =>
        ['confirmado', 'lembrado', 'concluido'].includes(apt.status)
      ).length,
      noShows: appointmentsByDay[date].filter((apt) => apt.status === 'no_show').length,
    }))
  }, [appointmentsByDay])

  const statsCards = [
    {
      label: 'Agendamentos',
      sublabel: 'Total',
      value: metrics.totalAppointments,
      icon: Calendar,
      color: '#3B82F6',
      bg: '#DBEAFE',
    },
    {
      label: 'Confirmação',
      sublabel: 'Taxa',
      value: `${confirmationRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: '#10B981',
      bg: '#D1FAE5',
    },
    {
      label: 'No-Show',
      sublabel: 'Taxa',
      value: `${noShowRate.toFixed(1)}%`,
      icon: AlertTriangle,
      color: '#EF4444',
      bg: '#FEE2E2',
    },
    {
      label: 'Utilização',
      sublabel: 'Taxa',
      value: `${metrics.utilizationRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: '#A855F7',
      bg: '#F3E8FF',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h1 text-theme mb-1">Relatórios e Métricas</h1>
        <p className="text-muted text-small">Acompanhe o desempenho da sua agenda</p>
      </div>

      {/* Antes vs Depois */}
      <div className="bg-surface rounded-theme shadow-lg p-6 border border-theme">
        <h2 className="card-title text-theme mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Impacto da Automação
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme">
                <th className="text-left py-3 px-4 text-sm font-semibold text-theme">
                  Métrica
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                  Antes (Manual)
                </th>
                <th className="text-center py-3 px-2">
                  <ArrowRight className="w-4 h-4 text-accent mx-auto" />
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-accent">
                  Depois (Automação)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {/* No-Show */}
              <tr>
                <td className="py-4 px-4 text-sm text-theme font-medium">
                  Taxa de No-Show
                </td>
                <td className="py-4 px-4 text-center text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold">
                    {financialStore.noShowAtual}%
                  </span>
                </td>
                <td></td>
                <td className="py-4 px-4 text-center text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                    {Math.round(
                      financialStore.noShowAtual *
                        (1 - financialStore.reducaoEsperada / 100)
                    )}
                    %
                  </span>
                  <div className="text-xs text-green-600 mt-1">
                    ↓ {financialStore.reducaoEsperada}% redução
                  </div>
                </td>
              </tr>

              {/* Utilização */}
              <tr>
                <td className="py-4 px-4 text-sm text-theme font-medium">
                  Taxa de Utilização
                </td>
                <td className="py-4 px-4 text-center text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-semibold">
                    {metrics.utilizationRate.toFixed(1)}%
                  </span>
                </td>
                <td></td>
                <td className="py-4 px-4 text-center text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                    {Math.min(100, metrics.utilizationRate + 8).toFixed(1)}%
                  </span>
                  <div className="text-xs text-green-600 mt-1">↑ +8% estimado</div>
                </td>
              </tr>

              {/* Receita Recuperada */}
              <tr>
                <td className="py-4 px-4 text-sm text-theme font-medium">
                  Receita Recuperada/Mês
                </td>
                <td className="py-4 px-4 text-center text-sm">
                  <span className="text-muted">—</span>
                </td>
                <td></td>
                <td className="py-4 px-4 text-center text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold">
                    R$ {economiaEstimada.economia.toLocaleString('pt-BR')}
                  </span>
                  <div className="text-xs text-accent mt-1">Com automação</div>
                </td>
              </tr>

              {/* Tempo Economizado */}
              <tr>
                <td className="py-4 px-4 text-sm text-theme font-medium">
                  Tempo Economizado/Mês
                </td>
                <td className="py-4 px-4 text-center text-sm">
                  <span className="text-muted">—</span>
                </td>
                <td></td>
                <td className="py-4 px-4 text-center text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold">
                    {economiaEstimada.horasRecuperadas}h
                  </span>
                  <div className="text-xs text-accent mt-1">Recuperadas</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-theme">
          <p className="text-xs text-muted text-center">
            💡 Estimativas baseadas em parâmetros configuráveis. Ajuste em{' '}
            <span className="text-accent">Preferências → Parâmetros Financeiros</span>.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-theme" style={{ backgroundColor: stat.bg }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <span className="text-small text-muted uppercase tracking-wide">
                {stat.sublabel}
              </span>
            </div>
            <div className="metric-value">{stat.value}</div>
            <div className="metric-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Day */}
        <div className="card">
          <h2 className="card-title text-theme flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-accent" />
            Agendamentos por Dia
          </h2>

          <div className="space-y-3">
            {recentDays.map((day) => {
              const maxValue = Math.max(
                ...recentDays.map((d) => d.appointments.length),
                1
              )
              const percentage = (day.appointments.length / maxValue) * 100

              return (
                <div key={day.date}>
                  <div className="flex items-center justify-between mb-1 text-small">
                    <span className="font-medium text-theme">{day.dateLabel}</span>
                    <span className="text-muted">
                      {day.appointments.length} agendamentos
                    </span>
                  </div>
                  <div className="h-8 bg-theme rounded-theme overflow-hidden">
                    <div
                      className="h-full bg-accent flex items-center justify-end px-2"
                      style={{ width: `${percentage}%` }}
                    >
                      {day.appointments.length > 0 && (
                        <span className="text-accent-contrast text-xs font-semibold">
                          {day.confirmed} confirmados
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h2 className="card-title text-theme mb-4">Distribuição por Status</h2>

          <div className="space-y-4">
            {[
              { status: 'confirmado', label: 'Confirmado', color: '#3B82F6' },
              { status: 'lembrado', label: 'Lembrado', color: '#10B981' },
              { status: 'concluido', label: 'Concluído', color: '#059669' },
              { status: 'no_show', label: 'No-Show', color: '#EF4444' },
              { status: 'cancelado', label: 'Cancelado', color: '#6B7280' },
            ].map((item) => {
              const count = appointments.filter(
                (apt) => apt.status === item.status
              ).length
              const percentage =
                metrics.totalAppointments > 0
                  ? (count / metrics.totalAppointments) * 100
                  : 0

              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1 text-small">
                    <span className="font-medium text-theme">{item.label}</span>
                    <span className="text-muted">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-6 bg-theme rounded-theme overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Professional Performance */}
      <div className="bg-surface rounded-theme shadow-sm border border-theme overflow-hidden">
        <div className="p-6 border-b border-theme">
          <h2 className="card-title text-theme">Desempenho por Profissional</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-theme">
              <tr>
                <th className="px-6 py-3 text-left text-small font-medium text-muted uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-small font-medium text-muted uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-small font-medium text-muted uppercase tracking-wider">
                  Concluídos
                </th>
                <th className="px-6 py-3 text-left text-small font-medium text-muted uppercase tracking-wider">
                  No-Shows
                </th>
                <th className="px-6 py-3 text-left text-small font-medium text-muted uppercase tracking-wider">
                  Cancelados
                </th>
                <th className="px-6 py-3 text-left text-small font-medium text-muted uppercase tracking-wider">
                  Taxa No-Show
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {professionalStats.map((stat) => (
                <tr key={stat.professional.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-theme">{stat.professional.name}</div>
                    {stat.professional.specialty && (
                      <div className="text-sm text-muted">
                        {stat.professional.specialty}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-theme">
                    {stat.total}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: '#10B981' }}
                  >
                    {stat.completed}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: '#EF4444' }}
                  >
                    {stat.noShows}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                    {stat.cancelled}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`status-label ${
                        stat.noShowRate > 15
                          ? 'bg-red-100 text-red-800'
                          : stat.noShowRate > 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {stat.noShowRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="card">
        <h2 className="card-title text-theme mb-4">Métricas Adicionais</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-theme rounded-theme">
            <div className="metric-value" style={{ fontSize: '2.5rem' }}>
              {Math.round(metrics.averageConfirmationTime)}
            </div>
            <div className="text-small text-muted">Minutos (média)</div>
            <div className="text-xs text-muted mt-1">Tempo até confirmação</div>
          </div>

          <div className="text-center p-4 bg-theme rounded-theme">
            <div className="metric-value" style={{ fontSize: '2.5rem' }}>
              {metrics.confirmedAppointments}
            </div>
            <div className="text-small text-muted">Agendamentos</div>
            <div className="text-xs text-muted mt-1">Confirmados no total</div>
          </div>

          <div className="text-center p-4 bg-theme rounded-theme">
            <div className="metric-value" style={{ fontSize: '2.5rem' }}>
              {metrics.cancellations}
            </div>
            <div className="text-small text-muted">Cancelamentos</div>
            <div className="text-xs text-muted mt-1">Total de cancelamentos</div>
          </div>
        </div>
      </div>
    </div>
  )
}
