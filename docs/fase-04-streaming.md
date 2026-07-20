# Fase 4 — Streaming: componente `StreamingChat`

> Notas de aprendizaje (regla D9). Cubre tareas 4.5–4.7 (frontend).

## Por qué NO `EventSource`

El API nativo de SSE del browser solo hace **GET sin body** — nuestro endpoint es POST con JSON. Solución: `fetch` + leer `res.body` como `ReadableStream` y parsear el protocolo SSE a mano.

## El parser SSE manual — las 4 piezas

```ts
const reader = res.body.getReader();          // 1. bytes conforme llegan
const decoder = new TextDecoder();
let buffer = '';

while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });   // 2. bytes → texto

    const partes = buffer.split('\n\n');                  // 3. separar eventos
    buffer = partes.pop()!;                               //    lo incompleto espera

    for (const evento of partes) {                        // 4. parsear y despachar
        const lineas = evento.split('\n');
        const tipo = lineas.find(l => l.startsWith('event: '))?.slice(7);
        const dataRaw = lineas.find(l => l.startsWith('data: '))?.slice(6);
        if (!tipo || !dataRaw) continue;
        const data = JSON.parse(dataRaw);

        if (tipo === 'text-delta') setResponse(prev => prev + data.text);
        if (tipo === 'stream-error') setError(data.error);
    }
}
```

- **`{ stream: true }` en el decoder**: un carácter multi-byte (é, 🦊) puede llegar cortado entre dos chunks — el decoder guarda el byte suelto y lo completa después.
- **Buffer + `pop()`**: un chunk de red **no** equivale a un evento SSE — puede traer medio evento o dos y medio. Lo que queda tras el último `\n\n` aún no terminó de llegar → vuelve al buffer.
- **`prev + data.text`**: acumulación con forma función — mismo principio que el array de `MultiTurnChat`, aplicado a string.
- El cursor: `{loading && <span className="animate-pulse">▌</span>}` junto al texto.

## Abort: botón Stop con `AbortController` (4.6)

```tsx
const abortRef = useRef<AbortController | null>(null);

// al enviar:
abortRef.current = new AbortController();
fetch(url, { ..., signal: abortRef.current.signal });

// el botón (type="button" — sin él, dentro de <form> sería submit):
<button type="button" onClick={() => abortRef.current?.abort()}>Stop</button>

// en el catch — abortar NO es un error:
if (err instanceof DOMException && err.name === 'AbortError') return;
```

- **`useRef`, no `useState`**: cambiar el controller no debe repintar nada — es infraestructura, no UI. `useState` provocaría re-render inútil; el ref es una caja mutable invisible para el render.
- **Controller nuevo por envío**: un controller abortado queda muerto — no se reusa.
- **El `return` dentro del catch SÍ ejecuta el `finally`** — JS lo garantiza; `loading` se apaga igual.
- El filtro del `AbortError` distingue "el usuario canceló" (silencio) de "algo falló" (error rojo).

## Comprobado (4.7)

- Texto aparece incrementalmente con cursor ▌ ✓ (vs `SinglePromptChat`: misma pregunta, uno gotea, el otro congela — esa diferencia es la fase).
- Stop congela el texto donde iba, sin error rojo, y el siguiente envío funciona normal ✓.
