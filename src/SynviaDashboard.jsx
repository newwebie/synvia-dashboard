import { useState, useMemo, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area, Treemap, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import LoginPage from "./auth/LoginPage";

// Dados estáticos como fallback (gerados no build pelo sync)
import entregaveisFallback from "./data/entregaveis.json";
import financeiroFallback from "./data/financeiro.json";
import metadataFallback from "./data/metadata.json";

// Variáveis reativas — atualizadas pelo fetch dinâmico
let entregaveis = entregaveisFallback;
let financeiro = financeiroFallback;
let metadata = metadataFallback;

// Listeners para notificar componentes quando os dados mudam
const dataListeners = new Set();
function onDataChange(fn) { dataListeners.add(fn); return () => dataListeners.delete(fn); }
function notifyDataChange() { dataListeners.forEach((fn) => fn()); }

/** Busca dados frescos da API */
async function fetchFreshData(force = false) {
  try {
    const url = force ? "/api/data?fresh=1" : "/api/data";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    entregaveis = data.entregaveis;
    financeiro = data.financeiro;
    metadata = { lastModified: data.lastModified, syncedAt: data.syncedAt };
    notifyDataChange();
    return true;
  } catch (err) {
    console.warn("Falha ao buscar dados da API, usando fallback:", err.message);
    return false;
  }
}

/** Hook para forçar re-render quando dados mudam */
function useDataRefresh() {
  const [, setTick] = useState(0);
  useEffect(() => onDataChange(() => setTick((t) => t + 1)), []);
}

// ═══════════════════════════════════════════
//  SYNVIA DESIGN SYSTEM
// ═══════════════════════════════════════════
const DS = {
  // Paleta principal — chart-preferences.md + SYNVIA-DESIGN-SYSTEM.md
  greenDark: "#0C4B29",
  green: "#157340",
  greenLight: "#4ade80",
  greenBg100: "#EFFEF4",
  blue: "#2563eb",
  blueNavy: "#1e3a5f",
  blueLight: "#93c5fd",
  black: "#111827",
  gray: "#9ca3af",
  grayLight: "#d1d5db",
  amber: "#f59e0b",

  // Status
  statusActive: "#22c55e",
  statusRisk: "#ef4444",
  statusWarning: "#f97316",
  statusInactive: "#9ca3af",

  // UI — SYNVIA-DESIGN-SYSTEM.md
  greenBg: "rgba(21,115,64,0.08)",
  greenBg2: "rgba(21,115,64,0.15)",
  sidebar: "#082423",
  sidebarHover: "#2E7C65",
  sidebarActive: "#21A84E",
  bg: "#F7F8FA",
  card: "#FFFFFF",
  cardBorder: "#e5e7eb",
  text: "#1B2430",
  textSecondary: "#5F6B7A",
  textMuted: "#6b7280",
  red: "#ef4444",
  redBg: "rgba(239,68,68,0.08)",
  amberBg: "rgba(245,158,11,0.08)",
  blueBg: "rgba(37,99,235,0.08)",
  violet: "#9B59B6",
};

// Ordem de contraste máximo para séries de gráficos
const CHART_COLORS = [
  "#0C4B29", // verde escuro
  "#2563eb", // azul
  "#111827", // preto
  "#4ade80", // verde claro
  "#93c5fd", // azul claro
  "#9ca3af", // cinza
  "#157340", // verde médio
  "#f59e0b", // amarelo
];

const RADIAN = Math.PI / 180;

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// ═══════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════

// PROTOCOLOS — STATUS PROTOCOLO (col 49 do Excel)
const protStatus = [
  { name: "Aprovado", value: 1107, color: CHART_COLORS[0] },
  { name: "Aguardando documentação", value: 271, color: CHART_COLORS[1] },
  { name: "Em revisão patrocinador", value: 175, color: CHART_COLORS[2] },
  { name: "Cancelado", value: 124, color: CHART_COLORS[3] },
  { name: "Aguardando programação", value: 88, color: CHART_COLORS[4] },
  { name: "Em elaboração", value: 12, color: CHART_COLORS[5] },
  { name: "Aguardando Petição Anvisa", value: 4, color: CHART_COLORS[6] },
  { name: "Em revisão Synvia", value: 4, color: CHART_COLORS[7] },
];

// FAROL PROTOCOLO (col 51 do Excel)
const protFarol = { atrasado: 13, andamento: 28, naoIniciado: 275, concluido: 980, cancelado: 362 };

// Entregáveis previstos — Data Prevista Versionamento Protocolo (col 47)
const protMonthly = [
  { month: "Mai/25", value: 117 }, { month: "Jun/25", value: 12 }, { month: "Jul/25", value: 87 },
  { month: "Ago/25", value: 83 }, { month: "Set/25", value: 135 }, { month: "Out/25", value: 74 },
  { month: "Nov/25", value: 143 }, { month: "Dez/25", value: 85 }, { month: "Jan/26", value: 25 },
  { month: "Fev/26", value: 31 }, { month: "Mar/26", value: 116 },
];

// ANÁLISES — FAROL ANÁLISES (col 60 do Excel)
const analisesFarol = { atrasado: 211, andamento: 5, naoIniciado: 491, concluido: 973, cancelado: 360 };

// Início previsto (col 54) x Término (col 57) — meses recentes
const analiseInicio = [
  { month: "Jun/25", inicio: 53, termino: 67 }, { month: "Jul/25", inicio: 59, termino: 54 },
  { month: "Ago/25", inicio: 107, termino: 58 }, { month: "Set/25", inicio: 70, termino: 64 },
  { month: "Out/25", inicio: 92, termino: 49 }, { month: "Nov/25", inicio: 82, termino: 27 },
  { month: "Dez/25", inicio: 105, termino: 58 }, { month: "Jan/26", inicio: 75, termino: 58 },
  { month: "Fev/26", inicio: 52, termino: 28 }, { month: "Mar/26", inicio: 294, termino: 2 },
];

// DOC TÉCNICA — STATUS DT (col 66 do Excel)
const dtStatus = [
  { name: "Concluído Fora do Prazo", value: 881, color: "#ef4444" },
  { name: "Não iniciado", value: 735, color: CHART_COLORS[1] },
  { name: "Cancelado", value: 362, color: CHART_COLORS[5] },
  { name: "Não Aplicável", value: 128, color: CHART_COLORS[4] },
  { name: "Stand by", value: 91, color: CHART_COLORS[3] },
  { name: "Atrasado", value: 75, color: "#f97316" },
  { name: "Concluído Dentro do Prazo", value: 46, color: CHART_COLORS[0] },
  { name: "Em andamento", value: 3, color: CHART_COLORS[2] },
];

// Entregáveis DT — Data Prevista Término DT (col 63)
const dtMonthly = [
  { month: "Abr/25", value: 44 }, { month: "Mai/25", value: 72 }, { month: "Jun/25", value: 72 },
  { month: "Jul/25", value: 37 }, { month: "Ago/25", value: 89 }, { month: "Set/25", value: 78 },
  { month: "Out/25", value: 99 }, { month: "Nov/25", value: 47 }, { month: "Dez/25", value: 86 },
  { month: "Jan/26", value: 89 }, { month: "Fev/26", value: 53 }, { month: "Mar/26", value: 61 },
];

// GQ — STATUS GQ (col 72 do Excel)
const gqStatus = [
  { name: "Não iniciado", value: 826, color: CHART_COLORS[1] },
  { name: "Concluído", value: 818, color: CHART_COLORS[0] },
  { name: "Cancelado", value: 376, color: CHART_COLORS[5] },
  { name: "Concluído Fora do Prazo", value: 109, color: "#ef4444" },
  { name: "Stand by", value: 100, color: CHART_COLORS[3] },
  { name: "Em andamento", value: 39, color: CHART_COLORS[2] },
  { name: "Não Aplicável", value: 37, color: CHART_COLORS[4] },
  { name: "Atrasado", value: 15, color: "#f97316" },
];

// Entregáveis GQ — Data Prevista Término GQ (col 69)
const gqMonthly = [
  { month: "Abr/25", value: 35 }, { month: "Mai/25", value: 42 }, { month: "Jun/25", value: 53 },
  { month: "Jul/25", value: 57 }, { month: "Ago/25", value: 56 }, { month: "Set/25", value: 47 },
  { month: "Out/25", value: 77 }, { month: "Nov/25", value: 100 }, { month: "Dez/25", value: 67 },
  { month: "Jan/26", value: 95 }, { month: "Fev/26", value: 109 }, { month: "Mar/26", value: 56 },
];

// OVERVIEW — STATUS DO PROJETO (col 12 do Excel)
const projetoStatus = [
  { name: "Em andamento", value: 862, color: CHART_COLORS[0] },
  { name: "Concluído", value: 722, color: CHART_COLORS[1] },
  { name: "Cancelado", value: 378, color: CHART_COLORS[2] },
  { name: "Atrasado", value: 158, color: CHART_COLORS[3] },
  { name: "Não iniciado", value: 101, color: CHART_COLORS[4] },
  { name: "Stand by", value: 100, color: CHART_COLORS[5] },
];

// OVERVIEW — Por Tipo de Ensaio (col 6)
const porTipo = [
  { name: "VP", value: 836, color: CHART_COLORS[0] },
  { name: "PDC", value: 646, color: CHART_COLORS[1] },
  { name: "PSA", value: 279, color: CHART_COLORS[2] },
  { name: "EQFAR", value: 203, color: CHART_COLORS[3] },
  { name: "VT", value: 149, color: CHART_COLORS[4] },
  { name: "Micro", value: 128, color: CHART_COLORS[5] },
  { name: "Estabilidade", value: 35, color: CHART_COLORS[6] },
  { name: "RMN", value: 24, color: CHART_COLORS[7] },
];

// OVERVIEW — Por Key Account (responsável)
const porKeyAccount = [
  { name: "Ana Claudia", value: 857, color: CHART_COLORS[0] },
  { name: "Ana Maria", value: 632, color: CHART_COLORS[1] },
  { name: "Geovana", value: 265, color: CHART_COLORS[2] },
  { name: "Letícia", value: 242, color: CHART_COLORS[3] },
  { name: "Grizielle", value: 141, color: CHART_COLORS[4] },
  { name: "Rafhael", value: 63, color: CHART_COLORS[5] },
  { name: "Géssica", value: 59, color: CHART_COLORS[6] },
  { name: "Outros", value: 62, color: CHART_COLORS[7] },
];

// OVERVIEW — Top 10 Patrocinadores
const topPatrocinadores = [
  { name: "ACHÉ", value: 268 }, { name: "CAMBER", value: 109 },
  { name: "ABBOTT", value: 103 }, { name: "NATCOFARMA", value: 102 },
  { name: "UNIÃO QUÍMICA", value: 99 }, { name: "PRATI DONADUZZI", value: 96 },
  { name: "EUROFARMA", value: 89 }, { name: "SANOFI", value: 72 },
  { name: "EMS", value: 69 }, { name: "TEVA", value: 66 },
];

// OVERVIEW — Etapa do Projeto (top 10)
const porEtapa = [
  { name: "Projeto Concluído", value: 723 }, { name: "Cancelado", value: 378 },
  { name: "Recebimento do MT", value: 370 }, { name: "SINEB", value: 138 },
  { name: "Aguardando Início Análises", value: 111 }, { name: "Stand by", value: 100 },
  { name: "Conferência Patrocinador", value: 85 }, { name: "Em Análise", value: 67 },
  { name: "Recebimento do MR", value: 54 }, { name: "Documentação Técnica", value: 47 },
];

// FINALIZAÇÃO — STATUS PATROCINADOR (col 79)
const statusPatrocinador = [
  { name: "Não iniciado", value: 829, color: CHART_COLORS[1] },
  { name: "Concluído Fora do Prazo", value: 667, color: "#ef4444" },
  { name: "Cancelado", value: 378, color: CHART_COLORS[5] },
  { name: "Concluído Dentro do Prazo", value: 190, color: CHART_COLORS[0] },
  { name: "Em andamento", value: 124, color: CHART_COLORS[2] },
  { name: "Stand by", value: 100, color: CHART_COLORS[3] },
  { name: "Não Aplicável", value: 33, color: CHART_COLORS[4] },
];

// Dados da tabela — importados do JSON extraído da sheet Entregáveis do NEW_BD (2).xlsm
const allData = entregaveis;
const allFinanceiro = financeiro;

// INSUMOS — Status MT, MR e Insumos
const statusMT = [
  { name: "Concluído Dentro do Prazo", value: 1097, color: CHART_COLORS[0] },
  { name: "Cancelado", value: 378, color: CHART_COLORS[5] },
  { name: "Concluído Fora do Prazo", value: 362, color: "#ef4444" },
  { name: "Em andamento", value: 253, color: CHART_COLORS[1] },
  { name: "Não iniciado", value: 128, color: CHART_COLORS[4] },
  { name: "Stand by", value: 100, color: CHART_COLORS[3] },
];
const statusMR = [
  { name: "Concluído Dentro do Prazo", value: 893, color: CHART_COLORS[0] },
  { name: "Não Aplicável", value: 466, color: CHART_COLORS[4] },
  { name: "Cancelado", value: 378, color: CHART_COLORS[5] },
  { name: "Não iniciado", value: 205, color: CHART_COLORS[1] },
  { name: "Concluído Fora do Prazo", value: 161, color: "#ef4444" },
  { name: "Stand by", value: 100, color: CHART_COLORS[3] },
  { name: "Em andamento", value: 70, color: CHART_COLORS[2] },
];
const statusInsumosData = [
  { name: "Concluído Dentro do Prazo", value: 1031, color: CHART_COLORS[0] },
  { name: "Concluído Fora do Prazo", value: 408, color: "#ef4444" },
  { name: "Cancelado", value: 378, color: CHART_COLORS[5] },
  { name: "Não iniciado", value: 187, color: CHART_COLORS[1] },
  { name: "Em andamento", value: 129, color: CHART_COLORS[2] },
  { name: "Stand by", value: 100, color: CHART_COLORS[3] },
];

// FINANCEIRO
const statusFaturamento = [
  { name: "Concluído", value: 622, color: CHART_COLORS[0] },
  { name: "Não iniciado", value: 164, color: CHART_COLORS[1] },
  { name: "Cancelado", value: 49, color: CHART_COLORS[5] },
  { name: "Stand By", value: 28, color: CHART_COLORS[3] },
];

// ═══════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════

const SynviaLogo = () => (
  <div style={{
    padding: "20px 20px", display: "flex", alignItems: "center", justifyContent: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)", height: 72,
  }}>
    <img src="/logo-synvia.svg" alt="Synvia" style={{ height: 42, width: "auto" }} />
  </div>
);

