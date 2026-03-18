# Guia de Preferencias para Graficos e Dashboards

Documento universal de referencia para construcao de graficos, dashboards e visualizacoes de dados. Serve como base para qualquer projeto — aplicar automaticamente em todo novo grafico ou dashboard.

---

## 1. Paleta de Cores

### Cores primarias
As cores primarias de qualquer dashboard devem ser **verde** e **azul**. Explorar tons de ambos para criar variedade visual.

| Nome | Hex | Uso |
|------|-----|-----|
| Verde escuro | `#0C4B29` | Cor principal, primeira serie |
| Verde medio | `#157340` | Gradientes, areas |
| Verde claro | `#4ade80` | Serie secundaria verde |
| Azul | `#2563eb` | Segunda serie principal |
| Azul marinho | `#1e3a5f` | Serie complementar |
| Azul claro | `#93c5fd` | Hover, destaques leves |

### Cores de suporte (para contraste)
| Nome | Hex | Uso |
|------|-----|-----|
| Preto | `#111827` | Contraste forte entre series |
| Cinza | `#9ca3af` | Serie neutra |
| Cinza claro | `#d1d5db` | Itens inativos/desabilitados |
| Amarelo | `#f59e0b` | Ultima opcao quando precisa de mais cores |

### Regra do contraste maximo
- Cores adjacentes (fatias vizinhas, linhas proximas) NUNCA devem ser parecidas
- Alternar entre familias de cor: verde -> azul -> cinza -> preto -> verde claro -> azul marinho
- NUNCA colocar dois tons de verde ou dois tons de azul lado a lado
- Com 8+ series, usar toda a paleta incluindo preto, cinza e amarelo
- Ordem recomendada para series:
  1. `#0C4B29` (verde escuro)
  2. `#2563eb` (azul)
  3. `#111827` (preto)
  4. `#4ade80` (verde claro)
  5. `#93c5fd` (azul claro)
  6. `#9ca3af` (cinza)
  7. `#157340` (verde medio)
  8. `#f59e0b` (amarelo)

### Cores de status
| Status | Hex | Cor |
|--------|-----|-----|
| Normal/Ativo | `#22c55e` | Verde |
| Risco/Alerta | `#ef4444` | Vermelho |
| Perda recente | `#f97316` | Laranja |
| Inativo/Antigo | `#9ca3af` | Cinza |

### Mapa de calor (heatmap por intensidade)
| Faixa | Hex | Cor |
|-------|-----|-----|
| Sem dados | `#e5e7eb` | Cinza neutro |
| Baixo (0-25%) | `#d9f99d` | Verde claro |
| Medio (25-50%) | `#fde68a` | Amarelo |
| Alto (50-75%) | `#fdba74` | Laranja |
| Muito alto (75%+) | `#fca5a5` | Vermelho claro |
| Selecionado | `#2563eb` | Azul |
| Hover | `#93c5fd` | Azul claro |

---

## 2. Graficos de Area

### Visual
- Gradiente com cor primaria verde (`#157340`), NAO azul
- Opacidade do gradiente: 0.3 no topo, 0.05 na base
- Stroke com a mesma cor do gradiente
- Usar `ResponsiveContainer` width/height 100%

### Exemplo de gradiente (Recharts)
```tsx
<defs>
  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#157340" stopOpacity={0.3} />
    <stop offset="95%" stopColor="#157340" stopOpacity={0.05} />
  </linearGradient>
</defs>
```

---

## 2.5 Graficos de Barra Vertical (Entregaveis por Mes)

### Visual
- Eixo Y: **oculto** (`<YAxis hide />`) — os valores aparecem em cima de cada barra
- Label de valor em cima de cada barra: `position: "top"`, fonte 12px, fontWeight 600, cor `#5F6B7A`
- Altura minima do container: 300px para dar respiro visual
- Margem: `left: 0, right: 0, top: 20, bottom: 5` — maximizar area util
- Barras: barSize 28, radius `[4, 4, 0, 0]`, cor `#0C4B29`
- Eixo X: fontSize 11, sem axisLine/tickLine, angle -30 se necessario

### Exemplo (Recharts)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={monthlyData} margin={{ left: 0, right: 0, top: 20, bottom: 5 }}>
    <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-30} height={40} />
    <YAxis hide />
    <Tooltip content={<ChartTooltip />} />
    <Bar dataKey="value" fill="#0C4B29" radius={[4, 4, 0, 0]} barSize={28}
      label={{ position: "top", fill: "#5F6B7A", fontSize: 12, fontWeight: 600 }}
    />
  </BarChart>
