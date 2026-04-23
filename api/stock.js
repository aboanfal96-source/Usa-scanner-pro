export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbol = 'SPY', range = '3mo', interval = '1d', prepost = 'false' } = req.query;

  // US stocks — no .SR suffix
  const sym = symbol.replace('.SR', '');

  const h = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Referer': 'https://finance.yahoo.com/',
  };

  for (const host of ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com']) {
    try {
      const url = `${host}/v8/finance/chart/${sym}?range=${range}&interval=${interval}&includePrePost=${prepost}`;
      const r = await fetch(url, { headers: h });
      if (!r.ok) continue;
      const d = await r.json();
      if (!d?.chart?.result?.[0]) continue;
      res.setHeader('Cache-Control', 's-maxage=300,stale-while-revalidate=600');
      return res.status(200).json(d);
    } catch(e) { continue; }
  }

  return res.status(503).json({ error: 'unavailable' });
}
