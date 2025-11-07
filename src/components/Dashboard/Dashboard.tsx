import { useMemo } from 'react'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useFinancialStore } from '../../stores/financialStore'
import { format, isToday, parseISO, subDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  calculateMetrics,
  calculateNoShowRate,
  calculateConfirmationRate,
} from '../../utils/metrics'
import {
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Info,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function Dashboard() {
  const { appointments, professionals, patients } = useAppointmentStore()
  const { profile } = useSettingsStore()
  const financialStore = useFinancialStore()

  const todayAppointments = useMemo(() => {
    return appointments.filter((apt) => isToday(parseISO(apt.date)))
  }, [appointments])

  const metrics = useMemo(() => calculateMetrics(appointments), [appointments])
  const noShowRate = useMemo(() => calculateNoShowRate(appointments), [appointments])
  const confirmationRate = useMemo(
    () => calculateConfirmationRate(appointments),
    [appointments]
  )

  const economiaEstimada = useMemo(() => {
    return financialStore.calculateEconomia(appointments.length, metrics.noShows)
  }, [appointments.length, metrics.noShows, financialStore])

  const upcomingToday = useMemo(() => {
    return todayAppointments
      .filter((apt) => ['confirmado', 'lembrado'].includes(apt.status))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 5)
  }, [todayAppointments])

  // Dados para gráfico de tendência (últimos 14 dias)
  const trendData = useMemo(() => {
    const data = []
    const today = startOfDay(new Date())

    for (let i = 13; i >= 0; i--) {
      const day = subDays(today, i)
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayAppointments = appointments.filter((apt) => apt.date === dayStr)

      data.push({
        date: format(day, 'dd/MM'),
        Agendados: dayAppointments.length,
        Confirmados: dayAppointments.filter((a) =>
          ['confirmado', 'lembrado'].includes(a.status)
        ).length,
        Concluídos: dayAppointments.filter((a) => a.status === 'concluido').length,
      })
    }

    return data
  }, [appointments])

  // Dados para gráfico de distribuição por status
  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {
      Confirmado: 0,
      Concluído: 0,
      'No-Show': 0,
      Cancelado: 0,
    }

    appointments.forEach((apt) => {
      if (apt.status === 'confirmado' || apt.status === 'lembrado') {
        statusCounts['Confirmado']++
      } else if (apt.status === 'concluido') {
        statusCounts['Concluído']++
      } else if (apt.status === 'no_show') {
        statusCounts['No-Show']++
      } else if (apt.status === 'cancelado') {
        statusCounts['Cancelado']++
      }
    })

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }))
  }, [appointments])

  const stats = [
    {
      label: 'Agendamentos Hoje',
      value: todayAppointments.length,
      icon: Calendar,
      color: '#3B82F6',
      bg: '#DBEAFE',
    },
    {
      label: 'Confirmados',
      value: todayAppointments.filter((apt) =>
        ['confirmado', 'lembrado'].includes(apt.status)
      ).length,
      icon: CheckCircle,
      color: '#10B981',
      bg: '#D1FAE5',
    },
    {
      label: 'Taxa de No-Show',
      value: `${noShowRate.toFixed(1)}%`,
      icon: AlertCircle,
      color: '#EF4444',
      bg: '#FEE2E2',
    },
    {
      label: 'Taxa de Confirmação',
      value: `${confirmationRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: '#A855F7',
      bg: '#F3E8FF',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="h1 text-theme">Dashboard - Hoje</h1>
        <p className="text-muted text-small">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Economia Estimada Card - Destaque */}
      <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-theme shadow-lg p-6 border-2 border-accent/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-theme flex items-center gap-2 mb-2">
              <DollarSign className="w-6 h-6 text-accent" />
              Economia Estimada Este Mês
            </h2>
            <div className="text-4xl font-bold text-accent mt-4 mb-4">
              R$ {economiaEstimada.economia.toLocaleString('pt-BR')}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-theme">
                <span>↓ {economiaEstimada.noShowEvitados} no-shows evitados</span>
                <span className="font-semibold">
                  R${' '}
                  {(
                    economiaEstimada.noShowEvitados * financialStore.ticketMedio
                  ).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between text-theme">
                <span>↓ {economiaEstimada.horasRecuperadas}h economizadas</span>
                <span className="font-semibold">
                  R${' '}
                  {Math.round(
                    economiaEstimada.horasRecuperadas * financialStore.custoPorHora
                  ).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <Info className="w-5 h-5 text-accent cursor-help" />
            <div className="absolute right-0 top-8 w-80 bg-surface border border-theme rounded-theme p-4 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
              <h4 className="font-semibold text-theme mb-2 text-sm">Como calculamos:</h4>
              <div className="text-xs text-muted space-y-1">
                <p>
                  • No-shows evitados × Ticket médio (R$ {financialStore.ticketMedio})
                </p>
                <p>• Horas recuperadas × Custo/hora (R$ {financialStore.custoPorHora})</p>
                <p>• Redução esperada: {financialStore.reducaoEsperada}%</p>
                <p className="mt-2 pt-2 border-t border-theme text-accent">
                  Ajuste os parâmetros em Preferências
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-accent/20">
          <p className="text-xs text-muted">
            Baseado em: Ticket médio R$ {financialStore.ticketMedio} | No-show atual{' '}
            {financialStore.noShowAtual}% | Redução {financialStore.reducaoEsperada}% |
            Custo/hora R$ {financialStore.custoPorHora}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-theme" style={{ backgroundColor: stat.bg }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="metric-value">{stat.value}</div>
            <div className="metric-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        <div className="card">
          <h2 className="card-title text-theme flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-accent" />
            Próximos Hoje
          </h2>

          {upcomingToday.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-muted opacity-50" />
              <p className="text-muted">Nenhum agendamento confirmado para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingToday.map((apt) => {
                const patient = patients.find((p) => p.id === apt.patientId)
                const professional = professionals.find(
                  (p) => p.id === apt.professionalId
                )
                const service = profile.services.find((s) => s.id === apt.serviceId)

                return (
                  <div
                    key={apt.id}
                    className="flex items-center gap-3 p-3 rounded-theme bg-theme border border-theme"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--accent)', opacity: 0.2 }}
                      >
                        <span className="text-lg font-semibold text-accent">
                          {apt.startTime.substring(0, 5)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-theme">
                        {patient?.name || 'Paciente'}
                      </p>
                      <p className="text-sm text-muted truncate">
                        {service?.name || 'Serviço'} •{' '}
                        {professional?.name || 'Profissional'}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`status-label ${
                          apt.status === 'lembrado'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {apt.status === 'lembrado' ? 'Lembrado' : 'Confirmado'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Resumo Geral */}
        <div className="card">
          <h2 className="card-title text-theme flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            Resumo Geral
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-theme">
              <span className="text-muted">Total de Agendamentos</span>
              <span className="font-semibold text-theme">
                {metrics.totalAppointments}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-theme">
              <span className="text-muted">Confirmados</span>
              <span className="font-semibold" style={{ color: '#10B981' }}>
                {metrics.confirmedAppointments}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-theme">
              <span className="text-muted">No-Shows</span>
              <span className="font-semibold" style={{ color: '#EF4444' }}>
                {metrics.noShows}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-theme">
              <span className="text-muted">Cancelamentos</span>
              <span className="font-semibold" style={{ color: '#F97316' }}>
                {metrics.cancellations}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-theme">
              <span className="text-muted">Taxa de Utilização</span>
              <span className="font-semibold text-theme">
                {metrics.utilizationRate.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted">Tempo Médio Confirmação</span>
              <span className="font-semibold text-theme">
                {Math.round(metrics.averageConfirmationTime)} min
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-theme">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted">Profissionais Ativos</p>
                <p className="metric-value" style={{ fontSize: '1.75rem' }}>
                  {professionals.length}
                </p>
              </div>
              <div>
                <p className="text-small text-muted">Pacientes Cadastrados</p>
                <p className="metric-value" style={{ fontSize: '1.75rem' }}>
                  {patients.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência 14 Dias */}
        <div className="card">
          <h3 className="card-title text-theme mb-4">Tendência (Últimos 14 Dias)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                stroke="var(--border)"
              />
              <YAxis
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                stroke="var(--border)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'var(--text)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--muted)' }} />
              <Line
                type="monotone"
                dataKey="Agendados"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Confirmados"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Concluídos"
                stroke="#6EE7B7"
                strokeWidth={2}
                dot={{ fill: '#6EE7B7', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Status */}
        <div className="card">
          <h3 className="card-title text-theme mb-4">Distribuição por Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                stroke="var(--border)"
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                stroke="var(--border)"
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'var(--text)' }}
              />
              <Bar dataKey="value" fill="var(--accent)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Legend */}
      <div className="card">
        <h3 className="card-title text-theme mb-3">Estados de Agendamento</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Disponível', color: '#D1D5DB' },
            { label: 'Pendente', color: '#FDE047' },
            { label: 'Confirmado', color: '#93C5FD' },
            { label: 'Lembrado', color: '#86EFAC' },
            { label: 'Concluído', color: '#6EE7B7' },
            { label: 'No-Show', color: '#FCA5A5' },
            { label: 'Cancelado', color: '#9CA3AF' },
          ].map((status) => (
            <div key={status.label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: status.color }}
              />
              <span className="text-small text-theme">{status.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
