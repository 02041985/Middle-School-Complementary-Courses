// Student lesson access and marking.
//   GET  /api/student?key=ART7.A1_0                -> lesson without answers (only if assigned to the student)
//   POST /api/student {key, kind, answers[]}   -> marks practice or test, records the attempt
const { sb, userOf, tokenOf, lessonByKey, readBody } = require("./_auth");
const { markItem, rule, levelFor } = require("./_grade");

const isOpen = it => it.type !== "mc" && rule(it.q, it.answer != null ? it.answer : it.a).t === "open";

async function assignmentFor(token, key) {
  const r = await sb(token, `/rest/v1/pb_assignments?lesson_key=eq.${encodeURIComponent(key)}&open=eq.true&select=id,class_id,title,code,test_open&limit=1`);
  return r.ok && Array.isArray(r.body) && r.body[0] ? r.body[0] : null;
}

module.exports = async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  const token = tokenOf(req);
  const user = await userOf(token);
  if (!user) return res.status(401).json({ error: "Sign in again." });

  const body = req.method === "POST" ? readBody(req) : {};
  const key = String((req.method === "GET" ? req.query.key : body.key) || "");
  const L = lessonByKey(key);
  if (!L) return res.status(404).json({ error: "Lesson not found." });
  const asg = await assignmentFor(token, key);
  if (!asg) return res.status(403).json({ error: "Your teacher hasn't opened this lesson for you." });
  const b = L.body;

  if (req.method === "GET") {
    return res.status(200).json({
      key, code: L.code, i: L.i, title: asg.title, classId: asg.class_id, testOpen: asg.test_open,
      objective: b.objective, iCan: b.iCan, successCriteria: b.successCriteria, hook: b.hook,
      vocabulary: b.vocabulary, examples: b.examples, study: b.study || null,
      practice: b.practice.map(p => ({ q: p.q, level: p.level, open: isOpen(p) })),
      test: { title: L.test.title, items: L.test.items.map(t => ({ type: t.type, q: t.q, options: t.options, level: t.level, open: isOpen(t) })) }
    });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Use GET or POST." });

  const kind = body.kind === "test" ? "test" : "practice";
  if (kind === "test" && !asg.test_open) return res.status(403).json({ error: "Your teacher has closed this test." });
  const items = kind === "test" ? L.test.items : b.practice.map(p => ({ type: "short", q: p.q, answer: p.a }));
  const answers = Array.isArray(body.answers) ? body.answers.map(a => (a == null ? "" : String(a).slice(0, 300))) : [];
  const marks = items.map((it, ix) => markItem(it, answers[ix]));
  const counted = marks.filter(m => m !== null);
  const score = counted.filter(Boolean).length, total = counted.length;
  const pct = total ? Math.round((100 * score) / total) : 0;
  const level = kind === "test" ? levelFor(pct) : null;

  const rec = await sb(token, "/rest/v1/rpc/pb_record_attempt", {
    method: "POST",
    body: JSON.stringify({
      p_secret: process.env.GRADER_SECRET || "", p_class: asg.class_id, p_key: key, p_kind: kind,
      p_score: score, p_total: total, p_level: level, p_detail: { answers, marks }
    })
  });
  if (!rec.ok) {
    const msg = (rec.body && rec.body.message) || "Your answers couldn't be saved. Try again.";
    return res.status(/already/i.test(msg) ? 409 : 400).json({ error: msg });
  }
  return res.status(200).json({
    kind, score, total, pct, level,
    results: items.map((it, ix) => ({
      correct: marks[ix],
      ...(kind === "practice" ? { answer: it.answer } : {})
    }))
  });
};