const NavItem = ({ label, active, onClick, indent }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", width: "calc(100% - 16px)", textAlign: "left",
    border: "none", cursor: "pointer", position: "relative",
    padding: indent ? "8px 16px 8px 32px" : "10px 16px",
    fontSize: 15, fontWeight: active ? 600 : 500, fontFamily: font,
    color: active ? "#fff" : "rgba(200,220,210,0.7)",
    background: active
      ? "linear-gradient(to right, rgba(33,168,78,0.2), rgba(33,168,78,0.05))"
      : "transparent",
    borderRadius: 8, margin: "1px 8px",
    borderLeft: "none",
    transition: "all 0.2s ease-out",
  }}>
    {active && (
      <div style={{
        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
        width: 3, height: 24, background: DS.sidebarActive, borderRadius: "0 4px 4px 0",
      }} />
    )}
    {indent && (
      <div style={{
        position: "absolute", left: 14, top: 0, bottom: 0, width: 2,
        background: "rgba(255,255,255,0.1)", borderRadius: 1,
      }} />
    )}
    {label}
  </button>
);

const OverviewKpi = ({ value, label, color = DS.greenDark, icon }) => {
  const iconMap = {
    "Total de Entregáveis": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    "Em Andamento": "M13 10V3L4 14h7v7l9-11h-7z",
    "Concluídos": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    "Atrasados": "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    "Não Iniciados": "M20 12H4M12 4v16",
    "Patrocinadores": "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
    "Total Contratado": "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    "Total Faturado": "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
    "% Faturado": "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    "Pendente de Faturamento": "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    "MT Em Andamento": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    "MT Não Iniciado": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    "MR Em Andamento": "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    "Insumos Em Andamento": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  };
  const svgPath = icon || iconMap[label] || "M4 6h16M4 10h16M4 14h16M4 18h16";
  const bgColor = color + "14"; // ~8% opacidade em hex

  return (
    <div style={{
      background: DS.card, borderRadius: 14, padding: 0,
      border: `1px solid ${DS.cardBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      flex: "1 1 140px", minWidth: 140, overflow: "hidden",
      display: "flex", flexDirection: "row",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Barra lateral colorida */}
      <div style={{ width: 4, background: color, borderRadius: "14px 0 0 14px", flexShrink: 0 }} />
      <div style={{ padding: "18px 20px", flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
        {/* Ícone */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: bgColor,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={svgPath} />
          </svg>
        </div>
        {/* Textos */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: DS.text, lineHeight: 1.1 }}>{value}</div>
          <div style={{ fontSize: 12, color: DS.textMuted, fontWeight: 500, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ value, label, color, subtitle }) => (
  <div style={{
    background: DS.card, borderRadius: 12, padding: "20px 24px",
    border: `1px solid ${DS.cardBorder}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    flex: "1 1 140px", minWidth: 140,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: DS.textMuted, fontWeight: 500 }}>{label}</div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: DS.text, lineHeight: 1 }}>{value}</div>
    {subtitle && <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 6 }}>{subtitle}</div>}
  </div>
);

const SectionCard = ({ title, subtitle, children, flex }) => (
  <div style={{
    background: DS.card, borderRadius: 12,
    border: `1px solid ${DS.cardBorder}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    flex: flex || "1 1 0", display: "flex", flexDirection: "column",
  }}>
    {title && (
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: DS.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: DS.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
    )}
    <div style={{ padding: "16px 24px 20px", flex: 1 }}>
      {children}
    </div>
  </div>
);

const FarolSelect = ({ label, value, options, onChange, displayFn }) => {
  const [open, setOpen] = useState(false);
  const ref = { current: null };
  const display = displayFn ? displayFn(value) : value;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, position: "relative" }}
      ref={(el) => { ref.current = el; }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
      tabIndex={-1}
    >
      <div style={{ fontSize: 12, color: DS.textMuted, fontWeight: 500 }}>{label}</div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          height: 44, padding: "0 36px 0 16px", borderRadius: 10,
          border: `1.5px solid ${open ? DS.greenDark : DS.cardBorder}`,
          fontSize: 15, fontWeight: 600, color: DS.text, textAlign: "left",
          background: DS.card, fontFamily: font, cursor: "pointer",
          boxShadow: open ? "0 2px 12px rgba(0,0,0,0.1)" : "0 2px 6px rgba(0,0,0,0.06)",
          position: "relative", minWidth: 140, transition: "all 0.15s",
        }}
      >
        {display}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: "absolute", right: 12, top: "50%", transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: "transform 0.2s" }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 50,
          minWidth: "100%", maxHeight: 280, overflowY: "auto",
          background: DS.card, borderRadius: 10, border: `1px solid ${DS.cardBorder}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "4px",
        }}>
          {options.map((o) => {
            const isActive = o === value;
            const label = displayFn ? displayFn(o) : o;
            return (
              <button key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                style={{
                  display: "block", width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                  padding: "10px 14px", borderRadius: 8, fontSize: 14, fontWeight: isActive ? 600 : 400,
                  fontFamily: font, transition: "all 0.1s",
                  background: isActive ? DS.greenBg2 : "transparent",
                  color: isActive ? DS.greenDark : DS.text,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f3f4f6"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};



const StatusBadge = ({ status }) => {
  const map = {
    "Aprovado": { bg: DS.greenBg2, color: DS.greenDark },
    "Não iniciado": { bg: DS.amberBg, color: DS.amber },
    "Aguardando programação": { bg: DS.blueBg, color: DS.blue },
    "Aguardando documentação": { bg: DS.blueBg, color: DS.blue },
    "Aguardando Petição Anvisa": { bg: DS.blueBg, color: DS.blue },
    "Em revisão patrocinador": { bg: DS.amberBg, color: DS.amber },
    "Em revisão Synvia": { bg: DS.amberBg, color: DS.amber },
    "Em elaboração": { bg: DS.greenBg, color: DS.green },
    "Em andamento": { bg: DS.greenBg, color: DS.statusActive },
    "Concluído": { bg: DS.greenBg2, color: DS.greenDark },
    "Concluído Dentro do Prazo": { bg: DS.greenBg2, color: DS.greenDark },
    "Concluído Fora do Prazo": { bg: DS.redBg, color: DS.statusRisk },
    "Concluído Sem Prazo": { bg: "rgba(0,0,0,0.04)", color: DS.textSecondary },
    "Atrasado": { bg: DS.redBg, color: DS.statusRisk },
    "Cancelado": { bg: "rgba(0,0,0,0.04)", color: DS.statusInactive },
    "Não Aplicável": { bg: "rgba(0,0,0,0.04)", color: DS.textMuted },
    "Stand by": { bg: "rgba(155,89,182,0.1)", color: DS.violet },
    "NA": { bg: "rgba(0,0,0,0.04)", color: DS.textMuted },
  };
  const s = map[status] || { bg: "#f0f0f0", color: DS.textSecondary };
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 500,
      background: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>{status}</span>
  );
};

const EtapaBadge = ({ etapa }) => {
  const isGreen = etapa.includes("Concluído");
  const isYellow = etapa.includes("Recebimento") || etapa.includes("SINEB");
  const isRed = etapa.includes("Não iniciado");
  const bg = isGreen ? DS.statusActive : isYellow ? DS.amber : isRed ? DS.statusRisk : DS.blue;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: bg, flexShrink: 0 }} />
      <span style={{ fontSize: 11.5, color: DS.textSecondary }}>{etapa}</span>
    </div>
  );
};


const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
      padding: "8px 12px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 500 }}>
          {p.name}: {(p.value ?? 0).toLocaleString("pt-BR")}
        </div>
      ))}
    </div>
  );
};

const DonutTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length || !payload[0]) return null;
  const item = payload[0];
  const val = item.value ?? 0;
  const rawPct = total > 0 ? (val / total) * 100 : 0;
  const pct = rawPct < 1 ? rawPct.toFixed(2) : Math.round(rawPct);
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg"
      style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight: 500, color: "#111827", marginBottom: 2 }}>{item.name}</p>
      <p style={{ color: DS.greenDark, fontWeight: 600 }}>
        {val.toLocaleString("pt-BR")} ({pct}%)
      </p>
    </div>
  );
};

const renderDonutLabel = ({ cx, cy, midAngle, outerRadius, percent, value, fill }) => {
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

const DonutChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div>
      <ResponsiveContainer width="100%" height={340}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="45%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={2}
            strokeWidth={0}
            label={renderDonutLabel}
            labelLine={false}
          >
            {data.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Tooltip content={<DonutTooltip total={total} />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", justifyContent: "center", paddingTop: 4 }}>
        {data.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: DS.textMuted }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const PAGE_SIZE = 15;

// searchKeys: colunas onde a pesquisa textual funciona (texto livre)
// Se nao informado, busca em todas as colunas (retrocompativel)
const DataTable = ({ columns, rows, searchKeys }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase();
    const keys = searchKeys || columns.map(c => c.key);
    return rows.filter((row) =>
      keys.some((k) => {
        const val = row[k];
        return val && String(val).toLowerCase().includes(term);
      })
    );
  }, [rows, columns, search, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div>
      {/* Barra de pesquisa */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Pesquisar por código ou projeto..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          style={{
            flex: 1, height: 40, padding: "0 12px", borderRadius: 8,
            border: `1px solid ${DS.cardBorder}`, fontSize: 14,
            fontFamily: font, color: DS.text, background: DS.card,
            outline: "none", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        />
        <span style={{ fontSize: 11, color: DS.textMuted, whiteSpace: "nowrap" }}>
          {filtered.length.toLocaleString("pt-BR")} registro{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabela */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} style={{
                  textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 500,
                  color: "#fff", background: DS.greenDark, whiteSpace: "nowrap",
                  borderBottom: "none",
                  ...(i === 0 ? { borderRadius: "8px 0 0 0" } : {}),
                  ...(i === columns.length - 1 ? { borderRadius: "0 8px 0 0" } : {}),
                }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{
                  padding: 24, textAlign: "center", color: DS.textMuted, fontSize: 12,
                }}>Nenhum registro encontrado</td>
              </tr>
            ) : paged.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: `1px solid ${DS.cardBorder}`, transition: "background 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                {columns.map((c, ci) => (
                  <td key={ci} style={{
                    padding: "12px 16px", fontSize: 14, color: DS.textSecondary,
                    maxWidth: c.maxW || "auto",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {c.render ? c.render(row[c.key]) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 4, marginTop: 12, flexWrap: "wrap",
        }}>
          <PaginationBtn label="«" disabled={safePage === 0} onClick={() => setPage(0)} />
          <PaginationBtn label="‹" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} />
          {paginationRange(safePage, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} style={{ padding: "0 4px", fontSize: 12, color: DS.textMuted }}>...</span>
            ) : (
              <PaginationBtn key={p} label={String(p + 1)} active={p === safePage} onClick={() => setPage(p)} />
            )
          )}
          <PaginationBtn label="›" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)} />
          <PaginationBtn label="»" disabled={safePage >= totalPages - 1} onClick={() => setPage(totalPages - 1)} />
        </div>
      )}
    </div>
  );
};

const PaginationBtn = ({ label, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "6px 12px", borderRadius: 9999, fontSize: 12, fontWeight: active ? 600 : 500,
      fontFamily: font, cursor: disabled ? "default" : "pointer",
      border: active ? `1px solid ${DS.greenDark}` : `1px solid ${DS.cardBorder}`,
      background: active ? DS.greenDark : DS.card,
      color: disabled ? DS.grayLight : active ? "#fff" : DS.textSecondary,
      transition: "all 0.15s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    }}
  >
    {label}
  </button>
);

function paginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = [];
  pages.push(0);
  if (current > 3) pages.push("...");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 4) pages.push("...");
  pages.push(total - 1);
  return pages;
}

// ═══════════════════════════════════════════
//  PAGES
// ═══════════════════════════════════════════

