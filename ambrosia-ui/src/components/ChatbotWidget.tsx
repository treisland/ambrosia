import { useEffect, useRef, useState } from 'react'
import { useChatbot } from '../contexts/ChatbotContext'

export default function ChatbotWidget() {
  const { isOpen, open, close, messages, send } = useChatbot()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    await send(text)
  }

  return (
    <div>
      {!isOpen && (
        <button
          onClick={() => open()}
          className="fixed bottom-20 right-4 z-40 rounded-full bg-blue-600 text-white px-4 py-3 shadow-lg hover:bg-blue-500"
          aria-label="Open prescription assistant"
        >
          Ask
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-40 w-[min(100vw-1rem,380px)] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl flex flex-col max-h-[70vh]">
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="text-sm font-medium">Prescription Assistant</div>
            <button onClick={close} className="text-sm text-zinc-600 dark:text-zinc-300 hover:underline">Close</button>
          </div>
          <div className="px-3 pt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            Educational only. Not a substitute for professional advice. For emergencies, call local services.
          </div>
          <div className="p-3 space-y-2 overflow-auto flex-1">
            {messages.map(m => (
              <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={
                  'inline-block rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ' +
                  (m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : m.role === 'assistant'
                      ? 'bg-zinc-100 dark:bg-zinc-800'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200')
                }>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={onSubmit} className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              placeholder="Ask about dosing, interactions, side effects..."
              aria-label="Ask a prescription question"
            />
            <button className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-500">Send</button>
          </form>
        </div>
      )}
    </div>
  )
}