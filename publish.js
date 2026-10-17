// Funcție serverless Vercel: publică un HTML ca proiect nou pe <nume>.vercel.app
// Necesită variabila de mediu VERCEL_TOKEN (opțional VERCEL_TEAM_ID).
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Doar POST' });
  const token = process.env.VERCEL_TOKEN;
  if (!token) return res.status(500).json({ error: 'Lipsește VERCEL_TOKEN în Environment Variables.' });

  const { name, html } = req.body || {};
  if (!name || !html) return res.status(400).json({ error: 'Lipsesc name sau html.' });

  const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'app';
  const team = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : '';

  try {
    const r = await fetch(`https://api.vercel.com/v13/deployments${team}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: slug,
        target: 'production',
        files: [{ file: 'index.html', data: html }],
        projectSettings: { framework: null }
      })
    });
    const j = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: j.error?.message || 'Eroare Vercel' });
    res.status(200).json({ url: `https://${slug}.vercel.app`, deployment: `https://${j.url}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
