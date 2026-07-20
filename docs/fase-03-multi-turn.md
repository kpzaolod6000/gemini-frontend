# Fase 3 — Multi-turno: componente `MultiTurnChat`

> Notas de aprendizaje (regla D9). Cubre tareas 3.6–3.7 (frontend).

## Estado que persiste entre envíos

Diferencia clave vs `SinglePromptChat`: dos piezas de estado nuevas —

- `messages: ChatMessage[]` — el historial completo, no una sola respuesta.
- `conversationId: string` — vacío al inicio; el backend lo devuelve en el primer turno y se reenvía en los siguientes.

## Inmutabilidad: la regla de oro de React

```tsx
setMessages((prev) => [...prev, nuevo]);   // ✅
messages.push(nuevo);                      // ❌ jamás
```

React decide re-renderizar **comparando referencias**. `push` muta el mismo array → misma referencia → React no ve el cambio → UI congelada. Spread crea array nuevo.

**Forma función (`prev =>`)**: lee el estado más reciente en el momento de aplicar el update. Aquí es crítico — el mensaje del user y el del model se agregan en momentos distintos del mismo ciclo async; con `setMessages([...messages, x])` el segundo update pisaría al primero (closure sobre estado viejo).

## UI optimista

El mensaje del user entra al historial **antes** del fetch — la UI se siente instantánea aunque Gemini tarde segundos. El "Pensando..." es una burbuja fantasma mientras `loading`.

## Auto-scroll con `useRef` + `useEffect`

```tsx
const scrollRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
}, [messages]);
```

`useEffect` corre **después** del render — el DOM ya tiene el mensaje nuevo pintado, así que `scrollHeight` ya lo incluye. Dependencia `[messages]` = corre en cada mensaje.

## `conversationId || undefined`

El backend decide "¿nueva conversación?" con `if (id)`. String vacío es falsy y funcionaría… pero `JSON.stringify` **omite** claves `undefined` → el JSON viaja honesto (sin la clave) en vez de depender de que `""` sea falsy del otro lado.

## Comprobado en el test (3.7)

- 3+ turnos con contexto ✓ (el modelo recuerda lo dicho).
- Persistencia: `GET /api/conversations/:id` devuelve todos los turnos ✓.
- **Recarga de página** → el estado React muere (messages y conversationId vuelven a vacío) y aunque pegaras el id viejo, el server responde 404 tras reinicio: el `Map` de chats vive en RAM. Los datos están en Mongo; el objeto chat del SDK no. Ver doc backend — re-hidratación pendiente.
