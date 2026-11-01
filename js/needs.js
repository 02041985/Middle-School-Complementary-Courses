// Students page: the inclusion register for the students in this class. The SENCO and inclusion team keep the register
// in the Inclusion portal (SEN, ELL, gifted and talented, plan, accommodations, strategies); teachers see it here and
// their lesson plans count it. Teachers don't tick SEN or ELL themselves.
(function () {
  if (typeof S === "undefined" || typeof render !== "function") return;
  const SB = () => window.PB_PLATFORM?.sb;
  const e_ = v => (typeof esc === "function" ? esc(v) : String(v ?? ""));
  const PORTAL = "https://www.millardmiddleschoolmaths.live/inclusion";
  const N = window.PB_NEEDS = { map: {}, loaded: false, loading: null, open: null };

  function load() {
    if (N.loaded || !SB()) return Promise.resolve();
    if (N.loading) return N.loading;
    N.loading = (async () => {
      try { const { data, error } = await SB().rpc("pb_register_for_my_students"); if (!error) { N.map = {}; (data || []).forEach(r => { N.map[r.student_id] = r; }); N.loaded = true; } }
      catch (e) {}
      N.loading = null;
      if (S.tab === "students") render();
    })();
    return N.loading;
  }
  N.load = load;
  N.reload = () => { N.loaded = false; return load(); };
  N.count = ids => { let sen = 0, ell = 0, gifted = 0; ids.forEach(id => { const x = N.map[id]; if (x?.sen) sen++; if (x?.ell) ell++; if (x?.gifted) gifted++; }); return { sen, ell, gifted }; };
  N.of = id => N.map[id] || null;

  const tags = r => [r.sen ? `<span class="nd-tag sen" title="${e_(r.sen_type || "SEN")}">SEN${r.sen_type ? " · " + e_(r.sen_type) : ""}</span>` : "",
    r.ell ? `<span class="nd-tag ell">ELL${r.ell_level ? " · " + e_(r.ell_level) : ""}</span>` : "",
    r.gifted ? `<span class="nd-tag gt">G&amp;T</span>` : "", r.plan ? `<span class="nd-tag plan">${e_(r.plan)}</span>` : ""].join("");

  function card() {
    if (!S.pt || !S.pt.ready || typeof ptClass !== "function") return "";
    const c = ptClass(); if (!c) return "";
    const enrolled = (S.pt.enroll || []).filter(x => x.class_id === c.id);
    if (!enrolled.length) return "";
    if (!N.loaded) { load(); return `<div class="card needs-card"><div class="card-b row small muted"><span class="spinner"></span>Loading the inclusion register…</div></div>`; }
    const n = N.count(enrolled.map(x => x.student_id));
    const withNeeds = enrolled.filter(en => { const r = N.map[en.student_id]; return r && (r.sen || r.ell || r.gifted || r.plan); })
      .sort((a, b) => String(a.display_name).localeCompare(String(b.display_name)));
    const rest = enrolled.length - withNeeds.length;
    return `<div class="card needs-card"><div class="card-h"><h2>Inclusion register</h2><span class="small muted">${n.sen} SEN · ${n.ell} ELL · ${n.gifted} G&amp;T</span></div>
      <div class="card-b stack" style="gap:2px;max-height:460px;overflow-y:auto">
        ${withNeeds.map(en => { const r = N.map[en.student_id], open = N.open === en.student_id, more = r.accommodations || r.strategies;
          return `<div style="padding:6px 0;border-bottom:1px solid var(--line)"><div class="row between small" style="gap:8px;flex-wrap:wrap"><b style="min-width:0">${e_(en.display_name)}</b><span class="row" style="gap:4px;flex-wrap:wrap">${tags(r)}</span></div>
            ${more ? `<button type="button" class="linkbtn xs" data-ndo="${e_(en.student_id)}" aria-expanded="${open}">${open ? "Hide" : "Accommodations and strategies"}</button>` : ""}
            ${open ? `<div class="small" style="margin-top:4px">${r.accommodations ? `<div><span class="eyebrow">Accommodations</span><div style="white-space:pre-wrap">${e_(r.accommodations)}</div></div>` : ""}${r.strategies ? `<div style="margin-top:6px"><span class="eyebrow">Strategies</span><div style="white-space:pre-wrap">${e_(r.strategies)}</div></div>` : ""}</div>` : ""}</div>`; }).join("")
          || `<p class="small muted" style="margin:0">No students in this class are on the register.</p>`}
        ${withNeeds.length && rest ? `<p class="xs muted" style="margin:6px 0 0">${rest} other student${rest === 1 ? "" : "s"}: N/A.</p>` : ""}
        <p class="xs muted" style="margin:8px 0 0">The SENCO and inclusion team keep this register in the <a href="${PORTAL}" target="_blank" rel="noopener">Inclusion portal</a>. Your lesson plans count it. Speak to them about any changes.</p></div></div>`;
  }
  function place() {
    if (S.tab !== "students") return;
    const root = document.getElementById("app"); if (!root || root.querySelector(".needs-card")) return;
    const html = card(); if (!html) return;
    const h = [...root.querySelectorAll(".card-h h2")].find(x => /^Students \(\d+\)/.test(x.textContent.trim()));
    const host = h ? h.closest(".card") : null;
    if (host) host.insertAdjacentHTML("afterend", html);
  }
  if (!document.getElementById("nd-css")) {
    const st = document.createElement("style"); st.id = "nd-css";
    st.textContent = ".nd-tag{display:inline-flex;align-items:center;font-size:.7rem;font-weight:700;border-radius:99px;padding:2px 8px;border:1px solid var(--line);background:var(--surface);white-space:nowrap}.nd-tag.sen{background:var(--l2s,#fff4e0);color:var(--l2,#9a5b00);border-color:transparent}.nd-tag.ell{background:var(--l3s,#e5f5ec);color:var(--l3,#1d7a46);border-color:transparent}.nd-tag.gt{background:var(--l4s,#e6efff);color:var(--l4,#2a5bd7);border-color:transparent}";
    document.head.appendChild(st);
  }
  const _render = render;
  // eslint-disable-next-line no-global-assign
  render = function () { const r = _render.apply(this, arguments); try { place(); } catch (e) {} return r; };
  window.render = render;
  document.addEventListener("click", e => { const b = e.target.closest("[data-ndo]"); if (!b) return; N.open = N.open === b.dataset.ndo ? null : b.dataset.ndo; render(); });
})();
