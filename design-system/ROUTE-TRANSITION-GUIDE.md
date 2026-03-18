# Route Transition — Guia de Uso

Modulo de carregamento entre telas para Next.js Pages Router.

**Package:** `@ctox/ui/route-transition`

---

## Instalacao

Ja faz parte do `@ctox/ui`. Basta importar.

---

## Setup no _app.page.tsx

```tsx
import type { AppProps } from "next/app";
import { RouteTransition } from "@ctox/ui/route-transition";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <RouteTransition />
      <Component {...pageProps} />
    </>
  );
}
```

### Props opcionais

```tsx
<RouteTransition
  color="bg-sidebar-accent"   // Classe Tailwind para cor da barra (default: bg-sidebar-accent)
  showOverlay={true}           // Overlay semitransparente durante navegacao (default: true)
  minDisplayTime={300}         // Tempo minimo de exibicao em ms (default: 300)
  className=""                 // Classes extras no container da barra
/>
```

---

## Como funciona

1. **routeChangeStart**: Barra aparece e progride automaticamente ate ~90%
2. **routeChangeComplete**: Barra completa 100% e some com fade
3. **routeChangeError**: Comportamento igual ao complete (limpa a barra)

### Animacao da barra

- Progresso simulado: incrementos aleatorios de 3-15% a cada 150ms
- Para em 90% ate a rota carregar
- Jump para 100% no complete + fade out de 200ms
- Glow effect na ponta da barra
- Posicao: `fixed top-0 z-[99999]` (acima de tudo)

### Overlay

- Overlay `bg-app-bg opacity-40` cobre a pagina durante a navegacao
- `z-[99998]` (abaixo da barra, acima do conteudo)
- Desabilitavel via `showOverlay={false}`

---

## PageFadeIn (opcional)

Wrapper para fade-in do conteudo da pagina:

```tsx
import { PageFadeIn } from "@ctox/ui/route-transition";

export default function DashboardPage() {
  return (
    <PageLayout breadcrumbItems={[{ crumb: "Dashboard" }]}>
      <PageFadeIn>
        <h1>Dashboard</h1>
        {/* conteudo */}
      </PageFadeIn>
    </PageLayout>
  );
}
```

### Props

```tsx
<PageFadeIn
  duration={200}   // Duracao do fade em ms (default: 200)
  className=""     // Classes extras
>
  {children}
</PageFadeIn>
```

### Animacao

- Fade in: `opacity-0 → opacity-100`
- Slide up: `translate-y-1 → translate-y-0`
- Easing: `ease-out`

---

## Hook: useRouteTransition

Para estados customizados de loading baseados na navegacao:

```tsx
import { useRouteTransition } from "@ctox/ui/route-transition";

function MyComponent() {
  const { isTransitioning, progress } = useRouteTransition();

  if (isTransitioning) {
    return <SynviaLoader message="Navegando..." />;
  }

  return <div>Conteudo normal</div>;
}
```

---

## Exemplo Completo (Backoffice)

```tsx
// apps/backoffice/src/pages/_app.page.tsx
import type { AppProps } from "next/app";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouteTransition } from "@ctox/ui/route-transition";
import { Toaster } from "@ctox/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

import "@ctox/ui/styles.css";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouteTransition color="bg-sidebar-accent" />
        <Component {...pageProps} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## Personalizacao por App

| App | Cor sugerida | Resultado |
|-----|-------------|-----------|
| Backoffice | `bg-sidebar-accent` | Verde (#21A84E) |
| Company | `bg-primary` | Azul escuro (#050732) |
| Financial | `bg-primary` | Azul escuro (#050732) |
| Random | `bg-primary` | Cor do tema |

```tsx
// Company
<RouteTransition color="bg-primary" />

// Backoffice
<RouteTransition color="bg-sidebar-accent" />

// Qualquer cor custom
<RouteTransition color="bg-green-500" />
```

---

## Compatibilidade

- Next.js Pages Router (nao App Router)
- React 18+
- Requer `tailwindcss-animate` (ja incluso no @ctox/ui)
- Requer CSS variables `--sidebar-accent` ou `--app-bg` se usar defaults
