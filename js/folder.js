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
    const skip = typeof schoolSkip === "function" ? schoolSkip(p.skip).set : typeof skipDates === "function" ? skipDates(p.skip).set : new Set();
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
      <section class="card"><div class="card-h"><h2>Lesson plans (Word)</h2><span class="small muted">The school's lesson plan form, filled from your daily plans</span></div><div class="card-b stack" style="gap:12px">
        <div class="row" style="gap:10px;flex-wrap:wrap;align-items:flex-end"><label class="f" style="flex:1 1 280px;min-width:0">Day<select id="fdLpDay">${D.list.map(s => `<option value="${s.ix}" ${s.ix === (f.lpDay ?? (typeof currentSessionIndex === "function" ? currentSessionIndex(D.list) : 0)) ? "selected" : ""}>${e_(shortD(s.date))} · ${e_(s.code ? codeLabel(s.code) + " · " : "")}${e_(s.title)}${typeof dayTag === "function" ? e_(dayTag(s)) : ""}</option>`).join("")}</select></label>
          <button class="btn" data-lp="day">${icn("download")}Download lesson plan</button></div>
        <p class="small muted" style="margin:0">A Word file in the Maplewood template: lesson details on the first page, then the Hook, Learning episodes and Conclusion with timings, purpose and differentiation. Each week's <b>Word</b> button below puts that week's lessons in one file.</p>
      </div></section>
      <section class="card"><div class="card-h"><h2>Weeks</h2></div>
        <div class="tablewrap"><table class="fd-table"><thead><tr><th>Week</th><th>Dates</th><th>Outcomes</th><th>Days</th><th></th></tr></thead><tbody>
        ${D.weeks.map((mon, i) => { const ss = weekSessions(D, mon), codes = [...new Set(ss.map(s => s.code).filter(Boolean))];
          return `<tr><td><b>${i + 1}</b></td><td class="small">${shortD(mon)} – ${shortD(addDays(mon, 4))}</td><td class="small">${codes.map(c => `<span class="code">${e_(codeLabel(c))}</span>`).join(" ") || "–"}</td><td class="small">${ss.length}</td>
            <td style="text-align:right;white-space:nowrap"><button class="btn ghost sm" data-fp="week" data-w="${i + 1}">Weekly</button> <button class="btn ghost sm" data-fp="weekdays" data-w="${i + 1}" ${ss.length ? "" : "disabled"}>Daily</button> <button class="btn sm" data-fp="weekboth" data-w="${i + 1}">Both</button> <button class="btn ghost sm" data-lp="week" data-w="${i + 1}" ${ss.length ? "" : "disabled"} title="This week's lesson plans in the school's Word template">Word</button></td></tr>`; }).join("")}
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
        <tr><th>Term</th><td>${e_(f.term || "")}</td></tr><tr><th>Dates</th><td>${e_(longDate(first))} – ${e_(longDate(last))}</td></tr><tr><th>Teaching days</th><td>${D.list.length} in ${D.weeks.length} weeks, ${S.plan.period || 50}-minute periods</td></tr></table>
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
      else { what = `<span class="mut">${D.skip.has(key) ? ((typeof schoolOff === "function" && schoolOff(key)) || "No school") : p.days.includes(d.getDay()) ? "Open day" : "No class"}</span>`; type = ""; }
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

  // ---------- lesson plans in the school's Word template ----------
  // Each teaching day becomes the school's lesson plan form (Maplewood landscape template with the logo): page 1 lesson
  // details, then the Hook / Learning episode / Conclusion table. Filled from the planbook's own daily plan.
  const xe = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const RPR = (b, i, sz) => `<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>${b ? "<w:b/>" : ""}${i ? "<w:i/>" : ""}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`;
  const R = (t, st = "", sz = 19) => `<w:r>${RPR(st.includes("b"), st.includes("i"), sz)}<w:t xml:space="preserve">${xe(t)}</w:t></w:r>`;
  // a paragraph: a string, or a list of [text, style] pairs
  const PARA = (p, center) => `<w:p><w:pPr><w:spacing w:before="0" w:after="20"/>${center ? '<w:jc w:val="center"/>' : ""}</w:pPr>${(typeof p === "string" ? [[p, ""]] : p).map(([t, st]) => R(t, st)).join("")}</w:p>`;
  const CELL = (w, paras, o = {}) => `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${o.span ? `<w:gridSpan w:val="${o.span}"/>` : ""}${o.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${o.fill}"/>` : ""}${o.mid ? '<w:vAlign w:val="center"/>' : ""}</w:tcPr>${(paras.length ? paras : [""]).map(p => PARA(p, o.center)).join("")}</w:tc>`;
  const TABLE = (grid, rows) => `<w:tbl><w:tblPr><w:tblW w:w="${grid.reduce((a, b) => a + b, 0)}" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"].map(e => `<w:${e} w:val="single" w:sz="6" w:space="0" w:color="000000"/>`).join("")}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${grid.map(w => `<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>${rows.map(r => `<w:tr><w:trPr><w:cantSplit/></w:trPr>${r}</w:tr>`).join("")}</w:tbl>`;
  const BREAK = `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
  const G1 = [2098, 4876, 3458, 2608, 2665], G2 = [1644, 851, 3572, 3515, 6124], GREY = "EFEFEF", DARK = "D9D9D9", FULL = G1.reduce((a, b) => a + b, 0);
  const bul = t => [["•  ", ""], [t, ""]];
  const txt = el => (el ? el.textContent.replace(/\s+/g, " ").trim() : "");

  // what the planbook's daily plan says for one day: its timeline and its side notes
  function dayInfo(s) {
    const keep = S.daySel; let html = "";
    try { S.daySel = s.ix; html = rDay(); } catch (e) {} finally { S.daySel = keep; }
    const box = document.createElement("div"); box.innerHTML = html;
    const segs = [...box.querySelectorAll(".tl li")].map(li => ({ name: txt(li.querySelector(".body b")), tm: txt(li.querySelector(".tm")), text: txt(li.querySelector(".body .small") || li.querySelector(".body div")) }));
    const kv = {}; box.querySelectorAll(".kv").forEach(k => { const lab = txt(k.querySelector(".eyebrow")).toLowerCase(); const chips = [...k.querySelectorAll(".chip")].map(txt); const lb = k.querySelector(".eyebrow"); const v = chips.length ? chips.join(", ") : txt(k).replace(txt(lb), "").trim(); if (lab) kv[lab] = v; });
    const pick = (...keys) => { for (const k of keys) { const hit = Object.keys(kv).find(x => x.includes(k)); if (hit && kv[hit]) return kv[hit]; } return ""; };
    return { segs, kv, pick };
  }
  const minsOf = seg => { const m = String(seg?.tm || "").match(/(\d+)\s*[–-]\s*(\d+)/); return m ? +m[2] - +m[1] : 0; };
  const subjectName = () => planbookName().replace(/^(middle school|high school|elementary school|elementary|kg school|kg|kindergarten)\s*/i, "").replace(/\s*\(.*\)$/, "") || planbookName();
  const gradeText = D => { const g = S.plan.grade, grp = S.plan.group || "A"; return !isNaN(+g) ? (+g === 0 ? "KG" : String(g)) + grp : `${courseOf(D)} ${grp}`; };

  // the inclusion register's students in this grade and group, one line each, for the lesson plan's Inclusion and G&T boxes
  const regLines = (D, want, say) => { const ND = window.PB_NEEDS, ids = (D.nStudents && D.nStudents.ids) || []; if (!ND || !ids.length) return [];
    const name = id => ((S.pt && S.pt.enroll) || []).find(e => e.student_id === id)?.display_name || "Student";
    return ids.map(id => [id, ND.of(id)]).filter(([, r]) => r && want(r)).sort((a, b) => name(a[0]).localeCompare(name(b[0]))).map(([id, r]) => bul(`${name(id)}: ${say(r)}`)); };
  function lessonXml(D, s) {
    const so = SO[s.code] || {}, I = dayInfo(s), segs = I.segs, P = S.plan.period || segs.reduce((a, x) => a + minsOf(x), 0) || 60;
    const lessons = so.lessons || [], isLesson = s.type === "lesson";
    const objective = I.pick("learning objective", "objective", "focus", "assessment") || (isLesson ? `Students will be able to ${String(s.title).toLowerCase()}.` : s.title);
    const target = I.pick("student target", "i can") || "";
    const eq = I.pick("essential question", "inquiry");
    const vocab = I.pick("vocabulary", "keyword");
    const support = I.pick("support") || "Concrete models, worked-example cards and a vocabulary sheet; questions read aloud; extra time.";
    const extension = I.pick("extension", "challenge") || "Challenge questions and explaining strategies to a partner.";
    const materials = I.pick("materials", "resources");
    const prevL = D.list[s.ix - 1], nextL = D.list[s.ix + 1];
    const summ = (typeof planEvents === "function" ? planEvents(S.plan) : []).filter(e => e.kind === "summative" && (e.outcomes || []).includes(s.code) && e.date >= iso(s.date))[0];
    const tgt = target.replace(/^I can\s*/i, "").replace(/\.$/, "");
    const role = isLesson ? `Lesson ${s.i + 1} of ${lessons.length} on ${codeLabel(s.code)}: ${so.title || ""}.` : s.type === "review" ? `Review and informal check for ${codeLabel(s.code)}: ${so.title || ""}.` : `Formal assessment of ${codeLabel(s.code)}: ${so.title || ""}.`;
    const ctx = `Alberta curriculum, ${courseOf(D)}${so.sub ? ", " + so.sub : ""}. Outcome ${codeLabel(s.code)}: ${so.title || ""}.${prevL && prevL.code ? ` It follows “${prevL.title}”.` : ""}${nextL && nextL.code ? ` Next: “${nextL.title}”.` : ""}`;
    const fullRow = (paras, fill) => CELL(FULL, paras, { span: 5, fill });
    const p1 = TABLE(G1, [
      fullRow([[["Lesson title/question: ", "b"], [s.title + (typeof dayTag === "function" ? dayTag(s) : ""), ""]]], GREY),
      CELL(G1[0], [[["Date: ", "b"], [longDate(s.date), ""]]], { fill: GREY }) + CELL(G1[1], [[["Subject: ", "b"], [subjectName(), ""]]], { fill: GREY }) + CELL(G1[2], [[["Grade: ", "b"], [gradeText(D), ""]]], { fill: GREY }) + CELL(G1[3], [[["SEN: ", "b"], [D.nStudents && D.nStudents.sen ? String(D.nStudents.sen) : "", ""], ["          ELL: ", "b"], [D.nStudents && D.nStudents.ell ? String(D.nStudents.ell) : "", ""]]], { fill: GREY }) + CELL(G1[4], [[["UAE:", "b"]]], { fill: GREY }),
      CELL(G1[0], [[["Lesson length: ", "b"], [`${P} minutes`, ""]]], { fill: GREY }) + CELL(G1[1], [[["Unit: ", "b"], [`${codeLabel(s.code)} ${so.title || ""}`.trim(), ""]]], { fill: GREY }) + CELL(G1[2], [[["Number of Students: ", "b"], [D.nStudents && D.nStudents.total ? String(D.nStudents.total) : "", ""]]], { fill: GREY }) + CELL(G1[3] + G1[4], [[["Boys: ", "b"], [D.nStudents && D.nStudents.male ? String(D.nStudents.male) : "", ""]], [["Girls: ", "b"], [D.nStudents && D.nStudents.female ? String(D.nStudents.female) : "", ""]]], { span: 2, fill: GREY }),
      fullRow([[["Medium-term planning context: ", "b"], [ctx, ""]], "", [["Overall Inquiry Question/Essential Question: ", "b"], [eq || "", ""]], [["Role of this lesson: ", "b"], [role, ""]]]),
      fullRow([[["Specific Learning Outcome(s): ", "b"], [objective, ""]], ...(isLesson ? [] : lessons.map(t => bul(t))), "", [["3-Part Success Criteria", "b"]],
        [["All students (must): ", "b"], [tgt ? `I can ${tgt} with support, using models or a worked example.` : "I can show the key idea with support.", ""]],
        [["Most students (should): ", "b"], [tgt ? `I can ${tgt} on my own and explain my strategy.` : "I can apply the idea on my own and explain my thinking.", ""]],
        [["Some students (could): ", "b"], [tgt ? `I can ${tgt} in multi-step or unfamiliar problems and create my own example.` : "I can apply the idea to unfamiliar problems.", ""]]]),
      fullRow([[["Keywords (literacy) for this lesson(s): ", "b"]], vocab || "", ...(materials ? [[["Materials: ", "b"], [materials, "i"]]] : [])]),
      fullRow([[["Communication/Collaboration: ", "b"], [(segs[2] && segs[2].text) || "Pair and group discussion with sentence frames; students explain their thinking to a partner.", ""]]]),
      fullRow([[["Connection to the UAE: ", "b"]]]),
      fullRow([[["Inclusion: ", "b"], [`SEN: ${support} ELL: bilingual keyword cards and sentence frames; partnered with a supportive peer.`, ""]], ...regLines(D, r => r.sen || r.ell || r.plan, r => [r.sen ? "SEN" + (r.sen_type ? " (" + r.sen_type + ")" : "") : "", r.ell ? "ELL" + (r.ell_level ? " (" + r.ell_level + ")" : "") : "", r.plan].filter(Boolean).join(", ") + (r.accommodations ? ": " + r.accommodations : ""))]),
      fullRow([[["Higher-Ability/Gifted & Talented: Higher level questions in the formative task", "b"]], extension, ...regLines(D, r => r.gifted, r => "gifted and talented" + (r.strategies ? ": " + r.strategies : ""))]),
      fullRow([[["Summative Assessment at the end of this unit (attach document): ", "b"], [summ ? `${summ.title}, ${longDate(parseISO(summ.date))}. Marked with proficiency levels EX, PR, AD and LM.` : `End-of-unit summative on ${codeLabel(s.code)}, marked with proficiency levels EX, PR, AD and LM.`, ""]]])
    ]);
    // the lesson: hook, two learning episodes and the conclusion, from the daily plan's timeline
    const sg = segs.length >= 5 ? [[segs[0]], [segs[1], segs[2]], [segs[3]], [segs.slice(4)].flat()] : segs.length ? segs.map(x => [x]) : [[{ name: "Lesson", text: s.title }]];
    const stages = sg.length === 4 ? ["Hook", "Learning Episode", "Learning Episode", "Conclusion"] : sg.map((_, k) => k === 0 ? "Hook" : k === sg.length - 1 ? "Conclusion" : "Learning Episode");
    const PURPOSE = { "Hook": ["Activates prior knowledge and focuses students on today's objective."], "Conclusion": ["Checks each student against the objective and success criteria.", "Results set the support and challenge groups for the next lesson."] };
    const purpose = (st, k) => PURPOSE[st] || (k === 1 ? ["Models the new learning and checks understanding before students work alone (SLO).", "Questioning and discussion bring out and correct misconceptions."] : ["Students apply the learning independently.", "The teacher records each student's level (EX, PR, AD, LM) against the success criteria."]);
    const head = CELL(G2[0], [""], { fill: GREY }) + CELL(G2[1], [[["Time", "b"]]], { fill: GREY }) + CELL(G2[2], [[["Activity/Task", "b"]]], { fill: GREY }) + CELL(G2[3], [[["Purpose", "b"]], [["(", "b"], ["How does this help to meet the LO?", "i"], [")", ""]]], { fill: GREY }) + CELL(G2[4], [[["Differentiation", "b"]], [["(", "b"], ["How has this activity been differentiated for both struggling and excelling students?", "i"], [")", ""]]], { fill: GREY });
    const rows = sg.map((group, k) => { const st = stages[k], mins = group.reduce((a, x) => a + minsOf(x), 0);
      return CELL(G2[0], [[[st, "b"]]], { fill: st === "Conclusion" ? DARK : GREY, mid: true, center: true }) + CELL(G2[1], [mins ? `${mins} min` : ""]) +
        CELL(G2[2], group.map(x => [[x.name ? x.name + ": " : "", "b"], [x.text || "", ""]])) + CELL(G2[3], purpose(st, k).map(bul)) +
        CELL(G2[4], [[["Struggling: ", "b"], [support, ""]], [["Excelling: ", "b"], [extension, ""]]]); });
    return p1 + BREAK + TABLE(G2, [head, ...rows]);
  }

  let zipLib = null;
  const loadZip = () => zipLib || (zipLib = new Promise((ok, no) => { if (window.JSZip) return ok(window.JSZip);
    const urls = ["js/vendor/jszip.min.js", "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"];
    const next = () => { const u = urls.shift(); if (!u) { zipLib = null; return no(new Error("zip")); } const sc = document.createElement("script"); sc.src = u; sc.onload = () => window.JSZip ? ok(window.JSZip) : next(); sc.onerror = next; document.head.appendChild(sc); };
    next(); }));
  // students registered in the chosen grade and group: the online classes' enrolments (each student once),
  // or, with no online class, the markbook classes of that grade and group
  async function studentCount() {
    const g = String(S.plan.grade), grp = S.plan.group || "A";
    const ofGroup = (c, gr) => { const x = typeof ctxGroupOf === "function" ? ctxGroupOf(c, gr) : (c.section ? String(c.section).toUpperCase() : null); return x === grp; };
    try {
      if (S.pt && !S.pt.ready && window.PB_PLATFORM && typeof ptLoad === "function") { ptLoad(); for (let k = 0; k < 40 && !S.pt.ready; k++) await new Promise(ok => setTimeout(ok, 150)); }
      if (S.pt && S.pt.ready && Array.isArray(S.pt.classes)) {
        const ids = new Set(S.pt.classes.filter(c => String(c.course || c.grade) === g && ofGroup(c, g)).map(c => c.id));
        if (ids.size) {
          const sids = [...new Set((S.pt.enroll || []).filter(e => ids.has(e.class_id)).map(e => e.student_id))];
          const n = { total: sids.length, male: 0, female: 0, sen: 0, ell: 0, gifted: 0, ids: sids };
          try { const ND = window.PB_NEEDS; if (ND) { if (!ND.loaded) await ND.load(); Object.assign(n, ND.count(sids)); } } catch (e) {}
          try { const sbc = window.PB_PLATFORM?.sb; const r = sbc ? await sbc.rpc("pb_gender_counts", { p_classes: [...ids] }) : null; if (r && r.data) { n.male = +r.data.male || 0; n.female = +r.data.female || 0; } } catch (e) {}
          return n;
        }
      }
    } catch (e) {}
    try { const mb = (S.classes || []).filter(c => String(c.grade) === g && ofGroup(c, g)); if (mb.length) return { total: new Set(mb.flatMap(c => (c.students || []).map(x => String(x.name || x.id).trim().toLowerCase()))).size, male: 0, female: 0 }; } catch (e) {}
    return { total: 0, male: 0, female: 0 };
  }
  async function lessonDoc(sessionsIn, name) {
    const D = data(), ss = sessionsIn.filter(Boolean);
    if (!ss.length) { say("No teaching days to put in a lesson plan."); return; }
    say(`Making ${ss.length === 1 ? "the lesson plan" : ss.length + " lesson plans"}…`);
    try {
      D.nStudents = await studentCount();
      const JSZip = await loadZip();
      const res = await fetch("lp-template.docx"); if (!res.ok) throw new Error("template");
      const zip = await JSZip.loadAsync(await res.arrayBuffer());
      const doc = await zip.file("word/document.xml").async("string");
      const a = doc.indexOf("<w:body>") + 8, b = doc.indexOf("<w:sectPr");
      const body = ss.map(s => lessonXml(D, s)).join(BREAK);
      zip.file("word/document.xml", doc.slice(0, a) + body + `<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>` + doc.slice(b));
      const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", compression: "DEFLATE" });
      const url = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = url; link.download = name.replace(/[\\/:*?"<>|]+/g, "-").slice(0, 150) + ".docx"; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      say("Lesson plan downloaded");
    } catch (e) { say("Couldn't make the Word file. Check your connection and try again."); }
  }
  window.PB_LESSONDOC = { lessonXml, lessonDoc };
  window.PB_FOLDER = { build, printDoc, lessonDoc };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-fp]"); if (!b || b.disabled) return;
    e.preventDefault(); printDoc(b.dataset.fp, b.dataset.w ? +b.dataset.w : 0);
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-lp]"); if (!b || b.disabled || typeof S === "undefined" || !S.plan) return;
    e.preventDefault(); const D = data(), course = courseOf(D);
    if (b.dataset.lp === "day") { const s = D.list[+(document.getElementById("fdLpDay")?.value ?? 0)]; if (s) lessonDoc([s], `${course} Lesson Plan - ${s.title} (${iso(s.date)})`); }
    else { const w = +b.dataset.w; lessonDoc(weekSessions(D, D.weeks[w - 1]), `${course} Lesson Plans - Week ${w} (${iso(D.weeks[w - 1])})`); }
  });
  document.addEventListener("change", e => { if (e.target && e.target.id === "fdLpDay" && typeof S !== "undefined" && S.plan) { F().lpDay = +e.target.value; } });
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
