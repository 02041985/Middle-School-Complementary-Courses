// Grade and group context for the planbook: one plan per grade and class group (A, B, C).
// Picking a grade anywhere (Curriculum, Weekly plan, this bar) switches the Curriculum, Weekly plan, Daily plan, Lessons
// and Plans folder to that grade; the group picks which of that grade's plans is open (8A, 8B and 8C keep their own
// outcomes, order, start weeks, assessment days, activities and folder details). School-wide settings (first day,
// teaching days, no-school dates, period length, review and assessment days on/off) stay shared.
(function () {
  if (typeof S === "undefined" || !S.plan) return;
  const PER = ["sos", "order", "pins", "akind", "akindDefault", "events", "spans", "folder"];
  const GROUPS = ["A", "B", "C"];
  const TABS = ["home", "curriculum", "week", "day", "lessons", "folder"];
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
  const _render = render;
  // eslint-disable-next-line no-global-assign
  render = function () { syncPages(); const r = _render.apply(this, arguments); try { place(); } catch (e) {} return r; };
  window.render = render;

  document.addEventListener("change", e => { const el = e.target; if (el.dataset?.ctx !== "grade") return; if (ctxSwitch(el.value, S.plan.group)) toast?.(`${ctxLabel()} plan`); render(); });
  document.addEventListener("click", e => { const b = e.target.closest?.('[data-ctx="group"]'); if (!b) return; if (ctxSwitch(S.plan.grade, b.dataset.v)) toast?.(`${ctxLabel()} plan`); render(); });
  syncPages();
  try { render(); } catch (e) {}
})();
