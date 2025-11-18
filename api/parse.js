// Node 18+ / Vercel Serverless function
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  try {
    const { input } = req.body || {};
    if (!input) return res.status(400).json({ error: 'Missing input' });

    const openaiRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input,
        temperature: 0.0,
        max_output_tokens: 600
      })
    });

    const json = await openaiRes.json();
    res.status(openaiRes.status).json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'proxy error' });
  }
}
