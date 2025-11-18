import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end("Method Not Allowed");

  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: "Missing input" });

    // Gemini "Responses" endpoint
    const geminiRes = await fetch("https://api.google.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gemini-1.5-pro",   // you can pick any Gemini model
        input,
        temperature: 0,
        max_output_tokens: 600
      })
    });

    const data = await geminiRes.json();
    return res.status(geminiRes.status).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
