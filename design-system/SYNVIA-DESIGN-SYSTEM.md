# Synvia Design System

Guia de padronizacao visual para todos os projetos Synvia. Extraido do CTOX-v2 como referencia canonica.

---

## 1. Cores

### 1.1 Paleta Semantica (CSS Variables HSL)

Cada app define essas variaveis no `:root`. Valores abaixo sao do **Backoffice** (tema verde).

```css
:root {
  /* ── Marca ── */
  --primary: 150 70% 18%;           /* #0C4B29 — Verde escuro Synvia */
  --primary-foreground: 0 0% 100%;  /* Branco */

  /* ── Secundaria ── */
  --secondary: 140 30% 95%;         /* Verde claro (table headers bg) */
  --secondary-foreground: 150 40% 20%;

  /* ── Feedback ── */
  --success: 158 71% 27%;           /* Verde positivo */
  --success-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;         /* Vermelho erro */
  --destructive-foreground: 0 0% 100%;
  --warning: 38 92% 50%;            /* Amarelo/laranja alerta */
  --warning-foreground: 0 0% 100%;

  /* ── Neutros ── */
  --background: 0 0% 100%;          /* Branco */
  --foreground: 222 47% 11%;        /* Quase preto */
  --muted: 210 40% 96%;             /* Cinza claro */
  --muted-foreground: 215 16% 47%;  /* Cinza medio */
  --accent: 210 40% 96%;
  --accent-foreground: 222 47% 11%;

  /* ── Bordas e Inputs ── */
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 150 70% 18%;              /* Focus ring = primary */

  /* ── Cards e Popovers ── */
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;

  /* ── App background ── */
  --app-bg: 247 248 250;            /* RGB — cinza levemente azulado #F7F8FA */

  /* ── Raio padrao ── */
  --radius: 0.5rem;
}
```

### 1.2 Cores da Sidebar (RGB com alpha)

```css
:root {
  --sidebar-bg: 8 36 35;           /* Dark teal #082423 */
  --sidebar-bg-hover: 46 124 101;  /* Medium teal #2E7C65 */
  --sidebar-bg-active: 33 168 78;  /* Verde #21A84E */
  --sidebar-text: 255 255 255;     /* Branco */
  --sidebar-text-muted: 200 220 210; /* Verde claro */
  --sidebar-accent: 33 168 78;     /* Verde accent */
}
```

**Uso no Tailwind:**
```typescript
sidebar: {
  bg: "rgb(var(--sidebar-bg) / <alpha-value>)",
  "bg-hover": "rgb(var(--sidebar-bg-hover) / <alpha-value>)",
  "bg-active": "rgb(var(--sidebar-bg-active) / <alpha-value>)",
  text: "rgb(var(--sidebar-text) / <alpha-value>)",
  "text-muted": "rgb(var(--sidebar-text-muted) / <alpha-value>)",
  accent: "rgb(var(--sidebar-accent) / <alpha-value>)",
}
```

### 1.3 Cores Hex Fixas (Tailwind extend)

| Token | Hex | Uso |
|-------|-----|-----|
| `primary-100` | `#0C4B29` | Verde escuro |
| `primary-200` | `#EFFEF4` | Verde muito claro (bg) |
| `primary-500` | `#157340` | Verde medio |
| `primary-700` | `#157340` | Verde medio alt |
| `chart-1` | `hsl(var(--chart-1))` | = primary |

### 1.4 Paleta ctoxColors (de @synvia-dev/ui)

```typescript
const ctoxColors = {
  primary: {
    DEFAULT: "#050732",       // Azul escuro profundo (company/financial)
    700: "#050732B2",
    500: "#05073266",
    200: "#0507324D",
  },
  secondary: {
    DEFAULT: "#2AC15F",       // Verde vibrante
    700: "#2AC15F80",
  },
  dark: {
    DEFAULT: "#424B52",
    700: "#C3CDD7",
    500: "#C0C0C0",
    50: "#F3F5F7",
  },
  light: { DEFAULT: "#F3F7FF" },
  negative: {
    DEFAULT: "#DF3D11",       // Vermelho
    900: "#AC3716",
    500: "#E7775C",
    50: "#FAE4DF",
  },
  alert: {
    DEFAULT: "#F2C94C",       // Amarelo
    900: "#8A6803",
    500: "#F5D887",
    50: "#FCF5E2",
  },
  positive: {
    DEFAULT: "#0E7F3C",       // Verde
    500: "#43E887",
    50: "#DAFAE7",
  },
  steelblue: {
    DEFAULT: "#566C9A",
    900: "#33497A",
    700: "#4A5D89",
    500: "#566C9A",
    300: "#8FA3C7",
    200: "#C4D5FA",
    50: "#E8EDF8",
  },
}
```

### 1.5 Cores de Status (Badges/Chips)

