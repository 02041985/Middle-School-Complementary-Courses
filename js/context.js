// Grade and group context for the planbook: one plan per grade and class group (A, B, C).
// Picking a grade anywhere (Curriculum, Weekly plan, this bar) switches the Curriculum, Weekly plan, Daily plan, Lessons
// and Plans folder to that grade; the group picks which of that grade's plans is open (8A, 8B and 8C keep their own
// outcomes, order, start weeks, assessment days, activities and folder details). School-wide settings (first day,
// teaching days, no-school dates, period length, review and assessment days on/off) stay shared.
(function () {
  if (typeof S === "undefined" || !S.plan) return;
  const PER = ["sos", "order", "pins", "akind", "akindDefault", "events", "spans", "folder"];
  const GROUPS = ["A", "B", "C"];
  const TABS = ["home", "curriculum", "week", "day", "lessons", "folder", "tracker", "marks", "analysis", "students"];
  const e_ = v => (typeof esc === "function" ? esc(v) : String(v ?? ""));
  const clone = v => JSON.parse(JSON.stringify(v));
  const keyOf = (g, grp) => `${g}@${grp || "A"}`;
  const conv = v => (typeof S.plan.grade === "number" && v !== "" && !isNaN(+v)) ? +v : v;
  const gradeName = g => { try { if (typeof CN === "function") { const n = CN(g); if (n && n !== "undefined") return n; } } catch (e) {} return isNaN(+g) ? String(g) : (+g === 0 ? "Kindergarten" : "Grade " + g); };
  const grades = () => { const all = [...new Set((typeof SOS !== "undefined" ? SOS : []).map(s => s.grade))]; return all.filter(g => typeof pbOk !== "function" || pbOk(g)); };
  const groupsFor = g => { const gs = window.PB_PLATFORM?.groups; if (!Array.isArray(gs)) return GROUPS; const mine = GROUPS.filter(x => gs.includes(`${g}@${x}`)); return mine.length ? mine : GROUPS; };
  const firstOf = g => (typeof gradeSOs === "function" ? gradeSOs(g) : SOS.filter(s => String(s.grade) === String(g)))[0];

  // keep the other pages on the plan's grade
  function syncPages() {
    const g = S.plan.grade, f = firstOf(g); if (!f) return;
    if (String(S.curGrade) !== String(g)) { S.curGrade = g; S.curSel = f.code; }
    if (S.lesson && SO[S.lesson.code] && String(SO[S.lesson.code].grade) !== String(g)) S.lesson = { code: f.code, i: 0 };
  }
  // switch to another grade and/or group, keeping each one's plan
  window.ctxSwitch = function (g, grp) {
    const p = S.plan;
    g = g == null ? p.grade : conv(g);
    grp = grp || p.group || "A";
    if (String(g) === String(p.grade) && grp === (p.group || "A")) { syncPages(); return false; }
    p.plans = p.plans || {};
    const cur = {}; PER.forEach(k => { if (p[k] !== undefined) cur[k] = clone(p[k]); });
    p.plans[keyOf(p.grade, p.group)] = cur;
    const nxt = p.plans[keyOf(g, grp)];
    PER.forEach(k => { delete p[k]; });
    p.grade = g; p.group = grp;
    if (nxt) Object.assign(p, clone(nxt));
    if (!Array.isArray(p.sos)) p.sos = [];
    S.daySel = null; syncPages();
    if (typeof savePlan === "function") savePlan();
    return true;
  };
  window.ctxLabel = () => `${gradeName(S.plan.grade)} · Group ${S.plan.group || "A"}`;

  function bar() {
    const p = S.plan, gs = grades(); if (!gs.length) return "";
    const cur = p.group || "A", grps = groupsFor(p.grade);
    const n = g => { const k = keyOf(g, cur); return String(g) === String(p.grade) ? (p.sos || []).length : ((p.plans || {})[k]?.sos || []).length; };
    return `<div class="ctxbar" role="group" aria-label="Grade and group">
      <label class="ctx-g"><span>Grade</span><select data-ctx="grade">${gs.map(g => `<option value="${e_(g)}" ${String(g) === String(p.grade) ? "selected" : ""}>${e_(gradeName(g))}</option>`).join("")}</select></label>
      <div class="ctx-grp"><span>Group</span><span class="aks">${grps.map(x => `<button type="button" class="${x === cur ? "on" : ""}" data-ctx="group" data-v="${x}" aria-pressed="${x === cur}">${x}</button>`).join("")}</span></div>
      <span class="ctx-note">Plan for ${e_(gradeName(p.grade))} · Group ${cur} · ${n(p.grade)} outcome${n(p.grade) === 1 ? "" : "s"}${S.tab === "curriculum" ? " · the Curriculum shows this grade" : ""}</span></div>`;
  }
  // put the bar under the page heading on the planning pages
  function place() {
    if (!TABS.includes(S.tab)) return;
    const root = document.getElementById("app"); if (!root || root.querySelector(".ctxbar")) return;
    const html = bar(); if (!html) return;
    const ph = root.querySelector(".ph");
    if (ph) ph.insertAdjacentHTML("afterend", html); else root.insertAdjacentHTML("afterbegin", html);
  }
  // a class's group: the online class's Group setting, or the letter after the grade in a markbook class name ("9A Math", "8B - Math")
  const groupOf = (c, g) => { if (c.section) return String(c.section).toUpperCase(); const m = String(c.name || "").match(new RegExp("(^|[^0-9A-Za-z])" + String(g).replace(/[-]/g, "\\-") + "\\s*-?\\s*([A-Ca-c])(?![A-Za-z])")); return m ? m[2].toUpperCase() : null; };
  const inGroup = (c, g) => { const x = groupOf(c, g); return !x || x === (S.plan.group || "A"); };
  window.ctxGroupOf = groupOf; window.ctxInGroup = inGroup;
  // the Markbook and Analysis show only the classes of the chosen grade and group
  const sameGrade = c => String(c.grade) === String(S.plan.grade) && inGroup(c, S.plan.grade);
  const wantClass = list => { const g = String(S.plan.grade), grp = S.plan.group || "A"; return list.find(c => new RegExp("(^|\\W)" + g.replace(/[-]/g, "\\-") + "\\s*" + grp + "(\\W|$)", "i").test(c.name)) || list[0]; };
  function gradeOnly(fn) {
    return function () {
      if (!Array.isArray(S.classes) || !S.classes.length) return fn.apply(this, arguments);
      const all = S.classes, mine = all.filter(sameGrade);
      if (!mine.some(c => c.id === S.classSel)) { const w = mine.length ? wantClass(mine) : null; S.classSel = w ? w.id : null; S.assessSel = null; }
      S.classes = mine;
      let html; try { html = fn.apply(this, arguments); } finally { S.classes = all; }
      const others = all.length - mine.length;
      return others && typeof html === "string" ? html.replace(/(<\/div>)/, `$1<p class="small muted" style="margin:-4px 0 12px">Showing ${e_(gradeName(S.plan.grade))} · Group ${e_(S.plan.group || "A")} classes. ${others} other class${others === 1 ? "" : "es"} in other grades or groups; choose them above.</p>`) : html;
    };
  }
  if (typeof rMarks === "function") { const f = rMarks; rMarks = gradeOnly(f); }
  if (typeof rAnalysis === "function") { const f = rAnalysis; rAnalysis = gradeOnly(f); }
  // the Students page shows only the online classes of the chosen grade, opening the group's class first
  if (typeof rStudents === "function") {
    const f = rStudents;
    rStudents = function () {
      if (!S.pt || !S.pt.ready || !Array.isArray(S.pt.classes)) return f.apply(this, arguments);
      const all = S.pt.classes, g = String(S.plan.grade), grp = S.plan.group || "A";
      const mine = all.filter(c => String(c.course || c.grade) === g && inGroup(c, g)), ck = keyOf(g, grp);
      if (S.pt._ctx !== ck || !mine.some(c => c.id === S.pt.sel)) { S.pt._ctx = ck; const w = mine.find(c => String(c.section || "").toUpperCase() === grp) || mine[0]; S.pt.sel = w ? w.id : null; }
      S.pt.classes = mine;
      let html; try { html = f.apply(this, arguments); } finally { S.pt.classes = all; }
      const others = all.length - mine.length;
      return others && typeof html === "string" ? html.replace(/(<\/div>)/, `$1<p class="small muted" style="margin:-4px 0 12px">Showing ${e_(gradeName(S.plan.grade))} · Group ${e_(grp)} online classes. ${others} other class${others === 1 ? "" : "es"} in other grades or groups; choose them above.</p>`) : html;
    };
  }
  // the online class name is made from the grade and group (8A, English 10-1 B); no typing needed
  function autoClassName() {
    const gs = document.getElementById("ptGrade"), ss = document.getElementById("ptSection"), nm = document.getElementById("ptName");
    if (!gs || !nm) return;
    const g = gs.value, grp = ss ? ss.value : "";
    const label = !isNaN(+g) && g !== "" ? (+g === 0 ? "KG" : String(g)) : gradeName(g);
    nm.value = grp ? (!isNaN(+g) && g !== "" ? `${label}${grp}` : `${label} ${grp}`) : gradeName(g);
    if (!nm.readOnly) {
      nm.readOnly = true; nm.tabIndex = -1; nm.placeholder = ""; nm.style.background = "var(--sunk)"; nm.title = "Made from the grade and group";
      const lab = nm.closest("label"); if (lab && lab.firstChild && lab.firstChild.nodeType === 3) lab.firstChild.textContent = "Class name (automatic)";
    }
  }
  document.addEventListener("change", e => { if (e.target && (e.target.id === "ptGrade" || e.target.id === "ptSection")) setTimeout(autoClassName, 0); });
  // a new online class starts on the chosen grade and group
  function presetClassForm() {
    const gs = document.getElementById("ptGrade"), ss = document.getElementById("ptSection");
    if (!gs || gs.dataset.ctx) return;
    gs.dataset.ctx = "1";
    if ([...gs.options].some(o => String(o.value || o.textContent) === String(S.plan.grade))) gs.value = String(S.plan.grade);
    if (ss && typeof ptSectionOpts === "function") { ss.innerHTML = ptSectionOpts(gs.value); ss.dataset.f = "1"; if ([...ss.options].some(o => o.value === (S.plan.group || "A"))) ss.value = S.plan.group || "A"; }
  }
  const _render = render;
  // eslint-disable-next-line no-global-assign
  render = function () { syncPages(); const r = _render.apply(this, arguments); try { place(); if (S.tab === "students") { presetClassForm(); autoClassName(); } } catch (e) {} return r; };
  window.render = render;

  document.addEventListener("change", e => { const el = e.target; if (el.dataset?.ctx !== "grade") return; if (ctxSwitch(el.value, S.plan.group)) toast?.(`${ctxLabel()} plan`); render(); });
  document.addEventListener("click", e => { const b = e.target.closest?.('[data-ctx="group"]'); if (!b) return; if (ctxSwitch(S.plan.grade, b.dataset.v)) toast?.(`${ctxLabel()} plan`); render(); });
  syncPages();
  try { render(); } catch (e) {}
})();
