'use client';

import { useState } from 'react';

const API_URL = 'http://localhost:4000';

export default function SinglePromptChat() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch(`${API_URL}/api/chat/single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Error HTTP ${res.status}`);
      }

      setResponse(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
        Single Prompt Chat
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
          {loading ? 'Pensando...' : 'Enviar'}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {response && (
        <div className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
          {response}
        </div>
      )}
    </div>
  );
}