```css
/* Uso: hsl(var(--available)) + hsl(var(--available-foreground)) */
--available:     221 84% 87%;    /* Azul claro */
--processing:    28 88% 80%;     /* Laranja */
--finished:      80 94% 87%;     /* Verde claro */
--analysis:      57 98% 78%;     /* Amarelo */
--selected:      28 88% 80%;     /* Laranja */
--notSelected:   142 76% 84%;    /* Verde claro */
--substituted:   221 84% 87%;    /* Azul claro */
```

### 1.6 Cores de Risco (Churn)

```typescript
const RISK_COLORS = {
  Normal:               { bg: '#dcfce7', text: '#166534', chart: '#22c55e' },
  'Perda (Risco Alto)': { bg: '#fee2e2', text: '#991b1b', chart: '#ef4444' },
  'Perda Recente':      { bg: '#ffedd5', text: '#9a3412', chart: '#f97316' },
  'Perda Antiga':       { bg: '#f3f4f6', text: '#374151', chart: '#9ca3af' },
}

const WOW_COLORS = {
  ok: '#22c55e',        // green-500
  attention: '#eab308', // yellow-500
  alert: '#f97316',     // orange-500
  critical: '#ef4444',  // red-500
}
```

---

## 2. Tipografia

### 2.1 Fonte Principal

```typescript
fontFamily: {
  primary: "Helvetica Neue, sans-serif",
}
```

Sem Google Fonts customizadas. Toda a plataforma usa Helvetica Neue.

### 2.2 Escala de Tamanhos

| Classe | Tamanho | Uso |
|--------|---------|-----|
| `text-[10px]` | 10px | Versao da app |
| `text-xs` | 12px | Descricoes de form, labels secundarios |
| `text-[0.8rem]` | 12.8px | Mensagens de erro, descricoes de form |
| `text-sm` | 14px | **Padrao geral** — labels, botoes, body, menus |
| `text-base` | 16px | Body text padrao |
| `text-lg` | 18px | Titulos de dialogs |
| `text-2xl` | 24px | Titulos de pagina, headings de cards |

### 2.3 Pesos

| Classe | Peso | Uso |
|--------|------|-----|
| `font-medium` | 500 | Labels, botoes, breadcrumbs, menu items |
| `font-semibold` | 600 | Titulos de toast, nomes de usuario, items ativos |
| `font-bold` | 700 | Titulos de pagina (`h1`) |

### 2.4 Line Height

- Body: usa Tailwind default (1.5)
- `leading-none`: titulos de dialog/label

---

## 3. Espacamento e Layout

### 3.1 Border Radius

```typescript
borderRadius: {
  lg: "0.5rem",                    // 8px — Cards, dialogs
  md: "calc(0.5rem - 2px)",       // 6px — Selects, botoes sm
  sm: "calc(0.5rem - 4px)",       // 4px — Checkboxes, badges
}
// Botoes usam rounded-full (pill shape)
// Sidebar items usam rounded-lg
```

### 3.2 Sombras

| Classe | Uso |
|--------|-----|
| `shadow-sm` | Botoes (outline/secondary), inputs, toast actions |
| `shadow-md` | Selects, dropdowns, popovers |
| `shadow-lg` | Dialogs, tabelas, cards |
| `shadow-2xl` | Sidebar, dropdown do usuario |
| `shadow-xl` | Tooltips da sidebar |

### 3.3 Espacamento Padrao

| Contexto | Padding |
|----------|---------|
| Pagina (conteudo) | `px-6 py-4` |
| Header | `h-14 px-4` |
| Card header | `px-4 py-3` |
| Card content | `p-8` |
| Dialog header/footer | `py-4` |
| Dialog body | `p-6` |
| Inputs | `h-12 px-3 py-1` |
| Botoes (default) | `h-9 px-4 py-2` |
| Botoes (sm) | `h-8 px-3 text-xs` |
| Botoes (lg) | `h-10 px-8` |
| Botoes (icon) | `h-9 w-9` |
| Table cells | `px-8 py-4` |
| Dropzone | `p-6` |

### 3.4 Gaps e Spacings

```
gap-0.5  (2px)  — Space entre items de menu
gap-1    (4px)  — Breadcrumbs, flex horizontal
gap-2    (8px)  — Paginacao, form items
gap-3    (12px) — Header left/right sections
gap-4    (16px) — Grid cards, dialog content
gap-6    (24px) — Sections de pagina
```

---

## 4. Sidebar

### 4.1 Estrutura Visual

