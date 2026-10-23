// Lesson writing endpoint. Requires a signed-in Supabase user; calls the Claude API with the
// server-side ANTHROPIC_API_KEY and returns the parsed JSON the page asked for.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://zbvicgxsstbebcgykitm.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable__pkhBsx_5OB0TDRaCJZKTA_OUv_0f_3";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

function parseJSON(text) {
  try { return JSON.parse(text); } catch (e) {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch (e) {} }
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch (e) {} }
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "method", error: "Use POST." });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ code: "no_key", error: "Lesson writing isn't set up yet. Add ANTHROPIC_API_KEY in the Vercel project's environment variables, then redeploy." });
  }

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ code: "not_signed", error: "Sign in again to write lessons." });
  const who = await fetch(SUPABASE_URL + "/auth/v1/user", { headers: { apikey: SUPABASE_KEY, authorization: "Bearer " + token } });
  if (!who.ok) return res.status(401).json({ code: "not_signed", error: "Your session has expired. Sign in again to write lessons." });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body || "{}"); } catch (e) { body = {}; } }
  const prompt = String((body && body.prompt) || "").slice(0, 20000);
  if (!prompt) return res.status(400).json({ code: "bad_request", error: "Missing prompt." });

  let r, j;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { authorization: "Bearer " + apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 8000, messages: [{ role: "user", content: prompt }] })
    });
    j = await r.json();
  } catch (e) {
    return res.status(502).json({ code: "upstream", error: "Couldn't reach the Claude API. Try again in a moment." });
  }
  if (!r.ok) {
    const code = r.status === 429 ? "rate_limited" : r.status === 401 ? "bad_key" : "upstream";
    const error = r.status === 401 ? "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in Vercel."
      : r.status === 429 ? "The Claude API is busy or the usage limit was reached. Try again shortly."
      : "Claude API error: " + ((j && j.error && j.error.message) || r.status);
    return res.status(502).json({ code, error });
  }
  const text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  const data = parseJSON(text);
  if (!data) return res.status(502).json({ code: "invalid_json", error: "The lesson came back in an unexpected format. Try again." });
  return res.status(200).json({ data });
};
