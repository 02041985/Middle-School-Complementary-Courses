// Shared helpers for the API functions: Supabase calls made as the signed-in user, and lesson files.

const SUPABASE_URL = process.env.SUPABASE_URL || "https://zbvicgxsstbebcgykitm.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable__pkhBsx_5OB0TDRaCJZKTA_OUv_0f_3";

const tokenOf = req => String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");

async function sb(token, pathAndQuery, init = {}) {
  const r = await fetch(SUPABASE_URL + pathAndQuery, {
    ...init,
    headers: { apikey: SUPABASE_KEY, authorization: "Bearer " + token, "content-type": "application/json", ...(init.headers || {}) }
  });
  const text = await r.text();
  let body = null; try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }
  return { ok: r.ok, status: r.status, body };
}

async function userOf(token) {
  if (!token) return null;
  const r = await sb(token, "/auth/v1/user");
  return r.ok && r.body && r.body.id ? r.body : null;
}

// Teachers only see answers for the subjects the administrator approved them for.
const PB_APP = "complementary_ms";
async function roleOf(token) {
  const r = await sb(token, "/rest/v1/rpc/pb_app_role", { method: "POST", body: JSON.stringify({ p_app: PB_APP }) });
  return r.ok ? r.body : "none";
}

const LESSONS = require("./_lessons/all.js");
// Outcomes look like ART7.A1, FSL8.C1 or ETH.B1: course, a dot, unit letter, outcome number.
const CODE = "(?:(?:ART|DR|MU|IM|CTF|EOE|FSL|SPA|CHI)[789]|ETH)\\.[A-D][1-4]";
function lessonFile(code) {
  if (!new RegExp("^" + CODE + "$").test(code)) return null;
  return Object.prototype.hasOwnProperty.call(LESSONS, code) ? LESSONS[code] : null;
}
function lessonByKey(key) {
  const m = new RegExp("^(" + CODE + ")_(\\d{1,2})$").exec(String(key || ""));
  if (!m) return null;
  const f = lessonFile(m[1]);
  return f ? f.lessons.find(l => l.i === +m[2]) || null : null;
}

function readBody(req) {
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b || "{}"); } catch (e) { b = {}; } }
  return b || {};
}

module.exports = { sb, userOf, roleOf, tokenOf, lessonFile, lessonByKey, readBody };