```
 EXPANDIDA (w-64 = 256px)              COLAPSADA (w-20 = 80px)
┌────────────────────────────┐         ┌──────────┐
│  [logo-synvia-branco.svg]  │         │  [seta-   │
│    100x28  (clica=colapsa) │         │  branca]  │
│                            │         │  24x24    │
├────────────────────────────┤         ├──────────┤
│  ◉ Icone  Texto      ▸    │         │    ◉     │ ← so icone
│  │ ──── Sub-rota 1         │         │    ◉     │   hover = tooltip
│  │ ──── Sub-rota 2         │         │    ◉     │   click = popup
│  ◉ Icone  Texto            │         │    ◉     │
│                            │         │          │
├────────────────────────────┤         ├──────────┤
│  (•) Nome do usuario       │         │   (•)    │
└────────────────────────────┘         └──────────┘
```

### 4.2 SVGs da Sidebar

Arquivos em `design-system/assets/` — copiar para `public/` de cada projeto.

**Expandida — Logo completa:**
```
Arquivo: logo-synvia-branco.svg
ViewBox: 0 0 365.66 140.99
Conteudo: Logo "Synvia" branca + marca S verde gradiente (#82BB48 → #21A750)
Dimensoes no componente: width={100} height={28}
```

**Colapsada — Marca S (seta):**
```
Arquivo: seta-branca.svg
ViewBox: 0 0 1000 1000
Conteudo: Marca "S" Synvia branca (mesma forma da marca no logo completo)
Dimensoes no componente: width={24} height={24}
```

Ambos SVGs usam `fill: #fff` (branco) para contrastar com o fundo escuro da sidebar.

### 4.3 Mecanismo de Collapse

#### Estado e Persistencia

```typescript
const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

// Ler estado salvo
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
useEffect(() => {
  const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  if (stored !== null) setIsSidebarCollapsed(stored === "true");
}, []);

// Toggle com persistencia
const toggleSidebar = () => {
  setIsSidebarCollapsed((prev) => {
    const next = !prev;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    return next;
  });
};
```

#### Container da Sidebar

```tsx
<div className={cn(
  "relative flex h-full flex-col bg-sidebar-bg shadow-2xl transition-all duration-300 ease-out",
  isCollapsed ? "w-20" : "w-64"  // ← largura muda aqui
)}>
```

#### Header da Sidebar (onde o SVG troca)

```tsx
{/* EXPANDIDA: mostra logo completa, clica para colapsar */}
{!isCollapsed ? (
  <button
    className="flex w-full items-center justify-center rounded-lg px-2 py-2
               transition-all duration-200 hover:bg-sidebar-bg-hover"
    onClick={onToggleCollapse}
  >
    <Image
      alt="Synvia"
      src="/logo-synvia-branco.svg"   // ← Logo completa
      width={100} height={28}
    />
  </button>
) : (
  // COLAPSADA: mostra marca S, clica para expandir
  <button
    className="flex items-center justify-center rounded-lg p-2
               transition-all duration-200 hover:bg-sidebar-bg-hover"
    onClick={onToggleCollapse}
  >
    <Image
      alt="Expandir sidebar"
      src="/seta-branca.svg"          // ← Marca S pequena
      width={24} height={24}
      className="transition-transform duration-200"
    />
  </button>
)}
```

#### Toggle Externo (Header da pagina)

Alem do click no logo, ha um botao Menu no header:

```tsx
<Button
  aria-label="Alternar sidebar"
  className="h-9 w-9 rounded-lg text-gray-500 transition-all
             hover:bg-gray-100 hover:text-gray-700"
  onClick={toggleSidebar}
  size="icon"
  variant="ghost"
>
  <Menu className="h-5 w-5" />  {/* lucide-react Menu icon */}
</Button>
```

### 4.4 Dimensoes

| Estado | Largura | Transicao |
|--------|---------|-----------|
| Expandida | `w-64` (256px) | `duration-300 ease-out` |
| Colapsada | `w-20` (80px) | `duration-300 ease-out` |

### 4.5 Menu Item Interface

```typescript
interface MenuItem {
  text: string;
  icon?: ReactNode;          // lucide-react, h-5 w-5 (pai) / h-4 w-4 (filho)
  link?: string;
  isActive?: boolean;
  hidden?: boolean;
  routes?: MenuItem[];       // Sub-rotas (popup quando colapsado)
  auth?: {
    permissions: Permissions[];
    every?: boolean;
  };
}
```

### 4.6 Estados Visuais dos Items

```
Inativo:  text-sidebar-text-muted
          hover:bg-sidebar-bg-hover hover:text-sidebar-text

Ativo:    bg-gradient-to-r from-sidebar-accent/20 to-sidebar-accent/5
          text-sidebar-text
          Barra lateral esquerda: w-1 h-7 bg-sidebar-accent rounded-r-full
          Icone: text-sidebar-accent
          Texto: font-semibold

Sub-item: ml-2.5 border-l-2 border-sidebar-text/10 pl-3
```

### 4.7 Comportamento dos Items por Estado

#### Expandida

