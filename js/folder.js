// Plans folder: printable weekly and daily plans from the planbook's own weekly plan.
// Everything is built from sessions(S.plan) and the planbook's own daily plan (rDay), so it follows the teacher's
// topic order, start weeks, days per lesson, activities and assessment days. Printing uses a hidden frame, so the
// browser's print dialog can print on A4 or "Save as PDF".
(function () {
  const e_ = v => (typeof esc === "function" ? esc(v) : String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));
  const say = m => (typeof toast === "function" ? toast(m) : console.log(m));
  const icn = n => (typeof ic === "function" ? ic(n) : "");
  const DN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], DL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const longDate = d => `${DL[d.getDay()]} ${d.getDate()} ${d.toLocaleDateString([], { month: "long" })} ${d.getFullYear()}`;
  const shortD = d => `${d.getDate()} ${d.toLocaleDateString([], { month: "short" })}`;
  const courseName = k => { try { if (typeof CN === "function") { const n = CN(isNaN(+k) ? k : +k); if (n && n !== "undefined") return n; } } catch (e) {} return isNaN(+k) ? String(k) : (+k === 0 ? "Kindergarten" : "Grade " + k); };
  const planbookName = () => (document.title || "Planbook").split(/ [-·] /)[0].trim();
  const codeLabel = c => (typeof sc === "function" ? sc(c) : c);
  const TYPE = { lesson: "Lesson", review: "Review", quiz: "Formal assessment", workshop: "Workshop", lab: "Investigation" };
  const typeName = t => TYPE[t] || (t ? t[0].toUpperCase() + t.slice(1) : "");

  function data() {
    const p = S.plan, list = sessions(p);
    const evs = typeof planEvents === "function" ? planEvents(p) : [];
    const skip = typeof skipDates === "function" ? skipDates(p.skip).set : new Set();
    const first = list[0]?.date, last = list[list.length - 1]?.date;
    const weeks = [];
    if (first) { let mon = mondayOf(first); while (mon <= last) { weeks.push(mon); mon = addDays(mon, 7); } }
    const byDate = {}; list.forEach(s => (byDate[iso(s.date)] = s));
    const evBy = {}; evs.forEach(e => (evBy[e.date] = e));
    return { p, list, evs, skip, weeks, byDate, evBy };
  }
  const F = () => (S.plan.folder = S.plan.folder || {});
  const clsText = () => F().cls || (typeof ctxLabel === "function" ? ctxLabel() : "");
  const courseOf = D => { const c = D.list.find(s => s.code && SO[s.code]); return c ? courseName(SO[c.code].grade) : courseName(D.p.grade); };

  // ---------- page ----------
  window.rFolder = function () {
    const head = typeof ph === "function" ? ph("Plans folder", "Printable weekly and daily plans, made from your weekly plan. Print them on A4 or choose “Save as PDF” in the print window to keep a copy.") : "<h1>Plans folder</h1>";
    if (typeof S === "undefined" || !S.plan || typeof sessions !== "function") return head;
    const D = data(), f = F();
    if (!D.list.length) return head + `<div class="card"><div class="empty"><h2>No plan yet</h2><p>Choose outcomes in the weekly plan first; the folder fills itself from it.</p><button class="btn" style="margin-top:12px" data-act="tab" data-t="week">Go to weekly plan</button></div></div>`;
    const n = D.weeks.length, from = Math.min(f.from || 1, n), to = Math.min(Math.max(f.to || n, from), n);
    const wkOpts = sel => D.weeks.map((m, i) => `<option value="${i + 1}" ${sel === i + 1 ? "selected" : ""}>Week ${i + 1} · ${shortD(m)}</option>`).join("");
    return head + `<div class="stack" style="gap:16px">
      <section class="card"><div class="card-h"><h2>Cover page</h2><span class="small muted">Printed on the folder's first page</span></div><div class="card-b">
        <div class="fd-form"><label class="f">Teacher<input data-fd="teacher" maxlength="80" value="${e_(f.teacher || "")}" placeholder="Your name"></label>
        <label class="f">Class<input data-fd="cls" maxlength="80" value="${e_(f.cls || "")}" placeholder="${e_(typeof ctxLabel === "function" ? ctxLabel() : "e.g. 9A")}"></label>
        <label class="f">School<input data-fd="school" maxlength="120" value="${e_(f.school ?? "Maplewood Canadian International School")}"></label>
        <label class="f">Term or year<input data-fd="term" maxlength="80" value="${e_(f.term || "")}" placeholder="e.g. Term 1, 2026–27"></label></div></div></section>
      <section class="card"><div class="card-h"><h2>Print the folder</h2><span class="small muted">${D.list.length} teaching days · ${n} week${n === 1 ? "" : "s"} · ${shortD(D.list[0].date)} – ${shortD(D.list[D.list.length - 1].date)}</span></div><div class="card-b stack" style="gap:12px">
        <div class="row" style="gap:10px;flex-wrap:wrap;align-items:flex-end"><label class="f">From<select data-fd="from">${wkOpts(from)}</select></label><label class="f">To<select data-fd="to">${wkOpts(to)}</select></label></div>
        <div class="row" style="gap:8px;flex-wrap:wrap">
          <button class="btn" data-fp="all">${icn("print")}Complete folder</button>
          <button class="btn ghost" data-fp="weeks">Weekly plans only</button>
          <button class="btn ghost" data-fp="days">Daily plans only</button>
          <button class="btn ghost" data-fp="overview">Term overview</button></div>
        <p class="small muted" style="margin:0">The complete folder has a cover, a term overview, then each week's plan followed by that week's daily plans, one per page.</p>
      </div></section>
      <section class="card"><div class="card-h"><h2>Weeks</h2></div>
        <div class="tablewrap"><table class="fd-table"><thead><tr><th>Week</th><th>Dates</th><th>Outcomes</th><th>Days</th><th></th></tr></thead><tbody>
        ${D.weeks.map((mon, i) => { const ss = weekSessions(D, mon), codes = [...new Set(ss.map(s => s.code).filter(Boolean))];
          return `<tr><td><b>${i + 1}</b></td><td class="small">${shortD(mon)} – ${shortD(addDays(mon, 4))}</td><td class="small">${codes.map(c => `<span class="code">${e_(codeLabel(c))}</span>`).join(" ") || "–"}</td><td class="small">${ss.length}</td>
            <td style="text-align:right;white-space:nowrap"><button class="btn ghost sm" data-fp="week" data-w="${i + 1}">Weekly</button> <button class="btn ghost sm" data-fp="weekdays" data-w="${i + 1}" ${ss.length ? "" : "disabled"}>Daily</button> <button class="btn sm" data-fp="weekboth" data-w="${i + 1}">Both</button></td></tr>`; }).join("")}
        </tbody></table></div></section>
    </div>`;
  };
  const weekSessions = (D, mon) => { const a = iso(mon), b = iso(addDays(mon, 7)); return D.list.filter(s => { const k = iso(s.date); return k >= a && k < b; }); };

  // ---------- printable pages ----------
  function cover(D) {
    const f = F(), first = D.list[0].date, last = D.list[D.list.length - 1].date;
    const codes = [...new Set(D.list.map(s => s.code).filter(Boolean))];
    return `<section class="pg cover"><div class="cv-top"><div class="cv-k">Plans folder</div><h1>${e_(planbookName())}</h1><div class="cv-sub">${e_(courseOf(D))}${clsText() ? " · " + e_(clsText()) : ""}</div></div>
      <table class="cv-t"><tr><th>Teacher</th><td>${e_(f.teacher || "")}</td></tr><tr><th>Class</th><td>${e_(clsText())}</td></tr><tr><th>School</th><td>${e_(f.school ?? "Maplewood Canadian International School")}</td></tr>
        <tr><th>Term</th><td>${e_(f.term || "")}</td></tr><tr><th>Dates</th><td>${e_(longDate(first))} – ${e_(longDate(last))}</td></tr><tr><th>Teaching days</th><td>${D.list.length} in ${D.weeks.length} weeks, ${S.plan.period || 60}-minute periods</td></tr></table>
      <div class="cv-o"><div class="cv-k">Outcomes in this folder</div><ol>${codes.map(c => `<li><b>${e_(codeLabel(c))}</b> ${e_(SO[c].title)}</li>`).join("")}</ol></div>
      <div class="cv-foot">Made with the ${e_(planbookName())} planbook · ${e_(new Date().toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" }))}</div></section>`;
  }
  function overview(D, from, to) {
    return `<section class="pg"><header class="ph2"><div><div class="k">Term overview</div><h2>${e_(courseOf(D))} · weeks ${from}–${to}</h2></div><div class="r">${e_(F().teacher || "")}${clsText() ? " · " + e_(clsText()) : ""}</div></header>
      <table class="wt"><thead><tr><th style="width:12%">Week</th><th style="width:18%">Dates</th><th>Outcomes and lessons</th><th style="width:26%">Assessments and activities</th></tr></thead><tbody>
      ${D.weeks.slice(from - 1, to).map((mon, k) => { const ss = weekSessions(D, mon), codes = [...new Set(ss.map(s => s.code).filter(Boolean))];
        const a = iso(mon), b = iso(addDays(mon, 7)), evs = D.evs.filter(e => e.date >= a && e.date < b), asm = ss.filter(s => s.type === "quiz" || s.type === "review");
        return `<tr><td><b>${from + k}</b></td><td>${shortD(mon)} – ${shortD(addDays(mon, 4))}</td><td>${codes.map(c => `<div><b>${e_(codeLabel(c))}</b> ${e_(SO[c].title)} <span class="mut">(${ss.filter(s => s.code === c && s.type === "lesson").length} lesson days)</span></div>`).join("") || "<span class='mut'>No lessons</span>"}</td>
          <td>${[...asm.map(s => `${DN[s.date.getDay()]}: ${e_(s.akind === "summative" ? "Summative assessment" : typeName(s.type))} ${e_(codeLabel(s.code))}`), ...evs.map(e => `${DN[parseISO(e.date).getDay()]}: ${e_(e.title)}`)].map(x => `<div>${x}</div>`).join("") || "<span class='mut'>–</span>"}</td></tr>`; }).join("")}
      </tbody></table></section>`;
  }
  function weekPage(D, w) {
    const mon = D.weeks[w - 1], f = F(), p = D.p, ss = weekSessions(D, mon);
    const days = [1, 2, 3, 4, 5, 6, 0].filter(k => k >= 1 && k <= 5 || p.days.includes(k));
    const codes = [...new Set(ss.map(s => s.code).filter(Boolean))];
    const rows = days.map(k => { const d = addDays(mon, (k + 6) % 7), key = iso(d), s = D.byDate[key], ev = D.evBy[key];
      let what, type, out = "";
      if (s) { what = `<b>${e_(s.title)}</b>${typeof dayTag === "function" ? e_(dayTag(s)) : ""}${s.type === "lesson" && SO[s.code] ? `<div class="mut">Lesson ${s.i + 1} of ${SO[s.code].lessons.length}</div>` : ""}`; type = typeName(s.type); out = s.code ? codeLabel(s.code) : ""; if (s.akind === "summative") type = "Summative assessment"; }
      else if (ev) { what = `<b>${e_(ev.title)}</b>`; type = ev.kind === "summative" ? "Summative assessment" : ev.kind === "formal" ? "Formal assessment" : "Activity"; out = (ev.outcomes || []).map(codeLabel).join(", "); }
      else { what = `<span class="mut">${D.skip.has(key) ? "No school" : p.days.includes(d.getDay()) ? "Open day" : "No class"}</span>`; type = ""; }
      return `<tr><td><b>${DN[d.getDay()]}</b><div class="mut">${shortD(d)}</div></td><td><b>${e_(out)}</b></td><td>${what}</td><td>${e_(type)}</td><td class="lines"></td></tr>`; }).join("");
    return `<section class="pg"><header class="ph2"><div><div class="k">Weekly plan · Week ${w}</div><h2>${e_(longDate(mon))} – ${e_(longDate(addDays(mon, 4)))}</h2></div><div class="r">${e_(courseOf(D))}<br>${e_(f.teacher || "")}${clsText() ? " · " + e_(clsText()) : ""}</div></header>
      <table class="wt"><thead><tr><th style="width:11%">Day</th><th style="width:10%">Outcome</th><th>Plan</th><th style="width:15%">Type</th><th style="width:26%">Notes and homework</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="two"><div class="box"><div class="k">Outcomes this week</div>${codes.map(c => { const so = SO[c]; return `<div class="oc"><b>${e_(codeLabel(c))}</b> ${e_(so.title)}</div>`; }).join("") || "<div class='mut'>–</div>"}</div>
        <div class="box"><div class="k">Resources to prepare</div><div class="lines tall"></div></div></div>
      <div class="box"><div class="k">Reflection and adjustments for next week</div><div class="lines tall"></div></div></section>`;
  }
  // the planbook's own daily plan for one day, without its buttons
  function dayPage(D, s, w) {
    const keep = S.daySel; let html = "";
    try { S.daySel = s.ix; html = rDay(); } catch (e) { html = ""; } finally { S.daySel = keep; }
    const box = document.createElement("div"); box.innerHTML = html;
    box.querySelectorAll(".ph, button, select, input, .tbar, script").forEach(x => x.remove());
    const body = box.querySelector(".split") || box;
    const f = F(), so = SO[s.code];
    return `<section class="pg day"><header class="ph2"><div><div class="k">Daily plan · Week ${w} · day ${s.ix + 1} of ${D.list.length}</div><h2>${e_(longDate(s.date))}</h2></div><div class="r">${e_(courseOf(D))}${so ? " · " + e_(codeLabel(so.code)) : ""}<br>${e_(f.teacher || "")}${clsText() ? " · " + e_(clsText()) : ""}</div></header>
      <div class="dbody">${body.innerHTML || `<p><b>${e_(s.title)}</b></p>`}</div>
      <div class="box"><div class="k">Notes after the lesson</div><div class="lines"></div></div></section>`;
  }

  function build(kind, w) {
    const D = data(), f = F(), n = D.weeks.length;
    const from = w || Math.min(f.from || 1, n), to = w || Math.min(Math.max(f.to || n, from), n);
    const pages = [], daysOf = i => weekSessions(D, D.weeks[i - 1]).map(s => dayPage(D, s, i));
    if (kind === "all") { pages.push(cover(D), overview(D, from, to)); for (let i = from; i <= to; i++) pages.push(weekPage(D, i), ...daysOf(i)); }
    else if (kind === "weeks" || kind === "week") for (let i = from; i <= to; i++) pages.push(weekPage(D, i));
    else if (kind === "days" || kind === "weekdays") for (let i = from; i <= to; i++) pages.push(...daysOf(i));
    else if (kind === "weekboth") pages.push(weekPage(D, w), ...daysOf(w));
    else if (kind === "overview") pages.push(overview(D, from, to));
    const name = kind === "all" ? "Plans folder" : kind.startsWith("week") && w ? `Week ${w} plans` : kind === "overview" ? "Term overview" : kind === "days" ? "Daily plans" : "Weekly plans";
    return { pages, name: `${planbookName()} - ${name}${w ? "" : ` (weeks ${from}-${to})`}` };
  }

  const PRINT_CSS = `@page{size:A4;margin:12mm}
    html,body{background:#fff!important;color:#111}
    body{font-family:var(--f-body,system-ui,sans-serif);font-size:11pt;margin:0}
    .pg{page-break-after:always;break-after:page;padding:0}
    .pg:last-child{page-break-after:auto;break-after:auto}
    .ph2{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;border-bottom:2.5px solid var(--accent,#333);padding-bottom:8px;margin-bottom:12px}
    .ph2 h2{margin:2px 0 0;font-family:var(--f-display,inherit);font-size:16pt}
    .ph2 .r{text-align:right;font-size:9.5pt;color:#444}
    .k{font-size:8pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent,#333)}
    .mut{color:#666;font-size:9pt}
    .wt{width:100%;border-collapse:collapse;font-size:10pt}
    .wt th,.wt td{border:1px solid #bbb;padding:6px 7px;vertical-align:top;text-align:left}
    .wt th{background:#f1f3f5;font-size:8.5pt;text-transform:uppercase;letter-spacing:.06em}
    .wt tr{break-inside:avoid}
    .lines{background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 21px,#d0d4d9 21px,#d0d4d9 22px);min-height:44px}
    .lines.tall{min-height:88px}
    .box{border:1px solid #bbb;border-radius:6px;padding:8px 10px;margin-top:12px;break-inside:avoid}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .oc{font-size:10pt;margin-top:4px}
    .cover{display:flex;flex-direction:column;gap:28px;min-height:250mm}
    .cv-top{border-left:8px solid var(--accent,#333);padding:24px 0 24px 20px;margin-top:30mm}
    .cv-top h1{font-family:var(--f-display,inherit);font-size:30pt;margin:6px 0}
    .cv-sub{font-size:14pt;color:#333}
    .cv-t{border-collapse:collapse;width:100%;font-size:11.5pt}.cv-t th{text-align:left;width:32%;color:#555;font-weight:600;padding:7px 0;border-bottom:1px solid #ddd}.cv-t td{padding:7px 0;border-bottom:1px solid #ddd}
    .cv-o ol{columns:2;column-gap:24px;font-size:10pt;padding-left:18px;margin:6px 0 0}.cv-o li{break-inside:avoid;margin-bottom:3px}
    .cv-foot{margin-top:auto;font-size:9pt;color:#777}
    /* the planbook's own daily plan, flattened for paper */
    .dbody .split{display:block!important}
    .dbody .card{box-shadow:none!important;border:1px solid #ccc!important;background:#fff!important;margin-bottom:10px;break-inside:avoid}
    .dbody .card-h,.dbody .card-b{padding:10px 12px!important}
    .dbody{zoom:.84}
    .dbody .card-b.stack{gap:10px!important}
    .dbody aside{display:grid!important;grid-template-columns:repeat(3,1fr);gap:10px;position:static!important}
    .dbody aside .card{margin:0}
    .dbody .tl li{break-inside:avoid}
    .dbody h2{font-size:14pt!important}
    .dbody a{color:inherit;text-decoration:none}
    *{-webkit-print-color-adjust:exact;print-color-adjust:exact}`;

  async function printDoc(kind, w) {
    const { pages, name } = build(kind, w);
    if (!pages.length) { say("Nothing to print for those weeks."); return; }
    say(`Preparing ${pages.length} page${pages.length === 1 ? "" : "s"}…`);
    const css = [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => `<link rel="stylesheet" href="${e_(l.href)}">`).join("");
    const dir = document.documentElement.getAttribute("dir") || "ltr";
    const html = `<!doctype html><html lang="${e_(document.documentElement.lang || "en")}" data-theme="light" dir="${dir}"><head><meta charset="utf-8"><title>${e_(name)}</title>${css}<style>${PRINT_CSS}</style></head><body>${pages.join("")}</body></html>`;
    let fr = document.getElementById("pbPrintFrame"); if (fr) fr.remove();
    fr = document.createElement("iframe"); fr.id = "pbPrintFrame"; fr.title = "Print";
    fr.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(fr);
    const doc = fr.contentDocument; doc.open(); doc.write(html); doc.close();
    await new Promise(ok => { if (doc.readyState === "complete") ok(); else fr.onload = ok; setTimeout(ok, 4000); });
    try { await Promise.race([doc.fonts?.ready, new Promise(ok => setTimeout(ok, 2500))]); } catch (e) {}
    const keepTitle = document.title; document.title = name; // most browsers name the PDF after the page title
    try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { say("Printing isn't available here. Try another browser."); }
    setTimeout(() => { document.title = keepTitle; }, 1500);
  }
  window.PB_FOLDER = { build, printDoc };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-fp]"); if (!b || b.disabled) return;
    e.preventDefault(); printDoc(b.dataset.fp, b.dataset.w ? +b.dataset.w : 0);
  });
  const onField = e => {
    const el = e.target.closest?.("[data-fd]"); if (!el || typeof S === "undefined" || !S.plan) return;
    const f = F(), k = el.dataset.fd;
    if (k === "from" || k === "to") { f[k] = +el.value; if (k === "from" && f.to && f.to < f.from) f.to = f.from; if (k === "to" && f.from && f.from > f.to) f.from = f.to; if (typeof savePlan === "function") savePlan(); if (typeof render === "function") render(); return; }
    f[k] = el.value.slice(0, 120);
    if (e.type === "change" && typeof savePlan === "function") savePlan();
  };
  document.addEventListener("input", onField);
  document.addEventListener("change", onField);
})();
