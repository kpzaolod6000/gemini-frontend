'use client';

import { useEffect, useRef, useState } from 'react';

const API_URL = 'http://localhost:4000';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function MultiTurnChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || loading) return;

    setPrompt('');
    setError('');
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    try {
      const res = await fetch(`${API_URL}/api/chat/multi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          conversationId: conversationId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Error HTTP ${res.status}`);
      }

      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: 'model', content: data.message }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
          Multi-Turn Chat
        </h2>
        {conversationId && (
          <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600">
            {conversationId}
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex max-h-96 min-h-48 flex-col gap-3 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {messages.length === 0 && (
          <p className="m-auto text-sm text-zinc-400 dark:text-zinc-600">
            Empieza la conversación — el modelo recordará los turnos anteriores.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'self-end bg-black text-white dark:bg-zinc-50 dark:text-black'
                : 'self-start border border-zinc-200 bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50'
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="self-start rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
            Pensando...
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 rounded-lg border border-zinc-300 bg-white p-3 text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="rounded-full bg-black px-5 py-2 text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