const ProtocolosPage = () => {
  const [anoTep, setAnoTep] = useState("2025");
  const [fStatusProt, setFStatusProt] = useState("Todos");
  const [fEtapa, setFEtapa] = useState("Todos");
  const [fPatrocinador, setFPatrocinador] = useState("Todos");
  const [fKeyAccount, setFKeyAccount] = useState("Todos");

  const anos = useMemo(() => [...new Set(allData.map(d => d.tepAno).filter(Boolean))].sort(), []);
  const nomeMes = { 1:"Jan",2:"Fev",3:"Mar",4:"Abr",5:"Mai",6:"Jun",7:"Jul",8:"Ago",9:"Set",10:"Out",11:"Nov",12:"Dez" };
  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);

  // Universo filtrado por ano TEP e Key Account
  const byAno = useMemo(() => allData.filter(d =>
    d.tepAno === parseInt(anoTep) &&
    (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount)
  ), [anoTep, fKeyAccount]);

  const statusProts = useMemo(() => [...new Set(byAno.map(d => d.statusProtocolo).filter(Boolean))].sort(), [byAno]);
  const etapas = useMemo(() => [...new Set(byAno.map(d => d.etapa).filter(Boolean))].sort(), [byAno]);
  const patrocinadores = useMemo(() => [...new Set(byAno.map(d => d.patrocinador).filter(Boolean))].sort(), [byAno]);

  const statusFiltered = useMemo(() => {
    return fStatusProt === "Todos" ? byAno : byAno.filter(d => d.statusProtocolo === fStatusProt);
  }, [byAno, fStatusProt]);

  const filteredRows = useMemo(() => {
    return statusFiltered.filter(d =>
      (fEtapa === "Todos" || d.etapa === fEtapa) &&
      (fPatrocinador === "Todos" || d.patrocinador === fPatrocinador)
    );
  }, [statusFiltered, fEtapa, fPatrocinador]);

  // KPIs reativos (farol protocolo)
  const kpiAtrasado = useMemo(() => statusFiltered.filter(d => d.farolProtocolo === "Atrasado").length, [statusFiltered]);
  const kpiAndamento = useMemo(() => statusFiltered.filter(d => d.farolProtocolo === "Em andamento").length, [statusFiltered]);
  const kpiNaoIniciado = useMemo(() => statusFiltered.filter(d => d.farolProtocolo === "Não iniciado").length, [statusFiltered]);
  const kpiAprovados = useMemo(() => statusFiltered.filter(d => d.statusProtocolo === "Aprovado").length, [statusFiltered]);

  // Donut por status
  const donutData = useMemo(() => {
    const counts = {};
    statusFiltered.forEach(d => { const s = d.statusProtocolo; if (s) counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [statusFiltered]);

  // Protocolos previstos vs enviados por mês
  const curvaProtocolo = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const mes = statusFiltered.filter(d => {
        if (!d.dataPrevProtocolo) return false;
        const parts = d.dataPrevProtocolo.split("/");
        return parseInt(parts[1]) === i + 1;
      });
      const enviados = statusFiltered.filter(d => {
        if (!d.dataEnvioProtocolo) return false;
        const parts = d.dataEnvioProtocolo.split("/");
        return parseInt(parts[1]) === i + 1;
      });
      return { month: nomeMes[i + 1], previstos: mes.length, enviados: enviados.length };
    });
  }, [statusFiltered]);

  return (
    <>
      {/* Filtros + KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 200 }}><FarolSelect label="Ano — TEP" value={anoTep} options={anos.map(String)} onChange={setAnoTep} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Status do Protocolo" value={fStatusProt} options={["Todos", ...statusProts]} onChange={setFStatusProt} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
        <div style={{ flex: 1 }} />
        <KpiCard value={kpiAprovados.toLocaleString("pt-BR")} label="Aprovados" color={DS.greenDark} />
        <KpiCard value={kpiAtrasado.toLocaleString("pt-BR")} label="Atrasados" color={DS.statusRisk} />
        <KpiCard value={kpiAndamento.toLocaleString("pt-BR")} label="Em Andamento" color={DS.statusActive} />
        <KpiCard value={kpiNaoIniciado.toLocaleString("pt-BR")} label="Não Iniciados" color={DS.amber} />
      </div>

      {/* Donut + Curva previstos x enviados */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Percentual por Status do Protocolo">
          <DonutChart data={donutData} />
        </SectionCard>
        <SectionCard title="Protocolos Previstos x Enviados por Mês">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={curvaProtocolo} margin={{ left: 0, right: 0, top: 20, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fill: DS.textMuted, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} interval={0} dy={8} height={32} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="previstos" name="Previstos" fill={CHART_COLORS[5]} radius={[4, 4, 0, 0]} barSize={14}
                label={{ position: "top", fill: DS.textMuted, fontSize: 10, fontWeight: 600 }}
              />
              <Bar dataKey="enviados" name="Enviados" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} barSize={14}
                label={{ position: "top", fill: CHART_COLORS[0], fontSize: 10, fontWeight: 600 }}
              />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DS.textSecondary }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: CHART_COLORS[5] }} /> Previstos
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DS.textSecondary }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: CHART_COLORS[0] }} /> Enviados
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Tabela */}
      <SectionCard title="Projetos x Status">
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <FarolSelect label="Etapa do Projeto" value={fEtapa} options={["Todos", ...etapas]} onChange={setFEtapa} />
          <FarolSelect label="Patrocinador" value={fPatrocinador} options={["Todos", ...patrocinadores]} onChange={setFPatrocinador} />
          {(fEtapa !== "Todos" || fPatrocinador !== "Todos" || fStatusProt !== "Todos") && (
            <button onClick={() => { setFEtapa("Todos"); setFPatrocinador("Todos"); setFStatusProt("Todos"); }}
              style={{
                padding: "0 14px", height: 36, borderRadius: 9999, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 500, fontFamily: font,
                background: DS.redBg, color: DS.statusRisk, alignSelf: "flex-end",
              }}>
              Limpar
            </button>
          )}
        </div>
        <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]}
          columns={[
            { key: "codigo", label: "Codificação" },
            { key: "patrocinador", label: "Patrocinador" },
            { key: "projeto", label: "Projeto (Ativo)", maxW: 220 },
            { key: "etapa", label: "Etapa do Projeto", render: (v) => <EtapaBadge etapa={v} /> },
            { key: "statusProtocolo", label: "Status Protocolo", render: (v) => <StatusBadge status={v} /> },
            { key: "dataPrevProtocolo", label: "Data Prevista Envio" },
            { key: "dataEnvioProtocolo", label: "Data Envio Draft" },
            { key: "farolProtocolo", label: "Farol", render: (v) => <StatusBadge status={v} /> },
          ]}
          rows={filteredRows}
        />
      </SectionCard>
    </>
  );
};

const AnalisesPage = () => {
  const [fFarol, setFFarol] = useState("Todos");
  const [fPatrocinador, setFPatrocinador] = useState("Todos");
  const [fKeyAccount, setFKeyAccount] = useState("Todos");
  const [fAno, setFAno] = useState("Todos");
  const anos = useMemo(() => [...new Set(allData.map(d => d.tepAno).filter(Boolean))].sort(), []);
  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);
  const farois = useMemo(() => [...new Set(allData.map(d => d.farolAnalises).filter(Boolean))].sort(), []);
  const pats = useMemo(() => [...new Set(allData.map(d => d.patrocinador).filter(Boolean))].sort(), []);
  const filtered = useMemo(() => allData.filter(d =>
    (fFarol === "Todos" || d.farolAnalises === fFarol) &&
    (fPatrocinador === "Todos" || d.patrocinador === fPatrocinador) &&
    (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount) &&
    (fAno === "Todos" || d.tepAno === parseInt(fAno))
  ), [fFarol, fPatrocinador, fKeyAccount, fAno]);

  const kpiAtrasado = useMemo(() => filtered.filter(d => d.farolAnalises === "Atrasado").length, [filtered]);
  const kpiAndamento = useMemo(() => filtered.filter(d => d.farolAnalises === "Em andamento").length, [filtered]);
  const kpiNaoIniciado = useMemo(() => filtered.filter(d => d.farolAnalises === "Não iniciado").length, [filtered]);

  return (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 160 }}><FarolSelect label="Ano" value={fAno} options={["Todos", ...anos.map(String)]} onChange={setFAno} /></div>
        <div style={{ width: 160 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
        <div style={{ flex: 1 }} />
        <KpiCard value={kpiAtrasado.toLocaleString("pt-BR")} label="Em Atraso" color={DS.statusRisk} />
        <KpiCard value={kpiAndamento.toLocaleString("pt-BR")} label="Em Andamento" color={DS.statusActive} />
        <KpiCard value={kpiNaoIniciado.toLocaleString("pt-BR")} label="Não Iniciado" color={DS.amber} />
      </div>
      <SectionCard title="Quantidade Prevista — Início x Término das Análises">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={analiseInicio} margin={{ left: -10, right: 20, top: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={DS.cardBorder} />
            <XAxis dataKey="month" tick={{ fill: DS.textMuted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: DS.textMuted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="inicio" name="Início de Análise" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS[0] }} />
            <Line type="monotone" dataKey="termino" name="Término de Análise" stroke={CHART_COLORS[1]} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS[1] }} strokeDasharray="6 3" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DS.textSecondary }}>
            <div style={{ width: 18, height: 3, background: CHART_COLORS[0], borderRadius: 2 }} /> Previsão de Início
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DS.textSecondary }}>
            <div style={{ width: 18, height: 3, background: CHART_COLORS[1], borderRadius: 2, borderTop: "1px dashed" }} /> Previsão de Término
          </div>
        </div>
      </SectionCard>
      <div style={{ height: 16 }} />
      <SectionCard title="Projetos x Status — Análises">
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <FarolSelect label="Farol Análises" value={fFarol} options={["Todos", ...farois]} onChange={setFFarol} />
          <FarolSelect label="Patrocinador" value={fPatrocinador} options={["Todos", ...pats]} onChange={setFPatrocinador} />
          {(fFarol !== "Todos" || fPatrocinador !== "Todos") && (
            <button onClick={() => { setFFarol("Todos"); setFPatrocinador("Todos"); }}
              style={{ padding: "0 14px", height: 36, borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: font, background: DS.redBg, color: DS.statusRisk, alignSelf: "flex-end" }}>
              Limpar
            </button>
          )}
        </div>
        <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]}
          columns={[
            { key: "codigo", label: "Código" },
            { key: "patrocinador", label: "Patrocinador" },
            { key: "tipo", label: "Tipo" },
            { key: "ensaio", label: "Ensaio", maxW: 260 },
            { key: "etapa", label: "Etapa do Projeto", render: (v) => <EtapaBadge etapa={v} /> },
            { key: "farolAnalises", label: "Farol Análises", render: (v) => <StatusBadge status={v} /> },
          ]}
          rows={filtered}
        />
      </SectionCard>
    </>
  );
};

