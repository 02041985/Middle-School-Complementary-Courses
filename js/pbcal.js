// School calendar (shared by every planbook, every student site and the portals at www.millardmiddleschoolmaths.live).
// One month or list view of what is happening, filtered to what the signed-in person may see. The database decides
// that (function pb_calendar): everyone sees school holidays and events; teachers see their own weekly plans and
// smart board due dates in every subject; students see their own teachers' plans for their classes and groups;
// managers see every department. The administrator adds, edits and deletes school events and holidays.
(function () {
  if (window.PBCal) return;
  const APPS = {
    kindergarten: ["KG School", "Kindergarten"], elementary: ["Elementary School", "Elementary"],
    maths: ["Middle School Maths", "Mathematics"], maths_hs: ["High School Maths", "Mathematics"],
    science: ["Middle School Sciences", "Sciences"], science_hs: ["High School Sciences", "Sciences"],
    english_ms: ["Middle School English", "English"], english_hs: ["High School English", "English"],
    social_ms: ["Middle School Social Studies", "Social Studies"], social_hs: ["High School Social Studies", "Social Studies"],
    physed_ms: ["Middle School PE and Wellness", "PE and Wellness"], physed_hs: ["High School PE and Wellness", "PE and Wellness"],
    complementary_ms: ["Middle School Complementary Courses", "Complementary Courses"], complementary_hs: ["High School Complementary Courses", "Complementary Courses"],
    ai_literacy: ["AI Literacy", "AI Literacy"], arabic_kg: ["KG Arabic", "Arabic"], arabic_el: ["Elementary Arabic", "Arabic"],
    arabic_ms: ["Middle School Arabic", "Arabic"], arabic_hs: ["High School Arabic", "Arabic"]
  };
  // KG School and Elementary School hold several departments: their course keys say which
  const deptOf = (app, course) => {
    const c = String(course || "");
    if (app === "kindergarten" || app === "elementary") {
      if (/^FSL/.test(c)) return "Languages";
      if (/^SS/.test(c)) return "Social Studies";
      if (/^PE/.test(c)) return "PE and Wellness";
      if (/^CE/.test(c)) return "Creative Expression";
      if (/^M/.test(c)) return "Mathematics";
      if (/^E/.test(c)) return "English";
      if (/^S/.test(c)) return "Sciences";
    }
    return (APPS[app] || [app, "Other"])[1];
  };
  const appName = a => (APPS[a] || [a || "School"])[0];
  const KINDS = [
    ["school", "School calendar", k => k === "holiday" || k === "event"],
    ["lesson", "Lessons", k => k === "lesson" || k === "class"],
    ["assess", "Assessments", k => k === "review" || k === "formal" || k === "summative"],
    ["activity", "Activities", k => k === "activity"],
    ["due", "Smart board due", k => k === "due"]
  ];
  const groupOf = k => (KINDS.find(g => g[2](k)) || KINDS[3])[0];
  const KLABEL = { holiday: "Holiday", event: "School event", lesson: "Lesson", class: "Class", review: "Review and informal check", formal: "Formal assessment", summative: "Summative assessment", activity: "Activity", due: "Smart board due" };
  const AUD = { all: "Everyone", staff: "Staff only (teachers and managers)", managers: "Managers only" };
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = s => { const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const monday = d => add(d, -((d.getDay() + 6) % 7));
  const fmt = (d, o) => parse(d).toLocaleDateString("en-GB", o || { weekday: "short", day: "numeric", month: "short" });
  const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const css = `
.pc{--pc-hol:#9aa3ad;--pc-ev:#3b74c4;--pc-les:#2f8f6b;--pc-ass:#d0821f;--pc-sum:#c4473b;--pc-act:#7b56b8;--pc-due:#1f8a98}
.pc .pc-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}
.pc .pc-bar h2{margin:0;font-size:1.25rem;min-width:170px}
.pc .pc-sp{flex:1}
.pc .pc-btn{border:1px solid var(--line,#ddd);background:var(--surface,#fff);color:var(--ink,#222);border-radius:8px;padding:6px 10px;font:inherit;font-size:.86rem;cursor:pointer;line-height:1.2}
.pc .pc-btn:hover{background:var(--sunk,#f4f4f4)}
.pc .pc-btn.on{background:var(--accent,#2b5);color:#fff;border-color:transparent}
.pc .pc-btn.pri{background:var(--accent,#2b5);color:#fff;border-color:transparent}
.pc .pc-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;font-size:.86rem}
.pc .pc-filters select{font:inherit;font-size:.86rem;padding:5px 6px;border:1px solid var(--line,#ddd);border-radius:7px;background:var(--surface,#fff);color:var(--ink,#222);max-width:220px}
.pc .pc-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line,#ddd);border-radius:999px;padding:3px 9px;cursor:pointer;user-select:none;background:var(--surface,#fff)}
.pc .pc-chip.off{opacity:.45}
.pc .pc-dot{width:9px;height:9px;border-radius:50%;display:inline-block;flex:none}
.pc .k-holiday{--c:var(--pc-hol)}.pc .k-event{--c:var(--pc-ev)}.pc .k-lesson,.pc .k-class{--c:var(--pc-les)}.pc .k-review,.pc .k-formal{--c:var(--pc-ass)}.pc .k-summative{--c:var(--pc-sum)}.pc .k-activity{--c:var(--pc-act)}.pc .k-due{--c:var(--pc-due)}
.pc .pc-dot{background:var(--c,#999)}
.pc .pc-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border:1px solid var(--line,#ddd);border-radius:12px;overflow:hidden;background:var(--surface,#fff)}
.pc .pc-dh{padding:6px 8px;font-size:.75rem;font-weight:700;color:var(--muted,#777);background:var(--sunk,#f6f6f6);border-bottom:1px solid var(--line,#ddd)}
.pc .pc-day{min-height:104px;border-right:1px solid var(--line,#eee);border-bottom:1px solid var(--line,#eee);padding:4px 5px;display:flex;flex-direction:column;gap:3px;min-width:0;cursor:pointer}
.pc .pc-day:nth-child(7n){border-right:0}
.pc .pc-day.out{background:var(--sunk,#fafafa);opacity:.6}
.pc .pc-day.we{background:var(--sunk,#fafafa)}
.pc .pc-day.hol{background:repeating-linear-gradient(135deg,transparent 0 8px,rgba(150,160,170,.10) 8px 16px)}
.pc .pc-day.today .pc-n{background:var(--accent,#2b5);color:#fff}
.pc .pc-day.pick{outline:2px solid var(--accent,#2b5);outline-offset:-2px}
.pc .pc-n{font-size:.75rem;font-weight:700;width:22px;height:22px;border-radius:50%;display:grid;place-items:center}
.pc .pc-e{display:block;width:100%;text-align:left;border:0;border-left:3px solid var(--c,#999);background:color-mix(in srgb,var(--c,#999) 12%,transparent);color:var(--ink,#222);border-radius:4px;padding:2px 5px;font:inherit;font-size:.72rem;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.pc .pc-e:hover{background:color-mix(in srgb,var(--c,#999) 24%,transparent)}
.pc .pc-more{font-size:.7rem;color:var(--muted,#777);padding-left:4px}
.pc .pc-list{display:flex;flex-direction:column;gap:14px}
.pc .pc-lday h3{margin:0 0 6px;font-size:.9rem}
.pc .pc-lday h3 small{font-weight:400;color:var(--muted,#777);margin-left:6px}
.pc .pc-li{display:flex;gap:10px;align-items:flex-start;padding:7px 10px;border:1px solid var(--line,#eee);border-left:4px solid var(--c,#999);border-radius:8px;margin-bottom:5px;background:var(--surface,#fff);cursor:pointer;width:100%;text-align:left;font:inherit;color:inherit}
.pc .pc-li b{display:block;font-size:.88rem}
.pc .pc-li span{font-size:.78rem;color:var(--muted,#777)}
.pc .pc-panel{margin-top:14px;border:1px solid var(--line,#ddd);border-radius:12px;padding:14px;background:var(--surface,#fff)}
.pc .pc-panel h3{margin:0 0 8px;font-size:1rem}
.pc .pc-meta{font-size:.84rem;color:var(--muted,#666);display:flex;flex-direction:column;gap:3px}
.pc .pc-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;align-items:end}
.pc .pc-form label{display:flex;flex-direction:column;gap:3px;font-size:.8rem;font-weight:700}
.pc .pc-form input,.pc .pc-form select,.pc .pc-form textarea{font:inherit;font-weight:400;font-size:.88rem;padding:6px 8px;border:1px solid var(--line,#ddd);border-radius:7px;background:var(--surface,#fff);color:var(--ink,#222)}
.pc .pc-msg{font-size:.84rem;color:var(--muted,#777);padding:10px 0}
.pc .pc-err{color:var(--l1,#c33)}
.pc .pc-legend{display:flex;flex-wrap:wrap;gap:12px;font-size:.76rem;color:var(--muted,#777);margin-top:10px}
.pc.compact .pc-day{min-height:70px}
@media (max-width:720px){.pc .pc-day{min-height:62px;padding:2px}.pc .pc-e{font-size:0;height:6px;padding:0;border-left-width:0;background:var(--c)}.pc .pc-more{font-size:.6rem}.pc .pc-dh{padding:4px 2px;text-align:center}}
@media print{.pc .pc-bar .pc-btn,.pc .pc-filters,.pc .pc-panel{display:none!important}.pc .pc-day{min-height:90px}}`;
  function addCss() { if (document.getElementById("pc-css")) return; const s = document.createElement("style"); s.id = "pc-css"; s.textContent = css; document.head.appendChild(s); }

  const STATES = {};
  function newState(opts) {
    return { opts, month: new Date(today().getFullYear(), today().getMonth(), 1), view: opts.view || "month", data: null, loading: false, err: "", key: "",
      f: { app: opts.here && opts.only ? opts.here : "", course: "", section: "", teacher: "", dept: "" }, off: new Set(), lessons: opts.mine ? true : null, sel: null, day: null, form: null, busy: false };
  }
  function range(st) {
    if (st.view === "list") { const a = today(); return [a, add(a, 41)]; }
    const a = monday(st.month); return [a, add(a, 41)];
  }
  async function load(st, force) {
    const [a, b] = range(st), lessons = st.lessons !== false;
    const key = iso(a) + iso(b) + lessons;
    if (!force && (st.loading || key === st.key)) return;
    st.loading = true; st.key = key; st.err = ""; draw(st);
    try {
      const { data, error } = await st.opts.sb.rpc("pb_calendar", { p_from: iso(a), p_to: iso(b), p_lessons: lessons, p_mine: !!st.opts.mine });
      if (error) throw error;
      st.data = data || { role: "public", events: [] };
      if (st.lessons === null && st.data.role === "manager") { st.lessons = false; st.loading = false; st.key = ""; return load(st, true); }
    } catch (e) { st.err = "Couldn't load the calendar. Check your connection and try again."; st.key = ""; }
    st.loading = false; draw(st);
  }
  const evLabel = (e, role) => {
    if (e.src === "school") return e.title;
    const who = e.course_name || e.course || "";
    const grp = e.section ? ` ${e.section}` : "";
    if (e.src === "board") return `Due: ${e.title}${e.class ? ` (${e.class})` : ""}`;
    return `${who}${grp}${who ? ": " : ""}${e.title}${role === "manager" && e.teacher ? ` · ${e.teacher}` : ""}`;
  };
  function filtered(st) {
    const ev = st.data?.events || [], f = st.f;
    return ev.filter(e => {
      if (st.off.has(groupOf(e.kind))) return false;
      if (e.src === "school") return true;
      if (f.app && e.app !== f.app) return false;
      if (f.dept && deptOf(e.app, e.course) !== f.dept) return false;
      if (f.course && `${e.app}|${e.course}` !== f.course) return false;
      if (f.section && e.section !== f.section) return false;
      if (f.teacher && e.teacher !== f.teacher) return false;
      return true;
    });
  }
  function byDay(list) {
    const m = {};
    list.forEach(e => {
      const a = parse(e.date), b = e.end ? parse(e.end) : a;
      for (let d = new Date(a), g = 0; d <= b && g < 120; d = add(d, 1), g++) (m[iso(d)] = m[iso(d)] || []).push(e);
    });
    return m;
  }
  const uniq = (arr, k) => [...new Map(arr.map(x => [k(x), x])).values()];
  function filtersHtml(st) {
    const ev = (st.data?.events || []).filter(e => e.src !== "school"), role = st.data?.role, f = st.f;
    const apps = uniq(ev.filter(e => e.app), e => e.app).map(e => e.app).sort((a, b) => appName(a).localeCompare(appName(b)));
    const scoped = ev.filter(e => (!f.app || e.app === f.app) && (!f.dept || deptOf(e.app, e.course) === f.dept));
    const courses = uniq(scoped.filter(e => e.course), e => e.app + "|" + e.course).sort((a, b) => String(a.course_name || a.course).localeCompare(String(b.course_name || b.course), undefined, { numeric: true }));
    const secs = [...new Set(scoped.map(e => e.section).filter(Boolean))].sort();
    const teachers = [...new Set(scoped.map(e => e.teacher).filter(Boolean))].sort();
    const depts = [...new Set(ev.map(e => deptOf(e.app, e.course)))].sort();
    const sel = (k, label, opts) => `<select data-pcf="${k}" aria-label="${label}"><option value="">${label}</option>${opts.map(([v, t]) => `<option value="${esc(v)}" ${f[k] === v ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`;
    const parts = [];
    if (role === "manager" && depts.length > 1) parts.push(sel("dept", "All departments", depts.map(d => [d, d])));
    if (apps.length > 1 || (apps.length === 1 && f.app)) parts.push(sel("app", "All subjects", apps.map(a => [a, appName(a)])));
    if (courses.length > 1 || f.course) parts.push(sel("course", "All grades and courses", courses.map(e => [e.app + "|" + e.course, (e.course_name || e.course) + (apps.length > 1 && !f.app ? ` · ${appName(e.app)}` : "")])));
    if (secs.length > 1 || f.section) parts.push(sel("section", "All groups", secs.map(s => [s, "Group " + s])));
    if (role === "manager" && (teachers.length > 1 || f.teacher)) parts.push(sel("teacher", "All teachers", teachers.map(t => [t, t])));
    const chips = KINDS.filter(([g]) => role !== "public" || g === "school").map(([g, l]) => `<span class="pc-chip ${st.off.has(g) ? "off" : ""} k-${g === "school" ? "holiday" : g === "assess" ? "formal" : g}" data-pc="kind" data-g="${g}" role="button" aria-pressed="${!st.off.has(g)}"><i class="pc-dot"></i>${l}</span>`).join("");
    const lessons = role === "manager" ? `<label class="pc-chip"><input type="checkbox" data-pc="lessons" ${st.lessons !== false ? "checked" : ""} style="margin:0">Include daily lessons</label>` : "";
    return `<div class="pc-filters">${parts.join("")}${chips}${lessons}</div>`;
  }
  function monthHtml(st, days) {
    const a = monday(st.month), t = iso(today()), m = st.month.getMonth(), max = st.opts.compact ? 3 : 4;
    let h = DOW.map(d => `<div class="pc-dh">${d}</div>`).join("");
    for (let i = 0; i < 42; i++) {
      const d = add(a, i), k = iso(d), list = days[k] || [], hol = list.some(e => e.kind === "holiday");
      const cls = ["pc-day", d.getMonth() !== m ? "out" : "", d.getDay() === 0 || d.getDay() === 6 ? "we" : "", hol ? "hol" : "", k === t ? "today" : "", st.day === k ? "pick" : ""].filter(Boolean).join(" ");
      const shown = list.slice(0, max).map(e => `<button type="button" class="pc-e k-${e.kind}" data-pc="ev" data-id="${e.id}" data-d="${k}" title="${esc(evLabel(e, st.data?.role))}">${esc(evLabel(e, st.data?.role))}</button>`).join("");
      h += `<div class="${cls}" data-pc="day" data-d="${k}"><span class="pc-n">${d.getDate()}</span>${shown}${list.length > max ? `<span class="pc-more">+${list.length - max} more</span>` : ""}</div>`;
    }
    return `<div class="pc-grid">${h}</div>`;
  }
  function listHtml(st, days) {
    const ks = Object.keys(days).filter(k => k >= iso(range(st)[0]) && k <= iso(range(st)[1])).sort();
    if (!ks.length) return `<div class="pc-msg">Nothing on the calendar in the next six weeks${st.off.size ? " with these filters" : ""}.</div>`;
    const seen = new Set(), show = {};
    ks.forEach(k => { show[k] = days[k].filter(e => { if (!e.end) return true; if (seen.has(e.id)) return false; seen.add(e.id); return true; }); });
    return `<div class="pc-list">${ks.filter(k => show[k].length).map(k => `<div class="pc-lday"><h3>${fmt(k, { weekday: "long", day: "numeric", month: "long" })}${k === iso(today()) ? "<small>Today</small>" : ""}</h3>${show[k].map(e => `<button type="button" class="pc-li k-${e.kind}" data-pc="ev" data-id="${e.id}" data-d="${k}"><div><b>${esc(evLabel(e, st.data?.role))}</b><span>${esc(KLABEL[e.kind] || e.kind)}${e.src !== "school" && e.app && !st.opts.only ? " · " + esc(appName(e.app)) : ""}${e.end && e.src === "school" ? ` · ${fmt(e.date)} – ${fmt(e.end)}` : ""}</span></div></button>`).join("")}</div>`).join("")}</div>`;
  }
  function panelHtml(st, days) {
    const role = st.data?.role, admin = st.data?.admin;
    if (st.form) {
      const v = st.form;
      return `<div class="pc-panel"><h3>${v.id ? "Edit school event" : "Add a school event"}</h3>
        <div class="pc-form">
          <label style="grid-column:1/-1">Title<input data-pcv="title" maxlength="120" value="${esc(v.title)}" placeholder="e.g. Sports day, Parent conferences, Eid Al Adha"></label>
          <label>Type<select data-pcv="kind"><option value="event" ${v.kind === "event" ? "selected" : ""}>School event</option><option value="holiday" ${v.kind === "holiday" ? "selected" : ""}>Holiday or break (no lessons)</option></select></label>
          <label>From<input type="date" data-pcv="date" value="${esc(v.date)}"></label>
          <label>To (optional)<input type="date" data-pcv="end" value="${esc(v.end || "")}"></label>
          <label>Who sees it<select data-pcv="audience">${Object.entries(AUD).map(([k, l]) => `<option value="${k}" ${v.audience === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
          <label style="grid-column:1/-1">Details (optional)<textarea data-pcv="detail" rows="2" maxlength="400">${esc(v.detail || "")}</textarea></label>
        </div>
        <p class="pc-msg" style="padding:6px 0 0">A holiday or break is left out of every teacher's weekly plan (lessons move to the next school day) the next time they open their planbook.</p>
        ${v.err ? `<p class="pc-msg pc-err">${esc(v.err)}</p>` : ""}
        <div class="pc-bar" style="margin:10px 0 0"><button type="button" class="pc-btn pri" data-pc="save" ${st.busy ? "disabled" : ""}>${st.busy ? "Saving…" : "Save"}</button><button type="button" class="pc-btn" data-pc="cancel">Cancel</button></div></div>`;
    }
    if (st.sel) {
      const e = st.sel;
      const rows = [
        `<span><b>${esc(KLABEL[e.kind] || e.kind)}</b> · ${fmt(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${e.end ? " – " + fmt(e.end, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}</span>`,
        e.app ? `<span>${esc(appName(e.app))}${e.course_name || e.course ? " · " + esc(e.course_name || e.course) : ""}${e.section ? " · Group " + esc(e.section) : ""}</span>` : "",
        e.class ? `<span>Class: ${esc(e.class)}</span>` : "",
        e.teacher && role !== "teacher" ? `<span>Teacher: ${esc(e.teacher)}</span>` : "",
        e.src === "school" && e.audience !== "all" ? `<span>${esc(AUD[e.audience] || "")}</span>` : "",
        e.detail ? `<span>${esc(e.detail)}</span>` : ""
      ].filter(Boolean).join("");
      const edit = admin && e.src === "school" ? `<div class="pc-bar" style="margin:10px 0 0"><button type="button" class="pc-btn" data-pc="edit">Edit</button><button type="button" class="pc-btn" data-pc="del">${st.del ? "Click again to delete" : "Delete"}</button></div>` : "";
      const open = st.opts.openUrl && e.src !== "school" ? st.opts.openUrl(e) : "";
      return `<div class="pc-panel k-${e.kind}"><h3><i class="pc-dot"></i> ${esc(e.src === "board" ? "Due: " + e.title : e.title)}</h3><div class="pc-meta">${rows}</div>${open ? `<div style="margin-top:8px"><a class="pc-btn" href="${esc(open)}">Open</a></div>` : ""}${edit}<div style="margin-top:8px"><button type="button" class="pc-btn" data-pc="close">Close</button></div></div>`;
    }
    if (st.day) {
      const list = days[st.day] || [];
      return `<div class="pc-panel"><h3>${fmt(st.day, { weekday: "long", day: "numeric", month: "long" })}</h3>${list.length ? list.map(e => `<button type="button" class="pc-li k-${e.kind}" data-pc="ev" data-id="${e.id}" data-d="${st.day}"><div><b>${esc(evLabel(e, role))}</b><span>${esc(KLABEL[e.kind] || e.kind)}${e.app && !st.opts.only ? " · " + esc(appName(e.app)) : ""}</span></div></button>`).join("") : `<p class="pc-msg">Nothing on this day.</p>`}
        <div class="pc-bar" style="margin:8px 0 0">${admin ? `<button type="button" class="pc-btn" data-pc="add" data-d="${st.day}">Add a school event on this day</button>` : ""}<button type="button" class="pc-btn" data-pc="close">Close</button></div></div>`;
    }
    return "";
  }
  function intro(role) {
    return { teacher: "Your weekly plans in every subject you teach, smart board due dates and the school calendar. Students see your plans for their own classes.",
      student: "Your lessons, assessments and smart board due dates from your teachers, and the school calendar.",
      manager: "Every department's plans, assessments and smart board due dates, with the school calendar. Use the filters to narrow it down.",
      public: "School holidays and events. Sign in to see your own lessons and assessments." }[role] || "";
  }
  function draw(st) {
    const el = st.el; if (!el || !el.isConnected) return;
    const role = st.data?.role || "", admin = st.data?.admin, days = byDay(filtered(st));
    const title = st.view === "list" ? "Next six weeks" : st.month.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    el.className = "pc" + (st.opts.compact ? " compact" : "");
    el.innerHTML = `${st.opts.heading === false ? "" : `<p class="pc-msg" style="padding:0 0 10px">${esc(intro(role))}</p>`}
      <div class="pc-bar">
        ${st.view === "month" ? `<button type="button" class="pc-btn" data-pc="prev" aria-label="Previous month">‹</button><button type="button" class="pc-btn" data-pc="today">Today</button><button type="button" class="pc-btn" data-pc="next" aria-label="Next month">›</button>` : ""}
        <h2>${esc(title)}</h2><span class="pc-sp"></span>
        <button type="button" class="pc-btn ${st.view === "month" ? "on" : ""}" data-pc="view" data-v="month">Month</button><button type="button" class="pc-btn ${st.view === "list" ? "on" : ""}" data-pc="view" data-v="list">List</button>
        ${admin && !st.opts.noEdit ? `<button type="button" class="pc-btn pri" data-pc="add">Add school event</button>` : ""}
        <button type="button" class="pc-btn" data-pc="ics" title="Download the events shown, to add them to Outlook, Google or Apple Calendar">Download (.ics)</button>
      </div>
      ${st.data ? filtersHtml(st) : ""}
      ${st.err ? `<p class="pc-msg pc-err">${esc(st.err)} <button type="button" class="pc-btn" data-pc="retry">Try again</button></p>` : ""}
      ${!st.data && st.loading ? `<p class="pc-msg">Loading the calendar…</p>` : ""}
      ${st.data ? (st.view === "list" ? listHtml(st, days) : monthHtml(st, days)) : ""}
      ${st.data && st.loading ? `<p class="pc-msg">Updating…</p>` : ""}
      ${st.data ? panelHtml(st, days) : ""}
      <div class="pc-legend">${KINDS.filter(([g]) => role !== "public" || g === "school").map(([g, l]) => `<span class="k-${g === "school" ? "holiday" : g === "assess" ? "formal" : g}"><i class="pc-dot"></i> ${l}</span>`).join("")}<span class="k-summative"><i class="pc-dot"></i> Summative</span><span class="k-event"><i class="pc-dot"></i> School event</span></div>`;
  }
  function ics(st) {
    const list = filtered(st), stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const d8 = s => String(s).slice(0, 10).replace(/-/g, "");
    const txt = s => String(s || "").replace(/\\/g, "\\\\").replace(/[,;]/g, m => "\\" + m).replace(/\n/g, "\\n");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Maplewood Planbooks//Calendar//EN", "CALSCALE:GREGORIAN"];
    list.forEach(e => {
      lines.push("BEGIN:VEVENT", `UID:${e.id}-${d8(e.date)}@millardmiddleschoolmaths.live`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d8(e.date)}`,
        `DTEND;VALUE=DATE:${d8(iso(add(parse(e.end || e.date), 1)))}`, `SUMMARY:${txt(evLabel(e, st.data?.role))}`,
        `DESCRIPTION:${txt([KLABEL[e.kind], e.app ? appName(e.app) : "", e.detail].filter(Boolean).join(" · "))}`, "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
    a.download = "school-calendar.ics"; document.body.appendChild(a); a.click(); a.remove();
  }
  async function save(st) {
    const v = st.form;
    if (!v.title.trim() || !v.date) { v.err = "Give the event a title and a date."; draw(st); return; }
    st.busy = true; draw(st);
    const { error } = await st.opts.sb.rpc("pb_cal_school_save", { p_id: v.id || null, p_title: v.title.trim(), p_kind: v.kind, p_date: v.date, p_end: v.end || null, p_audience: v.audience, p_detail: v.detail || null });
    st.busy = false;
    if (error) { v.err = error.message || "Couldn't save. Try again."; draw(st); return; }
    st.form = null; st.sel = null;
    if (v.kind === "holiday" && window.PBSchoolCal) window.PBSchoolCal.refresh();
    load(st, true);
  }
  function bind(st) {
    const el = st.el;
    el.addEventListener("click", async e => {
      const b = e.target.closest("[data-pc]"); if (!b || !el.contains(b)) return;
      const a = b.dataset.pc;
      if (a === "day" && e.target.closest(".pc-e")) return;
      if (a !== "del") st.del = false;
      if (a === "prev" || a === "next") { st.month = new Date(st.month.getFullYear(), st.month.getMonth() + (a === "prev" ? -1 : 1), 1); st.day = null; st.sel = null; load(st); draw(st); }
      else if (a === "today") { st.month = new Date(today().getFullYear(), today().getMonth(), 1); st.day = iso(today()); st.sel = null; load(st); draw(st); }
      else if (a === "view") { st.view = b.dataset.v; st.day = null; st.sel = null; load(st); draw(st); }
      else if (a === "day") { st.day = st.day === b.dataset.d ? null : b.dataset.d; st.sel = null; st.form = null; draw(st); }
      else if (a === "ev") { st.sel = (st.data?.events || []).find(x => x.id === b.dataset.id) || null; st.day = b.dataset.d; st.form = null; draw(st); st.el.querySelector(".pc-panel")?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
      else if (a === "close") { st.sel = null; st.day = null; draw(st); }
      else if (a === "kind") { const g = b.dataset.g; st.off.has(g) ? st.off.delete(g) : st.off.add(g); draw(st); }
      else if (a === "retry") load(st, true);
      else if (a === "ics") ics(st);
      else if (a === "add") { st.form = { title: "", kind: "event", date: b.dataset.d || iso(today()), end: "", audience: "all", detail: "" }; st.sel = null; draw(st); st.el.querySelector(".pc-panel")?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
      else if (a === "edit" && st.sel) { const x = st.sel; st.form = { id: x.id, title: x.title, kind: x.kind, date: x.date, end: x.end || "", audience: x.audience || "all", detail: x.detail || "" }; draw(st); }
      else if (a === "del" && st.sel) {
        if (!st.del) { st.del = true; draw(st); return; }
        const was = st.sel.kind; const { error } = await st.opts.sb.rpc("pb_cal_school_delete", { p_id: st.sel.id });
        if (error) { st.err = error.message; draw(st); return; }
        st.sel = null; st.del = false; if (was === "holiday" && window.PBSchoolCal) window.PBSchoolCal.refresh(); load(st, true);
      }
      else if (a === "cancel") { st.form = null; draw(st); }
      else if (a === "save") save(st);
    });
    el.addEventListener("change", e => {
      const f = e.target.closest("[data-pcf]"); if (f) { st.f[f.dataset.pcf] = f.value; if (f.dataset.pcf === "app" || f.dataset.pcf === "dept") { st.f.course = ""; st.f.section = ""; } st.sel = null; draw(st); return; }
      if (e.target.dataset.pc === "lessons") { st.lessons = e.target.checked; load(st, true); return; }
      const v = e.target.closest("[data-pcv]"); if (v && st.form) { st.form[v.dataset.pcv] = v.value; }
    });
    el.addEventListener("input", e => { const v = e.target.closest("[data-pcv]"); if (v && st.form) st.form[v.dataset.pcv] = v.value; });
  }
  // mount (or re-mount after the host page re-renders) a calendar into el; opts.key keeps its state between mounts
  function mount(el, opts) {
    if (!el || !opts || !opts.sb) return null;
    addCss();
    const key = opts.key || "main";
    let st = STATES[key];
    if (!st) st = STATES[key] = newState(opts);
    st.opts = Object.assign(st.opts, opts);
    if (st.el !== el) { st.el = el; bind(st); }
    draw(st); load(st);
    return { reload: () => load(st, true), state: st };
  }
  window.PBCal = { mount, APPS, appName, deptOf, reload: key => STATES[key || "main"] && load(STATES[key || "main"], true) };
})();