</ResponsiveContainer>
```

### Regra geral
- NUNCA mostrar eixo Y numerico quando os valores ja aparecem em cima das barras — informacao duplicada
- O grafico deve ocupar o maximo de espaco dentro do card, sem margens excessivas

---

## 3. Graficos de Linha (Comparativos)

### Cores
- Aplicar a ordem de contraste maximo da secao 1
- Cada serie com cor bem distinta da anterior

### Zero-fill obrigatorio
- Quando comparando series (ex: estados, cidades, categorias), TODAS as series devem ter valor em TODAS as datas/pontos do eixo X
- Se uma serie nao tem dado em um ponto, preencher com `0`
- Isso evita:
  - Linhas quebradas ou que somem no meio do grafico
  - Series que so aparecem em parte do eixo X
  - Gaps visuais que confundem o usuario

### Implementacao backend (pivot com zero-fill)
```typescript
// 1. Coletar todas as datas unicas
const allDates = [...new Set(rawData.map(d => d.date))].sort();

// 2. Coletar todas as series unicas
const allSeries = [...new Set(rawData.map(d => d.seriesKey))];

// 3. Criar mapa de valores existentes
const valueMap = new Map(rawData.map(d => [`${d.date}_${d.seriesKey}`, d.value]));

// 4. Gerar pivot com zero-fill
const items = allDates.map(date => {
  const point: Record<string, unknown> = { date };
  for (const series of allSeries) {
    point[series] = valueMap.get(`${date}_${series}`) ?? 0;
  }
  return point;
});
```

---

## 3.5 Graficos de Barra Horizontal (Ranking)

### Label de valor na frente da barra — OBRIGATORIO
- Em graficos de barra horizontal (ranking, distribuicao), o valor numerico DEVE aparecer ao lado direito da barra
- Posicao: `position: "right"`, fonte 12px, fontWeight 600, cor `#5F6B7A`
- Formato pt-BR com separador de milhar: `v.toLocaleString("pt-BR")`
- Margem direita do chart deve ser no minimo 50px para caber os labels

### Exemplo (Recharts)
```tsx
<Bar dataKey="value" fill="#0C4B29" radius={[0, 4, 4, 0]} barSize={18}
  label={{ position: "right", fill: "#5F6B7A", fontSize: 12, fontWeight: 600,
    formatter: (v) => v.toLocaleString("pt-BR") }}
/>
```

### Cor
- Usar sempre a primeira cor da paleta de contraste maximo (`#0C4B29` verde escuro)
- NUNCA usar cores secundarias (azul, preto) como cor principal de barras de ranking

---

## 4. Graficos de Rosca (Donut)

### Dimensoes
- Inner radius: 45, outer radius: 75
- Padding angle: 2 entre fatias
- Sem stroke (`strokeWidth: 0`)
- Centro: `cx="50%"` `cy="45%"`
- Altura do container: 340px

### Rotulos de dados (labels)
- Formato: `1.234 (56%)` — valor absoluto + porcentagem
- Locale pt-BR para numeros (ponto como separador de milhar)
- Regras de visibilidade:
  - **< 2%**: ocultar rotulo completamente
  - **< 1%**: mostrar 2 casas decimais (`0.45%`)
  - **>= 1%**: arredondar para inteiro (`56%`)
- Labels externos com polyline (linha de conexao):
  - Ponto circular na borda da fatia (`<circle r={2}>`)
  - Cotovelo a 12px da borda externa
  - Linha horizontal ate 60px alem do raio
  - Texto: fontSize 11, fontWeight 500, cor `#374151`
  - Usar `labelLine={false}` e renderizar polyline customizado via SVG

### Exemplo de label com polyline (Recharts)
```tsx
const RADIAN = Math.PI / 180;

const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, value, fill }) => {
  if (percent < 0.02) return null;

  const cos = Math.cos(-midAngle * RADIAN);
  const sin = Math.sin(-midAngle * RADIAN);
  const isRight = cos >= 0;

  const edgeX = cx + outerRadius * cos;
  const edgeY = cy + outerRadius * sin;
  const elbowX = cx + (outerRadius + 12) * cos;
  const elbowY = cy + (outerRadius + 12) * sin;
  const endX = cx + (outerRadius + 60) * (isRight ? 1 : -1);

  const rawPct = percent * 100;
  const pct = rawPct < 1 ? rawPct.toFixed(2) : Math.round(rawPct);

  return (
    <g>
      <polyline
        fill="none"
        points={`${edgeX},${edgeY} ${elbowX},${elbowY} ${endX},${elbowY}`}
        stroke={fill}
        strokeWidth={1}
      />
      <circle cx={edgeX} cy={edgeY} fill={fill} r={2} />
      <text
        dominantBaseline="central"
        dx={isRight ? 4 : -4}
        fill="#374151"
        fontSize={11}
        fontWeight={500}
        textAnchor={isRight ? "start" : "end"}
        x={endX}
        y={elbowY}
      >
        {value.toLocaleString("pt-BR")} ({pct}%)
      </text>
    </g>
  );
};
```

