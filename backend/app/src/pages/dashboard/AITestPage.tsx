import { useState } from 'react'
import { trpc } from '@/providers/trpc'

interface ChatMessage {
  id: number
  sender: 'customer' | 'ai'
  content: string
  timestamp: Date
}

export default function AITestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<number | undefined>()

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ai',
          content: data.response,
          timestamp: new Date(),
        },
      ])
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ai',
          content: `Error: ${error.message}. Make sure you have set up a business profile first.`,
          timestamp: new Date(),
        },
      ])
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'customer',
        content: userMsg,
        timestamp: new Date(),
      },
    ])
    setInput('')

    chatMutation.mutate({
      message: userMsg,
      conversationId,
    })
  }

  const suggestions = [
    'What products do you have?',
    'What are your business hours?',
    'How much does shipping cost?',
    'I need to talk to a human',
  ]

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-[#1a1814]" style={{ fontWeight: 400 }}>
          AI Chat Simulator
        </h1>
        <p className="font-body text-sm text-[#8a8580] mt-1">
          Test how your AI assistant responds to customer messages
        </p>
      </div>

      <div
        className="bg-white rounded-xl border border-[#e0dcd6] flex flex-col overflow-hidden"
        style={{ height: 'calc(100vh - 240px)' }}
      >
        {/* Messages Area */}
        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-[#ece9e4] rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a8580" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <p className="font-body text-sm text-[#8a8580] mb-4">
                Start a conversation to test your AI assistant
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setMessages([{
                        id: Date.now(),
                        sender: 'customer',
                        content: suggestion,
                        timestamp: new Date(),
                      }])
                      chatMutation.mutate({ message: suggestion })
                    }}
                    className="px-4 py-2 bg-[#ece9e4] rounded-full font-body text-xs text-[#1a1814] hover:bg-[#e0dcd6] transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === 'customer' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex items-start gap-3 max-w-[75%]">
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-[rgba(212,165,116,0.2)] flex items-center justify-center flex-shrink-0 mt-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="2">
                        <path d="M12 2a8 8 0 00-8 8c0 3.866 3.134 7 7 7h2c3.866 0 7-3.134 7-7a8 8 0 00-8-8z"/>
                      </svg>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      msg.sender === 'customer'
                        ? 'bg-[#1a1814] text-[#f5f3ef] rounded-br-sm'
                        : 'bg-[#ece9e4] text-[#1a1814] rounded-bl-sm'
                    }`}
                  >
                    <p className="font-body text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.sender === 'customer' && (
                    <div className="w-8 h-8 rounded-full bg-[#2d6b6b] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="font-body text-xs font-medium text-white">C</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[rgba(212,165,116,0.2)] flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="2">
                    <path d="M12 2a8 8 0 00-8 8c0 3.866 3.134 7 7 7h2c3.866 0 7-3.134 7-7a8 8 0 00-8-8z"/>
                  </svg>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#ece9e4]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#c8c4be] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#c8c4be] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#c8c4be] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 border-t border-[#e0dcd6] flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a test message..."
            className="flex-1 px-5 py-3 rounded-full border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatMutation.isPending}
            className="px-7 py-3 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-sm font-semibold hover:bg-[#2d2a24] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            Send
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </form>
      </div>

      {conversationId && (
        <p className="mt-3 font-body text-xs text-[#8a8580]">
          Conversation ID: {conversationId} — This conversation is saved and viewable in the Conversations tab.
        </p>
      )}
    </div>
  )
}