```
Item simples:   [icone mr-3] [texto flex-1 truncate]
                Click → navega para item.link

Item com rotas: [icone mr-3] [texto flex-1] [ChevronRight h-4 w-4]
                Click → toggle expand/collapse (rotate-90 no chevron)
                Sub-rotas aparecem com animacao:
                  duration-200 animate-in slide-in-from-top-2
                Sub-item tem: ml-2.5 border-l-2 border-sidebar-text/10 pl-3
```

#### Colapsada

```
Item simples:   [icone centralizado]
                Hover → tooltip aparece:
                  absolute left-full ml-3 -translate-y-1/2
                  bg-sidebar-bg-hover px-3 py-2 text-sm shadow-xl
                  z-[99999] (portal nao necessario, usa group-hover:block)

Item com rotas: [icone centralizado]
                Hover/Click → popup com sub-rotas via createPortal(document.body):
                  Position: fixed, top = rect.top, left = rect.right + 8px
                  Style: min-w-56 rounded-lg bg-sidebar-bg-hover p-3
                         shadow-2xl ring-1 ring-sidebar-text/10
                         z-[99999]
                  Seta: absolute left-0 top-4 -ml-2 h-4 w-4 rotate-45
                        bg-sidebar-bg-hover (triangulo CSS)

                Sub-rota no popup:
                  Inativa: text-sidebar-text-muted
                           hover:scale-[1.02] hover:bg-sidebar-bg
                  Ativa:   bg-sidebar-bg-active text-sidebar-text
                           ring-1 ring-sidebar-accent/30
```

#### Auto-expand

Quando a sidebar muda de estado, rotas ativas expandem automaticamente:

```typescript
// Colapsado: abre popup da rota ativa
useEffect(() => {
  if (isCollapsed) {
    items.forEach((item, index) => {
      if (item.routes?.some((route) => route.isActive)) {
        setOpenPopupIndex(index);
      }
    });
  }
}, [isCollapsed, items]);

// Expandido: expande accordion da rota ativa
useEffect(() => {
  if (!isCollapsed) {
    items.forEach((item, index) => {
      if (item.routes?.some((route) => route.isActive)) {
        setExpandedItems((prev) => [...new Set([...prev, index])]);
      }
    });
  }
}, [isCollapsed, items]);
```

### 4.8 Navegacao da Sidebar (overflow)

```tsx
<nav className={cn(
  "flex-1 px-1.5 py-2",
  isCollapsed ? "overflow-visible" : "overflow-y-auto"
  //              ↑ popups precisam    ↑ scroll normal
  //                sair do container
)}
style={{
  scrollbarColor: "rgb(var(--sidebar-text-muted) / 0.15) transparent",
  scrollbarWidth: "thin",
  scrollbarGutter: "stable both-edges",
}}>
```

### 4.9 Footer do Usuario

```
Expandida:  [Avatar 32px bg-sidebar-bg-hover rounded-full] gap-2.5 [Nome text-sm truncate]
Colapsada:  [Avatar 32px centralizado]

Dropdown (DropdownMenu side="top" sideOffset={8}):
  ┌──────────────────────────┐
  │ Nome (text-sm semibold)  │  text-white
  │ Email (text-xs)          │  text-white/50
  ├──────────────────────────┤  bg-white/10
  │ LogOut  Sair             │  text-red-400 hover:bg-red-500/10
  ├──────────────────────────┤  bg-white/10
  │ v1.0.0                   │  text-[10px] text-white/20
  └──────────────────────────┘

  Container: w-56 rounded-xl bg-[#082423] border-white/10 shadow-2xl p-0
```

### 4.10 Para Replicar em Outro Projeto

Checklist:

1. Copiar SVGs de `design-system/assets/` para `public/`:
   - `logo-synvia-branco.svg` (sidebar expandida)
   - `seta-branca.svg` (sidebar colapsada)

2. Definir CSS variables da sidebar no `globals.css`:
   ```css
   :root {
     --sidebar-bg: 8 36 35;
     --sidebar-bg-hover: 46 124 101;
     --sidebar-bg-active: 33 168 78;
     --sidebar-text: 255 255 255;
     --sidebar-text-muted: 200 220 210;
     --sidebar-accent: 33 168 78;
   }
   ```

3. Registrar cores no `tailwind.config.ts`:
   ```typescript
   sidebar: {
     bg: "rgb(var(--sidebar-bg) / <alpha-value>)",
     "bg-hover": "rgb(var(--sidebar-bg-hover) / <alpha-value>)",
     "bg-active": "rgb(var(--sidebar-bg-active) / <alpha-value>)",
     text: "rgb(var(--sidebar-text) / <alpha-value>)",
     "text-muted": "rgb(var(--sidebar-text-muted) / <alpha-value>)",
     accent: "rgb(var(--sidebar-accent) / <alpha-value>)",
   }
   ```

