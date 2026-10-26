// Online formal quizzes and summative tests (assessment tracker).
//   POST /api/quiz {quiz, answers[]} -> marks the student's answers against the key held in Supabase and records
//   the attempt; the proficiency level then appears in the teacher's assessment tracker automatically.
// Multiple-choice questions are marked against the key. Short answers are marked against the accepted answers
// ("accept"), or by the subject's own marking rules (numbers in Mathematics); anything else is left for the teacher.
const { sb, userOf, tokenOf, readBody } = require("./_auth");
const { markItem, levelFor } = require("./_grade");

const norm = s => String(s == null ? "" : s).toLowerCase().normalize("NFKD")
  .replace(/[ً-ٰٟـ]/g, "")                // Arabic short vowels and tatweel
  .replace(/[آأإٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
  .replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}.\-\/ ]/gu, " ").replace(/\s+/g, " ").trim();

function mark(item, answer) {
  if (item.type === "mc") return answer != null && String(answer) === String(item.answer);
  const given = norm(answer);
  if (Array.isArray(item.accept) && item.accept.length) {
    if (!given) return false;
    return item.accept.some(a => { const k = norm(a); return k && (given === k || (k.length > 3 && given.includes(k))); });
  }
  try { return markItem(item, answer); } catch (e) { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const token = tokenOf(req);
  if (!(await userOf(token))) return res.status(401).json({ error: "Sign in again." });
  const body = readBody(req);
  const quiz = String(body.quiz || "");
  if (!/^[0-9a-f-]{36}$/i.test(quiz)) return res.status(400).json({ error: "Unknown assessment." });

  const key = await sb(token, "/rest/v1/rpc/pb_quiz_key", { method: "POST", body: JSON.stringify({ p_secret: process.env.GRADER_SECRET || "", p_quiz: quiz }) });
  if (!key.ok || !Array.isArray(key.body)) return res.status(403).json({ error: (key.body && key.body.message) || "This assessment is not open for you." });
  const items = key.body;
  const answers = Array.isArray(body.answers) ? body.answers.map(a => (a == null ? "" : String(a).slice(0, 500))) : [];
  const marks = items.map((it, ix) => mark(it, answers[ix]));
  const counted = marks.filter(m => m !== null);
  const score = counted.filter(Boolean).length, total = counted.length;
  const pct = total ? Math.round((100 * score) / total) : 0;
  const level = total ? levelFor(pct) : null;

  const rec = await sb(token, "/rest/v1/rpc/pb_record_quiz", {
    method: "POST",
    body: JSON.stringify({ p_secret: process.env.GRADER_SECRET || "", p_quiz: quiz, p_score: score, p_total: total, p_level: level, p_detail: { answers, marks } })
  });
  if (!rec.ok) {
    const msg = (rec.body && rec.body.message) || "Your answers couldn't be saved. Try again.";
    return res.status(/already/i.test(msg) ? 409 : 400).json({ error: msg });
  }
  return res.status(200).json({
    score, total, pct, level,
    results: items.map((it, ix) => ({ correct: marks[ix], answer: it.answer != null ? it.answer : (Array.isArray(it.accept) ? it.accept[0] : null) }))
  });
};
