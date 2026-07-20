'use client';

import { useState, useRef } from 'react';

const API_URL = 'http://localhost:4000';

export default function StreamingChat() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError('');
    setResponse('');
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Error HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      console.log(reader);
      const decoder = new TextDecoder();
      let buffer = '';
      
      console.log("Buffer", buffer);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        console.log(buffer);

        const partes = buffer.split('\n\n');
        buffer = partes.pop()!;

        for (const evento of partes) {
          const lineas = evento.split('\n');
          const tipo = lineas.find((l) => l.startsWith('event: '))?.slice(7);
          const dataRaw = lineas.find((l) => l.startsWith('data: '))?.slice(6);
          if (!tipo || !dataRaw) continue;
          const data = JSON.parse(dataRaw);

          if (tipo === 'text-delta') {
            setResponse((prev) => prev + data.text);
          }
          if (tipo === 'stream-error') {
            setError(data.error);
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
        Streaming Chat
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe tu prompt..."
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-300 bg-white p-3 text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="self-end rounded-full bg-black px-5 py-2 text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
        >
          {loading ? 'Generando...' : 'Enviar'}
        </button>
        {loading && (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            className="self-end rounded-full border border-red-300 px-5 py-2 text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            Stop
          </button>
        )}
      </form>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {(response || loading) && (
        <div className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
          {response}
          {loading && <span className="animate-pulse">▌</span>}
        </div>
      )}
    </div>
  );
}