4. Implementar `ModernSidebar` com:
   - `isCollapsed` state + `localStorage` persistencia
   - Header: troca SVG (logo ↔ marca) conforme estado
   - Nav: `overflow-y-auto` (expandida) vs `overflow-visible` (colapsada)
   - Items: `createPortal` para popups quando colapsada
   - Footer: `DropdownMenu` side="top"

5. Implementar `PageLayout` com:
   - Header sticky `z-40 bg-white/80 backdrop-blur-md`
   - Botao `Menu` (lucide) para toggle externo
   - Content area `bg-app-bg`

---

## 5. Header e Navegacao

### 5.1 Header Sticky

```html
<header class="sticky top-0 z-40 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
  <div class="flex h-14 items-center justify-between px-4">
    <!-- Esquerda: Toggle + Breadcrumbs -->
    <!-- Direita: Actions -->
  </div>
</header>
```

### 5.2 Breadcrumbs

```typescript
interface BreadcrumbItem {
  crumb: string;
  icon?: ReactNode;
  path?: string;    // undefined = item atual (sem link)
}
```

```
Separador: ChevronRight h-4 w-4 text-gray-300
Item link: text-gray-500 hover:text-gray-900
Item atual: font-medium text-gray-900
```

### 5.3 Titulo de Pagina

```html
<h1 class="mb-2 text-2xl font-bold text-gray-900">Titulo</h1>
<p class="mb-4 text-gray-600">Descricao secundaria</p>
```

---

## 6. Componentes Core

### 6.1 Botoes (Variants)

| Variant | Classes |
|---------|---------|
| `default` | `bg-primary text-primary-foreground shadow hover:bg-primary/90` |
| `destructive` | `bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90` |
| `outline` | `border border-input bg-background shadow-sm hover:bg-accent` |
| `secondary` | `bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` |
| `link` | `text-primary underline-offset-4 hover:underline` |

Todos: `rounded-full transition-colors focus-visible:ring-1`

### 6.2 Cards

```
Wrapper: shadow rounded-t com border
Header:  bg-primary-200 px-4 py-3, titulo text-2xl font-medium text-primary
Content: p-8
```

### 6.3 Inputs

```
h-12 w-full rounded-md border border-input bg-transparent px-3 py-1
text-sm shadow-sm placeholder:text-muted-foreground
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
disabled:cursor-not-allowed disabled:opacity-50
```

### 6.4 Tabelas

```
Header (thead): bg-secondary → overridden para rgb(12 75 41) + text white
Cells:          px-8 py-4 font-primary
Rows:           border-b hover:bg-muted/50
First th:       rounded-tl-lg
Last th:        rounded-tr-lg
```

### 6.5 Checkbox

```
h-4 w-4 rounded-sm border border-primary
checked: bg-primary text-primary-foreground
```

### 6.6 Switch

```
h-5 w-9 rounded-full
unchecked: bg-input
checked:   bg-success
thumb:     h-4 w-4 translate-x-0 → translate-x-4
```

### 6.7 Dialog/Modal

```
Position: fixed center z-50
Size:     max-w-lg
Header:   border-b-2 bg-gradient-to-t from-cyan-50 py-4 text-center
Footer:   border-t-2 py-4 flex justify-center
Title:    text-lg font-semibold leading-none tracking-tight
```

---

## 7. Icones

### 7.1 Biblioteca

**lucide-react** — unica biblioteca de icones do projeto.

### 7.2 Tamanhos

| Contexto | Classe |
|----------|--------|
| Menu pai (sidebar) | `h-5 w-5` |
| Menu filho (sub-rota) | `h-4 w-4` |
| Botoes de acao | `h-4 w-4` |
| Breadcrumb separador | `h-4 w-4` |
| Header toggle | `h-5 w-5` |

### 7.3 Icones Frequentes

```typescript
import {
  Activity, Building2, Calendar, Check, ChevronRight, ChevronDown,
  ClipboardList, Eye, EyeOff, FileCheck2, FileSpreadsheet, FileUp,
  FlaskConical, Info, LayoutDashboard, Loader2, LogOut, Map, MapPin,
  Menu, Plus, RotateCcw, Search, Settings, Shuffle, Trash2, User, X, XCircle,
} from "lucide-react";
```

---

## 8. Logos e Assets

### 8.1 Logos Principais

| Arquivo | Uso | Dimensoes Sugeridas |
|---------|-----|---------------------|
| `synvia-tox-logo-white.svg` | Header em fundo escuro | — |
| `synvia-tox-logo-black.svg` | Login, loading, PDF | 120x48 (md) |
| `logo-synvia-branco.svg` | Sidebar expandida | 100x28 |
| `seta-branca.svg` | Sidebar colapsada (marca) | 24x24 |
| `background-login.svg` | Fundo decorativo login | 1126x1196 |

