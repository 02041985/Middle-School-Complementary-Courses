// Reads a teacher's uploaded assessment (PDF, image or the text of a Word document) with Claude and returns its
// questions tagged by level, an answer key where one can be worked out, and a four-level proficiency rubric
// (EX, PR, AD, LM) the teacher uses when recording levels in the assessment tracker.
//   POST /api/analyze {kind, context, name, mediaType, data (base64) | text}
const { userOf, roleOf, tokenOf, readBody } = require("./_auth");
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

function parseJSON(text) {
  try { return JSON.parse(text); } catch (e) {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch (e) {} }
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch (e) {} }
  return null;
}
const IMG = ["image/png", "image/jpeg", "image/webp", "image/gif"];

module.exports = async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Reading uploads isn't set up yet. Add ANTHROPIC_API_KEY in the Vercel project, then redeploy." });
  const token = tokenOf(req);
  if (!(await userOf(token))) return res.status(401).json({ error: "Sign in again." });
  if ((await roleOf(token)) !== "teacher") return res.status(403).json({ error: "Only teachers of this subject can analyze uploads." });

  const b = readBody(req);
  const kind = ["informal", "formal", "summative"].includes(b.kind) ? b.kind : "formal";
  const context = String(b.context || "").slice(0, 6000);
  const name = String(b.name || "upload").slice(0, 200);
  const media = String(b.mediaType || "");
  let fileBlock;
  if (typeof b.text === "string" && b.text.trim()) fileBlock = { type: "text", text: "Text of the uploaded file \"" + name + "\":\n\n" + b.text.slice(0, 60000) };
  else if (media === "application/pdf" && b.data) fileBlock = { type: "document", source: { type: "base64", media_type: "application/pdf", data: String(b.data) } };
  else if (IMG.includes(media) && b.data) fileBlock = { type: "image", source: { type: "base64", media_type: media, data: String(b.data) } };
  else return res.status(400).json({ error: "Upload a PDF, a Word document or a photo (PNG or JPG)." });

  const prompt = `You are an experienced teacher and assessment specialist. A teacher uploaded the ${kind} assessment above for this class.
${context}

Read the whole assessment carefully. Then return ONLY a JSON object, no other text:
{"title":"a short title for the assessment",
 "method":"what kind of task it is, for example Quiz, Practice task, Exit ticket, Worksheet, Project, Lab, Presentation",
 "summary":"one or two sentences on what it assesses and which outcomes it covers",
 "questions":[{"type":"mc" or "short" or "open","q":"the question as written","options":["A) ...","B) ..."] (mc only),"answer":"the correct option text exactly as in options (mc), or the correct answer (short); omit if it can't be worked out","accept":["accepted short answers, each one word, number or short phrase"] (short only),"level":"Basic" or "Intermediate" or "Challenge","marks":number of marks if shown}],
 "rubric":{"4":"Excellent (EX): what a student at this level shows on THIS task","3":"Proficient (PR): ...","2":"Adequate (AD): ...","1":"Limited (LM): ..."},
 "levelGuide":"how to turn a student's result on this task into a level, for example by score bands or by which questions they answered correctly",
 "autoMarkable": true if every question is multiple choice or has a clear short answer that can be marked automatically, otherwise false,
 "notes":"anything the teacher should check, such as unclear questions, missing answers or questions that do not match the outcomes"}
Use "open" for questions that need the teacher's judgement (explanations, extended writing, drawings, performances). Work out every answer yourself and check it. Write the rubric in plain language a teacher can use while marking. Use the same language as the assessment for questions and answers.`;

  let r, j;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { authorization: "Bearer " + apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 8000, messages: [{ role: "user", content: [fileBlock, { type: "text", text: prompt }] }] })
    });
    j = await r.json();
  } catch (e) { return res.status(502).json({ error: "Couldn't reach the Claude API. Try again in a moment." }); }
  if (!r.ok) return res.status(502).json({ error: r.status === 429 ? "The Claude API is busy. Try again shortly." : "Claude API error: " + ((j && j.error && j.error.message) || r.status) });
  const data = parseJSON((j.content || []).filter(x => x.type === "text").map(x => x.text).join(""));
  if (!data || !Array.isArray(data.questions)) return res.status(502).json({ error: "The analysis came back in an unexpected format. Try again." });
  return res.status(200).json({ data });
};
