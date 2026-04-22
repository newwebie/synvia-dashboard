/**
 * Vercel Serverless Function — retorna dados atualizados do SharePoint.
 * Cache CDN de 5 min, revalida em background.
 * Query ?fresh=1 ignora o cache (botão de refresh).
 *
 * O mapeamento das colunas é feito por NOME (header), não por índice.
 * Se a estrutura da planilha for alterada (coluna renomeada/removida),
 * o handler retorna 422 com payload { error: "SCHEMA_MISMATCH", ... }
 * para o frontend exibir aviso ao usuário.
 */

import XLSX from "xlsx";

const GRAPH = "https://graph.microsoft.com/v1.0";

// ── Mapeamento: campo no JSON → nome da coluna no Excel ──
// Qualquer alteração nos nomes abaixo deve ser espelhada na planilha NEW_BD.
const ENTREGAVEIS_COLS = {
  keyAccount: "KEY ACCOUNT",
  patrocinador: "PATROCINADOR",
  codigoRve: "CÓDIGO RVE",
  projeto: "PROJETO (ATIVO)",
  codigo: "CODIFICAÇÃO",
  categoriaEnsaio: "CATEGORIA DO ENSAIO",
  tipo: "TIPO",
  ensaio: "ENSAIO",
  etapa: "ETAPA DO PROJETO",
  statusProjeto: "STATUS DO PROJETO",
  terceirizacao: "TERCEIRIZAÇÃO",
  bqv: "BQV",
  statusMT: "STATUS MT",
  statusMR: "STATUS MR",
  statusInsumos: "STATUS INSUMOS",
  dataPrevProtocolo: "DATA PREVISTA DE VERSIONAMENTO DO PROTOCOLO",
  dataEnvioProtocolo: "DATA DE ENVIO DO PROTOCOLO",
  statusProtocolo: "STATUS PROTOCOLO",
  farolProtocolo: "FAROL PROTOCOLO",
  variaveisRisco: "VARIÁVEIS DE RISCO",
  previstoInicio: "PREVISTO INÍCIO DAS ANÁLISES",
  dataRealInicio: "DATA REAL DE INÍCIO DAS ANÁLISES",
  dataPrevEnvioResultados: "DATA PREVISTA DE ENVIO DOS RESULTADOS",
  farolAnalises: "FAROL ANÁLISES",
  dataInicioDT: "DATA INÍCIO DT",
  dataPrevTerminoDT: "DATA PREVISTA DE TÉRMINO DT",
  monitoriaDT: "MONITORIA DT",
  statusDT: "STATUS DT",
  dataInicioGQ: "DATA INÍCIO GQ",
  dataPrevTerminoGQ: "DATA PREVISTA TÉRMINO GQ",
  monitoriaGQ: "MONITORIA GQ",
  statusGQ: "STATUS GQ",
  dataEnvioPatrocinador: "DATA DE ENVIO AO PATROCINADOR",
  monitoriaPatrocinador: "MONITORIA PATROCINADOR",
  dataAprovacaoPatrocinador: "DATA DE APROVAÇÃO DO PATROCINADOR",
  dataSineb: "DATA DE FECHAMENTO DO SINEB",
  statusPatrocinador: "STATUS PATROCINADOR",
  tep: "TEP - FINAL DO PROJETO",
  statusPrazoFinal: "STATUS PRAZO DE FINALIZAÇÃO",
};

const FINANCEIRO_COLS = {
  keyAccount: "KEY ACCOUNT",
  patrocinador: "PATROCINADOR",
  projeto: "PROJETO (ATIVO)",
  statusFaturamento: "STATUS FATURAMENTO",
  rve: "RVE",
  qtdeParcelas: "QTDE PARCELAS FATURADAS",
  tipo: "TIPO",
  parcelaPendente: "PARCELA PENDENTE",
  totalContrato: "TOTAL CONTRATO",
  valorParcela: "VALOR DA PARCELA",
  pctFaturado: "% FATURADO",
};

// ── Auth ──
async function getAccessToken() {
  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.SHAREPOINT_CLIENT_ID,
        client_secret: process.env.SHAREPOINT_CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
      }).toString(),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error_description);
  return data.access_token;
}

// ── Download ──
async function downloadFile(token) {
  const headers = { Authorization: `Bearer ${token}` };
  const driveId = process.env.SHAREPOINT_DRIVE_ID;
  const filePath = encodeURI(process.env.SHAREPOINT_FILE_PATH);

  // Metadados (última modificação)
  const metaRes = await fetch(`${GRAPH}/drives/${driveId}/root:/${filePath}`, { headers });
  let lastModified = new Date().toISOString();
  if (metaRes.ok) {
    const meta = await metaRes.json();
    lastModified = meta.lastModifiedDateTime || lastModified;
  }

  // Conteúdo
  const dlRes = await fetch(`${GRAPH}/drives/${driveId}/root:/${filePath}:/content`, {
    headers,
    redirect: "follow",
  });
  if (!dlRes.ok) throw new Error(`Download falhou: ${dlRes.status}`);

  const buffer = Buffer.from(await dlRes.arrayBuffer());
  return { buffer, lastModified };
}

