import { useState, useMemo, useEffect, useRef } from 'react'
import { useMessageStore } from '../../stores/messageStore'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MessageCircle, Send, Check, CheckCheck } from 'lucide-react'

export default function WhatsAppQueue() {
  const { messages, markAsRead } = useMessageStore()
  const { patients } = useAppointmentStore()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Agrupa mensagens por paciente
  const conversationsByPatient = useMemo(() => {
    const grouped = messages.reduce(
      (acc, msg) => {
        if (!acc[msg.patientId]) {
          acc[msg.patientId] = []
        }
        acc[msg.patientId].push(msg)
        return acc
      },
      {} as Record<string, typeof messages>
    )

    // Ordena mensagens dentro de cada conversa
    Object.keys(grouped).forEach((patientId) => {
      grouped[patientId].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    })

    return grouped
  }, [messages])

  // Lista de conversas ordenadas por última mensagem
  const conversationList = useMemo(() => {
    return Object.entries(conversationsByPatient)
      .map(([patientId, msgs]) => ({
        patientId,
        messages: msgs,
        lastMessage: msgs[msgs.length - 1],
        unreadCount: msgs.filter((m) => !m.read && m.direction === 'inbound').length,
      }))
      .sort(
        (a, b) =>
          new Date(b.lastMessage.timestamp).getTime() -
          new Date(a.lastMessage.timestamp).getTime()
      )
  }, [conversationsByPatient])

  const selectedConversation = selectedPatientId
    ? conversationsByPatient[selectedPatientId] || []
    : []

  const selectedPatient = selectedPatientId
    ? patients.find((p) => p.id === selectedPatientId)
    : null

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation])

  // Marca mensagens como lidas ao abrir conversa
  useEffect(() => {
    if (selectedPatientId) {
      const unreadMessages = selectedConversation.filter(
        (msg) => !msg.read && msg.direction === 'inbound'
      )
      unreadMessages.forEach((msg) => markAsRead(msg.id))
    }
  }, [selectedPatientId, selectedConversation, markAsRead])

  const getMessageTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      invite: '🧠',
      confirmation: '🧠',
      reminder: '🧠',
      csat: '🧠',
      cancellation: '🧠',
      rescheduling: '🧠',
      chat: '💬',
    }
    return icons[type] || '💬'
  }

  const getMessageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      invite: 'Convite',
      confirmation: 'Confirmação',
      reminder: 'Lembrete',
      csat: 'Avaliação',
      cancellation: 'Cancelamento',
      rescheduling: 'Reagendamento',
      chat: 'Mensagem',
    }
    return labels[type] || 'Mensagem'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <div className="lg:col-span-1 bg-surface rounded-theme shadow-sm border border-theme overflow-hidden">
        <div className="p-4 border-b border-theme">
          <h2 className="card-title text-theme flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-accent" />
            Conversas ({conversationList.length})
          </h2>
        </div>

        <div className="overflow-y-auto h-full">
          {conversationList.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-muted opacity-50" />
              <p className="text-muted">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {conversationList.map(({ patientId, lastMessage, unreadCount }) => {
                const patient = patients.find((p) => p.id === patientId)
                const isSelected = selectedPatientId === patientId

                return (
                  <button
                    key={patientId}
                    onClick={() => setSelectedPatientId(patientId)}
                    className={`w-full p-4 text-left hover:bg-theme transition-colors ${
                      isSelected ? 'bg-accent/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--accent)', opacity: 0.2 }}
                      >
                        <span className="text-lg">
                          {getMessageTypeIcon(lastMessage.type)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold truncate text-theme">
                            {patient?.name || 'Paciente'}
                          </p>
                          {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-accent text-accent-contrast text-xs rounded-full font-medium">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted truncate">
                          {lastMessage.content}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {format(parseISO(lastMessage.timestamp), "HH:mm · d 'de' MMM", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="lg:col-span-2 bg-surface rounded-theme shadow-sm border border-theme overflow-hidden flex flex-col">
        {selectedPatient ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-theme">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent)', opacity: 0.2 }}
                >
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <p className="font-semibold text-theme">{selectedPatient.name}</p>
                  <p className="text-sm text-muted">{selectedPatient.phone}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-theme">
              {selectedConversation.map((msg) => {
                const isOutbound = msg.direction === 'outbound'

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-theme p-3 ${
                        isOutbound
                          ? 'bg-accent text-accent-contrast rounded-br-none'
                          : 'bg-surface border border-theme rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-sm">{getMessageTypeIcon(msg.type)}</span>
                        <p className="text-xs opacity-75 font-semibold uppercase tracking-wide">
                          {getMessageTypeLabel(msg.type)}
                        </p>
                      </div>
                      <p
                        className={`text-sm whitespace-pre-wrap ${isOutbound ? '' : 'text-theme'}`}
                      >
                        {msg.content}
                      </p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                          isOutbound ? 'opacity-70' : 'text-muted'
                        }`}
                      >
                        <span>
                          {format(parseISO(msg.timestamp), 'HH:mm', { locale: ptBR })}
                        </span>
                        {isOutbound &&
                          (msg.read ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          ))}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input (Disabled for demo) */}
            <div className="p-4 border-t border-theme">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Mensagem automática (modo demo)"
                  disabled
                  className="flex-1 px-4 py-2 rounded-theme border border-theme bg-theme text-muted"
                />
                <button
                  disabled
                  className="p-2 rounded-theme text-muted cursor-not-allowed"
                  style={{ backgroundColor: 'var(--border)' }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-muted mt-2">
                💡 No modo demo, as mensagens são geradas automaticamente pelos fluxos
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted opacity-50" />
              <p className="text-lg font-semibold text-theme">Selecione uma conversa</p>
              <p className="text-sm text-muted">
                Escolha um paciente para ver as mensagens
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