### Tooltip (onMouseOver)
- Mostrar: nome da fatia + valor absoluto + porcentagem
- Mesmas regras de casas decimais dos labels
- Estilo: borda cinza, bg branco, sombra, texto da cor primaria
- Sempre custom (nunca usar tooltip padrao da lib)

### Legenda
- Icon: circulo, tamanho 10
- Fonte: tamanho 11, padding top 4

---

## 5. Cross-filtering (estilo PowerBI)

Padrao de interatividade onde clicar em um visual filtra todos os demais da pagina.

### Quando usar
- Quando NAO existe um filtro equivalente ja na barra de filtros (evitar duplicidade)
- Se ja existe filtro no header para o mesmo campo, NAO implementar cross-filtering no grafico — isso deixa o projeto mais pesado sem beneficio

### Comportamento visual
- Fatia/barra ativa: mantem cor original
- Fatias/barras inativas: cor cinza solida `#d1d5db` — NAO usar opacity, usar cor cinza
- Labels dos itens inativos: ocultar completamente (`return null`)
- Segundo clique na mesma fatia: remove o filtro (toggle)
- Cursor pointer nos elementos clicaveis

### Implementacao
- State via store global (Zustand) compartilhado entre componentes
- Tag do filtro ativo aparece na barra de filtros com botao X para remover
- Todos os componentes da pagina reagem ao filtro via query params

### Exemplo de Cell com cross-filtering (Recharts)
```tsx
{chartData.map((d, i) => (
  <Cell
    fill={activeKey && activeKey !== d.key ? "#d1d5db" : colors[i % colors.length]}
    key={`cell-${i}`}
  />
))}
```

---

## 6. Mapa Interativo

### Selecao
- Clique em regiao: seleciona/deseleciona (toggle)
- Cor de selecao: azul `#2563eb`, borda `#1d4ed8`
- Multipla selecao permitida (para comparar regioes)
- Selecao alimenta graficos comparativos na mesma pagina

### Reset
- Botao "Limpar filtros" deve resetar selecao do mapa + zoom + posicao central
- Implementar via `useEffect` que reseta zoom/center quando selecao e limpa

### Legenda
- Posicao: canto inferior esquerdo, sobre o mapa
- Estilo: fundo branco semi-transparente, borda cinza, cantos arredondados
- Incluir tooltip de ajuda (icone `Info`) explicando as faixas de cor

### Tooltip do mapa
- Segue o cursor (posicao relativa ao SVG via `getBoundingClientRect`)
- Mostra: nome da regiao + valor principal formatado

---

## 7. Layout e Espacamento

### Regra principal: sem espaco em branco excessivo
- Graficos devem ocupar o maximo de espaco disponivel
- Espacamento entre secoes: `space-y-6` (maximo)
- Graficos lado a lado: `grid grid-cols-1 gap-4 md:grid-cols-2`
- Mapa + comparativos: `grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2`
- Cards: `h-full` para preencher grid uniformemente
- Containers flex: `min-h-0` para evitar overflow

### Cards de grafico
- Header com padding reduzido: `pb-2`
- Titulo: `text-base font-semibold`
- Loading: overlay `absolute inset-0 z-10 bg-white/70` com spinner centralizado

### Skeleton loading
- Usar skeletons especificos por tipo: `ChartSkeleton`, `MapSkeleton`, `TableSkeleton`
- Carregar componentes pesados com `dynamic()` (Next.js) ou `lazy()` (React) com skeleton como fallback

---

## 8. Filtros

### Barra de filtros
- Container: cantos arredondados, borda, bg card, padding 16
- Layout: flex wrap com gap entre itens
- Separadores visuais entre grupos de filtro (linha vertical)

### Multi-select
- Implementar como Select que adiciona/remove do array ao clicar (nao substitui)
- Indicador visual: bolinha colorida quando selecionado, cinza quando nao
- Placeholder inteligente:
  - 0 selecionados: "Todos"
  - 1 selecionado: mostrar o valor
  - 2+: "N selecionados"

