// Teacher-only lesson content (includes answers). GET /api/lesson?code=ART7.A1
const { userOf, roleOf, tokenOf, lessonFile } = require("./_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET." });
  const token = tokenOf(req);
  if (!(await userOf(token))) return res.status(401).json({ error: "Sign in again." });
  if ((await roleOf(token)) !== "teacher") return res.status(403).json({ error: "Lesson answers are for teacher accounts only." });
  const f = lessonFile(String(req.query.code || ""));
  if (!f) return res.status(404).json({ error: "No built-in lessons for that outcome." });
  res.setHeader("cache-control", "private, max-age=300");
  return res.status(200).json(f);
};
