// Students page: the teacher marks each student SEN, ELL (both if needed) or N/A. Only that teacher sees the marks.
// The lesson plans in the Plans folder count them for the SEN and ELL boxes.
(function () {
  if (typeof S === "undefined" || typeof render !== "function") return;
  const SB = () => window.PB_PLATFORM?.sb;
  const e_ = v => (typeof esc === "function" ? esc(v) : String(v ?? ""));
  const say = m => (typeof toast === "function" ? toast(m) : null);
  const N = window.PB_NEEDS = { map: {}, loaded: false, loading: false };

  async function load() {
    if (N.loaded || N.loading || !SB()) return;
    N.loading = true;
    try { const { data, error } = await SB().from("pb_student_needs").select("student_id,sen,ell"); if (!error) { N.map = {}; (data || []).forEach(r => { N.map[r.student_id] = { sen: !!r.sen, ell: !!r.ell }; }); N.loaded = true; } }
    catch (e) {}
    N.loading = false;
    if (S.tab === "students") render();
  }
  N.load = load;
  N.count = ids => { let sen = 0, ell = 0; ids.forEach(id => { const x = N.map[id]; if (x?.sen) sen++; if (x?.ell) ell++; }); return { sen, ell }; };

  function card() {
    if (!S.pt || !S.pt.ready || typeof ptClass !== "function") return "";
    const c = ptClass(); if (!c) return "";
    const enrolled = (S.pt.enroll || []).filter(x => x.class_id === c.id);
    if (!enrolled.length) return "";
    if (!N.loaded) { load(); return `<div class="card needs-card"><div class="card-b row small muted"><span class="spinner"></span>Loading SEN and ELL…</div></div>`; }
    const n = N.count(enrolled.map(x => x.student_id));
    const seg = en => { const x = N.map[en.student_id] || {}, na = !x.sen && !x.ell;
      return `<span class="aks" role="group" aria-label="Needs for ${e_(en.display_name)}">${[["sen", "SEN", !!x.sen], ["ell", "ELL", !!x.ell], ["na", "N/A", na]].map(([k, l, on]) => `<button type="button" class="${on ? "on" : ""}" data-nd="${k}" data-id="${e_(en.student_id)}" aria-pressed="${on}">${l}</button>`).join("")}</span>`; };
    return `<div class="card needs-card"><div class="card-h"><h2>SEN and ELL</h2><span class="small muted">${n.sen} SEN · ${n.ell} ELL</span></div>
      <div class="card-b stack" style="gap:2px;max-height:420px;overflow-y:auto">
        ${enrolled.slice().sort((a, b) => String(a.display_name).localeCompare(String(b.display_name))).map(en => `<div class="row between small" style="gap:10px;flex-wrap:nowrap;padding:4px 0;border-bottom:1px solid var(--line)"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e_(en.display_name)}</span>${seg(en)}</div>`).join("")}
        <p class="xs muted" style="margin:8px 0 0">Tick SEN, ELL or both; N/A for neither. Only you see these. Your lesson plans count them.</p></div></div>`;
  }
  function place() {
    if (S.tab !== "students") return;
    const root = document.getElementById("app"); if (!root || root.querySelector(".needs-card")) return;
    const html = card(); if (!html) return;
    const h = [...root.querySelectorAll(".card-h h2")].find(x => /^Students \(\d+\)/.test(x.textContent.trim()));
    const host = h ? h.closest(".card") : null;
    if (host) host.insertAdjacentHTML("afterend", html);
  }
  const _render = render;
  // eslint-disable-next-line no-global-assign
  render = function () { const r = _render.apply(this, arguments); try { place(); } catch (e) {} return r; };
  window.render = render;

  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-nd]"); if (!b || !SB()) return;
    const id = b.dataset.id, k = b.dataset.nd, cur = { sen: false, ell: false, ...(N.map[id] || {}) };
    const next = k === "na" ? { sen: false, ell: false } : { ...cur, [k]: !cur[k] };
    N.map[id] = next; render();
    const { error } = await SB().from("pb_student_needs").upsert({ teacher_id: window.PB_PLATFORM.getUser?.()?.id, student_id: id, sen: next.sen, ell: next.ell, updated_at: new Date().toISOString() });
    if (error) { N.map[id] = cur; render(); say("Couldn't save. Check your connection and try again."); }
  });
})();
