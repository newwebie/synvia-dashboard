/**
 * Vercel Serverless Function — retorna dados atualizados do SharePoint
 * Cache CDN de 5 min, revalida em background.
 * Query ?fresh=1 ignora o cache (botão de refresh).
 */

import XLSX from "xlsx";

const GRAPH = "https://graph.microsoft.com/v1.0";

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

// ── Extração ──
function excelDate(val) {
  if (!val || typeof val !== "number") return "";
  const d = new Date((val - 25569) * 86400000);
  return String(d.getUTCDate()).padStart(2, "0") + "/" + String(d.getUTCMonth() + 1).padStart(2, "0") + "/" + d.getUTCFullYear();
}
function excelYear(val) { if (!val || typeof val !== "number") return null; return new Date((val - 25569) * 86400000).getUTCFullYear(); }
function excelMonth(val) { if (!val || typeof val !== "number") return null; return new Date((val - 25569) * 86400000).getUTCMonth() + 1; }

function extractEntregaveis(wb) {
  const ws = wb.Sheets["Entregáveis"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const rows = data.slice(5);
  const result = [];
  for (const r of rows) {
    const codigo = (r[4] || "").toString().trim();
    const pat = (r[1] || "").toString().trim();
    if (!codigo && !pat) continue;
    let sp = (r[49] || "").toString().trim().replace(/^\d+\.\s*/, "");
    result.push({
      keyAccount: (r[0] || "").toString().trim(), patrocinador: pat, codigo,
      codigoRve: (r[2] || "").toString().trim(), projeto: (r[3] || "").toString().trim(),
      tipo: (r[6] || "").toString().trim(), categoriaEnsaio: (r[5] || "").toString().trim(),
      ensaio: (r[10] || "").toString().trim().replace(/\r?\n/g, " ").substring(0, 120),
      etapa: (r[11] || "").toString().trim(), statusProjeto: (r[12] || "").toString().trim(),
      statusMT: (r[24] || "").toString().trim(), statusMR: (r[29] || "").toString().trim(),
      statusInsumos: (r[34] || "").toString().trim(), terceirizacao: (r[14] || "").toString().trim(),
      bqv: (r[16] || "").toString().trim(),
      statusProtocolo: sp, dataPrevProtocolo: excelDate(r[47]), dataEnvioProtocolo: excelDate(r[48]),
      farolProtocolo: (r[51] || "").toString().trim(), farolAnalises: (r[60] || "").toString().trim(),
      variaveisRisco: (r[52] || "").toString().trim(),
      previstoInicioData: excelDate(r[54]), previstoInicioAno: excelYear(r[54]), previstoInicioMes: excelMonth(r[54]),
      dataRealInicio: excelDate(r[56]), dataPrevEnvioResultados: excelDate(r[58]),
      statusDT: (r[66] || "").toString().trim(), monitoriaDT: (r[64] || "").toString().trim(),
      dataInicioDT: excelDate(r[62]), dataPrevTerminoDT: excelDate(r[63]),
      dataPrevTerminoDTAno: excelYear(r[63]), dataPrevTerminoDTMes: excelMonth(r[63]),
      statusGQ: (r[72] || "").toString().trim(), monitoriaGQ: (r[70] || "").toString().trim(),
      dataInicioGQ: excelDate(r[68]), dataPrevTerminoGQ: excelDate(r[69]),
      dataPrevTerminoGQAno: excelYear(r[69]), dataPrevTerminoGQMes: excelMonth(r[69]),
      monitoriaPatrocinador: (r[75] || "").toString().trim(),
      statusPatrocinador: (r[79] || "").toString().trim(),
      dataEnvioPatrocinador: excelDate(r[73]), dataEnvioPatAno: excelYear(r[73]),
      dataAprovacaoPatrocinador: excelDate(r[76]),
      tepAno: excelYear(r[80]), tepMes: excelMonth(r[80]),
      statusPrazoFinal: (r[81] || "").toString().trim(), dataSineb: excelDate(r[78]),
    });
  }
  return result;
}

function extractFinanceiro(wb) {
  const wsF = wb.Sheets["Financeiro"];
  const dataF = XLSX.utils.sheet_to_json(wsF, { header: 1 });
  const fin = [];
  for (const r of dataF.slice(6)) {
    const pat = (r[1] || "").toString().trim();
    if (!pat) continue;
    fin.push({
      keyAccount: (r[0] || "").toString().trim(), patrocinador: pat,
      projeto: (r[2] || "").toString().trim(), statusFaturamento: (r[3] || "").toString().trim(),
      rve: (r[4] || "").toString().trim(), qtdeParcelas: (r[6] || "").toString().trim(),
      tipo: (r[7] || "").toString().trim(), parcelaPendente: typeof r[8] === "number" ? r[8] : 0,
      totalContrato: typeof r[11] === "number" ? r[11] : 0,
      valorParcela: typeof r[12] === "number" ? r[12] : 0,
      pctFaturado: typeof r[13] === "number" ? r[13] : 0,
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

    // Cache CDN: 5 min, serve stale enquanto revalida
    // ?fresh=1 bypassa o cache (botão de refresh do user)
    const isFresh = req.query?.fresh === "1";
    if (isFresh) {
      res.setHeader("Cache-Control", "no-cache, no-store");
    } else {
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    }

    res.status(200).json(payload);
  } catch (error) {
    console.error("Erro no /api/data:", error.message);
    res.status(500).json({ error: error.message });
  }
}