### 8.2 Assets Padrao (design-system/assets/)

Todos os assets de referencia estao copiados em `design-system/assets/`. Copiar para `public/` de novos projetos.

| Arquivo | Uso |
|---------|-----|
| `favicon.ico` | Favicon padrao |
| `logo-synvia-branco.svg` | Sidebar expandida (fundo escuro) |
| `seta-branca.svg` | Sidebar colapsada (marca/seta) |
| `synvia-tox-logo-black.svg` | Login, loading, PDFs (fundo claro) |
| `synvia-tox-logo-white.svg` | Headers em fundo escuro |
| `background-login.svg` | Fundo decorativo da tela de login |

```html
<!-- Favicon -->
<link rel="icon" href="/favicon.ico" />

<!-- Sidebar expandida -->
<Image src="/logo-synvia-branco.svg" width={100} height={28} />

<!-- Sidebar colapsada -->
<Image src="/seta-branca.svg" width={24} height={24} />
```

### 8.3 Gradientes da Marca

```
Logo gradient:     #80C244 → #00AD4D (verde)
Synvia corporate:  #82BB48 → #21A750 (verde alt)
```

### 8.3 File Type Icons

Componentes SVG inline em `packages/ui/src/dropzone/`:

| Tipo | Cor | Arquivo |
|------|-----|---------|
| CSV | Roxo `#E412E3` / `#A841AC` | `csv-file-icon.tsx` |
| PDF | Vermelho `#F9033E` / `#C11446` | `pdf-file-icon.tsx` |
| PNG | Laranja `#F97500` / `#C16214` | `png-file-icon.tsx` |
| JPG | Azul `#0007F9` / `#141DC1` | `jpg-file-icon.tsx` |

---

## 9. Animacoes

### 9.1 Keyframes Customizados

```typescript
keyframes: {
  shimmer: {
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(400%)" },
  },
  slideDown: {
    from: { height: "0px" },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  slideUp: {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0px" },
  },
},
animation: {
  shimmer: "shimmer 1.5s ease-in-out infinite",
  slideDown: "slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)",
  slideUp: "slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)",
},
```

### 9.2 Duracoes Padrao

| Tipo | Duracao | Easing |
|------|---------|--------|
| Hover/focus | `transition-colors` | default |
| Sidebar collapse | `duration-300` | `ease-out` |
| Menu items | `duration-200` | `ease-out` |
| Accordion | `300ms` | `cubic-bezier(0.87, 0, 0.13, 1)` |
| Shimmer loader | `1.5s` | `ease-in-out infinite` |
| Sub-menu expand | `duration-200` | `animate-in slide-in-from-top-2` |

### 9.3 Plugin

```
tailwindcss-animate v1.0.7
```

Fornece: `animate-in`, `animate-out`, `fade-out-80`, `slide-in-from-*`, `slide-out-to-*`.

---

## 10. Layout de Pagina

### 10.1 Estrutura Base

```
┌─────────────────────────────────────────────┐
│ flex h-screen overflow-hidden               │
│ ┌──────┬──────────────────────────────────┐ │
│ │      │  Header sticky z-40 h-14        │ │
│ │      │  bg-white/80 backdrop-blur-md    │ │
│ │      ├──────────────────────────────────┤ │
│ │ Side │                                  │ │
│ │ bar  │  Content area                    │ │
│ │ w-64 │  bg-app-bg                       │ │
│ │  or  │  px-6 py-4                       │ │
│ │ w-20 │                                  │ │
│ │      │                                  │ │
│ └──────┴──────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 10.2 Z-Index Scale

| Z-Index | Uso |
|---------|-----|
| `z-40` | Header sticky |
| `z-50` | Dialogs, toasts, popovers |
| `z-[99999]` | Sidebar popups e tooltips |
| `z-[100]` | Toast viewport |

### 10.3 Responsividade

Breakpoints Tailwind padrao:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Grids usados: `grid-cols-2 md:grid-cols-3 xl:grid-cols-6` (KPIs), `grid-cols-1 lg:grid-cols-3` (charts)

---

## 11. Toast / Notificacoes

### 11.1 Variants

| Variant | Cor |
|---------|-----|
| `default` | `border bg-background text-foreground` |
| `success` | `border-success bg-success text-success-foreground` |
| `destructive` | `border-destructive bg-destructive text-destructive-foreground` |

### 11.2 Posicao

```
Mobile: top-0 center
Desktop: bottom-0 right-0 max-w-[420px]
```

### 11.3 Animacao

```
Entrada: slide-in-from-top-full (mobile) / slide-in-from-bottom-full (desktop)
Saida:   fade-out-80 + slide-out-to-right-full
```

---

## 12. Skeletons e Loading

### 12.1 Skeleton Base

```tsx
<div className="animate-pulse rounded-md bg-accent" />
```

### 12.2 Loader Synvia (branded)

```tsx
<div className="flex flex-col items-center justify-center gap-5 py-16">
  {/* Logo pulsante */}
  <div className="animate-pulse">
    <Image src="/synvia-tox-logo-black.svg" width={120} height={48} />
  </div>

  {/* Barra shimmer */}
  <div className="h-1 w-32 overflow-hidden rounded-full bg-primary/10">
    <div className="h-full w-1/3 animate-shimmer rounded-full bg-primary/60" />
  </div>

  {/* Mensagem */}
  <p className="text-sm text-muted-foreground">Carregando...</p>
