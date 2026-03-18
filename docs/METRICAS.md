# Métricas Possíveis — Dashboard Synvia

Todas as métricas abaixo podem ser calculadas a partir do `NEW_BD (2).xlsm`.

---

## 1. KPIs Gerais (Overview)

| Métrica | Cálculo | Status no Dashboard |
|---------|---------|:-------------------:|
| Total de Entregáveis | count(*) | ✅ |
| Por Status do Projeto | count por col 12 | ✅ |
| Por Key Account | count por col 0 | ✅ |
| Por Tipo de Ensaio | count por col 6 | ✅ |
| Por Categoria | count por col 5 | ✅ (Visão do Time) |
| Por Patrocinador (Top N) | count por col 1 | ✅ |
| Por Etapa do Projeto | count por col 11 | ✅ |
| Total de Patrocinadores ativos | distinct col 1 | ✅ |

---

## 2. Métricas de Prazo e Performance

| Métrica | Cálculo | Status no Dashboard |
|---------|---------|:-------------------:|
| Taxa de cumprimento geral | (Dentro do Prazo / Total concluídos) * 100 | ✅ (Finalização: 22%) |
| Taxa de cumprimento por área | Mesmo cálculo por DT/GQ/Protocolo/Análises | ❌ Falta |
| Dias médios de atraso | avg(data real - data prevista) quando atrasado | ❌ Falta |
| Dias corridos médios por projeto | avg(col 20) | ❌ Falta |
| Projetos dentro do deadline contratual | count onde dias corridos <= deadline | ❌ Falta |
| Projetos fora do deadline contratual | count onde dias corridos > deadline | ❌ Falta |
| SLA por patrocinador | taxa cumprimento agrupada por patrocinador | ❌ Falta |
| SLA por Key Account | taxa cumprimento agrupada por responsável | ❌ Falta |

---

## 3. Métricas de Protocolo

| Métrica | Cálculo | Status no Dashboard |
|---------|---------|:-------------------:|
| Distribuição por Status Protocolo | count por col 49 | ✅ |
| Farol do Protocolo | count por col 51 | ✅ (KPIs) |
| Entregáveis previstos por mês | count por mês de col 47 | ✅ |
| Tempo médio de elaboração | avg(col 50 - col 47) | ❌ Falta |
| Protocolos por prioridade | count por col 46 | ❌ Falta |
| Backlog de protocolos não iniciados | count onde status = Não iniciado/Aguardando | ❌ Falta |

---

## 4. Métricas de Análises

| Métrica | Cálculo | Status no Dashboard |
|---------|---------|:-------------------:|
| Farol das Análises | count por col 60 | ✅ (KPIs) |
| Início previsto vs real por mês | count col 54 vs col 56 | ⚠️ Parcial (usa col 54 vs 57) |
| Término previsto vs real por mês | count col 58 vs col 57 | ❌ Falta |
| Variáveis de risco | count por col 52 | ❌ Falta |
| Tempo médio de análise | avg(col 57 - col 56) em dias | ❌ Falta |
| Análises atrasadas por área | filtro cruzado col 60 + col 0 | ❌ Falta |
| Taxa de liberação início | (col 55 preenchida / total) * 100 | ❌ Falta |

---

## 5. Métricas de Documentação Técnica

| Métrica | Cálculo | Status no Dashboard |
|---------|---------|:-------------------:|
| Status DT | count por col 66 | ✅ |
| Entregáveis DT por mês | count por mês de col 63 | ✅ |
| Taxa cumprimento DT | (Dentro Prazo / Concluídos) * 100 | ⚠️ Mencionado no alerta (5%) |
| Tempo médio DT | avg(col 65 - col 62) em dias | ❌ Falta |
| Monitoria DT pendente | count por col 64 | ❌ Falta |
| Gargalo DT (fila por fase monitoria) | distribuição col 64 | ❌ Falta |

---

## 6. Métricas de Garantia da Qualidade

| Métrica | Cálculo | Status no Dashboard |
|---------|---------|:-------------------:|
| Status GQ | count por col 72 | ✅ |
| Entregáveis GQ por mês | count por mês de col 69 | ✅ |
| Taxa cumprimento GQ | (Concluído Dentro Prazo / Concluídos) * 100 | ❌ Falta |
| Tempo médio GQ | avg(col 71 - col 68) em dias | ❌ Falta |
| Monitoria GQ pendente | count por col 70 | ❌ Falta |
| Enviados em paralelo | count onde col 74 = Sim | ❌ Falta |

