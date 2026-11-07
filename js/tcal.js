// Planbook: the Calendar page (teacher site + #calendar) and the link between weekly plans and the school calendar.
// Every weekly plan the teacher keeps here (each grade or course and class group) is copied to the shared calendar,
// so the teacher sees all their subjects in one place, their students see the plan for their own class and group on
// the student site, and managers see it on the management calendar. The copy refreshes a few seconds after any change.
(function () {
  const P = () => window.PB_PLATFORM;
  const PER = ["sos", "order", "pins", "akind", "akindDefault", "events", "spans", "folder"];
  const e_ = v => (typeof esc === "function" ? esc(v) : String(v ?? ""));
  const clone = v => JSON.parse(JSON.stringify(v));
  const isoD = d => { const p = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
  const cName = k => { try { if (typeof CN === "function") { const n = CN(isNaN(+k) ? k : +k); if (n && n !== "undefined" && String(n) !== String(k)) return n; } } catch (e) {} return isNaN(+k) ? String(k) : (+k === 0 ? "Kindergarten" : "Grade " + k); };
  const cGrade = k => { try { if (typeof COURSES !== "undefined" && COURSES[k] && COURSES[k].grade != null) return +COURSES[k].grade; } catch (e) {} return isNaN(+k) ? null : +k; };

  // ---------- page ----------
  window.rCalendar = function () {
    setTimeout(() => {
      const host = document.getElementById("pbcal-host");
      if (host && window.PBCal && P()?.sb) window.PBCal.mount(host, { sb: P().sb, here: P().app, key: "teacher", heading: false, mine: true });
    }, 0);
    const head = typeof ph === "function" ? ph("Calendar", "Your lessons and assessment days in every subject you teach, smart board due dates and the school calendar (holidays and school events). Students see your plan for their own class; managers see every department.") : `<h1>Calendar</h1>`;
    return `${head}<section class="card"><div class="card-b"><div id="pbcal-host"><p class="muted">Loading the calendar…</p></div></div></section>`;
  };

  // ---------- weekly plans → calendar ----------
  function kindOf(s) {
    if (s.type === "lesson") return "lesson";
    if (s.type === "review") return "review";
    if (s.type === "quiz") return (s.akind === "summative" || /^Summative/.test(s.title || "")) ? "summative" : "formal";
    return "class";
  }
  function planRows(plan) {
    const rows = [];
    try {
      const list = typeof sessions === "function" ? sessions(plan) : [];
      list.forEach(s => { if (s.date instanceof Date) rows.push({ date: isoD(s.date), kind: kindOf(s), title: String(s.title || "") + (s.parts > 1 ? ` (day ${s.part} of ${s.parts})` : ""), detail: s.code ? String(s.code) : null }); });
      (typeof planEvents === "function" ? planEvents(plan) : []).forEach(ev => rows.push({ date: ev.date, kind: ev.kind === "summative" ? "summative" : ev.kind === "formal" ? "formal" : "activity", title: String(ev.title || "Activity"), detail: null }));
    } catch (e) {}
    return rows;
  }
  function allPlans() {
    if (typeof S === "undefined" || !S.plan) return [];
    const p = S.plan, base = clone(p); delete base.plans; PER.forEach(k => delete base[k]);
    const out = [], seen = new Set();
    const addPlan = (g, grp, data) => {
      const k = `${g}@${grp || "A"}`; if (seen.has(k)) return; seen.add(k);
      if (!data || !Array.isArray(data.sos) || !data.sos.length) return;
      if (typeof pbOk === "function") { try { if (!pbOk(g)) return; } catch (e) {} }
      const plan = Object.assign(clone(base), clone(data), { grade: g, group: grp || "A" });
      const rows = planRows(plan); if (!rows.length) return;
      out.push({ course: String(g), course_name: cName(g), grade: cGrade(g), section: grp || "A", rows });
    };
    addPlan(p.grade, p.group, p);
    Object.entries(p.plans || {}).forEach(([k, data]) => { const i = k.lastIndexOf("@"); const g0 = k.slice(0, i), grp = k.slice(i + 1); const g = typeof p.grade === "number" && !isNaN(+g0) ? +g0 : g0; addPlan(g, grp, data); });
    return out;
  }
  let last = null, busy = false, armed = false;
  const sig = () => { try { return JSON.stringify(S.plan) + "|" + (window.PBSchoolCal ? JSON.stringify(window.PBSchoolCal.list) : ""); } catch (e) { return ""; } };
  async function tick() {
    const plat = P(); if (busy || !plat || !plat.getUser?.() || typeof S === "undefined" || !S.storeReady) return;
    if (!armed) {
      // only copy plans the teacher has actually saved (not the sample plan a new planbook starts with)
      armed = true; last = sig();
      try { const saved = typeof store !== "undefined" ? await store.get("planner") : null; if (saved && saved.sos) last = null; } catch (e) {}
      if (last !== null) return;
    }
    const s = sig(); if (s === last) return;
    busy = true;
    try {
      const { error } = await plat.sb.rpc("pb_cal_sync", { p_app: plat.app, p_plans: allPlans() });
      if (!error) { last = s; if (window.PBCal) window.PBCal.reload("teacher"); }
    } catch (e) {}
    busy = false;
  }
  setInterval(tick, 6000);
  setTimeout(tick, 2500);
})();