</div>
```

### 12.3 Tamanhos do Loader

```typescript
const SIZE_MAP = {
  sm: { width: 80,  height: 32, bar: "w-24" },
  md: { width: 120, height: 48, bar: "w-32" },
  lg: { width: 160, height: 64, bar: "w-40" },
};
```

---

## 13. DataTable Header (tema verde)

Override global no backoffice:

```css
thead.bg-secondary {
  background-color: rgb(12 75 41);  /* #0C4B29 */
  color: white;
}

thead.bg-secondary button:hover {
  background-color: rgb(21 115 64 / 0.3);
}
```

---

## 14. Dependencias de UI

| Package | Versao | Uso |
|---------|--------|-----|
| `tailwindcss` | 3.x | Utility CSS |
| `tailwindcss-animate` | 1.0.7 | Animations plugin |
| `@radix-ui/*` | various | Primitives (dialog, toast, select, etc.) |
| `class-variance-authority` | — | Variant props (botoes, badges) |
| `lucide-react` | — | Icones SVG |
| `recharts` | — | Charts (backoffice) |
| `chart.js` + `react-chartjs-2` | — | Charts (company, financial) |
| `@tanstack/react-table` | — | Tabelas |
| `@synvia-dev/ui` | — | Componentes compartilhados (sidebar, dropdown) |
| `@ctox/ui` | workspace | UI lib interna (botoes, forms, toast, etc.) |

---

## 15. Dropdown Customizado (FarolSelect)

O select nativo do HTML nao permite estilizar as opcoes do popup. Em telas que precisam de dropdowns bonitos (filtros de ano, mes, monitoria), usar o componente **FarolSelect** — um dropdown 100% customizado.

### 15.1 Especificacao Visual

```
Botao (fechado):
  height: 44px
  padding: 0 36px 0 16px
  border-radius: 10px
  border: 1.5px solid (cardBorder | greenDark quando aberto)
  font-size: 15px, font-weight: 600
  background: white
  shadow: 0 2px 6px rgba(0,0,0,0.06)
  Seta chevron: right 12px, rotaciona 180deg quando aberto

Popup (aberto):
  position: absolute, top: 100%, left: 0, margin-top: 4px
  z-index: 50
  min-width: 100% do botao
  max-height: 280px com overflow-y auto
  background: white
  border-radius: 10px
  border: 1px solid cardBorder
  shadow: 0 8px 24px rgba(0,0,0,0.12)
  padding: 4px

Item do popup:
  padding: 10px 14px
  border-radius: 8px
  font-size: 14px
  Ativo: background greenBg2, color greenDark, font-weight 600
  Hover (inativo): background #f3f4f6
  Transicao: 0.1s

Fecha: onBlur (click fora)
```

### 15.2 Dimensoes Padrao

| Contexto | Largura | Componente |
|----------|---------|------------|
| Filtro de topo (ano, mes) | `width: 200px` (wrapper div) | FarolSelect |
| Filtro de tabela (patrocinador, tipo) | auto (conteudo) | TableFilter |

### 15.3 TableFilter (filtro dentro de tabela)

Para filtros dentro de `SectionCard` (acima da DataTable), usar **TableFilter** — select nativo estilizado:

```
height: 36px
border-radius: 8px
font-size: 13px
Ativo: border greenDark, background greenBg2, color greenDark
Inativo: border cardBorder, background white
Seta: SVG chevron customizado via background-image
appearance: none
```

### 15.4 Botao Limpar

Quando qualquer filtro esta ativo, mostrar botao "Limpar":

```
Texto: "Limpar" (nunca "Limpar filtros" — manter curto)
height: 36px
padding: 0 14px
border-radius: 9999px (pill)
background: redBg
color: statusRisk (#ef4444)
font-size: 13px, font-weight: 500
align-self: flex-end
```

---

## 16. KPI Cards

### 16.1 Componente KpiCard

```
background: white
border-radius: 12px
padding: 20px 24px
border: 1px solid cardBorder
shadow: 0 1px 3px rgba(0,0,0,0.06)
flex: 1 1 140px (cresce para preencher)
min-width: 140px

Label: fontSize 13, color textMuted, fontWeight 500, marginBottom 12
Valor: fontSize 28, fontWeight 700, color SEMPRE preto (DS.text) — NUNCA colorido
```

### 16.2 Regras de Uso

- Valores SEMPRE em preto — a cor do indicador NAO vai no texto
- Labels curtos — sem "Total de" ou prefixos redundantes
- Todos os cards na mesma linha devem ter o mesmo tamanho (flex 1)
- Container: `display: flex, gap: 12, marginBottom: 20, flexWrap: wrap`

---

## 17. Layout Padrao de Pagina (Dashboard)

Toda tela do dashboard segue esta estrutura:

```
1. Filtros + KPIs          flex, gap: 16, mb: 20, align: flex-start
   [FarolSelect w:200] [FarolSelect w:200] [flex:1 spacer] [KpiCard] [KpiCard] [KpiCard]

2. Graficos (2 colunas)    grid, 1fr 1fr, gap: 16, mb: 24
   [SectionCard Donut]     [SectionCard Barras/Linhas]

3. Tabela                  SectionCard title="Projeto x Status"
   [TableFilter] [TableFilter] [Limpar]
   [DataTable com paginacao + pesquisa]
```

### 17.1 Regras de Consistencia

- Filtros de topo: FarolSelect com `width: 200` wrapper
- KPIs a direita com `flex: 1` spacer entre filtros e cards
- Charts sempre em grid 2 colunas, `marginBottom: 24`
- Tabela sempre dentro de SectionCard com titulo "Projeto x Status"
- TableFilter de Patrocinador OBRIGATORIO em toda tabela
- Botao "Limpar" aparece quando qualquer filtro esta ativo
- Pesquisa textual ja inclusa no DataTable

### 17.2 SectionCard

```
background: white
border-radius: 12px
border: 1px solid cardBorder
shadow: 0 1px 3px rgba(0,0,0,0.06)

Titulo: padding 20px 24px 0, fontSize 16, fontWeight 600, color text
Conteudo: padding 16px 24px 20px
```

### 17.3 Tabela (DataTable)

```
Header (thead):
  background: #0C4B29 (greenDark)
  color: white
  font-size: 12px, font-weight: 500
  padding: 12px 16px
  Primeiro th: border-radius 8px 0 0 0
  Ultimo th: border-radius 0 8px 0 0

Cells (td):
  padding: 12px 16px
  font-size: 14px
  color: textSecondary
  hover na linha: background rgba(0,0,0,0.02)

Paginacao:
  Botoes pill (border-radius 9999)
  Ativo: background greenDark, color white
  15 registros por pagina

Pesquisa:
  height: 40px, border-radius: 8px
  placeholder: "Pesquisar por codigo, patrocinador, tipo..."
  Contador: "N registros" a direita
```

---

## 18. Checklist de Padronizacao

Antes de entregar qualquer tela nova, conferir:

### Visual Base
- [ ] Usa CSS variables semanticas (nao hex hardcoded)
- [ ] Sidebar segue estrutura `MenuItem` com icones SVG 20x20
- [ ] Header sticky com backdrop-blur-md e h-14
- [ ] Breadcrumbs com `ChevronRight` como separador
- [ ] Botoes com `rounded-full` e variant correto
- [ ] Tabelas com header verde (#0C4B29) e texto branco
- [ ] Icones consistentes (lucide-style, h-5 w-5)
- [ ] z-index respeitando a escala (40, 50, 99999)

### Dropdowns e Filtros
- [ ] Filtros de topo usam FarolSelect com wrapper `width: 200`
- [ ] Popup do FarolSelect: border-radius 10, shadow 0 8px 24px, max-height 280
- [ ] Item ativo no popup: background greenBg2, color greenDark
- [ ] Filtros de tabela usam TableFilter (select nativo estilizado)
- [ ] Filtro de Patrocinador PRESENTE em toda tabela
- [ ] Botao "Limpar" (nao "Limpar filtros") aparece quando filtro ativo
- [ ] Botao Limpar: pill, h-36, background redBg, color statusRisk

### KPI Cards
- [ ] Valor SEMPRE em preto (DS.text) — NUNCA colorido
- [ ] Labels curtos — sem "Total de" redundante
- [ ] Container: flex, gap 12, mb 20, flexWrap wrap
- [ ] Cards com flex 1 1 140px (mesmo tamanho)

### Layout de Pagina
- [ ] Filtros flex-start + KPIs a direita com spacer flex:1
- [ ] Charts em grid 1fr 1fr, gap 16, mb 24
- [ ] Tabela dentro de SectionCard com titulo "Projeto x Status"
- [ ] DataTable com paginacao (15/pagina) + pesquisa textual
- [ ] Todas as telas seguem o mesmo padrao de layout (secao 17)
