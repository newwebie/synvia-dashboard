/**
 * Extrai dados do arquivo local NEW_BD.xlsm (ou NEW_BD (2).xlsm)
 * Uso: node scripts/extract-local.js [caminho_do_arquivo]
 *
 * Se nenhum caminho for informado, procura NEW_BD.xlsm na raiz do projeto.
 */

import { writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Encontrar o arquivo
let filePath = process.argv[2];
if (!filePath) {
  const candidates = ["NEW_BD.xlsm", "NEW_BD (2).xlsm"];
  for (const c of candidates) {
    const p = join(ROOT, c);
    if (existsSync(p)) { filePath = p; break; }
  }
}

if (!filePath || !existsSync(filePath)) {
  console.error("Arquivo não encontrado. Uso: node scripts/extract-local.js [caminho]");
  process.exit(1);
}

console.log(`Lendo: ${filePath}`);

function excelDate(val) {
  if (!val || typeof val !== "number") return "";
  const d = new Date((val - 25569) * 86400000);
  return String(d.getUTCDate()).padStart(2, "0") + "/" + String(d.getUTCMonth() + 1).padStart(2, "0") + "/" + d.getUTCFullYear();
}
function excelYear(val) { if (!val || typeof val !== "number") return null; return new Date((val - 25569) * 86400000).getUTCFullYear(); }
function excelMonth(val) { if (!val || typeof val !== "number") return null; return new Date((val - 25569) * 86400000).getUTCMonth() + 1; }

const wb = XLSX.readFile(filePath);

// Entregáveis
const ws = wb.Sheets["Entregáveis"];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
const rows = data.slice(5);
const entregaveis = [];
for (const r of rows) {
  const codigo = (r[4] || "").toString().trim();
  const pat = (r[1] || "").toString().trim();
  if (!codigo && !pat) continue;
  let sp = (r[49] || "").toString().trim().replace(/^\d+\.\s*/, "");
  entregaveis.push({
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

// Financeiro
const wsF = wb.Sheets["Financeiro"];
const dataF = XLSX.utils.sheet_to_json(wsF, { header: 1 });
const financeiro = [];
for (const r of dataF.slice(6)) {
  const pat = (r[1] || "").toString().trim();
  if (!pat) continue;
  financeiro.push({
    keyAccount: (r[0] || "").toString().trim(), patrocinador: pat,
    projeto: (r[2] || "").toString().trim(), statusFaturamento: (r[3] || "").toString().trim(),
    rve: (r[4] || "").toString().trim(), qtdeParcelas: (r[6] || "").toString().trim(),
    tipo: (r[7] || "").toString().trim(), parcelaPendente: typeof r[8] === "number" ? r[8] : 0,
    totalContrato: typeof r[11] === "number" ? r[11] : 0,
    valorParcela: typeof r[12] === "number" ? r[12] : 0,
    pctFaturado: typeof r[13] === "number" ? r[13] : 0,
  });
}

await writeFile(join(ROOT, "src/data/entregaveis.json"), JSON.stringify(entregaveis));
await writeFile(join(ROOT, "src/data/financeiro.json"), JSON.stringify(financeiro));

console.log(`Entregáveis: ${entregaveis.length} registros`);
console.log(`Financeiro: ${financeiro.length} registros`);
console.log("Extração concluída!");
