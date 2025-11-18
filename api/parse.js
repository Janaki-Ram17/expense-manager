// api/parse.js
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const input = req.body?.input;
    if (!input) return res.status(400).json({ error: "Missing input" });

    const OPENAI = process.env.OPENAI_API_KEY;
    const GEMINI = process.env.GEMINI_API_KEY;

    if (!OPENAI && !GEMINI) {
      console.error("No API key found (OPENAI_API_KEY or GEMINI_API_KEY)");
      return res.status(500).json({ error: "Missing API key on server" });
    }

    let url, headers, payload;

    // ----- OPENAI MODE -----
    if (OPENAI) {
      url = "https://api.openai.com/v1/responses";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI}`
      };
      payload = {
        model: "gpt-4o-mini",
        input,
        temperature: 0,
        max_output_tokens: 600
      };
    }
    // ----- GEMINI MODE -----
    else {
      url = "https://api.google.com/v1/responses";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GEMINI}`
      };
      payload = {
        model: "gemini-1.5-pro",
        input,
        temperature: 0,
        max_output_tokens: 600
      };
    }

    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error("Upstream error:", upstream.status, text);
      return res.status(502).json({
        error: "Upstream API error",
        status: upstream.status,
        message: text
      });
    }

    // Try return JSON
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      return res.status(200).send(text);
    }

  } catch (err) {
    console.error("Server failed:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      detail: err.message
    });
  }
}