### Presets de periodo
- Botoes pill conectados (primeiro com rounded-l, ultimo com rounded-r)
- Auto-detectar qual preset esta ativo comparando datas atuais
- Presets comuns: 30d, 90d, 12m

### Tags de filtros ativos
- Mostrar abaixo da barra de filtros como badges coloridos
- Cada tag com botao X para remover individualmente
- Cores diferentes por tipo de filtro para diferenciar visualmente
- Exemplo: UF em verde, cidade em azul, selecao de mapa em violeta

### Loading indicator nos filtros
- Spinner + texto "Carregando..." na barra de filtros enquanto qualquer query esta em fetching
- Usar `isFetching` (nao `isLoading`) do React Query para capturar refetches

---

## 9. Parametros de Query Separados por Contexto

### Problema
Quando um filtro afeta todos os graficos indiscriminadamente, acontecem efeitos colaterais:
- Filtrar por tipo de coleta zera o mapa (que deveria mostrar visao geral geografica)
- Filtrar por cidade quebra o comparativo de estados (que deveria mostrar o total do estado)
- Selecao no mapa zera os dados do proprio mapa

### Solucao: params especificos por componente
```
baseParams     = { periodo + ufs + cities + labName + tipo + subtipo }
geoParams      = { periodo + ufs + cities + labName }              // SEM tipo/subtipo
stateParams    = { periodo + ufs + labName + tipo + subtipo }      // SEM cities
cityParams     = { periodo + ufs + cities + labName + tipo + subtipo }
tableParams    = { baseParams + page + pageSize + sort }
```

### Regra geral
- Cada componente recebe apenas os filtros que fazem sentido para ele
- Mapa: nunca filtrar por categorias (mostra visao geral geografica)
- Comparativo por regiao pai: nunca filtrar por regiao filha (estado nao filtra por cidade)
- Componente de categoria: nunca filtrar por si mesmo (evita filtro circular)

---

## 10. Filtros Dinamicos e Consistencia de Dados

### Principio: tudo e dinamico
- **Todos os graficos e tabelas devem reagir a todos os filtros ativos**, incluindo selecao no mapa
- Ao mudar qualquer filtro (periodo, UF, cidade, tipo, subtipo, lab, selecao no mapa), todos os componentes da pagina devem refletir a mudanca
- Nenhum componente deve ficar "imune" a um filtro sem justificativa explicita

### Selecao no mapa afeta tudo
- A selecao de estados no mapa (cross-filtering) deve afetar: KPIs, grafico de periodo, comparativo por estado, tabela de laboratorios, graficos de rosca
- Usar `effectiveUfs` (merge de UFs do header + selecao do mapa) em todos os params, nao apenas no comparativo por estado
- Excecao: o proprio mapa NAO deve filtrar por sua selecao (evitar feedback circular)

### Persistencia de dados ao limpar filtros — PROIBIDO
- Ao remover um filtro (ex: desmarcar todas as UFs), os dados antigos NAO podem continuar aparecendo
- Causa comum: `placeholderData` do React Query mantem dados antigos quando a query e desabilitada (`enabled: false`)
- **Regra**: quando a condicao de `enabled` e falsa, os componentes devem receber dados vazios diretamente — nao confiar no resultado do hook
- Exemplo correto:
  ```tsx
  // Na page, forcar dados vazios quando nao ha UFs selecionadas
  <StateChart
    data={effectiveUfs.length > 0 ? (queryData?.items ?? []) : []}
    ufs={effectiveUfs.length > 0 ? (queryData?.ufs ?? effectiveUfs) : []}
  />
  ```
- Exemplo errado:
  ```tsx
  // Confia no hook que pode retornar placeholderData stale
  <StateChart data={queryData?.items ?? []} ufs={queryData?.ufs ?? effectiveUfs} />
  ```

### Botao "Limpar filtros"
- Deve estar **sempre visivel** quando qualquer filtro difere do estado padrao (incluindo datas)
- Estado padrao: ultimos 30 dias, sem UF, sem cidade, sem lab, sem tipo/subtipo, sem selecao no mapa
- Ao clicar, reseta TUDO pro estado padrao: filtros do header, selecao do mapa, paginacao, zoom do mapa
- Validacao: comparar cada campo com o valor inicial, incluindo `fromDate`/`toDate` vs default de 30 dias

### keepPreviousData — usar com cuidado
- `placeholderData: keepPreviousData` e util para evitar skeleton flash ao trocar filtros
- MAS quando combinado com `enabled: false`, os dados ficam stale permanentemente
- **Regra**: sempre que um hook tem `enabled` condicional, a page deve checar a condicao e forcar dados vazios quando `enabled` seria `false`
- Hooks sem `enabled` condicional (overview, trend, geographic, purpose, lab-table) podem usar `keepPreviousData` sem problema

