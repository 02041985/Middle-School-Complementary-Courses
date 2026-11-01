// Analysis: gifted and talented groups beside the intervention groups. A student is in an outcome's gifted group
// when their level for it is Excellent (EX); the gifted and talented list holds students who are Excellent in at
// least half of the outcomes they have evidence for (and in at least two). Uses the same "Level used" setting
// (most recent or average) as the rest of the page.
(function () {
  if (typeof S === "undefined" || typeof rAnalysis !== "function" || typeof analyze !== "function") return;
  const e_ = v => (typeof esc === "function" ? esc(v) : String(v ?? ""));
  const icn = n => (typeof ic === "function" ? ic(n) : "");
  const EX = 3.5, lvl = v => (typeof band === "function" ? band(v) : Math.round(v));
  const lvTxt = v => (typeof LV !== "undefined" ? LV[lvl(v)] : "EX");
  const title = k => (typeof SO !== "undefined" && SO[k] ? SO[k].title : k);
  const code = k => (typeof sc === "function" ? sc(k) : k);

  function gifted(c, R) {
    const per = R.sosSet.map(k => ({ k, top: c.students.filter(s => R.val[s.id][k] != null && R.val[s.id][k] >= EX).map(s => ({ s, v: R.val[s.id][k] })) }));
    const students = c.students.map(s => { const have = R.sosSet.filter(k => R.val[s.id][k] != null), ex = have.filter(k => R.val[s.id][k] >= EX);
      return { s, have, ex }; }).filter(x => x.ex.length >= 2 && x.ex.length * 2 >= x.have.length).sort((a, b) => b.ex.length - a.ex.length || a.s.name.localeCompare(b.s.name));
    return { per, students };
  }
  function html(c, R) {
    const G = gifted(c, R);
    return `<section class="stack gifted" style="gap:12px">
      <div class="row between"><h2 style="font-size:1.3rem">Gifted groups by sub topic</h2><span class="small muted">Students at Excellent</span></div>
      <div class="igrid">${G.per.map(p => { const so = (typeof SO !== "undefined" && SO[p.k]) || null; return `<div class="card igroup">
        <div class="card-h"><div style="min-width:0"><span class="code">${e_(code(p.k))}</span> <b>${e_(title(p.k))}</b></div><span class="small muted">${p.top.length} student${p.top.length === 1 ? "" : "s"}</span></div>
        <div class="card-b stack" style="gap:10px">
        ${p.top.length ? `<ul class="names">${p.top.map(f => `<li>${e_(f.s.name)} <span class="lv lv${lvl(f.v)}">${lvTxt(f.v)}</span></li>`).join("")}</ul>
          <div class="kv"><span class="eyebrow">Extension focus</span><span class="small">Challenge questions, multi-step and real-world problems, and explaining or teaching the strategy to a peer.</span></div>
          ${so ? `<div><button class="btn ghost sm" data-act="openlesson" data-code="${e_(p.k)}" data-i="${Math.max(0, (so.lessons || [1]).length - 1)}">${icn("lesson")}Challenge material</button></div>` : ""}` : `<p class="small muted" style="margin:0">No students at Excellent yet.</p>`}
        </div></div>`; }).join("")}</div>
    </section>
    <div class="card gifted">
      <div class="card-h"><h2>Gifted and talented students</h2><span class="small muted">Excellent in at least half of their outcomes</span></div>
      ${G.students.length ? `<div class="tablewrap"><table><thead><tr><th>Student</th><th>Excellent</th><th>Extend in</th></tr></thead><tbody>${G.students.map(x => `<tr><td><b>${e_(x.s.name)}</b></td><td>${x.ex.length} of ${x.have.length}</td><td><div class="stack" style="gap:3px">${x.ex.map(k => `<span><span class="code">${e_(code(k))}</span> ${e_(title(k))}</span>`).join("")}</div></td></tr>`).join("")}</tbody></table></div>`
        : `<div class="card-b"><p class="small muted" style="margin:0">No students are Excellent in at least half of their outcomes yet.</p></div>`}
    </div>`;
  }

  const inner = rAnalysis;
  // eslint-disable-next-line no-global-assign
  rAnalysis = function () {
    let out = inner.apply(this, arguments);
    try {
      if (typeof out !== "string" || !Array.isArray(S.classes)) return out;
      const c = S.classes.find(x => x.id === S.classSel); if (!c || !c.students) return out;
      const R = analyze(c); if (!R.sosSet.length) return out;
      const add = html(c, R); out = out.replace('with intervention groups for reteaching.', 'with intervention groups for reteaching and gifted groups for extension.');
      const at = out.indexOf('<div class="card"><div class="card-h"><h2>Student × outcome heat map</h2>');
      return at >= 0 ? out.slice(0, at) + add + out.slice(at) : out.replace(/<\/div>\s*`?\s*$/, m => add + m);
    } catch (e) { return out; }
  };
  window.rAnalysis = rAnalysis;
})();
