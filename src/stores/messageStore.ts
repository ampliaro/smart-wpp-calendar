import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WhatsAppMessage } from '../types'

interface MessageState {
  messages: WhatsAppMessage[]

  addMessage: (message: Omit<WhatsAppMessage, 'id' | 'timestamp'>) => WhatsAppMessage
  markAsRead: (id: string) => void
  getMessagesByPatient: (patientId: string) => WhatsAppMessage[]
  getUnreadCount: () => number
  setMessages: (messages: WhatsAppMessage[]) => void
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: [],

      addMessage: (messageData) => {
        const message: WhatsAppMessage = {
          ...messageData,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        }

        set((state) => ({
          messages: [...state.messages, message],
        }))

        return message
      },

      markAsRead: (id: string) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, read: true } : msg
          ),
        }))
      },

      getMessagesByPatient: (patientId: string) => {
        return get().messages.filter((msg) => msg.patientId === patientId)
      },

      getUnreadCount: () => {
        return get().messages.filter((msg) => !msg.read && msg.direction === 'inbound')
          .length
      },

      setMessages: (messages: WhatsAppMessage[]) => {
        set({ messages })
      },
    }),
    {
      name: 'message-storage',
    }
  )
)
