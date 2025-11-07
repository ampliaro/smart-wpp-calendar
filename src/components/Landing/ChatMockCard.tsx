import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'

interface ChatMessage {
  id: number
  text: string
  sender: 'bot' | 'user'
  delay: number
  typingDuration: number
}

const conversationFlow: ChatMessage[] = [
  {
    id: 1,
    text: 'Boa tarde! Gostaria de agendar uma consulta',
    sender: 'user',
    delay: 0.2,
    typingDuration: 1.2,
  },
  {
    id: 2,
    text: 'Boa tarde! Claro, temos horários disponíveis. Qual procedimento você precisa?',
    sender: 'bot',
    delay: 1.3,
    typingDuration: 1.5,
  },
  {
    id: 3,
    text: 'Preciso fazer uma limpeza',
    sender: 'user',
    delay: 2.5,
    typingDuration: 0.8,
  },
  {
    id: 4,
    text: 'Perfeito. Para limpeza temos disponibilidade amanhã às 14h ou sexta às 10h. Qual prefere?',
    sender: 'bot',
    delay: 3.3,
    typingDuration: 1.8,
  },
  {
    id: 5,
    text: 'Amanhã às 14h está ótimo',
    sender: 'user',
    delay: 4.8,
    typingDuration: 0.9,
  },
  {
    id: 6,
    text: 'Agendado! Sua limpeza está confirmada para amanhã às 14h com Dra. Ana Silva. Te envio confirmação por SMS.',
    sender: 'bot',
    delay: 5.6,
    typingDuration: 2.0,
  },
]

export default function ChatMockCard() {
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; sender: 'bot' | 'user' }>
  >([])
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Tilt 3D effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [8, -8])
  const rotateY = useTransform(x, [-100, 100], [-8, 8])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((event.clientX - centerX) / 3)
    y.set((event.clientY - centerY) / 3)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  // Typewriter effect and conversation flow
  useEffect(() => {
    if (isPaused) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      // Show all messages immediately if reduced motion is preferred
      setMessages(
        conversationFlow.map((msg) => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
        }))
      )
      return
    }

    const timeouts: number[] = []

    // Start conversation
    if (currentMessageIndex < conversationFlow.length) {
      const currentMsg = conversationFlow[currentMessageIndex]

      // Show typing indicator
      const typingTimeout = window.setTimeout(() => {
        setIsTyping(true)
        setTypingText('')
      }, currentMsg.delay * 1000)
      timeouts.push(typingTimeout)

      // Typewriter effect
      const chars = currentMsg.text.split('')
      chars.forEach((char, index) => {
        const charTimeout = window.setTimeout(
          () => {
            setTypingText((prev) => prev + char)
          },
          (currentMsg.delay + 0.3) * 1000 + index * 20
        )
        timeouts.push(charTimeout)
      })

      // Add complete message to chat
      const completeTimeout = window.setTimeout(
        () => {
          setMessages((prev) => [
            ...prev,
            { id: currentMsg.id, text: currentMsg.text, sender: currentMsg.sender },
          ])
          setIsTyping(false)
          setTypingText('')
          setCurrentMessageIndex((prev) => prev + 1)
        },
        (currentMsg.delay + currentMsg.typingDuration) * 1000
      )
      timeouts.push(completeTimeout)
    } else {
      // Reset conversation after all messages
      const resetTimeout = window.setTimeout(() => {
        setMessages([])
        setCurrentMessageIndex(0)
        setIsTyping(false)
        setTypingText('')
      }, 1000)
      timeouts.push(resetTimeout)
    }

    return () => timeouts.forEach((id) => window.clearTimeout(id))
  }, [currentMessageIndex, isPaused])

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      style={{
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsPaused(true)}
      onTouchStart={() => setIsPaused(true)}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-surface/80 border-2 border-accent shadow-2xl chat-mock-card"
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />

        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-theme/50">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <div className="font-semibold text-theme text-sm">Agenda Bot</div>
            <div className="text-xs text-muted">Online</div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="p-4 space-y-3 min-h-[280px] max-h-[280px] overflow-y-auto">
          {/* Completed messages */}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.sender === 'bot'
                    ? 'bg-surface border border-theme text-theme shadow-sm'
                    : 'bg-accent text-accent-contrast shadow-sm'
                }`}
                style={{
                  borderRadius:
                    msg.sender === 'bot'
                      ? '1rem 1rem 1rem 0.25rem'
                      : '1rem 1rem 0.25rem 1rem',
                }}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator or current typing message */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                currentMessageIndex < conversationFlow.length &&
                conversationFlow[currentMessageIndex].sender === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              {typingText.length === 0 ? (
                // Typing indicator (three dots)
                <div className="bg-surface border border-theme px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-muted"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-muted"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-muted"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              ) : (
                // Typing message (typewriter effect)
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    currentMessageIndex < conversationFlow.length &&
                    conversationFlow[currentMessageIndex].sender === 'bot'
                      ? 'bg-surface border border-theme text-theme shadow-sm'
                      : 'bg-accent text-accent-contrast shadow-sm'
                  }`}
                  style={{
                    borderRadius:
                      currentMessageIndex < conversationFlow.length &&
                      conversationFlow[currentMessageIndex].sender === 'bot'
                        ? '1rem 1rem 1rem 0.25rem'
                        : '1rem 1rem 0.25rem 1rem',
                  }}
                >
                  {typingText}
                  <motion.span
                    className="inline-block ml-0.5"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    |
                  </motion.span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Subtle glow effect */}
        <div
          className="absolute -inset-1 bg-gradient-to-br from-accent/20 via-transparent to-accent/10 rounded-2xl blur-xl -z-10 opacity-50"
          style={{ transform: 'translateZ(-20px)' }}
        />
      </motion.div>
    </motion.div>
  )
}