---

## 7. Métricas de Finalização / Patrocinador

| Métrica | Cálculo | Status no Dashboard |
|---------|---------|:-------------------:|
| Status Patrocinador | count por col 79 | ✅ |
| Taxa cumprimento patrocinador | (Dentro Prazo / Concluídos) * 100 | ✅ (22%) |
| Tempo médio aprovação | avg(col 76 - col 73) em dias | ❌ Falta |
| Monitoria patrocinador pendente | count por col 75 | ❌ Falta |
| Tempo até fechamento SINEB | avg(col 78 - col 76) | ❌ Falta |
| Projetos aguardando assinatura | count onde col 77 vazio e col 76 preenchida | ❌ Falta |

---

## 8. Métricas de Medicamento e Insumos

| Métrica | Cálculo | Status no Dashboard |
|---------|---------|:-------------------:|
| Status recebimento MT | count por col 24 | ❌ Falta |
| Status recebimento MR | count por col 29 | ❌ Falta |
| Status insumos | count por col 34 | ❌ Falta |
| Tempo médio recebimento MT | avg(col 23 - col 22) | ❌ Falta |
| Projetos bloqueados por MT/MR | count onde status MT = pendente e etapa = Recebimento | ❌ Falta |
| Terceirizações por fornecedor | count por col 14 | ❌ Falta |
| Status microbiologia | count por col 45 | ❌ Falta |

---

## 9. Métricas Financeiras (Sheet Financeiro)

| Métrica | Cálculo | Status no Dashboard |
|---------|---------|:-------------------:|
| Valor total contratado | sum(TOTAL CONTRATO) | ❌ Falta (sheet inteira) |
| Valor total faturado | sum(VALOR PARCELA) onde tipo = Faturado | ❌ Falta |
| Valor pendente de faturamento | sum(VALOR PARCELA) onde pendente > 0 | ❌ Falta |
| % faturamento geral | avg(% FATURADO) | ❌ Falta |
| Faturamento por patrocinador | sum agrupado por patrocinador | ❌ Falta |
| Parcelas vencidas | count onde data corte < hoje e pendente > 0 | ❌ Falta |
| Previsão de faturamento mensal | sum por mês de DATA CORTE PREVISÃO | ❌ Falta |

---

## 10. Métricas Cruzadas / Avançadas

| Métrica | Cálculo | Status no Dashboard |
|---------|---------|:-------------------:|
| Heatmap Key Account x Etapa | pivot count | ❌ Falta |
| Funil do projeto (por etapa) | count em cada fase sequencial | ❌ Falta |
| Aging de projetos (faixas de dias) | distribuição col 20 em faixas | ❌ Falta |
| Gargalos por etapa | etapas com mais projetos parados | ⚠️ Parcial (barra horizontal) |
| Tendência mensal (novos vs concluídos) | count por mês de TAP vs conclusão | ❌ Falta |
| Projetos com BQV vencida | onde data BQV < hoje | ❌ Falta |
| Ranking de performance por Key Account | taxa cumprimento por pessoa | ❌ Falta |

---

## Resumo

| Categoria | Total Métricas | ✅ Implementadas | ❌ Faltando |
|-----------|:--------------:|:----------------:|:-----------:|
| KPIs Gerais | 8 | 8 | 0 |
| Prazo e Performance | 8 | 1 | 7 |
| Protocolo | 6 | 3 | 3 |
| Análises | 7 | 2 | 5 |
| Doc Técnica | 6 | 2 | 4 |
| Garantia Qualidade | 6 | 2 | 4 |
| Finalização | 6 | 2 | 4 |
| Medicamento/Insumos | 7 | 0 | 7 |
| Financeiro | 7 | 0 | 7 |
| Cruzadas/Avançadas | 7 | 0 | 7 |
| **TOTAL** | **68** | **20** | **48** |

**Cobertura atual: 29%** — O dashboard cobre bem os KPIs gerais e as visões por status, mas falta profundidade em métricas de prazo, performance individual, insumos, financeiro e análises cruzadas.
