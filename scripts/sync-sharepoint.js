/**
 * Sincronização com SharePoint via Microsoft Graph API (Client Credentials)
 * Baixa o NEW_BD.xlsm e extrai os dados em JSONs para o dashboard.
 *
 * Uso: node scripts/sync-sharepoint.js
 */

import "dotenv/config";
import { writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GRAPH = "https://graph.microsoft.com/v1.0";

const {
  SHAREPOINT_TENANT_ID,
  SHAREPOINT_CLIENT_ID,
  SHAREPOINT_CLIENT_SECRET,
  SHAREPOINT_HOSTNAME,
  SHAREPOINT_SITE_PATH,
  SHAREPOINT_DRIVE_ID,
  SHAREPOINT_FILE_PATH,
} = process.env;

// ═══════════════════════════════════════════
//  1. AUTENTICAÇÃO (Client Credentials)
// ═══════════════════════════════════════════

async function getAccessToken() {
  console.log("Autenticando via Client Credentials...");

  const res = await fetch(
    `https://login.microsoftonline.com/${SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: SHAREPOINT_CLIENT_ID,
        client_secret: SHAREPOINT_CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
      }).toString(),
    }
  );

  const data = await res.json();
  if (data.error) {
    console.error("Erro na autenticação:", data.error_description);
    process.exit(1);
  }

  console.log("Autenticado com sucesso!");
  return data.access_token;
}

// ═══════════════════════════════════════════
//  2. DOWNLOAD DO ARQUIVO
// ═══════════════════════════════════════════

async function downloadFile(token) {
  const headers = { Authorization: `Bearer ${token}` };
  const filePath = encodeURI(SHAREPOINT_FILE_PATH);

  // Se temos o drive ID direto, baixar sem precisar descobrir o site
  if (SHAREPOINT_DRIVE_ID) {
    // Buscar metadados do arquivo (última modificação)
    console.log(`Buscando metadados de ${SHAREPOINT_FILE_PATH}...`);
    const metaUrl = `${GRAPH}/drives/${SHAREPOINT_DRIVE_ID}/root:/${filePath}`;
    const metaRes = await fetch(metaUrl, { headers });
    let lastModified = new Date().toISOString();
    if (metaRes.ok) {
      const metaData = await metaRes.json();
      lastModified = metaData.lastModifiedDateTime || lastModified;
      console.log(`Última modificação no SharePoint: ${lastModified}`);
    }

    console.log(`Baixando...`);
    const url = `${GRAPH}/drives/${SHAREPOINT_DRIVE_ID}/root:/${filePath}:/content`;
    const res = await fetch(url, { headers, redirect: "follow" });

    if (!res.ok) {
      console.error(`Erro ao baixar: ${res.status} ${res.statusText}`);
      process.exit(1);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    console.log(`Baixado: ${(buffer.length / 1024 / 1024).toFixed(1)}MB`);
    return { buffer, lastModified };
  }

  // Fallback: descobrir site → drives → arquivo
  console.log("Buscando site...");
  const siteRes = await fetch(
    `${GRAPH}/sites/${SHAREPOINT_HOSTNAME}:/${SHAREPOINT_SITE_PATH}`,
    { headers }
  );
  const siteData = await siteRes.json();
  if (siteData.error) {
    console.error("Erro ao acessar site:", siteData.error.message);
    process.exit(1);
  }
  console.log(`Site: ${siteData.displayName}`);

  // Listar drives e buscar o arquivo
  const drivesRes = await fetch(`${GRAPH}/sites/${siteData.id}/drives`, { headers });
  const drivesData = await drivesRes.json();

  for (const drive of drivesData.value || []) {
    const searchRes = await fetch(
      `${GRAPH}/drives/${drive.id}/root:/${filePath}`,
      { headers }
    );
    if (searchRes.ok) {
      const fileData = await searchRes.json();
      console.log(`Encontrado em [${drive.name}]: ${fileData.name}`);
      console.log(`Drive ID: ${drive.id} (salve no .env para acelerar próximas execuções)`);

      const lastModified = fileData.lastModifiedDateTime || new Date().toISOString();
      const dlRes = await fetch(
        `${GRAPH}/drives/${drive.id}/root:/${filePath}:/content`,
        { headers, redirect: "follow" }
      );
      const buffer = Buffer.from(await dlRes.arrayBuffer());
      console.log(`Baixado: ${(buffer.length / 1024 / 1024).toFixed(1)}MB`);
      return { buffer, lastModified };
    }
  }

  console.error("Arquivo não encontrado em nenhum drive.");
  process.exit(1);
}

// ═══════════════════════════════════════════
//  3. EXTRAÇÃO
// ═══════════════════════════════════════════

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

// ═══════════════════════════════════════════
//  4. EXECUÇÃO
// ═══════════════════════════════════════════

async function main() {
  try {
    const token = await getAccessToken();
    const { buffer, lastModified } = await downloadFile(token);

    console.log("\nProcessando Excel...");
    const wb = XLSX.read(buffer, { type: "buffer" });

    const entregaveis = extractEntregaveis(wb);
    const financeiro = extractFinanceiro(wb);

    await writeFile(join(ROOT, "src/data/entregaveis.json"), JSON.stringify(entregaveis));
    await writeFile(join(ROOT, "src/data/financeiro.json"), JSON.stringify(financeiro));

    // Metadados da sincronização (lastModified = última edição do arquivo no SharePoint)
    const metadata = {
      lastModified,
      syncedAt: new Date().toISOString(),
      source: SHAREPOINT_FILE_PATH,
      entregaveis: entregaveis.length,
      financeiro: financeiro.length,
    };
    await writeFile(join(ROOT, "src/data/metadata.json"), JSON.stringify(metadata, null, 2));

    console.log(`Entregáveis: ${entregaveis.length} registros`);
    console.log(`Financeiro: ${financeiro.length} registros`);
    console.log("\nSincronização concluída!");
  } catch (error) {
    console.error("Erro:", error.message);
    process.exit(1);
  }
}

main();
