# Fase 1 — Setup del Frontend (Next.js)

> Notas de aprendizaje. Regla del proyecto: cada fase deja sus conceptos anotados en `docs/fase-NN-<tema>.md` (ver design D9).

## Scaffold con create-next-app

Se usó `npx create-next-app@latest frontend` como proyecto npm **independiente** (sin workspaces — ver nota del backend). Manual habría funcionado, pero create-next-app configura TypeScript, ESLint y App Router coherentes entre sí.

### Respuestas a los prompts y su porqué

| Prompt | Elección | Por qué |
|---|---|---|
| TypeScript | Yes | Todo el lab es TS |
| ESLint | Yes | Linting sin configurar nada |
| Tailwind CSS | Yes | Utilidades CSS para armar UI rápido |
| `src/` directory | Yes | Código de app separado de configs en raíz |
| App Router | Yes | Requisito del design — layouts, server components, streaming |
| Import alias `@/*` | Yes | `import X from '@/components/X'` en vez de `../../..` |
| React Compiler | **No** | Auto-memoiza componentes vía plugin Babel: build más lento y magia oculta. En un lab quieres ver re-renders reales y aprender `useMemo`/`useCallback` a mano. Se puede activar luego en `next.config.ts` |

## Estructura resultante

```
frontend/
├── docs/            # estas notas
├── next.config.ts   # config de Next (tarea 1.6 — ya generado)
├── tsconfig.json
└── src/
    ├── app/         # App Router: layout.tsx, page.tsx, globals.css
    ├── components/  # componentes de chat por fase (SinglePromptChat, StreamingChat, ...)
    ├── hooks/       # useSocket(), useLiveChat(), ...
    └── lib/         # helpers compartidos
```

Ojo: al elegir `src/`, **todo** el código va dentro de `src/` — `components/`, `hooks/` y `lib/` viven en `src/`, no en la raíz. El alias `@/*` apunta a `src/*`.

## Dependencia extra: socket.io-client

`npm i socket.io-client` — la mitad browser del protocolo Socket.IO. El backend corre `socket.io` (server, acepta conexiones); el frontend corre `socket.io-client` (inicia la conexión). Se usa desde la fase 5.

## App Router en dos líneas

- `src/app/layout.tsx` — shell HTML compartido; envuelve todas las páginas.
- `src/app/page.tsx` — la ruta `/`. Cada carpeta con `page.tsx` es una ruta nueva (`app/chat/page.tsx` → `/chat`).
- Por defecto los componentes son **Server Components**; los interactivos (hooks, eventos) llevan `'use client'` arriba — casi todos los componentes de chat de este lab lo llevarán.

## Variable de entorno del frontend

`NEXT_PUBLIC_SOCKET_URL` — prefijo `NEXT_PUBLIC_` = Next la expone al browser en build time. Sin ese prefijo, las env vars solo existen en el server. Nunca poner `GEMINI_API_KEY` con prefijo público: sería regalar la key a cualquiera que abra DevTools.

## `.gitignore`: patrones de negación

El `.gitignore` de create-next-app trae `.env*`, que atrapa **también** `.env.example` — y la plantilla debe commitearse. Fix:

```gitignore
.env*
!.env.example
```

- `!` re-incluye lo que un patrón anterior excluyó.
- **El orden importa**: la excepción va *después* del patrón que anula (git evalúa de arriba hacia abajo; gana la última regla que matchea).
- Verificación rápida: `git check-ignore .env.example` — si imprime la ruta, está ignorado; exit 1 = pasa a git.
