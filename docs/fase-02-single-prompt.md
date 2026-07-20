# Fase 2 — Single Prompt: componente `SinglePromptChat`

> Notas de aprendizaje (regla D9). Cubre tareas 2.4–2.6 (frontend). El backend de esta fase está en `backend/docs/fase-02-single-prompt.md`.

## `'use client'` — la frontera Server/Client

Primera línea del componente. En App Router todo es **Server Component** por defecto: se renderiza en el server, sin JS interactivo en el browser. `useState`, `onChange`, `onSubmit` exigen **Client Component** — la directiva marca la frontera. `page.tsx` puede seguir siendo Server Component aunque importe y monte un Client Component.

## Input controlado — una sola fuente de verdad

```tsx
<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
```

React es dueño del estado; el DOM solo lo refleja. La alternativa (leer el DOM con `querySelector` al enviar) crea **dos fuentes de verdad** que divergen. El beneficio concreto: UI *derivada* del valor en cada tecla —

```tsx
disabled={loading || !prompt.trim()}
```

— imposible si React no conoce el texto hasta el submit.

## Los 4 estados mínimos de un componente que llama API

| Estado | Para qué |
|---|---|
| `prompt` | El input controlado |
| `response` | Lo que llegó |
| `loading` | Deshabilitar botón, feedback "Pensando..." |
| `error` | Sin él, backend caído = silencio total. Siempre va |

## `<form onSubmit>` en vez de `onClick`

`onSubmit` + `e.preventDefault()`: Enter funciona gratis, semántica HTML correcta, y el submit queda en un solo handler. `preventDefault` evita el reload de página (comportamiento default de form).

## Patrón fetch con manejo de errores

```tsx
try {
  const res = await fetch(`${API_URL}/api/chat/single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Error HTTP ${res.status}`);
  setResponse(data.message);
} catch (err) {
  setError(err instanceof Error ? err.message : 'Error desconocido');
} finally {
  setLoading(false);
}
```

- **`fetch` no lanza en 4xx/5xx** — solo en fallo de red. Hay que chequear `res.ok` a mano. Por eso el 400 de validación del backend se lee del body (`data.error`) y se lanza manualmente.
- **`finally` apaga `loading`** pase lo que pase — éxito, 400 o red caída. Sin esto, un error deja el botón en "Pensando..." para siempre.
- **`err instanceof Error`**: en TS lo capturado es `unknown` — narrowing antes de leer `.message`.
- El request es cross-origin (3000 → 4000): funciona porque el backend manda `Access-Control-Allow-Origin` (ver doc backend, middleware `cors`).

## Verificación (2.6)

- curl al endpoint: estructura JSON `{ message: string }` ✓, 400 con `{ error }` si falta prompt ✓
- Browser: prompt real → respuesta de Gemini renderizada ✓
