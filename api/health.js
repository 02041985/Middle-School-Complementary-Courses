// Health check: reports whether the Claude API key is configured and accepted.
// Uses the free model-list endpoint, so it costs nothing and reveals nothing about the key.
module.exports = async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const out = { ok: true, lessonWriting: { configured: !!apiKey, accepted: null, status: null } };
  if (apiKey) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/models?limit=1", {
        headers: { authorization: "Bearer " + apiKey, "anthropic-version": "2023-06-01" }
      });
      out.lessonWriting.accepted = r.ok;
      out.lessonWriting.status = r.status;
    } catch (e) { out.lessonWriting.status = "unreachable"; }
  }
  res.setHeader("cache-control", "no-store");
  res.status(200).json(out);
};