// ── Conversões de data ──
function excelDate(val) {
  if (!val || typeof val !== "number") return "";
  const d = new Date((val - 25569) * 86400000);
  return String(d.getUTCDate()).padStart(2, "0") + "/" + String(d.getUTCMonth() + 1).padStart(2, "0") + "/" + d.getUTCFullYear();
}
function excelYear(val) { if (!val || typeof val !== "number") return null; return new Date((val - 25569) * 86400000).getUTCFullYear(); }
function excelMonth(val) { if (!val || typeof val !== "number") return null; return new Date((val - 25569) * 86400000).getUTCMonth() + 1; }

// ── Mapeamento por nome de coluna ──
const normalizeHeader = (s) => String(s || "").trim().toUpperCase();

/**
 * Resolve os índices das colunas a partir da linha de cabeçalho.
 * Lança erro com code "SCHEMA_MISMATCH" se alguma coluna esperada não existir.
 */
function buildColumnIndex(headerRow, requiredCols, sheetName) {
  const headerIndex = {};
  (headerRow || []).forEach((v, idx) => {
    const key = normalizeHeader(v);
    if (key && headerIndex[key] === undefined) headerIndex[key] = idx;
  });

  const col = {};
  const missing = [];
  for (const [field, header] of Object.entries(requiredCols)) {
    const idx = headerIndex[normalizeHeader(header)];
    if (idx === undefined) missing.push(header);
    else col[field] = idx;
  }

  if (missing.length > 0) {
    const err = new Error(
      `Colunas esperadas não foram encontradas na sheet "${sheetName}": ${missing.join(", ")}`
    );
    err.code = "SCHEMA_MISMATCH";
    err.sheet = sheetName;
    err.missingColumns = missing;
    throw err;
  }
  return col;
}

function throwSheetMissing(sheetName) {
  const err = new Error(`Sheet "${sheetName}" não encontrada na planilha.`);
  err.code = "SCHEMA_MISMATCH";
  err.sheet = sheetName;
  err.missingColumns = [];
  throw err;
}

// ── Extração ──
function extractEntregaveis(wb) {
  const ws = wb.Sheets["Entregáveis"];
  if (!ws) throwSheetMissing("Entregáveis");

  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  // Cabeçalho das colunas está na linha 4 (índice 4); dados começam na linha 5.
  const col = buildColumnIndex(data[4], ENTREGAVEIS_COLS, "Entregáveis");
  const rows = data.slice(5);

  const result = [];
  for (const r of rows) {
    const codigo = (r[col.codigo] || "").toString().trim();
    const pat = (r[col.patrocinador] || "").toString().trim();
    if (!codigo && !pat) continue;

    const sp = (r[col.statusProtocolo] || "").toString().trim().replace(/^\d+\.\s*/, "");
    result.push({
      keyAccount: (r[col.keyAccount] || "").toString().trim(),
      patrocinador: pat,
      codigo,
      codigoRve: (r[col.codigoRve] || "").toString().trim(),
      projeto: (r[col.projeto] || "").toString().trim(),
      tipo: (r[col.tipo] || "").toString().trim(),
      categoriaEnsaio: (r[col.categoriaEnsaio] || "").toString().trim(),
      ensaio: (r[col.ensaio] || "").toString().trim().replace(/\r?\n/g, " ").substring(0, 120),
      etapa: (r[col.etapa] || "").toString().trim(),
      statusProjeto: (r[col.statusProjeto] || "").toString().trim(),
      statusMT: (r[col.statusMT] || "").toString().trim(),
      statusMR: (r[col.statusMR] || "").toString().trim(),
      statusInsumos: (r[col.statusInsumos] || "").toString().trim(),
      terceirizacao: (r[col.terceirizacao] || "").toString().trim(),
      bqv: (r[col.bqv] || "").toString().trim(),
      statusProtocolo: sp,
      dataPrevProtocolo: excelDate(r[col.dataPrevProtocolo]),
      dataEnvioProtocolo: excelDate(r[col.dataEnvioProtocolo]),
      farolProtocolo: (r[col.farolProtocolo] || "").toString().trim(),
      farolAnalises: (r[col.farolAnalises] || "").toString().trim(),
      variaveisRisco: (r[col.variaveisRisco] || "").toString().trim(),
      previstoInicioData: excelDate(r[col.previstoInicio]),
      previstoInicioAno: excelYear(r[col.previstoInicio]),
      previstoInicioMes: excelMonth(r[col.previstoInicio]),
      dataRealInicio: excelDate(r[col.dataRealInicio]),
      dataPrevEnvioResultados: excelDate(r[col.dataPrevEnvioResultados]),
      statusDT: (r[col.statusDT] || "").toString().trim(),
      monitoriaDT: (r[col.monitoriaDT] || "").toString().trim(),
      dataInicioDT: excelDate(r[col.dataInicioDT]),
      dataPrevTerminoDT: excelDate(r[col.dataPrevTerminoDT]),
      dataPrevTerminoDTAno: excelYear(r[col.dataPrevTerminoDT]),
      dataPrevTerminoDTMes: excelMonth(r[col.dataPrevTerminoDT]),
      statusGQ: (r[col.statusGQ] || "").toString().trim(),
      monitoriaGQ: (r[col.monitoriaGQ] || "").toString().trim(),
      dataInicioGQ: excelDate(r[col.dataInicioGQ]),
      dataPrevTerminoGQ: excelDate(r[col.dataPrevTerminoGQ]),
      dataPrevTerminoGQAno: excelYear(r[col.dataPrevTerminoGQ]),
      dataPrevTerminoGQMes: excelMonth(r[col.dataPrevTerminoGQ]),
      monitoriaPatrocinador: (r[col.monitoriaPatrocinador] || "").toString().trim(),
      statusPatrocinador: (r[col.statusPatrocinador] || "").toString().trim(),
      dataEnvioPatrocinador: excelDate(r[col.dataEnvioPatrocinador]),
      dataEnvioPatAno: excelYear(r[col.dataEnvioPatrocinador]),
      dataAprovacaoPatrocinador: excelDate(r[col.dataAprovacaoPatrocinador]),
      tepAno: excelYear(r[col.tep]),
      tepMes: excelMonth(r[col.tep]),
      statusPrazoFinal: (r[col.statusPrazoFinal] || "").toString().trim(),
      dataSineb: excelDate(r[col.dataSineb]),
    });
  }
  return result;
}

