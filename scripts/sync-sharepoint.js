/**
 * Sincronização com SharePoint via Microsoft Graph API
 * Usa Device Code flow (primeira vez) + Refresh Token (automático depois).
 *
 * Uso: node scripts/sync-sharepoint.js
 *
 * Primeira execução: abre URL no navegador para login.
 * Próximas execuções: automático via refresh token salvo em .token-cache.json
 */

import "dotenv/config";
import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TOKEN_CACHE = join(ROOT, ".token-cache.json");

const { SHAREPOINT_SITE_URL, SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID } = process.env;

const TENANT_ID = SHAREPOINT_TENANT_ID || "fee1b506-24b6-444a-919e-83df9442dc5d";
const CLIENT_ID = SHAREPOINT_CLIENT_ID || "6a0d5571-1505-4d8b-98e5-f1d3a9352b4b";
const SCOPES = "Sites.Read.All Files.Read.All offline_access";

// ═══════════════════════════════════════════
//  1. AUTENTICAÇÃO
// ═══════════════════════════════════════════

async function loadCachedToken() {
  if (!existsSync(TOKEN_CACHE)) return null;
  try {
    const data = JSON.parse(await readFile(TOKEN_CACHE, "utf-8"));
    if (data.refresh_token) return data;
  } catch {}
  return null;
}

async function saveCachedToken(data) {
  await writeFile(TOKEN_CACHE, JSON.stringify({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
  }, null, 2));
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
      scope: SCOPES,
    }).toString(),
  });

  const data = await res.json();
  if (data.error) return null;
  return data;
}

async function deviceCodeLogin() {
  // 1. Solicitar device code
  console.log("\n  Iniciando login via Device Code...\n");

  const codeRes = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/devicecode`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      scope: SCOPES,
    }).toString(),
  });

  const codeData = await codeRes.json();

  if (codeData.error) {
    console.error("Erro ao solicitar device code:", codeData.error_description);
    process.exit(1);
  }

  // 2. Mostrar instruções
  console.log("  ┌─────────────────────────────────────────────────┐");
  console.log("  │                                                 │");
  console.log(`  │  Acesse: ${codeData.verification_uri.padEnd(38)}│`);
  console.log(`  │  Código: ${codeData.user_code.padEnd(38)}│`);
  console.log("  │                                                 │");
  console.log("  └─────────────────────────────────────────────────┘");
  console.log("\n  Aguardando login...\n");

  // 3. Polling até o usuário logar
  const interval = codeData.interval || 5;
  const expiresAt = Date.now() + (codeData.expires_in * 1000);

  while (Date.now() < expiresAt) {
    await new Promise((r) => setTimeout(r, interval * 1000));

    const tokenRes = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        client_id: CLIENT_ID,
        device_code: codeData.device_code,
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.access_token) {
      console.log("  Login realizado com sucesso!\n");
      return tokenData;
    }

    if (tokenData.error === "authorization_pending") continue;
    if (tokenData.error === "slow_down") { await new Promise((r) => setTimeout(r, 5000)); continue; }

    console.error("Erro:", tokenData.error_description);
    process.exit(1);
  }

  console.error("Tempo expirado. Execute novamente.");
  process.exit(1);
}

async function getAccessToken() {
  // Tentar refresh token salvo
  const cached = await loadCachedToken();

  if (cached?.refresh_token) {
    // Token ainda válido?
    if (cached.expires_at && cached.expires_at > Date.now() + 60000) {
      console.log("Usando token em cache (válido)");
      return cached.access_token;
    }

    // Tentar refresh
    console.log("Renovando token...");
    const refreshed = await refreshAccessToken(cached.refresh_token);
    if (refreshed) {
      await saveCachedToken(refreshed);
      console.log("Token renovado!");
      return refreshed.access_token;
    }

    console.log("Refresh token expirado. Necessário login novamente.");
  }

  // Primeiro login ou refresh expirado
  const tokenData = await deviceCodeLogin();
  await saveCachedToken(tokenData);
  return tokenData.access_token;
}

// ═══════════════════════════════════════════
//  2. DOWNLOAD DO ARQUIVO
// ═══════════════════════════════════════════

async function downloadFile(token) {
  const siteUrl = new URL(SHAREPOINT_SITE_URL || "https://synviagroup.sharepoint.com/sites/GerenciamentodeProjetos");
  const hostname = siteUrl.hostname;
  const sitePath = siteUrl.pathname;

  console.log("Buscando site...");
  const siteRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${hostname}:${sitePath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const siteData = await siteRes.json();
  if (siteData.error) {
    console.error("Erro ao acessar site:", siteData.error.message);
    if (siteData.error.code === "accessDenied") {
      console.log("Sem permissão. Verifique se sua conta tem acesso ao site SharePoint.");
    }
    process.exit(1);
  }
  console.log(`Site: ${siteData.displayName}`);

  console.log("Buscando NEW_BD.xlsm...");
  const searchRes = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${siteData.id}/drive/root/search(q='NEW_BD')`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const searchData = await searchRes.json();

  const file = searchData.value?.find((f) => f.name.includes("NEW_BD"));
  if (!file) { console.error("Arquivo não encontrado."); process.exit(1); }
  console.log(`Encontrado: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);

  console.log("Baixando...");
  const dlUrl = file["@microsoft.graph.downloadUrl"];
  const fileRes = await fetch(dlUrl);
  const buffer = Buffer.from(await fileRes.arrayBuffer());

  const localPath = join(ROOT, "NEW_BD.xlsm");
  await writeFile(localPath, buffer);
  console.log(`Salvo: ${localPath}`);
  return localPath;
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
    const filePath = await downloadFile(token);

    console.log("\nProcessando Excel...");
    const wb = XLSX.readFile(filePath);

    const entregaveis = extractEntregaveis(wb);
    const financeiro = extractFinanceiro(wb);

    await writeFile(join(ROOT, "src/data/entregaveis.json"), JSON.stringify(entregaveis));
    await writeFile(join(ROOT, "src/data/financeiro.json"), JSON.stringify(financeiro));

    console.log(`Entregáveis: ${entregaveis.length} registros`);
    console.log(`Financeiro: ${financeiro.length} registros`);
    console.log("\nSincronização concluída!");
  } catch (error) {
    console.error("Erro:", error.message);
    process.exit(1);
  }
}

main();
