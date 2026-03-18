# Projeto — Controle de Entregáveis Synvia

## O que é

O `NEW_BD (2).xlsm` é a **base de dados central** do time de Projetos da Synvia. Controla o ciclo de vida completo de **entregáveis analíticos** — desde a abertura do projeto até a aprovação final pelo patrocinador.

Cada linha da planilha representa um **entregável** (ensaio/análise) vinculado a um projeto farmacêutico. Um mesmo projeto (RVE) pode ter múltiplos entregáveis.

---

## Estrutura da Base

### Sheet: Entregáveis (2.321 registros)

O fluxo é dividido em **9 blocos** que representam as etapas sequenciais:

#### 1. Identificação do Projeto (cols 0-13)
| Campo | Descrição |
|-------|-----------|
| KEY ACCOUNT | Responsável comercial pelo projeto |
| PATROCINADOR | Empresa cliente (66 patrocinadores únicos) |
| CÓDIGO RVE | Registro de Viabilidade do Estudo |
| PROJETO (ATIVO) | Nome do ativo farmacêutico |
| CODIFICAÇÃO | Código interno do entregável |
| CATEGORIA DO ENSAIO | Ensaio Padrão, Biolote ou Bioisenção |
| TIPO | VP, PDC, PSA, EQFAR, VT, Micro, Estabilidade, RMN, T&E, Plotagem |
| ENSAIO | Descrição detalhada do que será feito |
| ETAPA DO PROJETO | Em qual fase está agora (27 etapas possíveis) |
| STATUS DO PROJETO | Em andamento, Concluído, Cancelado, Atrasado, Não iniciado, Stand by |
| TAP | Data de abertura (e-mail de kick-off) |

#### 2. Informações Importantes (cols 14-17)
| Campo | Descrição |
|-------|-----------|
| TERCEIRIZAÇÃO | Se terceirizado (EPHAR, RMN, PHARMACONTROL, etc.) |
| TRADUÇÃO | Se precisa de tradução |
| BQV | Tipo de BQV (Interna ou Externa) |
| DATA DA BQV | Data da BQV |

#### 3. Prazos (cols 18-21)
| Campo | Descrição |
|-------|-----------|
| DEADLINE | Prazo em dias do contrato |
| CONTROLE DE CONTRATOS | Referência contratual |
| DIAS CORRIDOS DO PROJETO | Quantos dias desde a abertura |
| TÉRMINO EM CONTRATO | Data limite contratual |

#### 4. Medicamento (cols 22-29)
| Campo | Descrição |
|-------|-----------|
| DATA PREVISTA/REAL RECEBIMENTO MT | Medicamento Teste |
| STATUS MT | Status do recebimento |
| DATA PREVISTA/REAL RECEBIMENTO MR | Medicamento Referência |
| STATUS MR | Status do recebimento |

#### 5. Insumos Laboratoriais e Terceirização (cols 30-45)
| Campo | Descrição |
|-------|-----------|
| STATUS INSUMOS | Aquisição de reagentes/padrões |
| SOLICITAÇÃO DE COMPRA | Controle de compras |
| 1º/2º FATURAMENTO | Marcos financeiros |
| Datas de envio/recebimento | Controle de terceirização (micro, etc.) |
| STATUS MICROBIOLOGIA | Quando aplicável |

#### 6. Protocolos (cols 46-51)
| Campo | Descrição |
|-------|-----------|
| PRIORIDADE | Nível de prioridade |
| DATA PREVISTA VERSIONAMENTO | Quando o protocolo deveria ficar pronto |
| DATA DE ENVIO | Quando foi enviado de fato |
| STATUS PROTOCOLO | Aprovado, Aguardando doc, Em revisão, Em elaboração, etc. |
| DATA DE VERSIONAMENTO | Data real de conclusão |
| FAROL PROTOCOLO | Semáforo: Dentro/Fora do Prazo, Atrasado, etc. |

#### 7. Análises (cols 52-60)
| Campo | Descrição |
|-------|-----------|
| VARIÁVEIS DE RISCO | Fatores que impactam o prazo |
| DIAS PREVISTOS | Prazo estimado para resultados |
| PREVISTO/REAL INÍCIO | Datas de início |
| DATA TÉRMINO | Data de conclusão |
| DATA PREVISTA ENVIO RESULTADOS | Deadline dos resultados |
| FAROL ANÁLISES | Semáforo de cumprimento |

#### 8. Documentação Técnica (cols 61-66)
| Campo | Descrição |
|-------|-----------|
| DIAS PREVISTOS | Prazo estimado |
| DATA INÍCIO/TÉRMINO DT | Datas reais |
| MONITORIA DT | Status de acompanhamento |
| STATUS DT | Concluído Dentro/Fora do Prazo, Atrasado, etc. |

#### 9. Garantia da Qualidade e Finalização (cols 67-79)
| Campo | Descrição |
|-------|-----------|
| DIAS PREVISTOS / DATA INÍCIO/TÉRMINO GQ | Controle de prazo da GQ |
| MONITORIA GQ | Status de acompanhamento |
| STATUS GQ | Concluído, Não iniciado, Atrasado, etc. |
| DATA ENVIO AO PATROCINADOR | Quando o documento foi enviado |
| ENVIADO EM PARALELO? | Se DT e GQ foram enviados juntos |
| MONITORIA PATROCINADOR | Acompanhamento da aprovação |
| DATA APROVAÇÃO PATROCINADOR | Quando o patrocinador aprovou |
| DATA FECHAMENTO SINEB | Finalização no sistema |
| STATUS PATROCINADOR | Status final de aprovação |

---

### Sheet: Financeiro (1.139 registros)

Controle de faturamento por parcela:
| Campo | Descrição |
|-------|-----------|
| STATUS FATURAMENTO | Concluído, Pendente, etc. |
| PRAZO LIMITE EMISSÃO | Dias para emitir NF |
| QTDE PARCELAS FATURADAS | Ex: "01-02" (1ª de 2) |
| TIPO | Faturado, Pendente |
| PARCELA PENDENTE | Quantidade pendente |
| CONTRATO | Condição de faturamento (ex: "1ª Parcela: na entrega do protocolo draft") |
| VENCIMENTO | Dias para vencimento |
| TOTAL CONTRATO | Valor total do contrato (R$) |
| VALOR DA PARCELA | Valor da parcela (R$) |
| % FATURADO | Percentual já faturado |
| DATA DE CORTE PREVISÃO | Data prevista de corte |

### Sheet: Validação_Dados

Listas de validação para dropdowns (patrocinadores, status, motivos de atraso, áreas, etc.).

---

## Fluxo do Projeto

```
Abertura (TAP) → Recebimento MT/MR → Recebimento Insumos → Protocolo
    → Análises → Documentação Técnica → Garantia da Qualidade
    → Envio ao Patrocinador → Aprovação → Fechamento SINEB
```

Cada etapa tem **data prevista** e **data real**, permitindo calcular atrasos e gerar faróis.

---

## Responsáveis (Key Accounts)

| Key Account | Projetos |
|-------------|----------|
| Ana Claudia | 857 |
| Ana Maria | 632 |
| Geovana | 265 |
| Letícia | 242 |
| Grizielle | 141 |
| Rafhael | 63 |
| Géssica | 59 |
| Ana Thereza | 27 |
| Ana Paula | 24 |
| Outros | 11 |