function extractFinanceiro(wb) {
  const ws = wb.Sheets["Financeiro"];
  if (!ws) throwSheetMissing("Financeiro");

  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  // Cabeçalho na linha 0; dados começam na linha 1.
  const col = buildColumnIndex(data[0], FINANCEIRO_COLS, "Financeiro");

  const fin = [];
  for (const r of data.slice(1)) {
    const pat = (r[col.patrocinador] || "").toString().trim();
    if (!pat) continue;
    fin.push({
      keyAccount: (r[col.keyAccount] || "").toString().trim(),
      patrocinador: pat,
      projeto: (r[col.projeto] || "").toString().trim(),
      statusFaturamento: (r[col.statusFaturamento] || "").toString().trim(),
      rve: (r[col.rve] || "").toString().trim(),
      qtdeParcelas: (r[col.qtdeParcelas] || "").toString().trim(),
      tipo: (r[col.tipo] || "").toString().trim(),
      parcelaPendente: typeof r[col.parcelaPendente] === "number" ? r[col.parcelaPendente] : 0,
      totalContrato: typeof r[col.totalContrato] === "number" ? r[col.totalContrato] : 0,
      valorParcela: typeof r[col.valorParcela] === "number" ? r[col.valorParcela] : 0,
      pctFaturado: typeof r[col.pctFaturado] === "number" ? r[col.pctFaturado] : 0,
    });
  }
  return fin;
}

// ── Handler ──
export default async function handler(req, res) {
  try {
    const token = await getAccessToken();
    const { buffer, lastModified } = await downloadFile(token);

    const wb = XLSX.read(buffer, { type: "buffer" });
    const entregaveis = extractEntregaveis(wb);
    const financeiro = extractFinanceiro(wb);

    const payload = {
      lastModified,
      syncedAt: new Date().toISOString(),
      entregaveis,
      financeiro,
    };

    // Cache CDN: 5 min, serve stale enquanto revalida.
    // ?fresh=1 bypassa o cache (botão de refresh do user).
    const isFresh = req.query?.fresh === "1";
    if (isFresh) {
      res.setHeader("Cache-Control", "no-cache, no-store");
    } else {
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    }

    res.status(200).json(payload);
  } catch (error) {
    console.error("Erro no /api/data:", error.message);

    if (error.code === "SCHEMA_MISMATCH") {
      // 422 Unprocessable Entity — a planilha foi lida mas a estrutura mudou.
      res.setHeader("Cache-Control", "no-cache, no-store");
      res.status(422).json({
        error: "SCHEMA_MISMATCH",
        message: error.message,
        sheet: error.sheet,
        missingColumns: error.missingColumns || [],
      });
      return;
    }

    res.status(500).json({ error: "INTERNAL_ERROR", message: error.message });
  }
}