const DocTecnicaPage = () => {
  const [anoDT, setAnoDT] = useState("2025");
  const [fMonitoria, setFMonitoria] = useState("Todos");
  const [fPat, setFPat] = useState("Todos");
  const [fKeyAccount, setFKeyAccount] = useState("Todos");

  const anos = useMemo(() => [...new Set(allData.map(d => d.dataPrevTerminoDTAno).filter(Boolean))].sort(), []);
  const monitorias = useMemo(() => [...new Set(allData.map(d => d.monitoriaDT).filter(v => v && v !== "NA"))].sort(), []);
  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);
  const nomeMes = { 1:"Jan",2:"Fev",3:"Mar",4:"Abr",5:"Mai",6:"Jun",7:"Jul",8:"Ago",9:"Set",10:"Out",11:"Nov",12:"Dez" };

  // Universo: DT pendente no ano selecionado
  const pendentes = useMemo(() => {
    const statusAtivos = ["Atrasado", "Em andamento"];
    return allData.filter(d =>
      d.dataPrevTerminoDTAno === parseInt(anoDT) &&
      statusAtivos.includes(d.statusDT) &&
      (fMonitoria === "Todos" || d.monitoriaDT === fMonitoria) &&
      (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount)
    );
  }, [anoDT, fMonitoria, fKeyAccount]);

  // Universo expandido para gráfico (inclui Não iniciado)
  const prevBarras = useMemo(() => {
    const statusExpandido = ["Atrasado", "Em andamento", "Não iniciado"];
    const base = allData.filter(d =>
      d.dataPrevTerminoDTAno === parseInt(anoDT) && statusExpandido.includes(d.statusDT)
    );
    return Array.from({ length: 12 }, (_, i) => ({
      month: nomeMes[i + 1],
      value: base.filter(d => d.dataPrevTerminoDTMes === i + 1).length,
    }));
  }, [anoDT]);

  // KPIs
  const totalProjetos = useMemo(() => new Set(pendentes.map(d => d.codigoRve).filter(Boolean)).size, [pendentes]);
  const totalPendentes = pendentes.length;
  const emConferencia = useMemo(() => pendentes.filter(d => d.monitoriaDT === "2.Em conferência" || d.monitoriaDT === "4.Em conferência retorno de monitoria").length, [pendentes]);
  const monitLab = useMemo(() => pendentes.filter(d => d.monitoriaDT === "3.Monitoria Lab").length, [pendentes]);

  // Donut por tipo
  const porTipoData = useMemo(() => {
    const counts = {};
    pendentes.forEach(d => { if (d.tipo) counts[d.tipo] = (counts[d.tipo] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [pendentes]);

  return (
    <>
      {/* Filtros + KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 200 }}><FarolSelect label="Ano" value={anoDT} options={anos.map(String)} onChange={setAnoDT} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Monitoria DT" value={fMonitoria} options={["Todos", ...monitorias]} onChange={setFMonitoria} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
        <div style={{ flex: 1 }} />
        <KpiCard value={totalProjetos.toLocaleString("pt-BR")} label="Projetos Pendentes" color={DS.greenDark} />
        <KpiCard value={totalPendentes.toLocaleString("pt-BR")} label="Entreg. Pendentes" color={DS.blue} />
        <KpiCard value={emConferencia.toLocaleString("pt-BR")} label="Em Conferência" color={DS.statusActive} />
        <KpiCard value={monitLab.toLocaleString("pt-BR")} label="Monit. Lab" color={DS.amber} />
      </div>

      {/* Donut + Barras */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Percentual por Categoria dos Projetos">
          <DonutChart data={porTipoData} />
        </SectionCard>
        <SectionCard title="Entregáveis Previstos para Conferência">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prevBarras} margin={{ left: 0, right: 0, top: 20, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fill: DS.textMuted, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} interval={0} dy={8} height={32} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Entregáveis" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} barSize={24}
                label={{ position: "top", fill: DS.textSecondary, fontSize: 12, fontWeight: 600 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Tabela */}
      <SectionCard title="Projeto x Status">
        {(() => {
          const pats = [...new Set(pendentes.map(d=>d.patrocinador).filter(Boolean))].sort();
          const tblRows = pendentes.filter(d => fPat==="Todos"||d.patrocinador===fPat);
          return <>
            <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
              <FarolSelect label="Patrocinador" value={fPat} options={["Todos", ...pats]} onChange={setFPat} />
              {fPat!=="Todos" && <button onClick={()=>setFPat("Todos")} style={{padding:"0 14px",height:36,borderRadius:9999,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:font,background:DS.redBg,color:DS.statusRisk,alignSelf:"flex-end"}}>Limpar</button>}
            </div>
            <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]} columns={[
              { key: "codigoRve", label: "Código RVE" },
              { key: "patrocinador", label: "Patrocinador" },
              { key: "tipo", label: "Tipo" },
              { key: "codigo", label: "Codificação" },
              { key: "projeto", label: "Projeto (Ativo)", maxW: 180 },
              { key: "statusProjeto", label: "Status Projeto", render: (v) => <StatusBadge status={v} /> },
              { key: "etapa", label: "Etapa", render: (v) => <EtapaBadge etapa={v} /> },
              { key: "statusDT", label: "Status DT", render: (v) => <StatusBadge status={v} /> },
              { key: "monitoriaDT", label: "Monitoria DT" },
              { key: "dataInicioDT", label: "Início DT" },
              { key: "dataPrevTerminoDT", label: "Prev. Término DT" },
            ]} rows={tblRows} />
          </>;
        })()}
      </SectionCard>
    </>
  );
};

const GarantiaQualidadePage = () => {
  const [anoGQ, setAnoGQ] = useState("2025");
  const [fMonitoria, setFMonitoria] = useState("Todos");
  const [fPat, setFPat] = useState("Todos");
  const [fKeyAccount, setFKeyAccount] = useState("Todos");

  const anos = useMemo(() => [...new Set(allData.map(d => d.dataPrevTerminoGQAno).filter(Boolean))].sort(), []);
  const monitorias = useMemo(() => [...new Set(allData.map(d => d.monitoriaGQ).filter(v => v && v !== "NA"))].sort(), []);
  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);
  const nomeMes = { 1:"Jan",2:"Fev",3:"Mar",4:"Abr",5:"Mai",6:"Jun",7:"Jul",8:"Ago",9:"Set",10:"Out",11:"Nov",12:"Dez" };

  // Universo: GQ pendente (não finalizada, não NA)
  const pendentes = useMemo(() => {
    return allData.filter(d =>
      d.dataPrevTerminoGQAno === parseInt(anoGQ) &&
      d.monitoriaGQ && d.monitoriaGQ !== "NA" && d.monitoriaGQ !== "9.Finalizado" &&
      (fMonitoria === "Todos" || d.monitoriaGQ === fMonitoria) &&
      (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount)
    );
  }, [anoGQ, fMonitoria, fKeyAccount]);

  // Universo expandido para gráfico (inclui não iniciado)
  const prevBarras = useMemo(() => {
    const statusExpandido = ["Atrasado", "Em andamento", "Não iniciado"];
    const base = allData.filter(d =>
      d.dataPrevTerminoGQAno === parseInt(anoGQ) && statusExpandido.includes(d.statusGQ)
    );
    return Array.from({ length: 12 }, (_, i) => ({
      month: nomeMes[i + 1],
      value: base.filter(d => d.dataPrevTerminoGQMes === i + 1).length,
    }));
  }, [anoGQ]);

  // KPIs
  const totalProjetos = useMemo(() => new Set(pendentes.map(d => d.codigoRve).filter(Boolean)).size, [pendentes]);
  const totalPendentes = pendentes.length;
  const emFila = useMemo(() => pendentes.filter(d => d.monitoriaGQ === "1.Em fila").length, [pendentes]);
  const emConferencia = useMemo(() => pendentes.filter(d =>
    d.monitoriaGQ === "2.Em conferência" || d.monitoriaGQ === "8.Em conferência retorno de monitoria"
  ).length, [pendentes]);
  const monitDT = useMemo(() => pendentes.filter(d =>
    d.monitoriaGQ === "3.Monitoria DT/LAB" || d.monitoriaGQ === "4.Monitoria DT"
  ).length, [pendentes]);
  const monitLab = useMemo(() => pendentes.filter(d => d.monitoriaGQ === "5.Monitoria Lab").length, [pendentes]);

  // Donut por tipo
  const porTipoData = useMemo(() => {
    const counts = {};
    pendentes.forEach(d => { if (d.tipo) counts[d.tipo] = (counts[d.tipo] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [pendentes]);

  return (
    <>
      {/* Filtros + KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 200 }}><FarolSelect label="Ano" value={anoGQ} options={anos.map(String)} onChange={setAnoGQ} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Monitoria GQ" value={fMonitoria} options={["Todos", ...monitorias]} onChange={setFMonitoria} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
        <div style={{ flex: 1 }} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KpiCard value={totalProjetos.toLocaleString("pt-BR")} label="Projetos Pendentes" color={DS.greenDark} />
        <KpiCard value={totalPendentes.toLocaleString("pt-BR")} label="Entreg. Pendentes" color={DS.blue} />
        <KpiCard value={emFila.toLocaleString("pt-BR")} label="Em Fila" color={DS.amber} />
        <KpiCard value={emConferencia.toLocaleString("pt-BR")} label="Em Conferência" color={DS.statusActive} />
        <KpiCard value={monitDT.toLocaleString("pt-BR")} label="Monit. DT" color="#f97316" />
        <KpiCard value={monitLab.toLocaleString("pt-BR")} label="Monit. Lab" color={DS.statusRisk} />
      </div>

      {/* Donut + Barras */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Percentual por Categoria dos Projetos">
          <DonutChart data={porTipoData} />
        </SectionCard>
        <SectionCard title="Entregáveis Previstos para Conferência">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prevBarras} margin={{ left: 0, right: 0, top: 20, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fill: DS.textMuted, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} interval={0} dy={8} height={32} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Entregáveis" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} barSize={24}
                label={{ position: "top", fill: DS.textSecondary, fontSize: 12, fontWeight: 600 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Tabela */}
      <SectionCard title="Projeto x Status">
        {(() => {
          const pats = [...new Set(pendentes.map(d=>d.patrocinador).filter(Boolean))].sort();
          const tblRows = pendentes.filter(d => fPat==="Todos"||d.patrocinador===fPat);
          return <>
            <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
              <FarolSelect label="Patrocinador" value={fPat} options={["Todos", ...pats]} onChange={setFPat} />
              {fPat!=="Todos" && <button onClick={()=>setFPat("Todos")} style={{padding:"0 14px",height:36,borderRadius:9999,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:font,background:DS.redBg,color:DS.statusRisk,alignSelf:"flex-end"}}>Limpar</button>}
            </div>
            <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]} columns={[
              { key: "codigoRve", label: "Código RVE" },
              { key: "patrocinador", label: "Patrocinador" },
              { key: "tipo", label: "Tipo" },
              { key: "codigo", label: "Codificação" },
              { key: "projeto", label: "Projeto (Ativo)", maxW: 180 },
              { key: "statusProjeto", label: "Status Projeto", render: (v) => <StatusBadge status={v} /> },
              { key: "etapa", label: "Etapa", render: (v) => <EtapaBadge etapa={v} /> },
              { key: "monitoriaGQ", label: "Monitoria GQ" },
              { key: "dataInicioGQ", label: "Início GQ" },
              { key: "dataPrevTerminoGQ", label: "Prev. Término GQ" },
            ]} rows={tblRows} />
          </>;
        })()}
      </SectionCard>
    </>
  );
};

// ═══════════════════════════════════════════
//  NOVAS PÁGINAS
// ═══════════════════════════════════════════

// Badge colorido para monitorias
const MonitoriaBadge = ({ value }) => {
  if (!value || value === "NA" || value === "-") return <span style={{ color: DS.textMuted, fontSize: 12 }}>—</span>;
  const lc = value.toLowerCase();
  let bg = "rgba(0,0,0,0.04)", color = DS.textMuted;
  if (lc.includes("finalizado")) { bg = DS.greenBg2; color = DS.greenDark; }
  else if (lc.includes("monitoria lab") || lc.includes("monitoria dt") || lc.includes("monitoria farm") || lc.includes("monitoria terc")) { bg = DS.redBg; color = DS.statusRisk; }
  else if (lc.includes("retorno")) { bg = DS.amberBg; color = DS.amber; }
  else if (lc.includes("conferência") || lc.includes("conferencia")) { bg = DS.blueBg; color = DS.blue; }
  else if (lc.includes("fila")) { bg = "rgba(245,158,11,0.15)"; color = "#b45309"; }
  return <span style={{ padding: "3px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 500, background: bg, color, whiteSpace: "nowrap" }}>{value}</span>;
};

const MonitoriaCheckbox = ({ label, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: DS.text, fontFamily: font }}>
    <input type="checkbox" checked={checked} onChange={onChange}
      style={{ width: 16, height: 16, accentColor: DS.greenDark, cursor: "pointer" }} />
    {label}
  </label>
);

const SinebPage = () => {
  const [anoSineb, setAnoSineb] = useState("2025");
  const [fPat, setFPat] = useState("Todos");
  const [fKeyAccount, setFKeyAccount] = useState("Todos");

  const anos = useMemo(() => [...new Set(allData.map(d => d.dataEnvioPatAno).filter(Boolean))].sort(), []);
  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);
  const nomeMes = { 1:"Jan",2:"Fev",3:"Mar",4:"Abr",5:"Mai",6:"Jun",7:"Jul",8:"Ago",9:"Set",10:"Out",11:"Nov",12:"Dez" };

  // Universo: envio ao patrocinador no ano, SINEB não fechado, projeto ativo
  const pendentes = useMemo(() => {
    return allData.filter(d =>
      d.dataEnvioPatAno === parseInt(anoSineb) &&
      !d.dataSineb &&
      !["Concluído", "Cancelado", "Stand by"].includes(d.statusProjeto) &&
      (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount)
    );
  }, [anoSineb, fKeyAccount]);

  // KPIs
  const totalProjetos = useMemo(() => new Set(pendentes.map(d => d.codigoRve).filter(Boolean)).size, [pendentes]);
  const totalPendentes = pendentes.length;

  // Donut: por tipo, apenas ETAPA = SINEB, count distinct RVE
  const donutData = useMemo(() => {
    const sinebEtapa = pendentes.filter(d => d.etapa === "SINEB");
    const byTipo = {};
    sinebEtapa.forEach(d => {
      if (!d.tipo) return;
      if (!byTipo[d.tipo]) byTipo[d.tipo] = new Set();
      byTipo[d.tipo].add(d.codigoRve);
    });
    return Object.entries(byTipo)
      .map(([name, rves]) => ({ name, value: rves.size }))
      .sort((a, b) => b.value - a.value)
      .map((d, i) => ({ ...d, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [pendentes]);

  // Barras: por mês da aprovação do patrocinador
  const barData = useMemo(() => {
    const counts = {};
    pendentes.forEach(d => {
      if (!d.dataAprovacaoPatrocinador) return;
      const parts = d.dataAprovacaoPatrocinador.split("/");
      if (parts.length < 3) return;
      const m = parseInt(parts[1]);
      const key = nomeMes[m];
      counts[key] = (counts[key] || 0) + 1;
    });
    const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    return months.map(m => ({ month: m, value: counts[m] || 0 })).filter(d => d.value > 0);
  }, [pendentes]);

  return (
    <>
      {/* Filtro + KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 200 }}><FarolSelect label="Ano — Envio ao Patrocinador" value={anoSineb} options={anos.map(String)} onChange={setAnoSineb} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
        <div style={{ flex: 1 }} />
        <KpiCard value={totalProjetos.toLocaleString("pt-BR")} label="Projetos Pendentes" color={DS.greenDark} />
        <KpiCard value={totalPendentes.toLocaleString("pt-BR")} label="Entreg. Pendentes" color={DS.blue} />
      </div>

      {/* Donut + Barras */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Percentual por Categoria (Etapa SINEB)">
          <DonutChart data={donutData} />
        </SectionCard>
        <SectionCard title="Entregáveis por Mês de Aprovação do Patrocinador">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ left: 0, right: 0, top: 20, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fill: DS.textMuted, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} interval={0} dy={8} height={32} />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="Entregáveis" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} barSize={28}
                  label={{ position: "top", fill: DS.textSecondary, fontSize: 12, fontWeight: 600 }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: DS.textMuted, fontSize: 14 }}>
              Sem dados de aprovação para o ano selecionado
            </div>
          )}
        </SectionCard>
      </div>

      {/* Tabela */}
      <SectionCard title="Projeto x Status — SINEB">
        {(() => {
          const pats = [...new Set(pendentes.map(d=>d.patrocinador).filter(Boolean))].sort();
          const etapas = [...new Set(pendentes.map(d=>d.etapa).filter(Boolean))].sort();
          const tblRows = pendentes.filter(d => fPat==="Todos"||d.patrocinador===fPat);
          return <>
            <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
              <FarolSelect label="Patrocinador" value={fPat} options={["Todos", ...pats]} onChange={setFPat} />
              {fPat!=="Todos" && <button onClick={()=>setFPat("Todos")} style={{padding:"0 14px",height:36,borderRadius:9999,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:font,background:DS.redBg,color:DS.statusRisk,alignSelf:"flex-end"}}>Limpar</button>}
            </div>
            <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]} columns={[
              { key: "codigoRve", label: "Código RVE" },
              { key: "patrocinador", label: "Patrocinador" },
              { key: "codigo", label: "Codificação" },
              { key: "projeto", label: "Projeto (Ativo)", maxW: 200 },
              { key: "statusProjeto", label: "Status Projeto", render: (v) => <StatusBadge status={v} /> },
              { key: "etapa", label: "Etapa", render: (v) => <EtapaBadge etapa={v} /> },
              { key: "dataAprovacaoPatrocinador", label: "Data Aprovação Patrocinador" },
            ]} rows={tblRows} />
          </>;
        })()}
      </SectionCard>
    </>
  );
};

const CollapsibleFilter = ({ title, count, options, selected, onToggle, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const selectedCount = selected.length;
  return (
    <div style={{ background: DS.card, borderRadius: 12, border: `1px solid ${DS.cardBorder}`, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: DS.text }}>{title}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999,
            background: selectedCount > 0 ? DS.greenBg100 : DS.bg, color: selectedCount > 0 ? DS.green : DS.textMuted,
          }}>{selectedCount}/{options.length}</span>
          <span style={{ fontSize: 12, color: DS.textMuted }}>({count})</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          {options.map(o => (
            <MonitoriaCheckbox key={o} label={o} checked={selected.includes(o)} onChange={() => onToggle(o)} />
          ))}
        </div>
      )}
    </div>
  );
};

const MonitoriasPage = () => {
  const [fPat, setFPat] = useState("Todos");
  const [fKeyAccount, setFKeyAccount] = useState("Todos");
  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);
  const [dtFilters, setDtFilters] = useState(["1.Em fila", "2.Em conferência", "3.Monitoria Lab", "4.Em conferência retorno de monitoria"]);
  const [gqFilters, setGqFilters] = useState(["3.Monitoria DT/LAB", "4.Monitoria DT", "5.Monitoria Lab"]);
  const [patFilters, setPatFilters] = useState(["2. Monitoria DT", "3.Monitoria Lab"]);

  const dtOpts = ["1.Em fila", "2.Em conferência", "3.Monitoria Lab", "4.Em conferência retorno de monitoria"];
  const gqOpts = ["3.Monitoria DT/LAB", "4.Monitoria DT", "5.Monitoria Lab", "6.Monitoria Farmácia", "7.Monitoria Terceiro"];
  const patOpts = ["1. Em conferência (Patrocinador)", "2. Monitoria DT", "3.Monitoria Lab", "4.Monitoria Terceiro"];

  const toggle = (arr, setArr, val) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const filtered = useMemo(() => {
    return allData.filter(d =>
      ((dtFilters.length > 0 && dtFilters.includes(d.monitoriaDT)) ||
      (gqFilters.length > 0 && gqFilters.includes(d.monitoriaGQ)) ||
      (patFilters.length > 0 && patFilters.includes(d.monitoriaPatrocinador))) &&
      (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount)
    );
  }, [dtFilters, gqFilters, patFilters, fKeyAccount]);

  const countDT = useMemo(() => allData.filter(d => dtFilters.includes(d.monitoriaDT)).length, [dtFilters]);
  const countGQ = useMemo(() => allData.filter(d => gqFilters.includes(d.monitoriaGQ)).length, [gqFilters]);
  const countPat = useMemo(() => allData.filter(d => patFilters.includes(d.monitoriaPatrocinador)).length, [patFilters]);

  return (
    <>
      {/* Filtro de Key Account */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 200 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
      </div>
      {/* Filtros colapsáveis */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20,
      }}>
        <CollapsibleFilter title="Monitoria DT" count={countDT} options={dtOpts} selected={dtFilters} onToggle={(v) => toggle(dtFilters, setDtFilters, v)} />
        <CollapsibleFilter title="Monitoria GQ" count={countGQ} options={gqOpts} selected={gqFilters} onToggle={(v) => toggle(gqFilters, setGqFilters, v)} />
        <CollapsibleFilter title="Monitoria Patrocinador" count={countPat} options={patOpts} selected={patFilters} onToggle={(v) => toggle(patFilters, setPatFilters, v)} />
      </div>

      {/* KPI */}
      <div style={{ marginBottom: 20 }}>
        <KpiCard value={filtered.length.toLocaleString("pt-BR")} label="Total de Entregáveis em Monitoria" color={DS.statusRisk} />
      </div>

      {/* Tabela */}
      <SectionCard title="Projeto x Status — Monitorias">
        {(() => {
          const pats = [...new Set(filtered.map(d=>d.patrocinador).filter(Boolean))].sort();
          const tblRows = filtered.filter(d => fPat==="Todos"||d.patrocinador===fPat);
          return <>
            <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
              <FarolSelect label="Patrocinador" value={fPat} options={["Todos", ...pats]} onChange={setFPat} />
              {fPat!=="Todos" && <button onClick={()=>setFPat("Todos")} style={{padding:"0 14px",height:36,borderRadius:9999,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:font,background:DS.redBg,color:DS.statusRisk,alignSelf:"flex-end"}}>Limpar</button>}
            </div>
            <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]} columns={[
              { key: "codigoRve", label: "Código RVE" },
              { key: "patrocinador", label: "Patrocinador" },
              { key: "codigo", label: "Codificação" },
              { key: "projeto", label: "Projeto (Ativo)", maxW: 160 },
              { key: "statusProjeto", label: "Status Projeto", render: (v) => <StatusBadge status={v} /> },
              { key: "etapa", label: "Etapa", render: (v) => <EtapaBadge etapa={v} /> },
              { key: "monitoriaDT", label: "Monit. DT", render: (v) => <MonitoriaBadge value={v} /> },
              { key: "monitoriaGQ", label: "Monit. GQ", render: (v) => <MonitoriaBadge value={v} /> },
              { key: "monitoriaPatrocinador", label: "Monit. Patrocinador", render: (v) => <MonitoriaBadge value={v} /> },
            ]} rows={tblRows} />
          </>;
        })()}
      </SectionCard>
    </>
  );
};

