/**
 * Vercel Cron Job — executa a cada 1 hora
 * Chama /api/data?fresh=1 para forçar refresh dos dados do SharePoint,
 * garantindo que o cache CDN seja renovado periodicamente.
 *
 * Configurado em vercel.json: schedule "0 * * * *"
 */

export default async function handler(req, res) {
  // Proteção: só aceita chamadas do Vercel Cron
  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    // Chama a própria API de dados com fresh=1 para renovar o cache
    const baseUrl = `https://${req.headers.host}`;
    const response = await fetch(`${baseUrl}/api/data?fresh=1`);

    if (!response.ok) {
      throw new Error(`API retornou ${response.status}`);
    }

    const data = await response.json();

    console.log(`[CRON] Sync concluído — ${data.entregaveis?.length || 0} entregáveis, ${data.financeiro?.length || 0} financeiro`);

    res.status(200).json({
      ok: true,
      syncedAt: data.syncedAt,
      entregaveis: data.entregaveis?.length || 0,
      financeiro: data.financeiro?.length || 0,
    });
  } catch (error) {
    console.error("[CRON] Erro:", error.message);
    res.status(500).json({ error: error.message });
  }
}