### Loading ao trocar filtros
- Ao trocar filtros, NAO mostrar skeleton da pagina inteira — mostrar overlay de loading em cada componente individualmente
- Usar `isFetching` (nao `isLoading`) para capturar refetches
- `isLoading` com `keepPreviousData` so e `true` no primeiro load (sem dados anteriores)
- Cada componente deve ter seu proprio overlay: `absolute inset-0 z-10 bg-white/70` + spinner

---

## 11. Otimizacoes de Performance

### React Query
- `refetchOnWindowFocus: false` — OBRIGATORIO no QueryClient global. Sem isso, toda vez que o usuario troca de aba e volta, TODAS as queries refazem
- `staleTime`: minimo 60 segundos para dados que nao mudam frequentemente
- Usar `isFetching` para mostrar loading em refetches (nao so no primeiro load)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Axios
- Serializacao de arrays: usar `paramsSerializer: { indexes: null }`
- Resultado: `ufs=SP&ufs=PA` (NAO `ufs[0]=SP&ufs[1]=PA`)
- Backends como NestJS com `@Transform` esperam o formato sem indice

```typescript
const api = axios.create({
  baseURL: "...",
  paramsSerializer: { indexes: null },
});
```

### Componentes
- Lazy load graficos pesados com `dynamic()` / `lazy()` + skeleton fallback
- `memo()` em componentes de grafico para evitar re-renders desnecessarios
- Zustand: usar seletores individuais `useStore((s) => s.campo)`, NUNCA desestruturar o store inteiro
- `useMemo` para objetos de params (evitar re-renders por referencia)

### Backend
- Validar enums com `$in: valoresValidos` (nunca `$exists: true`) para excluir dados sujos
- Zero-fill no backend, nao no frontend — o frontend nao deve se preocupar com gaps nos dados
- Retornar lista de series disponiveis junto com os dados (ex: `{ items: [...], ufs: ["SP", "PA"] }`)

---

## 12. Tooltips e Formatacao

### Numeros
- Sempre locale pt-BR: `value.toLocaleString("pt-BR")`
- Separador de milhar: ponto
- Separador decimal: virgula

### Porcentagens
- >= 1%: arredondar para inteiro
- < 1%: 2 casas decimais
- Calcular manualmente quando a lib nao fornece: `(value / total) * 100`

### Tooltips customizados (padrao)
```tsx
const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length || !payload[0]) return null;
  const item = payload[0];
  const val = item.value ?? 0;
  const rawPct = total > 0 ? (val / total) * 100 : 0;
  const pct = rawPct < 1 ? rawPct.toFixed(2) : Math.round(rawPct);
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-gray-900">{item.name}</p>
      <p className="text-primary">
        {val.toLocaleString("pt-BR")} ({pct}%)
      </p>
    </div>
  );
};
```

---

## 13. Checklist Rapido

Antes de entregar qualquer grafico ou dashboard, verificar:

- [ ] Cores adjacentes tem contraste suficiente (regra do contraste maximo)
- [ ] Labels de rosca com polyline, nao sobrepostos
- [ ] Porcentagens < 1% com 2 casas, >= 1% inteiro, < 2% oculto
- [ ] Zero-fill em todas as series comparativas
- [ ] `refetchOnWindowFocus: false` no QueryClient
- [ ] `paramsSerializer: { indexes: null }` no Axios
- [ ] Params separados por contexto (mapa, estado, cidade, tabela)
- [ ] Loading indicator na barra de filtros + overlay nos cards
- [ ] Sem espaco em branco excessivo entre graficos
- [ ] Tooltips customizados com formatacao pt-BR
- [ ] Multi-select com indicador visual e tags removiveis
- [ ] "Limpar filtros" visivel sempre que qualquer filtro difere do padrao (incluindo datas)
- [ ] "Limpar filtros" reseta TUDO (inclusive selecao de mapa, zoom, datas pro default 30d)
- [ ] Selecao no mapa afeta todos os componentes (graficos, tabela, KPIs)
- [ ] Ao desmarcar todos os filtros, dados antigos NAO persistem (checar hooks com `enabled` condicional)
- [ ] Trocar filtro mostra loader por componente, NAO skeleton da pagina inteira
- [ ] Componentes pesados com lazy load + skeleton
- [ ] `memo()` nos componentes de grafico
- [ ] Seletores individuais no Zustand (nao desestruturar)