const PlaceholderPage = ({ title, description }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", color: DS.textMuted }}>
    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🚧</div>
    <div style={{ fontSize: 18, fontWeight: 600, color: DS.text, marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 14 }}>{description}</div>
    <div style={{ fontSize: 13, marginTop: 16, color: DS.textMuted }}>Em desenvolvimento</div>
  </div>
);

// Calcula farol de prontidão a partir dos status de MT, MR, Insumos e Protocolo
function calcFarolProntidao(d) {
  const stats = [d.statusMT, d.statusMR, d.statusInsumos, d.statusProtocolo].filter(Boolean);
  if (stats.some(s => s.includes("Atrasado"))) return "Atrasado";
  if (stats.some(s => s.includes("Fora do Prazo"))) return "Concluído Fora do Prazo";
  if (stats.some(s => s === "Em andamento" || s === "Não iniciado")) return "Em andamento";
  return "Concluído Dentro do Prazo";
}

const LaboratorioPage = () => {
  const labEtapas = ["Em Análise", "Aguardando Início Análises"];
  const [fEtapa, setFEtapa] = useState("Todos");
  const [fPat, setFPat] = useState("Todos");
  const [fTipo, setFTipo] = useState("Todos");
  const [fKeyAccount, setFKeyAccount] = useState("Todos");
  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);

  const nomeMes = { 1:"Jan",2:"Fev",3:"Mar",4:"Abr",5:"Mai",6:"Jun",7:"Jul",8:"Ago",9:"Set",10:"Out",11:"Nov",12:"Dez" };

  // Universo: entregáveis no pipeline do lab
  const universo = useMemo(() => {
    const base = allData.filter(d =>
      labEtapas.includes(d.etapa) &&
      (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount)
    );
    return fEtapa === "Todos" ? base : base.filter(d => d.etapa === fEtapa);
  }, [fEtapa, fKeyAccount]);

  // KPIs
  const totalProjetos = useMemo(() => new Set(universo.map(d => d.codigoRve).filter(Boolean)).size, [universo]);
  const totalEntregaveis = universo.length;
  const emAnalise = useMemo(() => allData.filter(d => d.etapa === "Em Análise").length, []);
  const aguardando = useMemo(() => allData.filter(d => d.etapa === "Aguardando Início Análises").length, []);

  // Donut por tipo
  const porTipoData = useMemo(() => {
    const counts = {};
    universo.forEach(d => { if (d.tipo) counts[d.tipo] = (counts[d.tipo] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [universo]);

  // Barras: entregáveis previstos por mês (previsto início)
  const prevPorMes = useMemo(() => {
    const counts = {};
    universo.forEach(d => {
      if (!d.previstoInicioData) return;
      const parts = d.previstoInicioData.split("/");
      if (parts.length < 3) return;
      const key = nomeMes[parseInt(parts[1])] + "/" + parts[2].slice(2);
      counts[key] = (counts[key] || 0) + 1;
    });
    const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    return Object.entries(counts)
      .sort((a, b) => {
        const [mA, yA] = a[0].split("/"); const [mB, yB] = b[0].split("/");
        return (parseInt(yA)*12 + months.indexOf(mA)) - (parseInt(yB)*12 + months.indexOf(mB));
      })
      .map(([month, value]) => ({ month, value }));
  }, [universo]);

  return (
    <>
      {/* Filtro + KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 200 }}>
          <FarolSelect label="Etapa do Projeto" value={fEtapa}
            options={["Todos", ...labEtapas]} onChange={setFEtapa} />
        </div>
        <div style={{ width: 200 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
        <div style={{ flex: 1 }} />
        <KpiCard value={totalProjetos.toLocaleString("pt-BR")} label="Projetos Pendentes" />
        <KpiCard value={totalEntregaveis.toLocaleString("pt-BR")} label="Entreg. Pendentes" />
        <KpiCard value={emAnalise.toLocaleString("pt-BR")} label="Em Análise" />
        <KpiCard value={aguardando.toLocaleString("pt-BR")} label="Aguard. Início" />
      </div>

      {/* Donut + Barras */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Percentual por Categoria dos Projetos">
          <DonutChart data={porTipoData} />
        </SectionCard>
        <SectionCard title="Entregáveis Previstos para Execução">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prevPorMes} margin={{ left: 0, right: 0, top: 20, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fill: DS.textMuted, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} interval={0} dy={8} height={32} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Entregáveis" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} barSize={28}
                label={{ position: "top", fill: DS.textSecondary, fontSize: 12, fontWeight: 600 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Tabela */}
      <SectionCard title="Projeto x Status">
        {(() => {
          const pats = [...new Set(universo.map(d=>d.patrocinador).filter(Boolean))].sort();
          const tipos = [...new Set(universo.map(d=>d.tipo).filter(Boolean))].sort();
          const tblRows = universo.filter(d => (fPat==="Todos"||d.patrocinador===fPat) && (fTipo==="Todos"||d.tipo===fTipo));
          return <>
            <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
              <FarolSelect label="Patrocinador" value={fPat} options={["Todos", ...pats]} onChange={setFPat} />
              <FarolSelect label="Tipo" value={fTipo} options={["Todos", ...tipos]} onChange={setFTipo} />
              {(fPat!=="Todos"||fTipo!=="Todos") && <button onClick={()=>{setFPat("Todos");setFTipo("Todos");}} style={{padding:"0 14px",height:36,borderRadius:9999,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:font,background:DS.redBg,color:DS.statusRisk,alignSelf:"flex-end"}}>Limpar</button>}
            </div>
            <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]} columns={[
              { key: "codigoRve", label: "Código RVE" },
              { key: "patrocinador", label: "Patrocinador" },
              { key: "codigo", label: "Codificação" },
              { key: "tipo", label: "Tipo" },
              { key: "projeto", label: "Projeto (Ativo)", maxW: 180 },
              { key: "statusProjeto", label: "Status Projeto", render: (v) => <StatusBadge status={v} /> },
              { key: "etapa", label: "Etapa", render: (v) => <EtapaBadge etapa={v} /> },
              { key: "variaveisRisco", label: "Variáveis de Risco", maxW: 160 },
              { key: "farolAnalises", label: "Farol", render: (v) => <StatusBadge status={v} /> },
              { key: "previstoInicioData", label: "Prev. Início" },
              { key: "dataRealInicio", label: "Início Real" },
              { key: "dataPrevEnvioResultados", label: "Prev. Envio Result." },
            ]} rows={tblRows} />
          </>;
        })()}
      </SectionCard>
    </>
  );
};

const ProximasEntradasPage = () => {
  const [ano, setAno] = useState("2026");
  const [fEtapa, setFEtapa] = useState("Todos");
  const [fPat, setFPat] = useState("Todos");
  const [fStatusMT, setFStatusMT] = useState("Todos");

  const anos = useMemo(() => [...new Set(allData.map(d => d.previstoInicioAno).filter(Boolean))].sort(), []);
  const nomeMes = { 1:"Jan",2:"Fev",3:"Mar",4:"Abr",5:"Mai",6:"Jun",7:"Jul",8:"Ago",9:"Set",10:"Out",11:"Nov",12:"Dez" };

  // Universo: ano selecionado + farol análises não iniciado/atrasado
  const universo = useMemo(() => {
    return allData.filter(d =>
      d.previstoInicioAno === parseInt(ano) &&
      (d.farolAnalises === "Não iniciado" || d.farolAnalises === "Atrasado") &&
      (fEtapa === "Todos" || d.etapa === fEtapa)
    );
  }, [ano, fEtapa]);

  const etapas = useMemo(() => {
    const base = allData.filter(d =>
      d.previstoInicioAno === parseInt(ano) &&
      (d.farolAnalises === "Não iniciado" || d.farolAnalises === "Atrasado")
    );
    return [...new Set(base.map(d => d.etapa).filter(Boolean))].sort();
  }, [ano]);

  // KPIs
  const totalProjetos = useMemo(() => new Set(universo.map(d => d.codigoRve).filter(Boolean)).size, [universo]);
  const totalEntregaveis = universo.length;

  // Donut: por tipo
  const porTipoData = useMemo(() => {
    const counts = {};
    universo.forEach(d => { if (d.tipo) counts[d.tipo] = (counts[d.tipo] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [universo]);

  // Barras: projetos únicos por mês
  const projetosPorMes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const mes = universo.filter(d => d.previstoInicioMes === i + 1);
      const projetos = new Set(mes.map(d => d.codigoRve).filter(Boolean)).size;
      return { month: nomeMes[i + 1], value: projetos };
    });
  }, [universo]);

  // Tabela com farol calculado
  const tableRows = useMemo(() => {
    return universo.map(d => ({ ...d, farolProntidao: calcFarolProntidao(d) }));
  }, [universo]);

  return (
    <>
      {/* Filtros + KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 200 }}><FarolSelect label="Ano" value={ano} options={anos.map(String)} onChange={setAno} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Etapa do Projeto" value={fEtapa} options={["Todos", ...etapas]} onChange={setFEtapa} /></div>
        {fEtapa !== "Todos" && (
          <button onClick={() => setFEtapa("Todos")}
            style={{ padding: "0 14px", height: 36, borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: font, background: DS.redBg, color: DS.statusRisk, alignSelf: "flex-end" }}>
            Limpar etapa
          </button>
        )}
        <div style={{ flex: 1 }} />
        <KpiCard value={totalProjetos.toLocaleString("pt-BR")} label="Total de Projetos" color={DS.greenDark} />
        <KpiCard value={totalEntregaveis.toLocaleString("pt-BR")} label="Total de Entregáveis" color={DS.blue} />
      </div>

      {/* Donut + Barras */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Percentual por Categoria dos Projetos">
          <DonutChart data={porTipoData} />
        </SectionCard>
        <SectionCard title="Próximos Projetos Previstos para Início">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projetosPorMes} margin={{ left: 0, right: 0, top: 20, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fill: DS.textMuted, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} interval={0} dy={8} height={32} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Projetos" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} barSize={24}
                label={{ position: "top", fill: DS.textSecondary, fontSize: 12, fontWeight: 600 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Tabela */}
      <SectionCard title="Projetos x Status">
        {(() => {
          const pats = [...new Set(tableRows.map(d=>d.patrocinador).filter(Boolean))].sort();
          const mtStats = [...new Set(tableRows.map(d=>d.statusMT).filter(Boolean))].sort();
          const tblRows = tableRows.filter(d => (fPat==="Todos"||d.patrocinador===fPat) && (fStatusMT==="Todos"||d.statusMT===fStatusMT));
          const anyF = fPat!=="Todos"||fStatusMT!=="Todos";
          return <>
            <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
              <FarolSelect label="Patrocinador" value={fPat} options={["Todos", ...pats]} onChange={setFPat} />
              <FarolSelect label="Status MT" value={fStatusMT} options={["Todos", ...mtStats]} onChange={setFStatusMT} />
              {anyF && <button onClick={()=>{setFPat("Todos");setFStatusMT("Todos");}} style={{padding:"0 14px",height:36,borderRadius:9999,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:font,background:DS.redBg,color:DS.statusRisk,alignSelf:"flex-end"}}>Limpar</button>}
            </div>
            <DataTable searchKeys={["codigo","codigoRve","projeto"]} columns={[
              { key: "codigoRve", label: "Código RVE" },
              { key: "patrocinador", label: "Patrocinador" },
              { key: "codigo", label: "Codificação" },
              { key: "projeto", label: "Projeto (Ativo)", maxW: 180 },
              { key: "statusProjeto", label: "Status Projeto", render: (v) => <StatusBadge status={v} /> },
              { key: "etapa", label: "Etapa", render: (v) => <EtapaBadge etapa={v} /> },
              { key: "previstoInicioData", label: "Previsto Início" },
              { key: "statusMT", label: "Status MT", render: (v) => <StatusBadge status={v} /> },
              { key: "statusMR", label: "Status MR", render: (v) => <StatusBadge status={v} /> },
              { key: "statusProtocolo", label: "Status Protocolo", render: (v) => <StatusBadge status={v} /> },
              { key: "statusInsumos", label: "Status Insumos", render: (v) => <StatusBadge status={v} /> },
            ]} rows={tblRows} />
          </>;
        })()}
      </SectionCard>
    </>
  );
};

const FarolPage = () => {
  const [anoTep, setAnoTep] = useState("2025");
  const [mesTep, setMesTep] = useState("Todos");
  const [fKeyAccount, setFKeyAccount] = useState("Todos");
  const [fPatrocinador, setFPatrocinador] = useState("Todos");

  const anos = useMemo(() => [...new Set(allData.map(d => d.tepAno).filter(Boolean))].sort(), []);
  const meses = ["Todos","1","2","3","4","5","6","7","8","9","10","11","12"];
  const nomeMes = { "1":"Jan","2":"Fev","3":"Mar","4":"Abr","5":"Mai","6":"Jun","7":"Jul","8":"Ago","9":"Set","10":"Out","11":"Nov","12":"Dez" };
  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);
  const patrocinadores = useMemo(() => [...new Set(allData.map(d => d.patrocinador).filter(Boolean))].sort(), []);

  const filtered = useMemo(() => {
    return allData.filter(d =>
      d.tepAno === parseInt(anoTep) &&
      (mesTep === "Todos" || d.tepMes === parseInt(mesTep)) &&
      (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount) &&
      (fPatrocinador === "Todos" || d.patrocinador === fPatrocinador)
    );
  }, [anoTep, mesTep, fKeyAccount, fPatrocinador]);

  // KPIs
  const kpiProtAprovados = useMemo(() => filtered.filter(d =>
    d.statusProtocolo === "Aprovado" && (d.farolAnalises === "Não iniciado" || !d.farolAnalises)
  ).length, [filtered]);
  const kpiAnalises = useMemo(() => filtered.filter(d => d.farolAnalises && d.farolAnalises.includes("Concluído")).length, [filtered]);
  const kpiDT = useMemo(() => filtered.filter(d => d.statusDT && d.statusDT.includes("Concluído")).length, [filtered]);
  const kpiGQ = useMemo(() => filtered.filter(d => d.statusGQ === "Concluído" || d.statusGQ === "Concluído Dentro do Prazo").length, [filtered]);
  const kpiSineb = useMemo(() => filtered.filter(d => d.dataSineb).length, [filtered]);

  // Gráfico: Total Entregáveis x Categoria (só concluídos, exclui Estabilidade/Plotagem)
  const porCategoria = useMemo(() => {
    const concluidos = filtered.filter(d => d.etapa === "Projeto Concluído");
    const counts = {};
    concluidos.forEach(d => { if (d.tipo && d.tipo !== "Estabilidade" && d.tipo !== "Plotagem") counts[d.tipo] = (counts[d.tipo] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Gráfico: Finalizados x Mês
  const finalizadosMes = useMemo(() => {
    const concluidos = filtered.filter(d => d.etapa === "Projeto Concluído");
    const counts = {};
    concluidos.forEach(d => { if (d.tepMes) counts[d.tepMes] = (counts[d.tepMes] || 0) + 1; });
    return Array.from({ length: 12 }, (_, i) => ({
      month: nomeMes[String(i + 1)],
      value: counts[i + 1] || 0,
    }));
  }, [filtered]);

  // Curva S: Previsto x Dentro do Prazo x Fora do Prazo
  const curvaS = useMemo(() => {
    const concluidos = filtered.filter(d => d.etapa === "Projeto Concluído");
    return Array.from({ length: 12 }, (_, i) => {
      const mes = concluidos.filter(d => d.tepMes === i + 1);
      return {
        month: nomeMes[String(i + 1)],
        previsto: mes.length,
        dentro: mes.filter(d => d.statusPrazoFinal === "Dentro do Prazo").length,
        fora: mes.filter(d => d.statusPrazoFinal === "Fora do prazo").length,
      };
    });
  }, [filtered]);

  return (
    <>
      {/* Filtros */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 200 }}><FarolSelect label="Ano — TEP" value={anoTep} options={anos.map(String)} onChange={setAnoTep} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Mês — TEP" value={mesTep} options={["Todos","1","2","3","4","5","6","7","8","9","10","11","12"]} displayFn={(v) => v === "Todos" ? "Todos os meses" : nomeMes[v]} onChange={setMesTep} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Patrocinador" value={fPatrocinador} options={["Todos", ...patrocinadores]} onChange={setFPatrocinador} /></div>
        {(mesTep !== "Todos" || fKeyAccount !== "Todos" || fPatrocinador !== "Todos") && (
          <button onClick={() => { setMesTep("Todos"); setFKeyAccount("Todos"); setFPatrocinador("Todos"); }}
            style={{ padding: "0 14px", height: 36, borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: font, background: DS.redBg, color: DS.statusRisk, alignSelf: "flex-end" }}>
            Limpar</button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KpiCard value={kpiProtAprovados.toLocaleString("pt-BR")} label="Protocolos Aprovados" color={DS.greenDark} />
        <KpiCard value={kpiAnalises.toLocaleString("pt-BR")} label="Total Análises" color={DS.blue} />
        <KpiCard value={kpiDT.toLocaleString("pt-BR")} label="Total DT" color={DS.green} />
        <KpiCard value={kpiGQ.toLocaleString("pt-BR")} label="Total GQ" color={DS.amber} />
        <KpiCard value={kpiSineb.toLocaleString("pt-BR")} label="Total SINEB" color={DS.statusActive} />
      </div>

      {/* Categoria + Finalizados por mês */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Total de Entregáveis x Categoria">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porCategoria} layout="vertical" margin={{ left: 20, right: 50, top: 5, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: DS.textSecondary, fontSize: 13, textAnchor: "start", dx: -95 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Entregáveis" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} barSize={20}
                label={{ position: "right", fill: DS.textSecondary, fontSize: 13, fontWeight: 600, formatter: (v) => v.toLocaleString("pt-BR") }}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Total de Entregáveis Finalizados x Mês">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={finalizadosMes} margin={{ left: 0, right: 0, top: 20, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fill: DS.textMuted, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} interval={0} dy={8} height={32} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Finalizados" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} barSize={24}
                label={{ position: "top", fill: DS.textSecondary, fontSize: 11, fontWeight: 600 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Curva S */}
      <SectionCard title="Previsto x Dentro do Prazo x Fora do Prazo">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={curvaS} margin={{ left: -10, right: 20, top: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={DS.cardBorder} />
            <XAxis dataKey="month" tick={{ fill: DS.textMuted, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: DS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="previsto" name="Previsto" stroke={DS.gray} strokeWidth={2} dot={{ r: 4, fill: DS.gray }}
              label={{ fill: DS.textMuted, fontSize: 10, position: "top", dy: -10 }} />
            <Line type="monotone" dataKey="dentro" name="Dentro do Prazo" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS[0] }}
              label={{ fill: CHART_COLORS[0], fontSize: 10, position: "top", dy: -10 }} />
            <Line type="monotone" dataKey="fora" name="Fora do Prazo" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: "#ef4444" }}
              label={{ fill: "#ef4444", fontSize: 10, position: "bottom", dy: 10 }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DS.textSecondary }}>
            <div style={{ width: 18, height: 3, background: DS.gray, borderRadius: 2 }} /> Previsto
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DS.textSecondary }}>
            <div style={{ width: 18, height: 3, background: CHART_COLORS[0], borderRadius: 2 }} /> Dentro do Prazo
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DS.textSecondary }}>
            <div style={{ width: 18, height: 3, background: "#ef4444", borderRadius: 2 }} /> Fora do Prazo
          </div>
        </div>
      </SectionCard>
    </>
  );
};

const OverviewPage = () => {
  // KPIs dinâmicos calculados dos dados reais
  const totalEntregaveis = allData.length;
  const emAndamento = useMemo(() => allData.filter(d => d.statusProjeto === "Em andamento").length, []);
  const concluidos = useMemo(() => allData.filter(d => d.statusProjeto && d.statusProjeto.includes("Concluído")).length, []);
  const atrasados = useMemo(() => allData.filter(d => d.farolProtocolo === "Atrasado" || d.farolAnalises === "Atrasado").length, []);
  const naoIniciados = useMemo(() => allData.filter(d => d.statusProjeto === "Não iniciado").length, []);
  const totalPatrocinadores = useMemo(() => new Set(allData.map(d => d.patrocinador).filter(Boolean)).size, []);

  // Financeiro dinâmico
  const totalContrato = useMemo(() => allFinanceiro.reduce((s, d) => s + (d.totalContrato || 0), 0), []);
  const totalFaturado = useMemo(() => allFinanceiro.filter(d => d.tipo === "Faturado").reduce((s, d) => s + (d.valorParcela || 0), 0), []);
  const pctFaturado = totalContrato > 0 ? ((totalFaturado / totalContrato) * 100).toFixed(1) : "0,0";

  const fmtMoeda = (v) => "R$ " + (v / 1e6).toFixed(1).replace(".", ",") + "M";

  return (
    <>
      {/* Painel — Visão Geral dos Entregáveis */}
      <div style={{
        background: DS.card, borderRadius: 16, border: `1px solid ${DS.cardBorder}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: DS.greenDark + "14",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.greenDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: DS.text }}>Visão Geral dos Entregáveis</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <OverviewKpi value={totalEntregaveis.toLocaleString("pt-BR")} label="Total de Entregáveis" color={DS.greenDark} />
          <OverviewKpi value={emAndamento.toLocaleString("pt-BR")} label="Em Andamento" color={DS.greenDark} />
          <OverviewKpi value={concluidos.toLocaleString("pt-BR")} label="Concluídos" color={DS.greenDark} />
          <OverviewKpi value={atrasados.toLocaleString("pt-BR")} label="Atrasados" color={DS.greenDark} />
          <OverviewKpi value={naoIniciados.toLocaleString("pt-BR")} label="Não Iniciados" color={DS.greenDark} />
          <OverviewKpi value={totalPatrocinadores.toLocaleString("pt-BR")} label="Patrocinadores" color={DS.greenDark} />
        </div>
      </div>

      {/* Painel — Resumo Financeiro */}
      <div style={{
        background: DS.card, borderRadius: 16, border: `1px solid ${DS.cardBorder}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "#d9770614",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: DS.text }}>Resumo Financeiro</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <OverviewKpi value={fmtMoeda(totalContrato)} label="Total Contratado" color="#d97706" />
          <OverviewKpi value={fmtMoeda(totalFaturado)} label="Total Faturado" color="#d97706" />
          <OverviewKpi value={pctFaturado.replace(".", ",") + "%"} label="% Faturado" color="#d97706" />
        </div>
      </div>

      {/* Status do Projeto + Por Tipo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Status Geral dos Projetos">
          <DonutChart data={projetoStatus} />
        </SectionCard>
        <SectionCard title="Distribuição por Tipo de Ensaio">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={porTipo} layout="vertical" margin={{ left: 10, right: 50, top: 5, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: DS.textSecondary, fontSize: 12, textAnchor: "start", dx: -80 }} axisLine={false} tickLine={false} width={85} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Projetos" radius={[0, 4, 4, 0]} barSize={20}
                label={{ position: "right", fill: DS.textSecondary, fontSize: 12, fontWeight: 600, formatter: (v) => v.toLocaleString("pt-BR") }}
              >
                {porTipo.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Key Account + Top Patrocinadores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Projetos por Key Account">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={porKeyAccount} layout="vertical" margin={{ left: 20, right: 50, top: 5, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: DS.textSecondary, fontSize: 13, textAnchor: "start", dx: -95 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Projetos" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} barSize={20}
                label={{ position: "right", fill: DS.textSecondary, fontSize: 13, fontWeight: 600, formatter: (v) => v.toLocaleString("pt-BR") }}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Top 10 Patrocinadores">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={topPatrocinadores} margin={{ left: 5, right: 5, top: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={DS.cardBorder} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: DS.textSecondary, fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" height={60} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Entregáveis" radius={[4, 4, 0, 0]} barSize={28}
                label={{ position: "top", fill: DS.textSecondary, fontSize: 11, fontWeight: 600, formatter: (v) => v.toLocaleString("pt-BR") }}
              >
                {topPatrocinadores.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Etapa do Projeto */}
      <SectionCard title="Distribuição por Etapa do Projeto">
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={porEtapa} layout="vertical" margin={{ left: 10, right: 50, top: 5, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fill: DS.textSecondary, fontSize: 12, textAnchor: "start", dx: -145 }} axisLine={false} tickLine={false} width={150} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name="Projetos" fill={DS.greenDark} radius={[0, 4, 4, 0]} barSize={20}
              label={{ position: "right", fill: DS.textSecondary, fontSize: 12, fontWeight: 600, formatter: (v) => v.toLocaleString("pt-BR") }}
            />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <div style={{ height: 24 }} />

      {/* Taxa de cumprimento por área */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Taxa de Cumprimento de Prazo por Área">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[
                { area: "Protocolo", taxa: 71 },
                { area: "Patrocinador", taxa: 22 },
                { area: "Med. Teste", taxa: 75 },
                { area: "Med. Referência", taxa: 85 },
                { area: "Insumos Lab.", taxa: 72 },
                { area: "Análises", taxa: 7 },
                { area: "Doc. Técnica", taxa: 5 },
                { area: "Gar. Qualidade", taxa: 0.1 },
              ]}
              layout="vertical" margin={{ left: 20, right: 60, top: 5, bottom: 5 }}
            >
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis type="category" dataKey="area" tick={{ fill: DS.textSecondary, fontSize: 12, textAnchor: "start", dx: -130 }} axisLine={false} tickLine={false} width={135} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="taxa" name="% Dentro do Prazo" radius={[0, 4, 4, 0]} barSize={18}
                label={{ position: "right", fill: DS.textSecondary, fontSize: 12, fontWeight: 600, formatter: (v) => v + "%" }}
              >
                {[DS.greenDark, "#f97316", DS.greenDark, DS.greenDark, DS.greenDark, "#ef4444", "#ef4444", "#ef4444"].map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Resumo de Faróis — Todas as Áreas">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "4px 0" }}>
            {[
              { area: "Protocolo", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", atrasado: 13, andamento: 28, naoIniciado: 275 },
              { area: "Análises", icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", atrasado: 211, andamento: 5, naoIniciado: 491 },
              { area: "Doc. Técnica", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", atrasado: 75, andamento: 3, naoIniciado: 735 },
              { area: "Gar. Qualidade", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", atrasado: 15, andamento: 39, naoIniciado: 826 },
              { area: "Patrocinador", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", atrasado: 0, andamento: 124, naoIniciado: 829 },
              { area: "Med. Teste", icon: "M10.5 2.5L4.2 8.8a4.95 4.95 0 007 7l6.3-6.3a4.95 4.95 0 00-7-7zM8.5 8.5l7 7", atrasado: 2, andamento: 253, naoIniciado: 128 },
              { area: "Med. Referência", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", atrasado: 0, andamento: 70, naoIniciado: 205 },
              { area: "Insumos Lab.", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", atrasado: 0, andamento: 129, naoIniciado: 187 },
            ].map((a) => {
              const total = a.atrasado + a.andamento + a.naoIniciado;
              const pctAtr = total ? (a.atrasado / total * 100) : 0;
              const pctAnd = total ? (a.andamento / total * 100) : 0;
              const pctNao = total ? (a.naoIniciado / total * 100) : 0;
              // Cor de destaque do card — vermelho se muitos atrasados, verde se poucos
              const accentColor = pctAtr > 20 ? DS.statusRisk : pctAtr > 5 ? DS.amber : DS.statusActive;
              return (
                <div key={a.area} style={{
                  padding: 0, borderRadius: 12, border: `1px solid ${DS.cardBorder}`,
                  overflow: "hidden", background: DS.card,
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {/* Header do mini-card */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px",
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, background: DS.greenDark + "14",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={DS.greenDark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={a.icon} />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: DS.text, lineHeight: 1.2 }}>{a.area}</div>
                      <div style={{ fontSize: 11, color: DS.textMuted, marginTop: 1 }}>{total.toLocaleString("pt-BR")} pendentes</div>
                    </div>
                  </div>

                  {/* Barra de proporção empilhada */}
                  <div style={{ padding: "0 16px", marginBottom: 12 }}>
                    <div style={{
                      display: "flex", height: 6, borderRadius: 3, overflow: "hidden",
                      background: "#f3f4f6",
                    }}>
                      {pctAtr > 0 && <div style={{ width: pctAtr + "%", background: DS.statusRisk, transition: "width 0.4s" }} />}
                      {pctAnd > 0 && <div style={{ width: pctAnd + "%", background: DS.statusActive, transition: "width 0.4s" }} />}
                      {pctNao > 0 && <div style={{ width: pctNao + "%", background: DS.amber, transition: "width 0.4s" }} />}
                    </div>
                  </div>

                  {/* Números */}
                  <div style={{
                    display: "flex", borderTop: `1px solid ${DS.cardBorder}`,
                  }}>
                    {[
                      { val: a.atrasado, lbl: "Atrasado", color: DS.statusRisk, bg: DS.redBg },
                      { val: a.andamento, lbl: "Andamento", color: DS.statusActive, bg: "rgba(34,197,94,0.06)" },
                      { val: a.naoIniciado, lbl: "Não Inic.", color: DS.amber, bg: DS.amberBg },
                    ].map((item, i) => (
                      <div key={item.lbl} style={{
                        flex: 1, padding: "10px 0", textAlign: "center",
                        borderRight: i < 2 ? `1px solid ${DS.cardBorder}` : "none",
                        background: "transparent",
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: item.val > 0 ? item.color : DS.textMuted, lineHeight: 1 }}>
                          {item.val.toLocaleString("pt-BR")}
                        </div>
                        <div style={{ fontSize: 10, color: DS.textMuted, marginTop: 3, fontWeight: 500 }}>{item.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </>
  );
};

const FinalizacaoPage = () => {
  const [fStatus, setFStatus] = useState("Todos");
  const [fPatrocinador, setFPatrocinador] = useState("Todos");
  const [fKeyAccount, setFKeyAccount] = useState("Todos");
  const [fAno, setFAno] = useState("Todos");
  const statuses = useMemo(() => [...new Set(allData.map(d => d.statusPatrocinador).filter(Boolean))].sort(), []);
  const pats = useMemo(() => [...new Set(allData.map(d => d.patrocinador).filter(Boolean))].sort(), []);
  const anos = useMemo(() => [...new Set(allData.map(d => d.tepAno).filter(Boolean))].sort(), []);
  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);
  const filtered = useMemo(() => allData.filter(d =>
    (fStatus === "Todos" || d.statusPatrocinador === fStatus) &&
    (fPatrocinador === "Todos" || d.patrocinador === fPatrocinador) &&
    (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount) &&
    (fAno === "Todos" || d.tepAno === parseInt(fAno))
  ), [fStatus, fPatrocinador, fKeyAccount, fAno]);

  const kpiAndamento = useMemo(() => filtered.filter(d => d.statusPatrocinador === "Em andamento").length, [filtered]);
  const kpiForaPrazo = useMemo(() => filtered.filter(d => d.statusPatrocinador && d.statusPatrocinador.includes("Fora do Prazo")).length, [filtered]);
  const kpiDentroPrazo = useMemo(() => filtered.filter(d => d.statusPatrocinador && d.statusPatrocinador.includes("Dentro do Prazo")).length, [filtered]);

  return (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 160 }}><FarolSelect label="Ano" value={fAno} options={["Todos", ...anos.map(String)]} onChange={setFAno} /></div>
        <div style={{ width: 160 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
        <div style={{ flex: 1 }} />
        <KpiCard value={kpiAndamento.toLocaleString("pt-BR")} label="Em Andamento" color={DS.statusActive} />
        <KpiCard value={kpiForaPrazo.toLocaleString("pt-BR")} label="Fora do Prazo" color={DS.statusRisk} />
        <KpiCard value={kpiDentroPrazo.toLocaleString("pt-BR")} label="Dentro do Prazo" color={DS.green} />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <SectionCard title="Status de Aprovação do Patrocinador">
          <DonutChart data={statusPatrocinador} />
        </SectionCard>
        <SectionCard title="Taxa de Cumprimento de Prazo">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 340, gap: 16 }}>
            <div style={{ fontSize: 64, fontWeight: 800, color: DS.statusRisk, lineHeight: 1 }}>22%</div>
            <div style={{ fontSize: 14, color: DS.textMuted, textAlign: "center" }}>
              Apenas 190 de 857 projetos finalizados<br />foram entregues dentro do prazo
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: DS.green }}>190</div>
                <div style={{ fontSize: 12, color: DS.textMuted }}>Dentro do Prazo</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: DS.statusRisk }}>667</div>
                <div style={{ fontSize: 12, color: DS.textMuted }}>Fora do Prazo</div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Projetos x Status — Finalização Patrocinador">
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <FarolSelect label="Status Patrocinador" value={fStatus} options={["Todos", ...statuses]} onChange={setFStatus} />
          <FarolSelect label="Patrocinador" value={fPatrocinador} options={["Todos", ...pats]} onChange={setFPatrocinador} />
          {(fStatus !== "Todos" || fPatrocinador !== "Todos") && (
            <button onClick={() => { setFStatus("Todos"); setFPatrocinador("Todos"); }}
              style={{ padding: "0 14px", height: 36, borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: font, background: DS.redBg, color: DS.statusRisk, alignSelf: "flex-end" }}>
              Limpar
            </button>
          )}
        </div>
        <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]}
          columns={[
            { key: "codigo", label: "Código" },
            { key: "patrocinador", label: "Patrocinador" },
            { key: "tipo", label: "Tipo" },
            { key: "ensaio", label: "Ensaio", maxW: 260 },
            { key: "etapa", label: "Etapa do Projeto", render: (v) => <EtapaBadge etapa={v} /> },
            { key: "statusPatrocinador", label: "Status Patrocinador", render: (v) => <StatusBadge status={v} /> },
          ]}
          rows={filtered}
        />
      </SectionCard>
    </>
  );
};

const VisaoTimePage = () => {
  const [fKeyAccount, setFKeyAccount] = useState("Todos");
  const [fAno, setFAno] = useState("Todos");
  const [fStatus, setFStatus] = useState("Todos");

  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);
  const anos = useMemo(() => [...new Set(allData.map(d => d.tepAno).filter(Boolean))].sort(), []);
  const statuses = useMemo(() => [...new Set(allData.map(d => d.statusProjeto).filter(Boolean))].sort(), []);

  const filtered = useMemo(() => allData.filter(d =>
    (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount) &&
    (fAno === "Todos" || d.tepAno === parseInt(fAno)) &&
    (fStatus === "Todos" || d.statusProjeto === fStatus)
  ), [fKeyAccount, fAno, fStatus]);

  // KPIs dinâmicos por Key Account
  const kpiData = useMemo(() => {
    const counts = {};
    filtered.forEach(d => { if (d.keyAccount) counts[d.keyAccount] = (counts[d.keyAccount] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [filtered]);

  // Donut por categoria de ensaio
  const categoriaData = useMemo(() => {
    const counts = {};
    filtered.forEach(d => { if (d.categoriaEnsaio) counts[d.categoriaEnsaio] = (counts[d.categoriaEnsaio] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [filtered]);

  return (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 200 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
        <div style={{ width: 160 }}><FarolSelect label="Ano" value={fAno} options={["Todos", ...anos.map(String)]} onChange={setFAno} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Status Projeto" value={fStatus} options={["Todos", ...statuses]} onChange={setFStatus} /></div>
        {(fKeyAccount !== "Todos" || fAno !== "Todos" || fStatus !== "Todos") && (
          <button onClick={() => { setFKeyAccount("Todos"); setFAno("Todos"); setFStatus("Todos"); }}
            style={{ padding: "0 14px", height: 36, borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: font, background: DS.redBg, color: DS.statusRisk, alignSelf: "flex-end" }}>
            Limpar
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {kpiData.map((ka) => (
          <KpiCard key={ka.name} value={ka.value.toLocaleString("pt-BR")} label={ka.name} color={ka.color} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <SectionCard title="Projetos por Key Account">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={kpiData} layout="vertical" margin={{ left: 20, right: 50, top: 5, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: DS.textSecondary, fontSize: 13, textAnchor: "start", dx: -95 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Projetos" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} barSize={20}
                label={{ position: "right", fill: DS.textSecondary, fontSize: 13, fontWeight: 600, formatter: (v) => v.toLocaleString("pt-BR") }}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Categoria do Ensaio">
          <DonutChart data={categoriaData} />
        </SectionCard>
      </div>
      <SectionCard title="Todos os Projetos — Visão por Responsável">
        <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]}
          columns={[
            { key: "keyAccount", label: "Key Account" },
            { key: "codigo", label: "Código" },
            { key: "patrocinador", label: "Patrocinador" },
            { key: "tipo", label: "Tipo" },
            { key: "ensaio", label: "Ensaio", maxW: 240 },
            { key: "etapa", label: "Etapa", render: (v) => <EtapaBadge etapa={v} /> },
            { key: "statusProjeto", label: "Status", render: (v) => <StatusBadge status={v} /> },
          ]}
          rows={filtered}
        />
      </SectionCard>
    </>
  );
};

const InsumosPage = () => {
  const [fPatrocinador, setFPatrocinador] = useState("Todos");
  const [fKeyAccount, setFKeyAccount] = useState("Todos");
  const [fStatusMT, setFStatusMT] = useState("Todos");

  const patrocinadores = useMemo(() => [...new Set(allData.map(d => d.patrocinador).filter(Boolean))].sort(), []);
  const keyAccounts = useMemo(() => [...new Set(allData.map(d => d.keyAccount).filter(Boolean))].sort(), []);
  const statusMTOpts = useMemo(() => [...new Set(allData.map(d => d.statusMT).filter(Boolean))].sort(), []);

  const filtered = useMemo(() => allData.filter(d =>
    (fPatrocinador === "Todos" || d.patrocinador === fPatrocinador) &&
    (fKeyAccount === "Todos" || d.keyAccount === fKeyAccount) &&
    (fStatusMT === "Todos" || d.statusMT === fStatusMT)
  ), [fPatrocinador, fKeyAccount, fStatusMT]);

  // KPIs dinâmicos
  const mtAndamento = useMemo(() => filtered.filter(d => d.statusMT === "Em andamento").length, [filtered]);
  const mtNaoIniciado = useMemo(() => filtered.filter(d => d.statusMT === "Não iniciado").length, [filtered]);
  const mrAndamento = useMemo(() => filtered.filter(d => d.statusMR === "Em andamento").length, [filtered]);
  const insAndamento = useMemo(() => filtered.filter(d => d.statusInsumos === "Em andamento").length, [filtered]);

  // Donuts dinâmicos
  const buildDonut = (field) => {
    const counts = {};
    filtered.forEach(d => { const v = d[field]; if (v) counts[v] = (counts[v] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  };

  return (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 200 }}><FarolSelect label="Patrocinador" value={fPatrocinador} options={["Todos", ...patrocinadores]} onChange={setFPatrocinador} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Key Account" value={fKeyAccount} options={["Todos", ...keyAccounts]} onChange={setFKeyAccount} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Status MT" value={fStatusMT} options={["Todos", ...statusMTOpts]} onChange={setFStatusMT} /></div>
        {(fPatrocinador !== "Todos" || fKeyAccount !== "Todos" || fStatusMT !== "Todos") && (
          <button onClick={() => { setFPatrocinador("Todos"); setFKeyAccount("Todos"); setFStatusMT("Todos"); }}
            style={{ padding: "0 14px", height: 36, borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: font, background: DS.redBg, color: DS.statusRisk, alignSelf: "flex-end" }}>
            Limpar
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <OverviewKpi value={mtAndamento.toLocaleString("pt-BR")} label="MT Em Andamento" color={DS.blue} />
        <OverviewKpi value={mtNaoIniciado.toLocaleString("pt-BR")} label="MT Não Iniciado" color={DS.amber} />
        <OverviewKpi value={mrAndamento.toLocaleString("pt-BR")} label="MR Em Andamento" color={DS.blue} />
        <OverviewKpi value={insAndamento.toLocaleString("pt-BR")} label="Insumos Em Andamento" color={DS.statusActive} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        <SectionCard title="Status Medicamento Teste (MT)">
          <DonutChart data={buildDonut("statusMT")} />
        </SectionCard>
        <SectionCard title="Status Medicamento Referência (MR)">
          <DonutChart data={buildDonut("statusMR")} />
        </SectionCard>
        <SectionCard title="Status Insumos Laboratoriais">
          <DonutChart data={buildDonut("statusInsumos")} />
        </SectionCard>
      </div>
      <SectionCard title="Projetos — Recebimento de Materiais">
        <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]}
          columns={[
            { key: "codigo", label: "Código" },
            { key: "patrocinador", label: "Patrocinador" },
            { key: "projeto", label: "Projeto", maxW: 200 },
            { key: "etapa", label: "Etapa", render: (v) => <EtapaBadge etapa={v} /> },
            { key: "statusMT", label: "Status MT", render: (v) => <StatusBadge status={v} /> },
            { key: "statusMR", label: "Status MR", render: (v) => <StatusBadge status={v} /> },
            { key: "statusInsumos", label: "Status Insumos", render: (v) => <StatusBadge status={v} /> },
          ]}
          rows={filtered}
        />
      </SectionCard>
    </>
  );
};

const FinanceiroPage = () => {
  const [fPatrocinador, setFPatrocinador] = useState("Todos");
  const [fStatus, setFStatus] = useState("Todos");

  const patrocinadores = useMemo(() => [...new Set(allFinanceiro.map(d => d.patrocinador).filter(Boolean))].sort(), []);
  const statuses = useMemo(() => [...new Set(allFinanceiro.map(d => d.statusFaturamento).filter(Boolean))].sort(), []);

  const filtered = useMemo(() => allFinanceiro.filter(d =>
    (fPatrocinador === "Todos" || d.patrocinador === fPatrocinador) &&
    (fStatus === "Todos" || d.statusFaturamento === fStatus)
  ), [fPatrocinador, fStatus]);

  // KPIs dinâmicos
  const totalContrato = useMemo(() => filtered.reduce((s, d) => s + (d.totalContrato || 0), 0), [filtered]);
  const totalFaturado = useMemo(() => filtered.filter(d => d.tipo === "Faturado").reduce((s, d) => s + (d.valorParcela || 0), 0), [filtered]);
  const pendente = totalContrato - totalFaturado;
  const pctFaturado = totalContrato > 0 ? ((totalFaturado / totalContrato) * 100).toFixed(1) : "0,0";

  const fatPorPatrocinador = useMemo(() => {
    const map = {};
    filtered.forEach(r => {
      if (!r.patrocinador) return;
      if (!map[r.patrocinador]) map[r.patrocinador] = { name: r.patrocinador, total: 0, faturado: 0 };
      map[r.patrocinador].total += r.totalContrato;
      if (r.tipo === "Faturado") map[r.patrocinador].faturado += r.valorParcela;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filtered]);

  // Donut dinâmico
  const donutFat = useMemo(() => {
    const counts = {};
    filtered.forEach(d => { const s = d.statusFaturamento; if (s) counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [filtered]);

  const fmtMoeda = (v) => v >= 1e6
    ? "R$ " + (v / 1e6).toFixed(1).replace(".", ",") + "M"
    : "R$ " + (v / 1e3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "k";

  return (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 200 }}><FarolSelect label="Patrocinador" value={fPatrocinador} options={["Todos", ...patrocinadores]} onChange={setFPatrocinador} /></div>
        <div style={{ width: 200 }}><FarolSelect label="Status Faturamento" value={fStatus} options={["Todos", ...statuses]} onChange={setFStatus} /></div>
        {(fPatrocinador !== "Todos" || fStatus !== "Todos") && (
          <button onClick={() => { setFPatrocinador("Todos"); setFStatus("Todos"); }}
            style={{ padding: "0 14px", height: 36, borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: font, background: DS.redBg, color: DS.statusRisk, alignSelf: "flex-end" }}>
            Limpar
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <OverviewKpi value={fmtMoeda(totalContrato)} label="Total Contratado" color="#d97706" />
        <OverviewKpi value={fmtMoeda(totalFaturado)} label="Total Faturado" color="#d97706" />
        <OverviewKpi value={fmtMoeda(pendente)} label="Pendente de Faturamento" color="#d97706" />
        <OverviewKpi value={pctFaturado.replace(".", ",") + "%"} label="% Faturado" color="#d97706" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <SectionCard title="Status de Faturamento">
          <DonutChart data={donutFat} />
        </SectionCard>
        <SectionCard title="Top 10 Patrocinadores por Valor Contratado">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={fatPorPatrocinador} layout="vertical" margin={{ left: 20, right: 60, top: 5, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: DS.textSecondary, fontSize: 12, textAnchor: "start", dx: -115 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="total" name="Valor Contratado" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} barSize={18}
                label={{ position: "right", fill: DS.textSecondary, fontSize: 11, fontWeight: 600, formatter: (v) => "R$ " + (v / 1e3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "k" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
      <SectionCard title="Detalhamento Financeiro">
        <DataTable searchKeys={["codigo","codigoRve","projeto","ensaio","rve","variaveisRisco"]}
          columns={[
            { key: "patrocinador", label: "Patrocinador" },
            { key: "projeto", label: "Projeto", maxW: 200 },
            { key: "rve", label: "RVE" },
            { key: "qtdeParcelas", label: "Parcelas" },
            { key: "statusFaturamento", label: "Status", render: (v) => <StatusBadge status={v} /> },
            { key: "totalContrato", label: "Valor Contrato", render: (v) => v ? "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "-" },
            { key: "valorParcela", label: "Valor Parcela", render: (v) => v ? "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "-" },
          ]}
          rows={filtered}
        />
      </SectionCard>
    </>
  );
};

// ═══════════════════════════════════════════
//  MAIN LAYOUT
// ═══════════════════════════════════════════

// Ícones SVG inline (lucide-style, 20x20, stroke currentColor)
const I = (d) => ({ __html: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>` });
const ICONS = {
  farol:             I('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  proximas_entradas: I('<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/>'),
  protocolos:        I('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13h4"/><path d="M10 17h4"/>'),
  laboratorio:       I('<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/>'),
  doc_tecnica:       I('<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 11h8"/><path d="M8 7h6"/>'),
  gq:                I('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>'),
  monitorias:        I('<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),
  sineb:             I('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>'),
  overview:          I('<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>'),
  analises:          I('<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>'),
  finalizacao:       I('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>'),
  insumos:           I('<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>'),
  financeiro:        I('<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
  visao_time:        I('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
};

const PAGES = [
  { id: "farol", label: "Farol" },
  { id: "proximas_entradas", label: "Próximas Entradas" },
  { id: "protocolos", label: "Protocolos" },
  { id: "laboratorio", label: "Laboratório" },
  { id: "doc_tecnica", label: "Documentação Técnica" },
  { id: "gq", label: "Garantia da Qualidade" },
  { id: "monitorias", label: "Monitorias" },
  { id: "sineb", label: "SINEB" },
  { id: "sep1", label: "", separator: true },
  { id: "overview", label: "Overview Geral" },
  { id: "analises", label: "Análises" },
  { id: "finalizacao", label: "Finalização Patrocinador" },
  { id: "insumos", label: "Insumos e Materiais" },
  { id: "financeiro", label: "Financeiro" },
  { id: "visao_time", label: "Visão do Time" },
];

export default function SynviaDashboard() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts, instance } = useMsal();

  // Dados do usuário logado
  const user = accounts[0] || null;
  const displayName = user?.name || "";
  const nameParts = displayName.split(" ").filter(Boolean);
  const firstName = nameParts[0] || "";
  const lastName = nameParts[nameParts.length - 1] || "";
  const initials = (firstName[0] || "") + (lastName[0] || "");
  const shortName = nameParts.length > 1 ? `${firstName} ${lastName}` : firstName;

  const [page, setPage] = useState("farol");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-collapsed") === "true");
  const [refreshing, setRefreshing] = useState(false);

  // Reage a mudanças nos dados
  useDataRefresh();

  // Buscar dados frescos ao abrir + polling a cada 1h
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchFreshData();
    const interval = setInterval(() => fetchFreshData(), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Botão de refresh manual
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFreshData(true);
    setRefreshing(false);
  }, []);

  // Se não autenticado, mostra tela de login
  if (!isAuthenticated) return <LoginPage />;

  const pageTitle = {
    farol: "Farol",
    proximas_entradas: "Próximas Entradas",
    protocolos: "Protocolos",
    laboratorio: "Laboratório",
    doc_tecnica: "Documentação Técnica",
    gq: "Garantia da Qualidade",
    monitorias: "Monitorias",
    sineb: "SINEB",
    overview: "Overview Geral",
    analises: "Análises — Início x Término",
    finalizacao: "Finalização Patrocinador",
    insumos: "Insumos e Materiais",
    financeiro: "Financeiro",
    visao_time: "Visão do Time",
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: font, background: DS.bg }}>

      {/* ── SIDEBAR — conforme SYNVIA-DESIGN-SYSTEM.md §4 ── */}
      <div style={{
        width: collapsed ? 80 : 256, background: DS.sidebar, flexShrink: 0,
        display: "flex", flexDirection: "column", transition: "width 0.3s ease-out",
        boxShadow: "0 0 32px rgba(0,0,0,0.25)", overflow: "hidden", position: "relative",
      }}>
        {/* Header: logo ou seta */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)", height: 64, flexShrink: 0,
          padding: "0 12px",
        }}>
          <button onClick={() => { setCollapsed(!collapsed); localStorage.setItem("sidebar-collapsed", String(!collapsed)); }}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(46,124,101,0.3)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            {collapsed
              ? <img src="/seta-branca.svg" alt="Expandir" style={{ width: 24, height: 24 }} />
              : <img src="/logo-synvia-branco.svg" alt="Synvia" style={{ width: 100, height: 28 }} />
            }
          </button>
        </div>

        {/* Menu items */}
        <div className="sidebar-scroll" style={{ flex: 1, paddingTop: 6, overflowY: "auto", overflowX: "hidden" }}>
          {PAGES.map((p) => {
            if (p.separator) return (
              <div key={p.id} style={{ padding: "0 16px", margin: "8px 0" }}>
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
              </div>
            );
            const isActive = page === p.id;
            const icon = ICONS[p.id];
            if (collapsed) return (
              <div key={p.id} style={{ position: "relative", margin: "2px 8px" }}>
                <button onClick={() => setPage(p.id)} title={p.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "100%", height: 42, border: "none", cursor: "pointer", borderRadius: 8,
                  background: isActive ? "linear-gradient(to right, rgba(33,168,78,0.2), rgba(33,168,78,0.05))" : "transparent",
                  position: "relative", transition: "background 0.2s",
                  color: isActive ? DS.sidebarActive : "rgb(200,220,210)",
                }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(46,124,101,0.3)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {isActive && (
                    <div style={{
                      position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                      width: 4, height: 28, background: DS.sidebarActive, borderRadius: "0 9999px 9999px 0",
                    }} />
                  )}
                  {icon && <span dangerouslySetInnerHTML={icon} />}
                </button>
              </div>
            );
            return (
              <div key={p.id} style={{ position: "relative", margin: "2px 8px" }}>
                <button onClick={() => setPage(p.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                  border: "none", cursor: "pointer", padding: "10px 16px",
                  fontSize: 14, fontWeight: isActive ? 600 : 500, fontFamily: font,
                  color: isActive ? "#fff" : "rgb(200,220,210)",
                  background: isActive ? "linear-gradient(to right, rgba(33,168,78,0.2), rgba(33,168,78,0.05))" : "transparent",
                  borderRadius: 8, transition: "all 0.2s ease-out", whiteSpace: "nowrap",
                }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(46,124,101,0.3)"; e.currentTarget.style.color = "#fff"; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgb(200,220,210)"; } }}
                >
                  {icon && <span style={{ flexShrink: 0, display: "flex" }} dangerouslySetInnerHTML={icon} />}
                  {p.label}
                </button>
                {isActive && (
                  <div style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 4, height: 28, background: DS.sidebarActive, borderRadius: "0 9999px 9999px 0",
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: usuário logado */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, color: "rgb(200,220,210)", flexShrink: 0,
              textTransform: "uppercase",
            }}>{initials}</div>
            {!collapsed && (
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shortName}</div>
                <button
                  onClick={() => instance.logoutRedirect()}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    fontSize: 11, color: "rgba(200,220,210,0.5)", fontWeight: 400,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,220,210,0.5)"; }}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header sticky com backdrop-blur */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40, height: 56,
          padding: "0 24px", background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid rgba(229,231,235,0.8)`,
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6,
            display: "flex", alignItems: "center", marginRight: 4,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/>
            </svg>
          </button>
          <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>Dashboard</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{pageTitle[page]}</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 400 }}>
              Atualizado em {(() => {
                const d = new Date(metadata.syncedAt);
                const pad = (n) => String(n).padStart(2, "0");
                return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
              })()}
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Atualizar dados do SharePoint"
              style={{
                background: "none", border: "1px solid #e5e7eb", borderRadius: 6,
                cursor: refreshing ? "wait" : "pointer", padding: "3px 8px",
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, color: "#6b7280", fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.borderColor = "#d1d5db"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}>
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
              {refreshing ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </header>

        {/* Conteúdo com scroll */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 24px 48px" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>{pageTitle[page]}</h1>
          <div style={{ height: 16 }} />
          {page === "farol" && <FarolPage />}
          {page === "proximas_entradas" && <ProximasEntradasPage />}
          {page === "protocolos" && <ProtocolosPage />}
          {page === "laboratorio" && <LaboratorioPage />}
          {page === "doc_tecnica" && <DocTecnicaPage />}
          {page === "gq" && <GarantiaQualidadePage />}
          {page === "monitorias" && <MonitoriasPage />}
          {page === "sineb" && <SinebPage />}
          {page === "overview" && <OverviewPage />}
          {page === "analises" && <AnalisesPage />}
          {page === "finalizacao" && <FinalizacaoPage />}
          {page === "insumos" && <InsumosPage />}
          {page === "financeiro" && <FinanceiroPage />}
          {page === "visao_time" && <VisaoTimePage />}
        </div>

      </div>
    </div>
  );
}
