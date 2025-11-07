import { RefreshCw } from 'lucide-react'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useMessageStore } from '../../stores/messageStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { generateMessages } from '../../config/seeds'

export function RegenerateMessagesButton() {
  const { profile } = useSettingsStore()
  const { appointments, professionals, patients } = useAppointmentStore()
  const { setMessages } = useMessageStore()

  const handleRegenerate = () => {
    // Regenera apenas as mensagens usando dados atuais
    const newMessages = generateMessages(appointments, patients, professionals, profile)

    setMessages(newMessages)

    alert('✅ Mensagens regeneradas com sucesso! Agora todos os nomes estão corretos.')
  }

  return (
    <div className="bg-surface rounded-theme shadow p-6 border border-theme">
      <h2 className="card-title text-theme mb-4 flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-accent" />
        Regenerar Mensagens
      </h2>

      <p className="text-muted mb-4 text-small">
        Se você ver nomes errados nas mensagens (ex: paciente "João" recebendo mensagens
        para "Maria"), clique aqui para regenerar todas as mensagens com os nomes
        corretos.
      </p>

      <button
        onClick={handleRegenerate}
        className="btn btn-primary flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Regenerar Todas as Mensagens
      </button>

      <p className="text-xs text-muted mt-3">
        💡 Isso mantém seus agendamentos mas refaz as conversas do zero com nomes
        corretos.
      </p>
    </div>
  )
}
