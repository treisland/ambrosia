import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  context?: Record<string, unknown>
}

type OpenOptions = {
  question?: string
  context?: Record<string, unknown>
}

type ChatbotContextValue = {
  isOpen: boolean
  open: (opts?: OpenOptions) => void
  close: () => void
  messages: ChatMessage[]
  send: (text: string, context?: Record<string, unknown>) => Promise<void>
  setMessages: (messages: ChatMessage[]) => void
}

const ChatbotContext = createContext<ChatbotContextValue | undefined>(undefined)

export function useChatbot() {
  const ctx = useContext(ChatbotContext)
  if (!ctx) throw new Error('useChatbot must be used within ChatbotProvider')
  return ctx
}

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'sys-1',
      role: 'system',
      content:
        'I can answer questions about your prescriptions, dosing, side effects, and interactions. This is not medical advice. For urgent issues, contact a clinician.',
    },
  ])

  const send = useCallback(async (text: string, context?: Record<string, unknown>) => {
    const userMessage: ChatMessage = {
      id: 'u-' + (crypto?.randomUUID?.() || String(Date.now())),
      role: 'user',
      content: text,
      context,
    }
    setMessages(prev => [...prev, userMessage])

    const responseText = buildStubbedResponse(text, context)
    const assistantMessage: ChatMessage = {
      id: 'a-' + (crypto?.randomUUID?.() || String(Date.now() + 1)),
      role: 'assistant',
      content: responseText,
      context,
    }
    setMessages(prev => [...prev, assistantMessage])
  }, [])

  const open = useCallback((opts?: OpenOptions) => {
    setIsOpen(true)
    if (opts?.question) {
      void send(opts.question, opts.context)
    }
  }, [send])

  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ isOpen, open, close, messages, send, setMessages }),
    [isOpen, messages, open, close, send]
  )

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
}

function buildStubbedResponse(question: string, context?: Record<string, unknown>) {
  const lower = question.toLowerCase()
  const medName = inferMedicationName(lower, context)

  const disclaimers =
    'This information is for educational purposes and not a substitute for professional medical advice. If symptoms are severe or you are unsure, contact your pharmacist or clinician.'

  if (lower.includes('missed') || lower.includes('forget')) {
    return (
      (medName ? `For ${medName}: ` : '') +
      'If you miss a dose, take it as soon as you remember unless it is near the time for your next dose. Do not double up. Check your prescription label for specific instructions. [Source: DailyMed]\n\n' +
      disclaimers
    )
  }

  if (lower.includes('side effect') || lower.includes('side-effect') || lower.includes('adverse')) {
    return (
      (medName ? `Common side effects for ${medName} may include: ` : 'Common side effects may include: ') +
      'nausea, headache, and stomach upset. Serious effects like allergic reactions require immediate medical attention. [Source: DailyMed]\n\n' +
      disclaimers
    )
  }

  if (lower.includes('with food') || lower.includes('food') || lower.includes('take with')) {
    return (
      (medName ? `${medName} is often taken with food to reduce stomach upset. ` : 'Many medications are taken with food to reduce stomach upset. ') +
      'Follow the SIG on your label. [Source: DailyMed]\n\n' +
      disclaimers
    )
  }

  if (lower.includes('interaction') || lower.includes('interact')) {
    return (
      (medName ? `I can check common interactions for ${medName}. ` : 'I can check common drug interactions. ') +
      'For a full review, consult your pharmacist. [Source: RxNav]\n\n' +
      disclaimers
    )
  }

  return (
    (medName ? `Here is general information about ${medName}. ` : 'Here is general prescription information. ') +
    'Ask about dosing, missed dose, interactions, side effects, storage, or refills. [Source: DailyMed]\n\n' +
    disclaimers
  )
}

function inferMedicationName(text: string, context?: Record<string, unknown>) {
  const candidates: string[] = []
  if (typeof context?.medication === 'string') candidates.push(context.medication)
  const known = ['metformin', 'lisinopril', 'vitamin d', 'atorvastatin', 'amoxicillin']
  for (const k of known) if (text.includes(k)) candidates.push(k)
  const first = candidates.find(Boolean)
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : undefined
}