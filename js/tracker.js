// Assessment tracker and lesson resources for the planbooks.
// Tracker: one informal assessment per lesson (exit ticket, observation or mini-whiteboards), two or three formal
// assessments per unit (quiz, practice task or the teacher's own) and one summative assessment per unit, each with a
// proficiency level per student (EX 4, PR 3, AD 2, LM 1). Formal and summative assessments can be generated (taken
// online and marked automatically) or uploaded (read by Claude, which tags questions by level and writes a rubric;
// the teacher records levels or turns the upload into an online quiz).
// Lesson resources: PowerPoint slides, a printable worksheet and exit-ticket cards for every lesson, plus the
// teacher's own uploaded slides and files per lesson.
(function () {
  const P = () => window.PB_PLATFORM;
  const SB = () => P()?.sb;
  const LV = { 4: "EX", 3: "PR", 2: "AD", 1: "LM" };
  const LVN = { 4: "Excellent", 3: "Proficient", 2: "Adequate", 1: "Limited" };
  const METHODS = {
    informal: ["Exit ticket", "Observation", "Mini-whiteboards"],
    formal: ["Quiz", "Practice task"],
    summative: ["Unit test", "Project", "Performance task"]
  };
  const DEFAULT_RUBRIC = {
    4: "Excellent: in-depth, confident understanding; applies the learning to new or complex situations with accuracy and clear explanations.",
    3: "Proficient: solid understanding; completes the task accurately with only minor errors that do not affect the result.",
    2: "Adequate: basic understanding; completes familiar parts of the task, with errors or gaps; needs some support.",
    1: "Limited: beginning understanding; needs significant support; errors interfere with the result."
  };
  const TK = { cfg: { informal_mode: "outcome" }, list: null, loading: false, ref: null, students: [], items: {}, marks: {}, quizzes: {}, attempts: {}, panel: null, view: "table", unit: "all", busy: "", err: "", files: {}, filesLoading: {} };
  window.PB_TRACKER = TK;
  const tkEsc = v => (typeof esc === "function" ? esc(v) : String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));
  const say = m => (typeof toast === "function" ? toast(m) : console.log(m));
  const rerender = () => { if (typeof render === "function") render(); };
  const ICO = {
    up: "M12 20V9M7 14l5-5 5 5M5 4h14",
    slides: "M3 4h18v12H3zM8 20h8M12 16v4",
    sheet: "M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4",
    ticket: "M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    x: "M6 6l12 12M18 6L6 18"
  };
  const ti = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICO[n]}"/></svg>`;
  const icn = n => (typeof ic === "function" ? ic(n) : "");

  // ---------- curriculum helpers (every planbook defines SOS, SO and CN) ----------
  // Each outcome is a unit: its informal check (after its lessons, on the review day), its formal assessment
  // (after the outcome is finished) and its level. Outcomes are shown grouped by strand. Summative assessments cover
  // the outcomes the teacher chooses (or a summative day from the weekly plan) and sit after the last one they cover.
  const allSOS = () => (typeof SOS !== "undefined" ? SOS : []);
  const courseName = k => { try { if (typeof CN === "function") { const n = CN(isNaN(+k) ? k : +k); if (n && n !== "undefined") return n; } } catch (e) {} try { if (typeof COURSES !== "undefined" && COURSES[k]) return COURSES[k].name; } catch (e) {} return isNaN(+k) ? k : (+k === 0 ? "Kindergarten" : "Grade " + k); };
  const courseSos = course => allSOS().filter(s => String(s.grade) === String(course));
  const strandsOf = course => { const out = []; courseSos(course).forEach(s => { let u = out.find(x => x.key === String(s.sk)); if (!u) out.push(u = { key: String(s.sk), title: s.strand || String(s.sk), sub: s.sub || "", sos: [] }); u.sos.push(s); });
    // two strands with the same name (for example two Patterns and Relations strands) get their sub-strand too
    const seen = {}; out.forEach(u => (seen[u.title] = (seen[u.title] || 0) + 1));
    out.forEach(u => { if (seen[u.title] > 1) u.title = u.sub && !u.sub.includes(u.title) ? `${u.title}: ${u.sub}` : `${u.title} (${u.key})`; });
    return out; };
  const soOf = code => allSOS().find(s => s.code === code);
  const outcomeUnit = so => ({ key: so.code, title: `${so.code} ${so.title}`, sos: [so] });
  const SUM = "_S";  // summative assessments are stored under this unit key, one slot each
  const FSLOTS = ["F1", "F2", "F3"];
  const coveredSos = (c, it) => { const cv = it?.covers; return Array.isArray(cv) && cv.length ? courseSos(c.course).filter(so => cv.includes(so.code)) : []; };
  const sumUnit = (c, it) => ({ key: SUM, title: it?.title || "Summative", sos: coveredSos(c, it) });
  const codesText = codes => { const all = allSOS().map(s => s.code), cs = [...new Set(codes)].sort((a, b) => all.indexOf(a) - all.indexOf(b)), ix = cs.map(c => all.indexOf(c));
    return cs.length > 2 && ix.every((v, k) => !k || v === ix[k - 1] + 1) ? `${cs[0]}–${cs[cs.length - 1]}` : cs.join(", "); };
  const summatives = c => Object.values(TK.items).filter(it => it.unit === SUM && it.class_ref === c.ref);
  const lastCode = (c, it) => { const sos = coveredSos(c, it); return sos.length ? sos[sos.length - 1].code : null; };
  // the weekly plan's dates for this outcome: review day (informal check) and check-in day (formal assessment)
  const planDate = (code, type) => { try { if (typeof sessions !== "function" || !S.plan || !(S.plan.sos || []).includes(code)) return "";
    const l = sessions(S.plan).filter(s => s.code === code), hit = type === "informal" ? (l.filter(s => s.type === "review").pop() || l.filter(s => s.type === "lesson").pop()) : l.find(s => s.type === "quiz");
    return hit ? iso(hit.date) : ""; } catch (e) { return ""; } };
  // columns for one outcome (unit), then the summatives whose last outcome it is
  const outcomeCols = (c, so) => {
    const out = [];
    if (TK.cfg.informal_mode === "lesson") (so.lessons || []).forEach((t, i) => out.push({ u: so.code, slot: `L${i}`, kind: "informal", label: `L${i + 1}`, title: t }));
    else out.push({ u: so.code, slot: "I", kind: "informal", label: so.code, title: `Review: ${so.title}`, date: planDate(so.code, "informal") });
    FSLOTS.forEach((sl, n) => { if (!n || TK.items[so.code + "|" + sl]) out.push({ u: so.code, slot: sl, kind: "formal", label: n ? `${so.code} · ${n + 1}` : so.code, title: `Formal assessment: ${so.title}`, date: !n ? planDate(so.code, "formal") : "" }); });
    summatives(c).filter(it => lastCode(c, it) === so.code).sort((a, b) => String(a.plan_date || a.created_at).localeCompare(String(b.plan_date || b.created_at)))
      .forEach(it => out.push({ u: SUM, slot: it.slot, kind: "summative", label: "Summative", title: it.title, range: codesText(it.covers || []) }));
    return out;
  };
  const colFind = (c, u, slot) => { if (u === SUM) { const it = TK.items[SUM + "|" + slot]; return { u: SUM, slot, kind: "summative", label: "Summative", title: it?.title || "Summative" }; } const so = soOf(u); return so ? outcomeCols(c, so).find(x => x.slot === slot) : null; };
  const isArabic = s => /[؀-ۿ]/.test(String(s || ""));
  const appKey = () => P()?.app || "";
  const classApp = c => (c.subject || "math") === "math" ? (+c.grade >= 10 ? "maths_hs" : "maths") : c.subject;

  // ---------- data ----------
  async function loadList() {
    if (TK.loading) return; TK.loading = true; TK.err = "";
    const out = [];
    try {
      const u = P()?.getUser?.();
      if (u && SB()) {
        const { data, error } = await SB().from("pb_classes").select("id,name,grade,subject,course,section").eq("teacher_id", u.id).order("created_at");
        if (error) throw error;
        (data || []).filter(c => classApp(c) === appKey()).forEach(c => out.push({ ref: "pt:" + c.id, id: c.id, name: c.name + (c.section ? ` (${c.section})` : ""), course: String(c.course || c.grade), grade: c.grade, online: true }));
      }
    } catch (e) { TK.err = "Couldn't load your online classes. Refresh to try again."; }
    try { (S.classes || []).forEach(c => out.push({ ref: "mb:" + c.id, id: c.id, name: c.name, course: String(c.grade), online: false, students: c.students || [] })); } catch (e) {}
    TK.list = out; TK.loading = false;
    if (!TK.ref && out.length) await selectClass(out[0].ref); else rerender();
  }
  const cur = () => (TK.list || []).find(c => c.ref === TK.ref) || null;
  async function selectClass(ref) {
    TK.ref = ref; TK.cfg = { informal_mode: "outcome" }; TK.items = {}; TK.marks = {}; TK.quizzes = {}; TK.attempts = {}; TK.panel = null; TK.unit = "all"; TK.students = []; TK.busy = "load"; rerender();
    const c = cur(); if (!c) { TK.busy = ""; return rerender(); }
    try {
      if (c.online) {
        const { data } = await SB().from("pb_enrollments").select("student_id,display_name").eq("class_id", c.id);
        TK.students = (data || []).map(e => ({ ref: e.student_id, name: e.display_name || "Student" })).sort((a, b) => a.name.localeCompare(b.name));
      } else TK.students = (c.students || []).map(s => ({ ref: String(s.id), name: s.name }));
      TK.cfg = { informal_mode: "outcome" };
      const { data: cfg } = await SB().from("pb_tracker_classes").select("informal_mode").eq("class_ref", c.ref);
      if (cfg && cfg[0]) TK.cfg = { ...TK.cfg, ...cfg[0] };
      const { data: items } = await SB().from("pb_tracker_items").select("*").eq("class_ref", c.ref);
      (items || []).forEach(it => { TK.items[it.unit + "|" + it.slot] = it; });
      const ids = (items || []).map(i => i.id);
      if (ids.length) {
        const { data: ms } = await SB().from("pb_tracker_marks").select("item_id,student_ref,level,source,note").in("item_id", ids);
        (ms || []).forEach(m => { (TK.marks[m.item_id] ||= {})[m.student_ref] = m; });
      }
      if (c.online) {
        const { data: qs } = await SB().from("pb_quizzes").select("id,title,kind,unit,open,items,created_at").eq("class_id", c.id);
        (qs || []).forEach(q => { TK.quizzes[q.id] = q; });
        const qids = (qs || []).map(q => q.id);
        if (qids.length) {
          const { data: at } = await SB().from("pb_quiz_attempts").select("quiz_id,student_id,score,total,level").in("quiz_id", qids);
          (at || []).forEach(a => { (TK.attempts[a.quiz_id] ||= []).push(a); });
        }
      }
    } catch (e) { TK.err = "Couldn't load this class's tracker. Refresh to try again."; }
    TK.busy = ""; rerender();
  }
  const defaultsFor = (kind, slotInfo) => ({
    method: METHODS[kind][0],
    title: slotInfo?.title || (kind === "informal" ? "Informal check" : kind === "summative" ? "Summative" : "Formal assessment")
  });
  // grade for school-wide charts: the online class grade, otherwise the number in the course code (KG courses are grade 0)
  const gradeOf = c => { if (c.grade != null && !isNaN(+c.grade)) return +c.grade; const m = String(c.course || "").match(/\d+/); return m ? +m[0] : /K/.test(String(c.course || "")) ? 0 : null; };
  async function ensureItem(unit, slot, kind, slotInfo) {
    const k = unit + "|" + slot; if (TK.items[k]) return TK.items[k];
    const c = cur(); const d = defaultsFor(kind, slotInfo);
    const { data, error } = await SB().from("pb_tracker_items").insert({ app: appKey(), class_ref: c.ref, course: c.course, unit, slot, kind, method: d.method, title: d.title, unit_title: unit === SUM ? (slotInfo?.title || "Summative") : (soOf(unit) ? outcomeUnit(soOf(unit)).title : unit), grade: gradeOf(c) }).select().single();
    if (error) { say("Couldn't save. Check your connection and try again."); throw error; }
    TK.items[k] = data; return data;
  }
  async function updateItem(it, patch) {
    if (it.unit === SUM && patch.title) patch = { ...patch, unit_title: patch.title };  // management shows the summative by its name
    Object.assign(it, patch, { updated_at: new Date().toISOString() });
    const { error } = await SB().from("pb_tracker_items").update({ ...patch, updated_at: it.updated_at }).eq("id", it.id);
    if (error) say("Couldn't save. Try again.");
  }
  async function setMark(it, sref, level) {
    const m = (TK.marks[it.id] ||= {});
    if (!level) { delete m[sref]; await SB().from("pb_tracker_marks").delete().eq("item_id", it.id).eq("student_ref", sref); return; }
    m[sref] = { item_id: it.id, student_ref: sref, level: +level, source: "manual" };
    const { error } = await SB().from("pb_tracker_marks").upsert({ item_id: it.id, student_ref: sref, level: +level, source: "manual", updated_at: new Date().toISOString() }, { onConflict: "item_id,student_ref" });
    if (error) say("Couldn't save the level. Try again.");
  }
  const levelOf = (unit, slot, sref) => { const it = TK.items[unit + "|" + slot]; return it ? TK.marks[it.id]?.[sref] || null : null; };
  const avg = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  // outcome level: summatives that cover it (average), otherwise its formal assessments, then its informal checks
  function outcomeLevel(c, code, sref) {
    const sm = summatives(c).filter(it => (it.covers || []).includes(code)).map(it => TK.marks[it.id]?.[sref]).filter(Boolean).map(m => m.level);
    if (sm.length) return { v: Math.round(avg(sm)), from: "summative" };
    const so = soOf(code); if (!so) return null; const cols = outcomeCols(c, so);
    const f = cols.filter(x => x.kind === "formal").map(x => levelOf(x.u, x.slot, sref)).filter(Boolean).map(m => m.level);
    if (f.length) return { v: Math.round(avg(f)), from: "formal" };
    const i = cols.filter(x => x.kind === "informal").map(x => levelOf(x.u, x.slot, sref)).filter(Boolean).map(m => m.level);
    return i.length ? { v: Math.round(avg(i)), from: "informal" } : null;
  }


  // ---------- weekly plan link: summative and formal days the teacher added in Plan settings ----------
  const shortDate = d => { try { return new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }); } catch (e) { return d; } };
  const planEventsFor = (codes, kind) => { try { const ev = (typeof S !== "undefined" && S.plan && Array.isArray(S.plan.events)) ? S.plan.events : [];
    return ev.filter(e => (e.kind === "summative" || e.kind === "formal") && (!kind || e.kind === kind) && (e.outcomes || []).some(c => codes.includes(c))).sort((a, b) => a.date < b.date ? -1 : 1); } catch (e) { return []; } };
  const linked = e => Object.values(TK.items).some(it => it.plan_date === e.date && it.class_ref === TK.ref);
  async function linkPlan(c, e, toSlot) {
    const codes = courseSos(c.course).map(so => so.code), outc = (e.outcomes || []).filter(x => codes.includes(x));
    if (!outc.length) return null;
    if (e.kind === "formal") {
      const last = outc.sort((a, b) => codes.indexOf(a) - codes.indexOf(b))[outc.length - 1];
      const free = FSLOTS.find(x => { const it = TK.items[last + "|" + x]; return !it || (!it.plan_date && !it.quiz_id && !Object.keys(TK.marks[it.id] || {}).length); });
      if (!free) { say(`${last} already has three formal assessments. Clear one first.`); return null; }
      const it = await ensureItem(last, free, "formal", { title: e.title });
      await updateItem(it, { title: String(e.title || it.title).slice(0, 120), plan_date: e.date });
      return { u: last, s: free, k: "formal" };
    }
    const slot = toSlot || "P" + e.date.replace(/-/g, "");
    const it = await ensureItem(SUM, slot, "summative", { title: e.title });
    await updateItem(it, { covers: outc, title: String(e.title || it.title).slice(0, 120), plan_date: e.date });
    return { u: SUM, s: slot, k: "summative" };
  }

  // ---------- page ----------
  window.rTracker = function () {
    const head = (typeof ph === "function") ? ph("Assessment tracker", "Each outcome is a unit: an informal check after its lessons (the review day), a formal assessment once the outcome is finished, and summative assessments on the outcomes you choose. A proficiency level for each student.") : "<h1>Assessment tracker</h1>";
    if (!P()) return head + `<div class="card"><div class="empty"><p>The assessment tracker works on the school website, where your classes and students are saved.</p></div></div>`;
    if (typeof S !== "undefined" && S.storeReady === false) return head + `<div class="card"><div class="card-b row"><span class="spinner"></span>Loading your classes…</div></div>`;
    if (TK.list === null) { loadList(); return head + `<div class="card"><div class="card-b row"><span class="spinner"></span>Loading your classes…</div></div>`; }
    if (!TK.list.length) return head + `<div class="card"><div class="empty"><h2>No classes yet</h2><p>Create an online class on the Students tab (students join with your class group or code), or a class in the markbook. Then come back to track assessments.</p><div class="row" style="justify-content:center;margin-top:12px"><button class="btn" data-act="tab" data-t="students">Go to Students</button><button class="btn ghost" data-act="tab" data-t="marks">Go to Markbook</button></div></div></div>`;
    const c = cur();
    const strands = c ? strandsOf(c.course) : [];
    const shown = TK.unit === "all" ? strands : strands.filter(u => u.key === TK.unit);
    return head + `<div class="stack" style="gap:16px">
      <div class="card"><div class="card-b row tk-bar">
        <label class="f">Class<select data-tk="class">${TK.list.map(x => `<option value="${tkEsc(x.ref)}" ${x.ref === TK.ref ? "selected" : ""}>${tkEsc(x.name)} · ${tkEsc(courseName(x.course))}${x.online ? "" : " (markbook)"}</option>`).join("")}</select></label>
        <label class="f">Strand<select data-tk="unit"><option value="all">All strands</option>${strands.map(u => `<option value="${tkEsc(u.key)}" ${u.key === TK.unit ? "selected" : ""}>${tkEsc(u.title)}</option>`).join("")}</select></label>
        <label class="f">Informal checks<select data-tk="imode"><option value="outcome" ${TK.cfg.informal_mode !== "lesson" ? "selected" : ""}>One per outcome (review day)</option><option value="lesson" ${TK.cfg.informal_mode === "lesson" ? "selected" : ""}>One per lesson</option></select></label>
        <div class="seg" role="tablist" style="margin-left:auto"><button class="btn ${TK.view === "table" ? "" : "ghost"} sm" data-tk="view" data-v="table">Tracker</button><button class="btn ${TK.view === "charts" ? "" : "ghost"} sm" data-tk="view" data-v="charts">${icn("chart")}Charts</button></div>
      </div>
      ${c && !c.online ? `<div class="card-b small muted" style="padding-top:0">This markbook class has no online students, so levels are entered by hand. Use an online class (Students tab) to give quizzes online and fill levels automatically.</div>` : ""}</div>
      ${TK.err ? `<p class="note">${tkEsc(TK.err)}</p>` : ""}
      ${TK.busy === "load" ? `<div class="card"><div class="card-b row"><span class="spinner"></span>Loading…</div></div>` :
        !TK.students.length ? `<div class="card"><div class="empty"><p>No students in ${tkEsc(c?.name || "this class")} yet. ${c?.online ? "Students join with the class group or class code." : "Add students in the markbook."}</p></div></div>` :
        TK.view === "charts" ? charts(c, strands, shown) : shown.map(u => strandTable(c, u)).join("")}
      ${legend()}
    </div>${panel()}`;
  };
  const legend = () => `<p class="xs muted">EX Excellent · PR Proficient · AD Adequate · LM Limited. <b>auto</b> = filled from an online quiz or test (you can change it). Dates come from your weekly plan. Outcome level = the summative results that cover the outcome (their average), otherwise the formal assessment, then the informal check.</p>`;
  function cell(s, st) {
    const it = TK.items[s.u + "|" + s.slot], m = it ? TK.marks[it.id]?.[st.ref] : null, v = m?.level || "";
    return `<td class="tk-c ${v ? "lv" + v : ""} k-${s.kind}"><select data-tk="mark" data-u="${tkEsc(s.u)}" data-s="${tkEsc(s.slot)}" data-st="${tkEsc(st.ref)}" aria-label="${tkEsc(st.name)}, ${tkEsc(s.u === SUM ? s.title : s.u + " " + s.label)}">
      <option value="" ${!v ? "selected" : ""}>–</option>${[4, 3, 2, 1].map(l => `<option value="${l}" ${+v === l ? "selected" : ""}>${LV[l]}</option>`).join("")}</select>${m?.source === "auto" ? `<span class="tk-auto">auto</span>` : ""}</td>`;
  }
  const levelCell = (c, code, st) => { const ul = outcomeLevel(c, code, st.ref); return `<td class="tk-c tk-sum ${ul ? "lv" + ul.v : ""}" data-lu="${tkEsc(code)}">${ul ? `<b>${LV[ul.v]}</b><span class="tk-auto">${ul.from}</span>` : "–"}</td>`; };
  function colHead(s) {
    const it = TK.items[s.u + "|" + s.slot], meth = it?.method || METHODS[s.kind][0];
    const src = it?.source === "generated" ? "Generated" : it?.source === "uploaded" ? "Uploaded" : "";
    const q = it?.quiz_id && TK.quizzes[it.quiz_id], date = it?.plan_date || s.date;
    return `<th class="tk-h k-${s.kind}"><button class="tk-hb" data-tk="open" data-u="${tkEsc(s.u)}" data-s="${tkEsc(s.slot)}" data-k="${s.kind}" title="${tkEsc(s.title || s.label)}"><span class="tk-kind">${s.kind === "informal" ? (TK.cfg.informal_mode === "lesson" ? "Lesson check" : "Informal") : s.kind === "formal" ? "Formal" : "Summative"}</span><b>${tkEsc(s.kind === "summative" ? (s.range || "Summative") : s.label)}</b><span class="tk-meth">${tkEsc(meth)}${src ? " · " + src : ""}${q ? (q.open ? " · open" : " · closed") : ""}</span>${date ? `<span class="tk-meth">${tkEsc(shortDate(date))}</span>` : ""}</button></th>`;
  }
  function strandTable(c, u) {
    const groups = u.sos.map(so => ({ so, cols: outcomeCols(c, so) }));
    const top = groups.map(g => `<th class="tk-g" colspan="${g.cols.length + 1}"><span class="code">${tkEsc(g.so.code)}</span> ${tkEsc(g.so.title)}</th>`).join("");
    const head = groups.map(g => g.cols.map(colHead).join("") + `<th class="tk-h tk-lh"><div class="tk-hb" style="cursor:default"><span class="tk-kind">${tkEsc(g.so.code)}</span><b>Level</b></div></th>`).join("");
    const rows = TK.students.map(st => `<tr><th class="tk-st">${tkEsc(st.name)}</th>${groups.map(g => g.cols.map(s => cell(s, st)).join("") + levelCell(c, g.so.code, st)).join("")}</tr>`).join("");
    const codes = u.sos.map(so => so.code), chips = planEventsFor(codes).filter(e => !linked(e) && (e.kind !== "summative" || codes.includes((e.outcomes || []).filter(x => courseSos(c.course).some(so => so.code === x)).sort((a, b) => allSOS().findIndex(s => s.code === a) - allSOS().findIndex(s => s.code === b)).pop())));
    return `<section class="card"><div class="card-h"><h2>${tkEsc(u.title)}</h2><div class="row" style="gap:6px"><button class="btn ghost sm" data-tk="adds" data-u="${tkEsc(u.key)}">${icn("plus")}Add a summative</button></div></div>
      ${chips.length ? `<div class="card-b tk-plan"><span class="small muted">In your weekly plan:</span>${chips.map(e => `<button class="btn ghost sm" data-tk="planadd" data-date="${tkEsc(e.date)}">${icn("plus")}${tkEsc(e.title)} · ${tkEsc(shortDate(e.date))}</button>`).join("")}</div>` : ""}
      <div class="tablewrap"><table class="tk-table"><thead><tr><th class="tk-st"></th>${top}</tr><tr><th class="tk-st">Student</th>${head}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  // ---------- assessment panel ----------
  function panelSlot() { if (!TK.panel) return null; const c = cur(); if (!c) return null;
    if (TK.panel.u === SUM) { const it = TK.items[SUM + "|" + TK.panel.s]; return { c, u: sumUnit(c, it), s: colFind(c, SUM, TK.panel.s) }; }
    const so = soOf(TK.panel.u); if (!so) return null; const s = colFind(c, so.code, TK.panel.s) || { u: so.code, slot: TK.panel.s, kind: TK.panel.k, label: TK.panel.s }; return { c, u: outcomeUnit(so), s }; }
  function panel() {
    const P0 = panelSlot(); if (!P0) return "";
    const { c, u, s } = P0, it = TK.items[u.key + "|" + s.slot], kind = s.kind;
    const meth = it?.method || METHODS[kind][0], custom = !METHODS[kind].includes(meth);
    const q = it?.quiz_id ? TK.quizzes[it.quiz_id] : null, an = it?.analysis || null;
    const att = q ? (TK.attempts[q.id] || []) : [];
    const rub = an?.rubric || DEFAULT_RUBRIC;
    const busy = TK.busy;
    return `<div class="tk-scrim" data-tk="close"></div><aside class="tk-panel" role="dialog" aria-label="${tkEsc(s.label)}">
      <div class="row between"><div><span class="eyebrow">${kind === "summative" ? "Summative" : tkEsc(u.title) + " · " + kind}</span><h2 style="margin:2px 0 0">${tkEsc(kind === "summative" ? (it?.title || "Summative") : s.label)}</h2>${kind !== "summative" && s.title ? `<p class="small muted" style="margin:2px 0 0">${tkEsc(s.title)}</p>` : ""}${(it?.plan_date || s.date) ? `<p class="small" style="margin:2px 0 0">In your weekly plan: <b>${tkEsc(shortDate(it?.plan_date || s.date))}</b></p>` : ""}</div><button class="btn quiet sm" data-tk="close" aria-label="Close">${ti("x")}</button></div>
      <div class="stack" style="gap:12px">
        <label class="f">How is it assessed?<select data-tk="method">${METHODS[kind].map(m => `<option ${m === meth ? "selected" : ""}>${m}</option>`).join("")}<option value="__other" ${custom ? "selected" : ""}>Other (write your own)…</option></select></label>
        ${custom || TK.panel.other ? `<label class="f">Your own name for it<input data-tk="methodtext" maxlength="80" value="${tkEsc(custom ? meth : "")}" placeholder="e.g. Lab report, Gallery walk"></label>` : ""}
        <label class="f">Title<input data-tk="title" maxlength="120" value="${tkEsc(it?.title || defaultsFor(kind, s).title)}"></label>
        ${kind === "summative" ? coversBox(c, it) : ""}
        ${kind === "formal" && s.slot !== "F3" && !TK.items[u.key + "|" + (s.slot === "F1" ? "F2" : "F3")] ? `<button class="btn ghost sm" data-tk="addf" data-u="${tkEsc(u.key)}" style="align-self:flex-start">${icn("plus")}Another formal assessment for ${tkEsc(u.key)}</button>` : ""}
      </div>
      ${kind !== "informal" ? `<div class="tk-sec"><h3>Use a generated ${kind === "summative" ? "unit test" : "quiz"}</h3>
        <p class="small muted">${kind === "summative" ? "At least 15 questions covering the outcomes ticked above," : `Up to 10 questions on ${tkEsc(u.key)},`} a mix of multiple choice and short answer. Students take it online and their levels fill in automatically.</p>
        ${!c.online ? `<p class="small note">Online quizzes need an online class (Students tab). For this markbook class, record levels by hand.</p>` :
          q ? quizBox(q, att) : `<button class="btn" data-tk="gen" ${busy ? "disabled" : ""}>${busy === "gen" ? `<span class="spinner"></span>Writing…` : `${icn("spark")}Generate ${kind === "summative" ? "unit test" : "quiz"}`}</button>`}
      </div>` : ""}
      <div class="tk-sec"><h3>Upload your own ${kind === "informal" ? "task" : kind === "summative" ? "assessment" : "quiz or task"}</h3>
        <p class="small muted">PDF, Word or a photo, up to 3 MB. Claude reads it, tags each question by level and writes a rubric for EX, PR, AD and LM.${kind !== "informal" && c.online ? " You can then turn it into an online quiz that marks itself." : ""}</p>
        ${it?.file_name ? `<p class="small">File: <b>${tkEsc(it.file_name)}</b> <button class="linkbtn" data-tk="getfile">Open</button></p>` : ""}
        <label class="btn ghost sm" style="cursor:pointer">${ti("up")}${it?.file_name ? "Replace file" : "Choose file"}<input type="file" data-tk="upload" accept=".pdf,.docx,.png,.jpg,.jpeg,.webp" hidden></label>
        ${busy === "up" ? `<p class="small row"><span class="spinner"></span>Reading the assessment…</p>` : ""}
        ${an ? analysisBox(an, c, q) : ""}
      </div>
      <div class="tk-sec"><h3>Proficiency guide${an?.rubric ? " for this task" : ""}</h3>
        <dl class="tk-rub">${[4, 3, 2, 1].map(l => `<div class="lv${l}"><dt>${LV[l]} · ${LVN[l]}</dt><dd>${tkEsc(rub[l] || rub[String(l)] || DEFAULT_RUBRIC[l])}</dd></div>`).join("")}</dl>
        ${an?.levelGuide ? `<p class="small"><b>Turning results into levels:</b> ${tkEsc(an.levelGuide)}</p>` : ""}
      </div>
      <div class="tk-sec"><h3>Quick fill</h3><p class="small muted">Give every student without a level the same level, then change the few who differ.</p>
        <div class="row" style="gap:6px">${[4, 3, 2, 1].map(l => `<button class="btn ghost sm" data-tk="fill" data-l="${l}">${LV[l]}</button>`).join("")}</div></div>
      ${it ? `<div class="tk-sec"><button class="btn quiet sm" data-tk="clear">${icn("trash")}Clear this assessment and its levels</button></div>` : ""}
    </aside>`;
  }
  function coversBox(c, it) {
    const cv = it?.covers || [], strands = strandsOf(c.course), plan = planEventsFor(courseSos(c.course).map(so => so.code), "summative").filter(e => e.date !== it?.plan_date);
    return `<fieldset class="tk-cov"><legend>Outcomes it covers</legend><span class="xs muted">The summative sits after the last outcome you tick and counts towards each ticked outcome's level. A generated test covers only these outcomes.</span>
      <div class="tk-covl">${strands.map(u => `<span class="xs muted" style="margin-top:4px">${tkEsc(u.title)}</span>${u.sos.map(so => `<label class="row small" style="gap:6px;flex-wrap:nowrap"><input type="checkbox" data-tk="cover" value="${tkEsc(so.code)}" ${cv.includes(so.code) ? "checked" : ""}><span style="min-width:0"><span class="code">${tkEsc(so.code)}</span> ${tkEsc(so.title)}</span></label>`).join("")}`).join("")}</div>
      ${plan.length ? `<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:4px"><span class="xs muted">Use a summative day from your weekly plan:</span>${plan.map(e => `<button class="btn ghost sm" data-tk="useplan" data-date="${tkEsc(e.date)}">${tkEsc(e.title)} · ${tkEsc(shortDate(e.date))}</button>`).join("")}</div>` : ""}</fieldset>`;
  }
  function quizBox(q, att) {
    const n = q.items.length, done = att.length, total = TK.students.length;
    return `<div class="stack" style="gap:8px"><div class="row" style="gap:8px;flex-wrap:wrap"><b>${tkEsc(q.title)}</b><span class="badge">${n} questions</span><span class="badge ${q.open ? "b-quiz" : ""}">${q.open ? "Open to students" : "Closed"}</span><span class="small muted">${done} of ${total} completed</span></div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-tk="qopen">${q.open ? "Close for students" : "Open for students"}</button><button class="btn ghost sm" data-tk="qview">${ti("eye")}${TK.panel.view ? "Hide questions" : "Questions and answers"}</button><button class="btn quiet sm" data-tk="gen" ${TK.busy ? "disabled" : ""}>${TK.busy === "gen" ? `<span class="spinner"></span>Writing…` : "Write a new one"}</button></div>
      ${TK.panel.view ? `<ol class="qs small">${q.items.map(x => `<li><div>${tkEsc(x.q)} <span class="lvl ${tkEsc(x.level || "")}">${tkEsc(x.level || "")}</span>${x.options ? `<div class="opts">${x.options.map(o => `<span>${tkEsc(o)}</span>`).join("")}</div>` : ""}<div class="ans">Answer: ${tkEsc(x.answer ?? (x.accept || []).join(" / "))}</div></div></li>`).join("")}</ol>` : ""}</div>`;
  }
  function analysisBox(an, c, q) {
    const qs = an.questions || [], auto = qs.filter(x => quizable(x)).length, open = qs.length - auto;
    return `<div class="stack" style="gap:8px;margin-top:8px"><p class="small"><b>${tkEsc(an.title || "Your assessment")}</b>${an.method ? " · " + tkEsc(an.method) : ""}</p>${an.summary ? `<p class="small" style="margin:0">${tkEsc(an.summary)}</p>` : ""}
      <details><summary class="small" style="cursor:pointer">${qs.length} questions, tagged by level</summary><ol class="qs small">${qs.map(x => `<li><div>${tkEsc(x.q)} <span class="lvl ${tkEsc(x.level || "")}">${tkEsc(x.level || "")}</span>${x.type === "open" ? ` <span class="badge">teacher marks</span>` : ""}${x.answer || x.accept ? `<div class="ans">Answer: ${tkEsc(x.answer || (x.accept || []).join(" / "))}</div>` : ""}</div></li>`).join("")}</ol></details>
      ${an.notes ? `<p class="small note" style="margin:0">${tkEsc(an.notes)}</p>` : ""}
      ${c.online && !q && auto ? `<button class="btn sm" data-tk="convert">Make it an online quiz (${auto} questions marked automatically${open ? `, ${open} left for you` : ""})</button>` : ""}</div>`;
  }
  const quizable = x => (x.type === "mc" && Array.isArray(x.options) && x.options.length >= 2 && x.answer) || (x.type === "short" && ((x.accept && x.accept.length) || x.answer));

  // ---------- generation and upload ----------
  function unitContext(c, u) {
    const sos = u.sos;
    return `Course: ${courseName(c.course)}. ${u.key === SUM ? "Summative assessment" : "Unit (outcome): " + u.title}.\nOutcomes it covers:\n${sos.map(so => `- ${so.code} ${so.title}: ${so.outcome || ""} Lessons: ${(so.lessons || []).join("; ")}`).join("\n")}`;
  }
  function languageHint(c, u) {
    const ar = u.sos.some(so => isArabic(so.title) || isArabic((so.lessons || []).join(" "))) || /^AR[AB]/.test(c.course);
    const kg = /KG$|K$/.test(c.course) || c.course === "0";
    let h = "";
    if (/^ARB/.test(c.course)) h += " This is Arabic B (non-native learners): write questions and answers in simple Modern Standard Arabic with full diacritics; short English instructions are allowed.";
    else if (ar) h += " Write every question, option and answer in correct Modern Standard Arabic.";
    if (kg) h += " These are Kindergarten children: the teacher reads each question aloud; keep questions very short and concrete, options one or two words.";
    return h;
  }
  async function generate() {
    const P0 = panelSlot(); if (!P0) return; const { c, u, s } = P0; const summ = s.kind === "summative";
    if (summ && !u.sos.length) return say("Tick the outcomes the summative covers first.");
    if (!P()?.sample) return say("Lesson writing isn't available here.");
    TK.busy = "gen"; rerender();
    const n = summ ? 18 : 10, mc = summ ? 12 : 6;
    const prompt = `You are an experienced teacher writing a ${summ ? "summative unit test" : "formal quiz"} that students take online.
${unitContext(c, u)}
Write exactly ${n} questions: ${mc} multiple choice and ${n - mc} short answer, ${summ ? "covering every outcome listed, " : "only on the outcomes listed, "}from Basic to Challenge (about 40% Basic, 40% Intermediate, 20% Challenge).${languageHint(c, u)}
Multiple choice: 4 options labelled "A) ", "B) ", "C) ", "D) "; "answer" is the full correct option exactly as written; one clearly correct answer and plausible distractors.
Short answer: the answer must be a single word, number or short phrase that can be marked automatically; list every acceptable form in "accept" (for numbers include equivalent forms).
Check every answer carefully. Plain text only: no LaTeX and no markdown.
Return ONLY JSON: {"title":"short title","items":[{"type":"mc","q":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"B) ...","level":"Basic","outcome":"code"},{"type":"short","q":"...","answer":"...","accept":["..."],"level":"Intermediate","outcome":"code"}]}`;
    try {
      const d = await P().sample.json(prompt);
      const items = cleanItems(d?.items || []).slice(0, n);
      if (items.length < (summ ? 15 : 5)) throw new Error("short");
      await saveQuiz(c, u, s, (d.title || (summ ? "Summative: " + codesText(u.sos.map(x => x.code)) : "Quiz: " + u.title)).slice(0, 200), items, "generated");
      say(summ ? "Unit test written. Open it for students when you're ready." : "Quiz written. Open it for students when you're ready.");
    } catch (e) { say(e?.userMessage || "Couldn't write it this time. Try again."); }
    TK.busy = ""; rerender();
  }
  function cleanItems(raw) {
    return raw.map(x => {
      if (!x || !x.q) return null;
      if (x.type === "mc" && Array.isArray(x.options) && x.options.length >= 2) {
        let opts = x.options.map(String), ans = String(x.answer || "");
        if (!opts.includes(ans)) { const L = (/^\s*([A-D])\b/i.exec(ans) || [])[1]; const hit = L ? opts.find(o => o.trim().toUpperCase().startsWith(L.toUpperCase())) : opts.find(o => o.replace(/^[A-D]\)\s*/, "").trim() === ans.replace(/^[A-D]\)\s*/, "").trim()); if (!hit) return null; ans = hit; }
        return { type: "mc", q: String(x.q), options: opts, answer: ans, level: x.level || "Basic", outcome: x.outcome || "" };
      }
      if (x.type === "short" || x.type === "open") {
        const accept = (Array.isArray(x.accept) ? x.accept : []).map(String).filter(Boolean);
        if (x.type === "short" && !accept.length && x.answer) accept.push(String(x.answer));
        if (!accept.length) return null;
        return { type: "short", q: String(x.q), answer: String(x.answer || accept[0]), accept, level: x.level || "Intermediate", outcome: x.outcome || "" };
      }
      return null;
    }).filter(Boolean);
  }
  async function saveQuiz(c, u, s, title, items, source) {
    const it = await ensureItem(u.key, s.slot, s.kind, s);
    const { data: q, error } = await SB().from("pb_quizzes").insert({ app: appKey(), class_id: c.id, course: c.course, unit: u.key, kind: s.kind, title, items, open: false }).select().single();
    if (error) throw error;
    TK.quizzes[q.id] = q;
    const patch = { quiz_id: q.id, source, title };
    if (source === "generated") patch.method = s.kind === "summative" ? "Unit test" : "Quiz";
    await updateItem(it, patch);
  }
  async function toggleQuiz() {
    const P0 = panelSlot(); const it = P0 && TK.items[P0.u.key + "|" + P0.s.slot]; const q = it && TK.quizzes[it.quiz_id]; if (!q) return;
    const { error } = await SB().from("pb_quizzes").update({ open: !q.open }).eq("id", q.id);
    if (error) return say("Couldn't change it. Try again.");
    q.open = !q.open; say(q.open ? "Open: students see it under Assessments on the student site." : "Closed for students."); rerender();
  }
  const b64 = file => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = no; r.readAsDataURL(file); });
  const loadScript = src => new Promise((ok, no) => { if (document.querySelector(`script[data-src="${src}"]`)) return ok(); const s = document.createElement("script"); s.src = src; s.dataset.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  async function docxText(file) {
    await loadScript("js/vendor/jszip.min.js");
    const zip = await window.JSZip.loadAsync(file);
    const xml = await zip.file("word/document.xml").async("string");
    return xml.replace(/<\/w:p>/g, "\n").replace(/<w:tab\/>/g, "\t").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
  }
  async function upload(file) {
    const P0 = panelSlot(); if (!P0 || !file) return; const { c, u, s } = P0;
    if (file.size > 3 * 1024 * 1024) return say("That file is over 3 MB. Save a smaller copy and try again.");
    const docx = /\.docx$/i.test(file.name), media = file.type || "";
    if (!docx && media !== "application/pdf" && !/^image\/(png|jpeg|webp)$/.test(media)) return say("Upload a PDF, a Word document (.docx) or a photo.");
    TK.busy = "up"; rerender();
    try {
      const it = await ensureItem(u.key, s.slot, s.kind, s);
      const uidv = P().getUser().id, path = `${uidv}/${it.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
      const { error: upErr } = await SB().storage.from("pb-uploads").upload(path, file, { upsert: true, contentType: media || undefined });
      if (upErr) throw new Error("upload");
      const body = { kind: s.kind, name: file.name, context: unitContext(c, u) + (s.title ? `\nLesson: ${s.title}` : "") };
      if (docx) body.text = await docxText(file); else { body.mediaType = media; body.data = await b64(file); }
      const { data: { session } } = await SB().auth.getSession();
      const r = await fetch("/api/analyze", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + session.access_token }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "analyze");
      const an = j.data;
      await updateItem(it, { file_path: path, file_name: file.name, analysis: an, source: it.quiz_id && TK.quizzes[it.quiz_id] ? it.source : "uploaded", title: (an.title || it.title || file.name).slice(0, 120), method: an.method && s.kind !== "informal" && !METHODS[s.kind].includes(it.method) ? an.method.slice(0, 80) : it.method });
      say("Read and rated. The rubric is below.");
    } catch (e) { say(e.message && e.message.length > 12 ? e.message : "Couldn't read that file. Try again or use a PDF."); }
    TK.busy = ""; rerender();
  }
  async function convert() {
    const P0 = panelSlot(); if (!P0) return; const { c, u, s } = P0; const it = TK.items[u.key + "|" + s.slot]; const an = it?.analysis; if (!an) return;
    const items = cleanItems((an.questions || []).filter(quizable));
    if (!items.length) return say("None of the questions can be marked automatically.");
    try { await saveQuiz(c, u, s, (an.title || it.title || "Uploaded assessment").slice(0, 200), items, "uploaded"); say(`Online quiz made with ${items.length} questions. Open it for students when you're ready.`); }
    catch (e) { say("Couldn't make the quiz. Try again."); }
    rerender();
  }
  async function getFile() {
    const P0 = panelSlot(); const it = P0 && TK.items[P0.u.key + "|" + P0.s.slot]; if (!it?.file_path) return;
    const { data, error } = await SB().storage.from("pb-uploads").createSignedUrl(it.file_path, 600);
    if (error || !data?.signedUrl) return say("Couldn't open the file.");
    window.open(data.signedUrl, "_blank", "noopener");
  }

  // ---------- charts ----------
  const COL = { 4: "var(--l4)", 3: "var(--l3)", 2: "var(--l2)", 1: "var(--l1)" };
  function dist(unit, slot) { const it = TK.items[unit + "|" + slot]; const d = { 1: 0, 2: 0, 3: 0, 4: 0 }; if (it) Object.values(TK.marks[it.id] || {}).forEach(m => { if (TK.students.some(s => s.ref === m.student_ref)) d[m.level]++; }); return d; }
  function stackBars(rows) {
    const W = 640, rh = 26, lw = 190, H = rows.length * rh + 30;
    if (!rows.length) return `<p class="small muted">No levels recorded yet.</p>`;
    return `<div class="tablewrap"><svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;min-width:420px" role="img" aria-label="Levels by assessment">
      ${rows.map((r, i) => { const tot = r.d[1] + r.d[2] + r.d[3] + r.d[4]; let x = lw; const y = i * rh + 4;
        return `<text x="${lw - 8}" y="${y + 15}" text-anchor="end" font-size="11" fill="currentColor">${tkEsc(r.label.slice(0, 30))}</text>` +
          [4, 3, 2, 1].map(l => { const w = tot ? (W - lw - 40) * r.d[l] / tot : 0; const s = w ? `<rect x="${x}" y="${y}" width="${w}" height="${rh - 8}" rx="3" style="fill:${COL[l]}"><title>${LV[l]}: ${r.d[l]}</title></rect>${w > 22 ? `<text x="${x + w / 2}" y="${y + 13}" text-anchor="middle" font-size="10" fill="#fff">${r.d[l]}</text>` : ""}` : ""; x += w; return s; }).join("") +
          `<text x="${W - 34}" y="${y + 15}" font-size="11" fill="currentColor">${tot}</text>`; }).join("")}
      <g transform="translate(${lw},${H - 10})">${[4, 3, 2, 1].map((l, k) => `<rect x="${k * 80}" y="-9" width="10" height="10" rx="2" style="fill:${COL[l]}"/><text x="${k * 80 + 14}" y="0" font-size="10" fill="currentColor">${LV[l]}</text>`).join("")}</g></svg></div>`;
  }
  // average level per outcome (unit) for informal, formal and summative assessments
  function groupBars(c, sos) {
    const kinds = [["informal", "Informal"], ["formal", "Formal"], ["summative", "Summative"]];
    const data = sos.map(so => ({ so, v: kinds.map(([k]) => { const xs = [];
      const cols = k === "summative" ? summatives(c).filter(it => (it.covers || []).includes(so.code)).map(it => ({ u: SUM, slot: it.slot })) : outcomeCols(c, so).filter(s => s.kind === k);
      cols.forEach(s => { const it = TK.items[s.u + "|" + s.slot]; if (it) Object.values(TK.marks[it.id] || {}).forEach(m => xs.push(m.level)); }); return avg(xs); }) }));
    if (!data.some(d => d.v.some(v => v != null))) return `<p class="small muted">No levels recorded yet.</p>`;
    data.splice(0, data.length, ...data.filter(d => d.v.some(v => v != null)));  // only outcomes with levels so far
    sos = data.map(d => d.so);
    const step = 92, W = Math.max(420, sos.length * step + 60), H = 236, base = 190, sc = v => (v / 4) * 160, bw = 20, cols = ["var(--accent)", "var(--l2)", "var(--l4)"];
    return `<div class="tablewrap"><svg viewBox="0 0 ${W} ${H}" width="${W}" style="max-width:none" role="img" aria-label="Average level by outcome">
      ${[1, 2, 3, 4].map(l => `<line x1="40" x2="${W - 10}" y1="${base - sc(l)}" y2="${base - sc(l)}" stroke="currentColor" stroke-opacity=".12"/><text x="34" y="${base - sc(l) + 4}" text-anchor="end" font-size="10" fill="currentColor">${LV[l]}</text>`).join("")}
      ${data.map((d, i) => { const x0 = 52 + i * step; return d.v.map((v, k) => v == null ? "" : `<rect x="${x0 + k * (bw + 4)}" y="${base - sc(v)}" width="${bw}" height="${sc(v)}" rx="3" style="fill:${cols[k]}"><title>${tkEsc(d.so.code)} ${kinds[k][1]}: ${v.toFixed(1)}</title></rect>`).join("") + `<text x="${x0 + 34}" y="${base + 16}" text-anchor="middle" font-size="10" fill="currentColor"><title>${tkEsc(d.so.code + " " + d.so.title)}</title>${tkEsc(d.so.code)}</text>`; }).join("")}
      <g transform="translate(52,${H - 8})">${kinds.map(([, n], k) => `<rect x="${k * 100}" y="-9" width="10" height="10" rx="2" style="fill:${cols[k]}"/><text x="${k * 100 + 14}" y="0" font-size="10" fill="currentColor">${n}</text>`).join("")}</g></svg></div>`;
  }
  function charts(c, strands, shown) {
    const sosShown = shown.flatMap(u => u.sos);
    const perStrand = shown.map(u => { const rows = u.sos.flatMap(so => outcomeCols(c, so).map(s => ({ label: s.kind === "summative" ? `Summative ${s.range || ""}` : `${s.kind === "formal" ? "Formal " + s.label : TK.cfg.informal_mode === "lesson" ? so.code + " " + s.label : "Informal " + s.label} (${TK.items[s.u + "|" + s.slot]?.method || METHODS[s.kind][0]})`, d: dist(s.u, s.slot) })));
      return `<section class="card"><div class="card-h"><h2>${tkEsc(u.title)}: levels by assessment</h2></div><div class="card-b">${stackBars(rows.filter(r => r.d[1] + r.d[2] + r.d[3] + r.d[4]))}</div></section>`; }).join("");
    const allSos = strands.flatMap(u => u.sos);
    const stu = TK.students.map(st => { const ls = allSos.map(so => outcomeLevel(c, so.code, st.ref)?.v).filter(Boolean); return { st, v: avg(ls), n: ls.length }; }).filter(x => x.v != null).sort((a, b) => a.v - b.v);
    const support = stu.filter(x => x.v < 2.5);
    return `<section class="card"><div class="card-h"><h2>Average level by outcome and assessment type</h2></div><div class="card-b">${groupBars(c, sosShown)}</div></section>
      ${perStrand}
      <section class="card"><div class="card-h"><h2>Students: overall level across outcomes</h2></div><div class="card-b">${stu.length ? `<div class="tk-bars">${stu.map(x => `<div class="row" style="gap:8px"><span class="small" style="width:160px;flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${tkEsc(x.st.name)}</span><span class="tk-meter"><i style="width:${(x.v / 4) * 100}%;background:${COL[Math.round(x.v)]}"></i></span><b class="small">${LV[Math.round(x.v)]}</b><span class="xs muted">${x.n} outcome${x.n === 1 ? "" : "s"}</span></div>`).join("")}</div>` : `<p class="small muted">No outcome levels yet.</p>`}
      ${support.length ? `<p class="note small" style="margin-top:12px"><b>Needs support (below Proficient overall):</b> ${support.map(x => tkEsc(x.st.name)).join(", ")}</p>` : ""}</div></section>`;
  }

  // ---------- events ----------
  document.addEventListener("change", async e => {
    const el = e.target.closest("[data-tk]"); if (!el) return; const a = el.dataset.tk;
    if (a === "class") return selectClass(el.value);
    if (a === "unit") { TK.unit = el.value; return rerender(); }
    if (a === "imode") {
      const c = cur(); TK.cfg.informal_mode = el.value === "outcome" ? "outcome" : "lesson"; rerender();
      const { error } = await SB().from("pb_tracker_classes").upsert({ teacher_id: P().getUser().id, class_ref: c.ref, informal_mode: TK.cfg.informal_mode, updated_at: new Date().toISOString() }, { onConflict: "teacher_id,class_ref" });
      say(error ? "Couldn't save that setting. Try again." : TK.cfg.informal_mode === "outcome" ? "One informal check after each outcome. Levels recorded per lesson are kept and come back if you switch again." : "One informal check after each lesson.");
      return;
    }
    if (a === "mark") {
      el.disabled = true;
      const c = cur(), s = colFind(c, el.dataset.u, el.dataset.s);
      try { const it = await ensureItem(s.u, s.slot, s.kind, s); await setMark(it, el.dataset.st, el.value); } catch (err) {}
      el.disabled = false; const td = el.closest("td"); if (td) td.className = "tk-c k-" + s.kind + (el.value ? " lv" + el.value : ""); td?.querySelector(".tk-auto")?.remove();
      // refresh the outcome level cells in this row
      el.closest("tr")?.querySelectorAll(".tk-sum[data-lu]").forEach(sc => { const ul = outcomeLevel(c, sc.dataset.lu, el.dataset.st); sc.className = "tk-c tk-sum" + (ul ? " lv" + ul.v : ""); sc.innerHTML = ul ? `<b>${LV[ul.v]}</b><span class="tk-auto">${ul.from}</span>` : "–"; });
      return;
    }
    const P0 = panelSlot(); if (!P0) return;
    if (a === "method") {
      if (el.value === "__other") { TK.panel.other = true; return rerender(); }
      const it = await ensureItem(P0.u.key, P0.s.slot, P0.s.kind, P0.s); TK.panel.other = false; await updateItem(it, { method: el.value }); return rerender();
    }
    if (a === "methodtext") { const v = el.value.trim(); if (!v) return; const it = await ensureItem(P0.u.key, P0.s.slot, P0.s.kind, P0.s); await updateItem(it, { method: v.slice(0, 80) }); return rerender(); }
    if (a === "title") { const it = await ensureItem(P0.u.key, P0.s.slot, P0.s.kind, P0.s); await updateItem(it, { title: el.value.trim().slice(0, 120) || it.title }); return; }
    if (a === "upload") return upload(el.files && el.files[0]);
    if (a === "cover") {
      const box = el.closest(".tk-cov"), ticked = [...box.querySelectorAll('[data-tk="cover"]:checked')].map(x => x.value);
      if (!ticked.length) { el.checked = true; return say("Tick at least one outcome."); }
      const it = await ensureItem(P0.u.key, P0.s.slot, P0.s.kind, P0.s), patch = { covers: ticked };
      if (/^Summative: /.test(it.title || "")) patch.title = "Summative: " + codesText(ticked);  // keep an automatic name in step
      await updateItem(it, patch); return rerender();
    }
  });
  document.addEventListener("click", async e => {
    const el = e.target.closest("[data-tk]"); if (!el || el.tagName === "SELECT" || el.tagName === "INPUT") return; const a = el.dataset.tk;
    if (a === "view") { TK.view = el.dataset.v; return rerender(); }
    if (a === "open") { TK.panel = { u: el.dataset.u, s: el.dataset.s, k: el.dataset.k }; return rerender(); }
    if (a === "close") { TK.panel = null; return rerender(); }
    if (a === "adds") {
      const c = cur(), u = strandsOf(c.course).find(x => x.key === el.dataset.u); if (!u) return;
      const slot = "S" + Date.now().toString(36), codes = u.sos.map(so => so.code);
      const it = await ensureItem(SUM, slot, "summative", { title: "Summative: " + codesText(codes) }); await updateItem(it, { covers: codes, title: "Summative: " + codesText(codes) });
      TK.panel = { u: SUM, s: slot, k: "summative" }; return rerender();
    }
    if (a === "planadd") { const c = cur(), e = planEventsFor(courseSos(c.course).map(so => so.code)).find(x => x.date === el.dataset.date); if (!e) return; const p = await linkPlan(c, e); if (p) { TK.panel = p; say("Added from your weekly plan."); } return rerender(); }
    if (a === "useplan") { const c = cur(), P1 = panelSlot(); if (!P1) return; const e = planEventsFor(courseSos(c.course).map(so => so.code), "summative").find(x => x.date === el.dataset.date); if (!e) return; await linkPlan(c, e, P1.s.slot); return rerender(); }
    if (a === "addf") { const code = el.dataset.u, sl = FSLOTS.find(x => !TK.items[code + "|" + x]); if (!sl) return; await ensureItem(code, sl, "formal", { title: "Formal assessment: " + (soOf(code)?.title || code) }); TK.panel = { u: code, s: sl, k: "formal" }; return rerender(); }
    if (a === "gen") return generate();
    if (a === "qopen") return toggleQuiz();
    if (a === "qview") { TK.panel.view = !TK.panel.view; return rerender(); }
    if (a === "convert") return convert();
    if (a === "getfile") return getFile();
    const P0 = panelSlot(); if (!P0) return;
    if (a === "fill") {
      const it = await ensureItem(P0.u.key, P0.s.slot, P0.s.kind, P0.s); const have = TK.marks[it.id] || {};
      const todo = TK.students.filter(s => !have[s.ref]);
      for (const st of todo) await setMark(it, st.ref, el.dataset.l);
      say(todo.length ? `${todo.length} students set to ${LV[el.dataset.l]}.` : "Everyone already has a level."); return rerender();
    }
    if (a === "clear") {
      const k = P0.u.key + "|" + P0.s.slot, it = TK.items[k]; if (!it) return;
      if (!el.dataset.sure) { el.dataset.sure = "1"; el.textContent = "Click again to clear it"; return; }
      const { error } = await SB().from("pb_tracker_items").delete().eq("id", it.id);
      if (error) return say("Couldn't clear it. Try again.");
      delete TK.items[k]; delete TK.marks[it.id]; TK.panel = null; say("Cleared."); return rerender();
    }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && TK.panel) { TK.panel = null; rerender(); } });

  // ---------- lesson resources ----------
  const lessonTitle = (so, i) => (so.lessons || [])[i] || so.title;
  window.lkButtons = function (so, i, L) {
    const key = so.code + "_" + i;
    if (P() && TK.files[key] === undefined && !TK.filesLoading[key]) loadFiles(key);
    const files = TK.files[key] || [];
    return `<div class="lk-row"><span class="eyebrow">Teaching resources</span>
      <button class="btn ghost sm" data-lk="pptx">${ti("slides")}Slides (PowerPoint)</button>
      <button class="btn ghost sm" data-lk="sheet">${ti("sheet")}Worksheet</button>
      <button class="btn ghost sm" data-lk="tickets">${ti("ticket")}Exit tickets</button>
      ${P() ? `<label class="btn ghost sm" style="cursor:pointer">${ti("up")}Upload my slides or files<input type="file" data-lk="up" accept=".ppt,.pptx,.key,.pdf,.doc,.docx,.odp,.png,.jpg,.jpeg" hidden></label>` : ""}
      ${files.length ? `<div class="lk-files">${files.map(f => `<span class="lk-file"><button class="linkbtn" data-lk="get" data-id="${f.id}">${tkEsc(f.file_name)}</button><button class="lk-x" data-lk="del" data-id="${f.id}" aria-label="Delete ${tkEsc(f.file_name)}">${ti("x")}</button></span>`).join("")}</div>` : ""}</div>`;
  };
  async function loadFiles(key) {
    TK.filesLoading[key] = true;
    try { const { data } = await SB().from("pb_lesson_files").select("id,file_name,file_path,kind,created_at").eq("app", appKey()).eq("lesson_key", key).order("created_at"); TK.files[key] = data || []; }
    catch (e) { TK.files[key] = []; }
    TK.filesLoading[key] = false; if (S.tab === "lessons") rerender();
  }
  const curLesson = () => { const so = SO[S.lesson.code], i = S.lesson.i; return { so, i, L: S.lessons[so.code + "_" + i] }; };
  async function saveFile(filename, data, type) {
    const cap = (typeof downloadsCap !== "undefined" && downloadsCap) || P()?.downloads;
    if (cap && typeof data === "string") { try { await cap.save({ filename, data }); say("Saved"); } catch (e) { if (e?.code !== "declined") say("The file couldn't be saved."); } return; }
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type: type || "text/html" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: filename }); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 3000); say("Saved");
  }
  const T = v => String(v ?? "").replace(/\s+/g, " ").trim();
  async function makePptx() {
    const { so, i, L } = curLesson(); if (!L) return say("Open or generate the lesson first.");
    say("Making the slides…");
    try { await loadScript("js/vendor/pptxgen.bundle.js"); } catch (e) { return say("Couldn't load the slide maker. Refresh and try again."); }
    const b = L.body || {}, title = lessonTitle(so, i), rtl = isArabic(title + (b.objective || "")), cs = getComputedStyle(document.documentElement);
    const hex = v => { const s = cs.getPropertyValue(v).trim(); if (/^#[0-9a-f]{6}$/i.test(s)) return s.slice(1); const m = /rgb\((\d+),\s*(\d+),\s*(\d+)/.exec(s); return m ? [m[1], m[2], m[3]].map(n => (+n).toString(16).padStart(2, "0")).join("") : "2A5FB4"; };
    const ACC = hex("--accent"), INK = "1F2933", SOFT = "F4F6F8";
    const pptx = new window.PptxGenJS(); pptx.layout = "LAYOUT_WIDE"; pptx.rtlMode = rtl; pptx.title = title;
    const al = rtl ? "right" : "left", font = rtl ? "Arial" : "Calibri", txt = { fontFace: font, color: INK, align: al, rtlMode: rtl, valign: "top" };
    const course = courseName(so.grade);
    const base = (heading) => { const s = pptx.addSlide(); s.background = { color: "FFFFFF" };
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.18, fill: { color: ACC }, line: { color: ACC } });
      s.addText(heading, { ...txt, x: 0.6, y: 0.4, w: 12.1, h: 0.8, fontSize: 30, bold: true, color: ACC });
      s.addText(`${course} · ${so.code} · ${title}`, { ...txt, x: 0.6, y: 7.0, w: 12.1, h: 0.35, fontSize: 11, color: "7B8794" });
      return s; };
    const bullets = (s, list, y = 1.4, size = 22) => s.addText(list.filter(Boolean).map(t => ({ text: T(t), options: { bullet: rtl ? { indent: 18 } : true, rtlMode: rtl, breakLine: true } })), { ...txt, x: 0.8, y, w: 11.8, h: 7.0 - y - 0.2, fontSize: size, paraSpaceAfter: 10 });
    // title
    { const s = pptx.addSlide(); s.background = { color: ACC };
      s.addText(course + " · " + so.code, { ...txt, x: 0.8, y: 1.6, w: 11.7, h: 0.6, fontSize: 20, color: "FFFFFF" });
      s.addText(title, { ...txt, x: 0.8, y: 2.3, w: 11.7, h: 2.2, fontSize: 44, bold: true, color: "FFFFFF", valign: "middle" });
      s.addText(so.title || "", { ...txt, x: 0.8, y: 4.6, w: 11.7, h: 0.8, fontSize: 22, color: "FFFFFF" }); }
    { const s = base(rtl ? "هدف الدرس" : "Learning goal"); s.addText(T(b.iCan || b.objective || ""), { ...txt, x: 0.8, y: 1.4, w: 11.7, h: 1.4, fontSize: 28, bold: true });
      if (b.successCriteria?.length) { s.addText(rtl ? "معايير النجاح" : "Success criteria", { ...txt, x: 0.8, y: 3.0, w: 11.7, h: 0.5, fontSize: 18, color: ACC, bold: true }); bullets(s, b.successCriteria, 3.6, 20); } }
    if (b.hook) { const s = base(rtl ? "لنبدأ" : "Let's begin"); s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.5, w: 11.7, h: 4.6, fill: { color: SOFT }, line: { color: SOFT }, rectRadius: 0.2 }); s.addText(T(b.hook), { ...txt, x: 1.1, y: 1.8, w: 11.1, h: 4.0, fontSize: 26, valign: "middle" }); }
    if (b.vocabulary?.length) { const s = base(rtl ? "المفردات" : "Key vocabulary"); const rows = b.vocabulary.slice(0, 8).map(v => [{ text: T(v.term), options: { bold: true, color: ACC, fontSize: 18 } }, { text: T(v.definition), options: { fontSize: 16 } }]);
      s.addTable(rtl ? rows.map(r => r.reverse()) : rows, { x: 0.8, y: 1.4, w: 11.7, colW: rtl ? [8.4, 3.3] : [3.3, 8.4], fontFace: font, color: INK, align: al, border: { type: "solid", color: "E1E5EA", pt: 1 }, fill: { color: "FFFFFF" }, rowH: 0.62 }); }
    const st = b.study || b.lab;
    if (st) { const s = base(T(st.title) || (rtl ? "النشاط" : "Activity")); const parts = [st.question || st.purpose, st.passage ? T(st.passage).slice(0, 700) : null];
      s.addText(parts.filter(Boolean).map(T).join("\n\n"), { ...txt, x: 0.8, y: 1.4, w: 11.7, h: 3.2, fontSize: 18 });
      const steps = st.steps || st.procedure; if (steps?.length) bullets(s, steps.slice(0, 6), 4.7, 16); }
    (b.examples || []).slice(0, 4).forEach((ex, k) => { const s = base((rtl ? "مثال " : "Example ") + (k + 1) + (ex.title ? ": " + T(ex.title) : ""));
      s.addText(T(ex.problem), { ...txt, x: 0.8, y: 1.4, w: 11.7, h: 1.4, fontSize: 24, bold: true });
      if (ex.steps?.length) bullets(s, ex.steps, 2.9, 18);
      s.addText((rtl ? "الإجابة: " : "Answer: ") + T(ex.answer), { ...txt, x: 0.8, y: 6.2, w: 11.7, h: 0.6, fontSize: 20, bold: true, color: ACC }); });
    const pr = b.practice || [];
    for (let k = 0; k < Math.min(pr.length, 9); k += 3) { const s = base((rtl ? "تدريب" : "Practice") + ` ${k / 3 + 1}`);
      s.addText(pr.slice(k, k + 3).map((q, j) => ({ text: `${k + j + 1}. ${T(q.q)}`, options: { breakLine: true, rtlMode: rtl } })), { ...txt, x: 0.8, y: 1.5, w: 11.7, h: 5.2, fontSize: 24, paraSpaceAfter: 24 });
      s.addNotes(pr.slice(k, k + 3).map((q, j) => `${k + j + 1}. ${T(q.a)}`).join("\n")); }
    if (b.misconceptions?.length) { const s = base(rtl ? "انتبه" : "Watch out for"); bullets(s, b.misconceptions, 1.4, 20); }
    { const s = base(rtl ? "بطاقة الخروج" : "Exit ticket"); bullets(s, (b.exitTicket && b.exitTicket.length ? b.exitTicket : (b.successCriteria || []).slice(0, 2)), 1.6, 28); }
    try { await pptx.writeFile({ fileName: `${so.code}-lesson-${i + 1}-slides.pptx` }); say("Slides saved"); } catch (e) { say("Couldn't save the slides."); }
  }
  function printable(title, inner) {
    const rtl = isArabic(title + inner);
    return `<!doctype html><html lang="${rtl ? "ar" : "en"}" dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${tkEsc(title)}</title><style>
      body{font-family:${rtl ? "'Noto Naskh Arabic',Arial" : "Arial"},sans-serif;max-width:800px;margin:24px auto;padding:0 16px;line-height:1.5;color:#1f2933}
      h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;border-bottom:1px solid #ccc;padding-bottom:3px;margin-top:22px}.meta{color:#666;font-size:13px}
      .line{border-bottom:1px solid #999;height:26px}.q{margin:12px 0}.lvl{font-size:11px;color:#666;border:1px solid #ccc;border-radius:8px;padding:0 6px;margin:0 6px}
      .cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}.card{border:2px dashed #999;border-radius:10px;padding:12px;min-height:220px;page-break-inside:avoid}
      .card h3{margin:0 0 6px;font-size:15px}.name{border-bottom:1px solid #999;margin-bottom:8px;font-size:12px;color:#666}.faces{font-size:22px;letter-spacing:8px}
      @media print{.noprint{display:none}}</style></head><body>${inner}</body></html>`;
  }
  function worksheet() {
    const { so, i, L } = curLesson(); if (!L) return say("Open or generate the lesson first.");
    const b = L.body || {}, title = lessonTitle(so, i), rtl = isArabic(title);
    const inner = `<h1>${tkEsc(title)}</h1><div class="meta">${tkEsc(courseName(so.grade))} · ${tkEsc(so.code)} · ${rtl ? "الاسم" : "Name"}: ____________________ ${rtl ? "التاريخ" : "Date"}: __________</div>
      <h2>${rtl ? "هدف الدرس" : "Learning goal"}</h2><p>${tkEsc(b.iCan || b.objective || "")}</p>
      ${b.vocabulary?.length ? `<h2>${rtl ? "المفردات" : "Key words"}</h2><ul>${b.vocabulary.map(v => `<li><b>${tkEsc(v.term)}</b>: ${tkEsc(v.definition)}</li>`).join("")}</ul>` : ""}
      <h2>${rtl ? "تدريب" : "Practice"}</h2>${(b.practice || []).map((q, k) => `<div class="q"><b>${k + 1}.</b> ${tkEsc(q.q)}<span class="lvl">${tkEsc(q.level || "")}</span><div class="line"></div><div class="line"></div></div>`).join("")}
      <h2>${rtl ? "كيف أبليت؟" : "How did I do?"}</h2><p>☐ ${rtl ? "أحتاج إلى مساعدة" : "I need help"} &nbsp; ☐ ${rtl ? "أتعلّم" : "I'm getting there"} &nbsp; ☐ ${rtl ? "فهمت" : "I've got it"} &nbsp; ☐ ${rtl ? "أستطيع أن أعلّم غيري" : "I can teach it"}</p>
      <h2 style="page-break-before:always">${rtl ? "الإجابات (للمعلّم)" : "Answers (teacher copy)"}</h2><ol>${(b.practice || []).map(q => `<li>${tkEsc(q.a)}</li>`).join("")}</ol>`;
    saveFile(`${so.code}-lesson-${i + 1}-worksheet.html`, printable(title, inner));
  }
  function tickets() {
    const { so, i, L } = curLesson(); if (!L) return say("Open or generate the lesson first.");
    const b = L.body || {}, title = lessonTitle(so, i), rtl = isArabic(title);
    const qs = (b.exitTicket && b.exitTicket.length ? b.exitTicket : (b.practice || []).filter(q => q.level === "Intermediate").slice(0, 2).map(q => q.q));
    const card = `<div class="card"><h3>${rtl ? "بطاقة الخروج" : "Exit ticket"}: ${tkEsc(title)}</h3><div class="name">${rtl ? "الاسم" : "Name"}:</div>${qs.map((q, k) => `<p><b>${k + 1}.</b> ${tkEsc(q)}</p><div class="line"></div>`).join("")}<p class="faces">☹ 😐 🙂 😀</p></div>`;
    saveFile(`${so.code}-lesson-${i + 1}-exit-tickets.html`, printable(title, `<p class="noprint meta">Print and cut: 6 cards per page.</p><div class="cards">${card.repeat(6)}</div>`));
  }
  async function uploadLessonFile(file) {
    const { so, i } = curLesson(); const key = so.code + "_" + i; if (!file) return;
    if (file.size > 10 * 1024 * 1024) return say("That file is over 10 MB. Save a smaller copy and try again.");
    say("Uploading…");
    const u = P().getUser(), path = `${u.id}/lessons/${appKey()}/${key}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const kind = /\.(pptx?|key|odp)$/i.test(file.name) ? "slides" : /\.(docx?|pdf)$/i.test(file.name) ? "worksheet" : "other";
    const { error } = await SB().storage.from("pb-uploads").upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) return say("Couldn't upload. Try again.");
    const { data, error: e2 } = await SB().from("pb_lesson_files").insert({ app: appKey(), lesson_key: key, kind, file_path: path, file_name: file.name.slice(0, 200), size_bytes: file.size }).select().single();
    if (e2) return say("Couldn't save the file. Try again.");
    (TK.files[key] ||= []).push(data); say("Uploaded"); rerender();
  }
  document.addEventListener("click", async e => {
    const el = e.target.closest("[data-lk]"); if (!el || el.tagName === "INPUT") return; const a = el.dataset.lk;
    if (a === "pptx") return makePptx();
    if (a === "sheet") return worksheet();
    if (a === "tickets") return tickets();
    const { so, i } = curLesson(); const key = so.code + "_" + i; const f = (TK.files[key] || []).find(x => x.id === el.dataset.id); if (!f) return;
    if (a === "get") { const { data } = await SB().storage.from("pb-uploads").createSignedUrl(f.file_path, 600); if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener"); else say("Couldn't open the file."); }
    if (a === "del") {
      if (!el.dataset.sure) { el.dataset.sure = "1"; el.title = "Click again to delete"; el.classList.add("sure"); return; }
      await SB().storage.from("pb-uploads").remove([f.file_path]);
      await SB().from("pb_lesson_files").delete().eq("id", f.id);
      TK.files[key] = TK.files[key].filter(x => x.id !== f.id); say("Deleted"); rerender();
    }
  });
  document.addEventListener("change", e => { const el = e.target.closest("[data-lk='up']"); if (el) uploadLessonFile(el.files && el.files[0]); });

  // open the tracker straight from a link ending in #tracker
  if (location.hash === "#tracker" && typeof S !== "undefined") { const go = () => { S.tab = "tracker"; rerender(); }; (P()?.ready || Promise.resolve()).then(go); }
})();
