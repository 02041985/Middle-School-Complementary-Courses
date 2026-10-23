// ---------- helpers ----------
const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lc = s => s ? s[0].toLowerCase() + s.slice(1) : "";
const uid = () => Math.random().toString(36).slice(2, 10);
const pad = n => String(n).padStart(2, "0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y,m,d] = (s||"").split("-").map(Number); return y ? new Date(y, m-1, d) : new Date(); };
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DOWL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = d => `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
const fmtS = d => `${d.getDate()} ${MON[d.getMonth()]}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const today0 = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const mondayOf = d => addDays(d, -((d.getDay()+6)%7));
function nextMonday(){ const d = today0(); const k = (8 - d.getDay()) % 7 || 7; return addDays(d, k); }
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2200); }
const LV = {0:"IE",1:"LM",2:"AD",3:"PR",4:"EX"};
const LVNAME = {0:"Insufficient evidence",1:"Limited",2:"Adequate",3:"Proficient",4:"Excellent"};
const band = v => v == null ? 0 : v < 1.5 ? 1 : v < 2.5 ? 2 : v < 3.5 ? 3 : 4;
const BCOL = ["var(--ie)","var(--l1)","var(--l2)","var(--l3)","var(--l4)"];
const MODELS = Object.fromEntries(Object.entries(UNITS).map(([k,u]) => [k, u.mat]));
const sc = k => String(k).split(".").pop();
const dc = k => String(k).replace(".", " ");
const CN = g => COURSES[g]?.name || String(g);
const SUBJ = so => SUBJECTS[so.subj] || SUBJECTS.ART;
const isELA = so => false;
const isLang = so => ["FSL","SPA","CHI"].includes(so.subj);
const CS = g => COURSES[g]?.short || String(g);
const refOf = g => REF[g] || [];
const goOf = so => [...new Set(so.pos.map(p => p.split(".")[0]))];
const ICONS = {
  home:"M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  book:"M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7M8 11h5",
  calendar:"M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4",
  clock:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  lesson:"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6",
  marks:"M4 4h16v16H4zM4 10h16M4 15h16M10 4v16",
  chart:"M3 20h18M6 16v-5M11 16V6M16 16v-8",
  plus:"M12 5v14M5 12h14",
  search:"M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  spark:"M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  download:"M12 4v11M7 10l5 5 5-5M5 20h14",
  right:"M5 12h14M13 6l6 6-6 6",
  left:"M19 12H5M11 6l-6 6 6 6",
  users:"M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a6 6 0 0 0-4-5.6",
  alert:"M12 3l10 18H2zM12 10v5M12 18h.01",
  check:"M5 12l5 5L20 7",
  trash:"M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  info:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01",
  pen:"M4 20l4.5-1L19 8.5 15.5 5 5 15.5zM13.5 7l3.5 3.5M4 20h16",
  open:"M3 5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H3zM21 5h-6a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H21z",
  test:"M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M8 11h8M8 15h8M8 19h4",
  shuffle:"M4 7h3l10 10h3M4 17h3l3-3M14 10l3-3h3M18 4l3 3-3 3M18 14l3 3-3 3",
  print:"M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"
};
const ic = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n]}"/></svg>`;
const NAV = [
  {group:null, items:[["home","Overview","home","Home"]]},
  {group:"Plan", items:[["curriculum","Curriculum","book","Outcomes"],["week","Weekly plan","calendar","Week"],["day","Daily plan","clock","Day"]]},
  {group:"Teach", items:[["lessons","Lessons","lesson","Lessons"]]},
  {group:"Assess", items:[["marks","Markbook","marks","Marks"],["analysis","Analysis","chart","Data"],["test","Test builder","test","Tests"],["students","Students","users","Students"]]}
];
if (!window.PB_PLATFORM) NAV[3].items = NAV[3].items.filter(i => i[0] !== "students");
const TABS = NAV.flatMap(g => g.items.map(i => i[0]));
const GROUP_OF = Object.fromEntries(NAV.flatMap(g => g.items.map(i => [i[0], g.group || "Home"])));

// ---------- state ----------
const S = {
  tab: "home", curGrade: "ART7", curSel: "ART7.A1", cq: "",
  plan: {grade:"ART7", sos:["ART7.A1","ART7.B1"], start: iso(nextMonday()), period:60, days:[1,2,3,4,5], skip:"", ws:true, review:true, quiz:true},
  daySel: null,
  lesson: {code:"ART7.A1", i:0}, ltab: "overview", lessons: {}, busy: null, genErr: "", showAns: false,
  classes: [], classSel: null, assess: [], assessSel: null, newAssess: null, newClass: false, confirm: null, classPanel: false,
  an: {mode:"recent", thr:"ad"},
  storeReady: false
};

// ---------- storage ----------
const store = {
  mode: "none", col: null,
  async init(){
    try { localStorage.setItem("__t","1"); localStorage.removeItem("__t"); this.mode = "local"; } catch(e) { this.mode = "none"; }
    try {
      if (window.claude?.use) {
        const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
        const id = user ? await user.id() : null;
        if (db && id) { this.col = db.collection("data/users/" + id); this.mode = "db"; }
      }
    } catch(e) {}
  },
  async get(k){
    if (this.mode === "db") { try { const s = await this.col.doc(k).get(); return s.exists ? s.data() : null; } catch(e) { return null; } }
    if (this.mode === "local") { try { return JSON.parse(localStorage.getItem("pb_" + k)); } catch(e) { return null; } }
    return null;
  },
  async set(k, v){
    if (this.mode === "db") { try { await this.col.doc(k).set(v); return true; } catch(e) { toast("Couldn't save. Check your connection and try again."); return false; } }
    if (this.mode === "local") { try { localStorage.setItem("pb_" + k, JSON.stringify(v)); return true; } catch(e) { return false; } }
    return false;
  },
  async del(k){
    if (this.mode === "db") { try { await this.col.doc(k).delete(); } catch(e) {} return; }
    if (this.mode === "local") { try { localStorage.removeItem("pb_" + k); } catch(e) {} }
  },
  async listAssess(){
    if (this.mode === "db") { try { const q = await this.col.where("kind","==","assess").get(); return q.docs.map(d => d.data()); } catch(e) { return []; } }
    if (this.mode === "local") { const out = []; try { for (let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); if (k.startsWith("pb_a_")) out.push(JSON.parse(localStorage.getItem(k))); } } catch(e) {} return out; }
    return [];
  }
};
const timers = {};
function saveLater(key, getter, ms=700){ clearTimeout(timers[key]); timers[key] = setTimeout(() => store.set(key, getter()), ms); }
const savePlan = () => saveLater("planner", () => ({kind:"planner", ...S.plan}));
const saveBook = () => saveLater("gradebook", () => ({kind:"gradebook", classes:S.classes}), 300);
const saveAssess = a => saveLater("a_" + a.id, () => a, 600);
let sampleCap = null, downloadsCap = null;

// ---------- curriculum helpers ----------
const objectiveOf = (so, i) => `Students will be able to ${lc(so.lessons[i])}.`;
const iCanOf = (so, i) => `I can ${lc(so.lessons[i])}.`;
function descriptors(so){
  const t = lc(so.title);
  return [
    [4, `Insightful and confident: understands ${t} deeply, chooses efficient strategies, explains thinking clearly and applies it to new situations.`],
    [3, `Clear and accurate: understands ${t}, uses appropriate strategies and explains thinking with minor errors that do not affect understanding.`],
    [2, `Developing: shows a basic understanding of ${t} with support; strategies or explanations are partial or uneven.`],
    [1, `Beginning: shows limited understanding of ${t}, even with support; errors interfere with meaning.`]
  ];
}
function assessPlan(so){
  return [
    ["Diagnostic", `Pre-check before ${dc(so.code)}: a short cold read with two questions, or a quick-write, to see what students already notice and name.`],
    ["Formative", `An exit ticket for each of the ${so.lessons.length} lessons, observation and conversation during the activity, and descriptive feedback in conference.`],
    [isELA(so) ? "Writing" : "Task", isELA(so) ? `One polished piece of writing for ${dc(so.code)} from the workshop day, reported as EX, PR, AD or LM.` : `One performance task or written explanation for ${dc(so.code)} from the workshop day, reported as EX, PR, AD or LM.`],
    ["Summative", `Check-in quiz on ${dc(so.code)} and inclusion in the ${esc(SUBJ(so).short)} ${esc(UNITS[so.sk].title)} unit check.`]
  ];
}
const gradeSOs = g => SOS.filter(s => s.grade === String(g));
const seg = (cur, act, opts) => `<div class="seg" role="group">${opts.map(([v,l]) => `<button data-act="${act}" data-v="${v}" aria-pressed="${String(cur)===String(v)}">${l}</button>`).join("")}</div>`;
const courseOpts = sel => [7,8,9].map(gr => `<optgroup label="Grade ${gr}">${Object.keys(COURSES).filter(k => COURSES[k].grade === gr).map(k => `<option value="${k}" ${k===sel?"selected":""}>${COURSES[k].name}</option>`).join("")}</optgroup>`).join("");
const gradeSeg = (cur, act) => `<select class="cpick" data-cact="${act}" aria-label="Course">${courseOpts(cur)}</select>`;
const ph = (title, sub, actions="") => `<div class="ph"><div><div class="crumb">${esc(GROUP_OF[S.tab])}</div><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${actions ? `<div class="ph-actions">${actions}</div>` : ""}</div>`;
const typeBadge = t => `<span class="badge b-${t}">${t === "lesson" ? "Lesson" : t === "ws" ? "Workshop" : t === "review" ? "Review" : "Check-in"}</span>`;

// ---------- plan engine ----------
function sessions(plan){
  const order = SOS.map(s => s.code);
  const codes = [...plan.sos].filter(c => SO[c]).sort((a,b) => order.indexOf(a) - order.indexOf(b));
  const list = [];
  codes.forEach(c => {
    const so = SO[c];
    so.lessons.forEach((t,i) => list.push({type:"lesson", code:c, i, title:t}));
    if (plan.ws) list.push({type:"ws", code:c, title:`Practice workshop: ${so.title}`});
    if (plan.review) list.push({type:"review", code:c, title:`Review and practice: ${so.title}`});
    if (plan.quiz) list.push({type:"quiz", code:c, title:`Check-in quiz: ${so.title}`});
  });
  const skip = new Set((plan.skip||"").split(/[\s,]+/).filter(Boolean));
  let d = parseISO(plan.start), guard = 0;
  for (const s of list) {
    while (guard++ < 3000 && (!plan.days.includes(d.getDay()) || skip.has(iso(d)))) d = addDays(d, 1);
    s.date = new Date(d); d = addDays(d, 1);
  }
  list.forEach((s,ix) => s.ix = ix);
  return list;
}
function currentSessionIndex(list){
  const t = iso(today0());
  const ix = list.findIndex(s => iso(s.date) >= t);
  return ix < 0 ? list.length - 1 : ix;
}
function minutes(P, type="lesson"){
  const names = type === "lesson" ? ["Bell-ringer","Mini-lesson","Close reading","Guided writing","Exit ticket"] : type === "ws" ? ["Prompt and planning","Drafting","Conference and peer response","Revision and editing","Reflection"] : type === "review" ? ["Warm-up","Recap","Stations","Practice test","Reflection"] : ["Warm-up","Instructions","Part A: reading","Part B: writing","Wrap-up"];
  const fr = type === "lesson" ? [.1,.2,.3,.25,.15] : type === "ws" ? [.12,.38,.2,.2,.1] : [.12,.18,.28,.27,.15];
  const m = names.map((n,k) => [n, Math.max(3, Math.round(P*fr[k]))]);
  m[2][1] += P - m.reduce((a,[,x]) => a+x, 0); return m;
}
const SEGCOL = ["var(--l2)","var(--accent)","var(--l4)","var(--l3)","var(--l1)"];

// ---------- shell ----------
function renderNav(){
  $("#sidenav").innerHTML = NAV.map(g => `<div class="navgroup">${g.group ? `<div class="gl">${g.group}</div>` : ""}${g.items.map(([k,l,i]) => `<button class="nav" data-tab="${k}" ${S.tab===k?'aria-current="page"':""}>${ic(i)}${l}</button>`).join("")}</div>`).join("");
  $("#bottomnav").innerHTML = NAV.flatMap(g => g.items).map(([k,l,i,short]) => `<button data-tab="${k}" ${S.tab===k?'aria-current="page"':""}>${ic(i)}${short}</button>`).join("");
}
function setTab(t){
  S.tab = t; S.confirm = null;
  try { history.replaceState(null, "", "#" + t); } catch(e) {}
  renderNav(); render(); window.scrollTo(0, 0);
}
// ---------- the teacher's approved grades/courses (set by the administrator in the teacher portal) ----------
let PB_ALLOWED = null; // null = every grade/course
const pbOk = g => !PB_ALLOWED || PB_ALLOWED.includes(String(g));
function pbFixState(){
  if (!PB_ALLOWED) return;
  const first = PB_ALLOWED.find(g => gradeSOs(g).length); if (first == null) return;
  const g0 = typeof S.curGrade === "number" ? +first : first;
  if (!pbOk(S.curGrade)) { S.curGrade = g0; S.curSel = gradeSOs(g0)[0].code; }
  if (S.plan && !pbOk(S.plan.grade)) { S.plan.grade = typeof S.plan.grade === "number" ? +first : first; S.plan.sos = gradeSOs(g0).slice(0, 3).map(s => s.code); }
  if (S.lesson && SO[S.lesson.code] && !pbOk(SO[S.lesson.code].grade)) S.lesson = {code: gradeSOs(g0)[0].code, i: 0};
  if (S.tb && S.tb.course != null && !pbOk(S.tb.course)) { S.tb.course = g0; S.tb.sos = []; }
}
function pbRestrictDom(root){
  if (!PB_ALLOWED || !root) return;
  root.querySelectorAll("#cGrade option, #pGrade option, #ptGrade option, select.cpick option").forEach(o => { if (!pbOk(o.value)) o.remove(); });
  root.querySelectorAll("#cGrade optgroup, #pGrade optgroup, #ptGrade optgroup, select.cpick optgroup").forEach(g => { if (!g.children.length) g.remove(); });
  root.querySelectorAll('[data-act="cgrade"],[data-act="lgrade"],[data-act="tbcourse"]').forEach(b => { if (!pbOk(b.dataset.v)) b.remove(); });
}

function render(){
  const R = {home:rHome, curriculum:rCurriculum, week:rWeek, day:rDay, lessons:rLessons, marks:rMarks, analysis:rAnalysis, test:rTest, students:rStudents}[S.tab] || rHome;
  pbFixState();
  $("#app").innerHTML = R();
  pbRestrictDom($("#app"));
}

// ---------- Overview ----------
function rHome(){
  const list = sessions(S.plan), d0 = today0();
  const cix = list.length ? currentSessionIndex(list) : -1, cur = list[cix];
  const done = list.filter(s => s.date < d0).length;
  const pct = list.length ? Math.round(100*done/list.length) : 0;
  const isToday = cur && iso(cur.date) === iso(d0);
  const mon = mondayOf(cur ? cur.date : d0);
  const byDate = Object.fromEntries(list.map(s => [iso(s.date), s]));
  const cls = S.storeReady ? S.classes.map(c => ({c, R: analyze(c)})) : [];
  const flaggedTotal = cls.reduce((a,x) => a + x.R.students.length, 0);
  const dateLabel = `${DOWL[d0.getDay()]}, ${d0.getDate()} ${MON[d0.getMonth()]} ${d0.getFullYear()}`;
  return `
  ${ph(esc(dateLabel), "Your plan, the next lesson and where each class needs support.")}
  <div class="stack" style="gap:18px">
    ${cur ? `<section class="hero">
      <div class="stack" style="gap:10px">
        <div class="when">${isToday ? "TODAY" : "NEXT UP · " + fmt(cur.date).toUpperCase()} · ${CN(SO[cur.code].grade).toUpperCase()}</div>
        <div class="row">${typeBadge(cur.type)}<span class="code">${dc(cur.code)}</span><span class="small muted">${esc(SO[cur.code].title)}</span></div>
        <h2>${esc(cur.title)}</h2>
        ${cur.type === "lesson" ? `<p class="muted">${esc(objectiveOf(SO[cur.code], cur.i))}</p>` : ""}
        <div class="row" style="margin-top:4px">
          <button class="btn" data-act="openday" data-ix="${cur.ix}">${ic("clock")}Daily plan</button>
          ${cur.type === "lesson" ? `<button class="btn ghost" data-act="openlesson" data-code="${cur.code}" data-i="${cur.i}">${ic("lesson")}Lesson materials</button>` : ""}
        </div>
      </div>
      <div class="stack" style="gap:12px;justify-content:center">
        <div class="row between"><span class="eyebrow">Plan progress</span><span class="small"><b>${done}</b> of ${list.length} days</span></div>
        <div class="prog"><span style="width:${pct}%"></span></div>
        <div class="row" style="gap:22px;margin-top:6px">
          <div class="stat"><span class="n">${S.plan.sos.length}</span><span class="l">Outcomes planned</span></div>
          <div class="stat"><span class="n">${fmtS(list[list.length-1].date)}</span><span class="l">Plan ends</span></div>
        </div>
      </div>
    </section>
    <section class="card">
      <div class="card-h"><h2>Week of ${fmtS(mon)}</h2><button class="btn quiet sm" data-act="tab" data-t="week">Full plan ${ic("right")}</button></div>
      <div class="card-b"><div class="weekstrip">${[0,1,2,3,4].map(k => { const d = addDays(mon,k), s = byDate[iso(d)], t = iso(d) === iso(d0);
        return s ? `<button class="wday ${t?"today":""}" data-act="openday" data-ix="${s.ix}"><span class="d">${DOW[d.getDay()]} ${d.getDate()}</span>${typeBadge(s.type)}<span class="t">${esc(s.title)}</span></button>`
                 : `<div class="wday off"><span class="d">${DOW[d.getDay()]} ${d.getDate()}</span><span class="xs">No lesson</span></div>`; }).join("")}</div></div>
    </section>` : `<section class="card"><div class="empty"><h2>Start a plan</h2><p>Choose the outcomes you're teaching and every lesson is laid out on your calendar.</p><button class="btn" style="margin-top:14px" data-act="tab" data-t="week">${ic("calendar")}Build a weekly plan</button></div></section>`}

    <section class="card">
      <div class="card-h"><h2>Classes</h2><div class="row">${flaggedTotal ? `<span class="badge b-quiz">${flaggedTotal} flagged</span>` : ""}<button class="btn quiet sm" data-act="tab" data-t="analysis">Analysis ${ic("right")}</button></div></div>
      ${!S.storeReady ? `<div class="card-b row"><span class="spinner"></span><span class="muted">Loading your classes…</span></div>` :
        !cls.length ? `<div class="empty"><p>No classes yet. Set one up in the markbook to record proficiency levels.</p><button class="btn ghost" style="margin-top:12px" data-act="tab" data-t="marks">${ic("plus")}Set up a class</button></div>` :
        `<div>${cls.map(({c,R}) => { const weakest = R.perSO.filter(p => p.avg != null).sort((a,b) => a.avg - b.avg)[0];
          return `<div class="classrow">
            <div style="min-width:0"><b>${esc(c.name)}</b><div class="xs muted">${CN(c.grade)} · ${c.students.length} students</div></div>
            <div class="stat"><span class="n" style="font-size:1.25rem">${R.pctProf ?? "–"}${R.pctProf!=null?"%":""}</span><span class="l">PR or EX</span></div>
            <div class="stat"><span class="n" style="font-size:1.25rem;color:${R.students.length?"var(--l1)":"var(--l3)"}">${R.students.length}</span><span class="l">Flagged</span></div>
            <div class="stat" style="min-width:0"><span class="n" style="font-size:1.05rem">${weakest ? `<span class="code">${sc(weakest.k)}</span>` : "–"}</span><span class="l">${weakest ? esc(SO[weakest.k].title) : "Weakest outcome"}</span></div>
            <button class="btn ghost sm" data-act="classanalysis" data-id="${c.id}">View</button></div>`; }).join("")}</div>`}
    </section>

    <section>
      <div class="eyebrow" style="margin-bottom:10px">Quick actions</div>
      <div class="quick">
        <button class="qa" data-act="tab" data-t="curriculum"><span class="ic">${ic("book")}</span><span><b>Browse outcomes</b><span>Objectives, questions, vocabulary</span></span></button>
        <button class="qa" data-act="tab" data-t="lessons"><span class="ic">${ic("spark")}</span><span><b>Open a lesson</b><span>Activity, 15 practice, 20-item test</span></span></button>
        <button class="qa" data-act="tab" data-t="marks"><span class="ic">${ic("marks")}</span><span><b>Enter marks</b><span>EX · PR · AD · LM by outcome</span></span></button>
        <button class="qa" data-act="tab" data-t="analysis"><span class="ic">${ic("users")}</span><span><b>Plan interventions</b><span>Groups by lesson topic</span></span></button>
        <button class="qa" data-act="tab" data-t="test"><span class="ic">${ic("test")}</span><span><b>Build a unit test</b><span>Mix questions across outcomes</span></span></button>
        <button class="qa" data-act="tab" data-t="day"><span class="ic">${ic("pen")}</span><span><b>Today's workshop</b><span>Prompts, conferences, revision</span></span></button>
      </div>
    </section>
  </div>`;
}

// ---------- Curriculum ----------
function rCurriculum(){
  const g = S.curGrade, q = S.cq.trim().toLowerCase();
  const list = gradeSOs(g);
  if (!SO[S.curSel] || SO[S.curSel].grade !== g) S.curSel = list[0].code;
  const filtered = q ? list.filter(s => (s.code + " " + s.title + " " + s.outcome + " " + s.strand + " " + s.vocab.join(" ") + " " + s.lessons.join(" ") + " " + UNITS[s.sk].kc.join(" ") + " " + UNITS[s.sk].mat).toLowerCase().includes(q)) : list;
  const groups = [];
  filtered.forEach(s => { let gr = groups.find(x => x.k === s.sub); if (!gr) groups.push(gr = {k:s.sub, items:[]}); gr.items.push(s); });
  const so = SO[S.curSel], inPlan = S.plan.grade === so.grade && S.plan.sos.includes(so.code);
  return `
  ${ph("Curriculum", `${CN(g)} outcomes with organizing ideas, lesson topics, learning objectives, essential questions, key concepts, vocabulary, suggested materials and assessment. ${esc(COURSES[g].blurb)}`, `${COURSES[g].diploma ? `<span class="badge b-quiz" style="align-self:center">Program note</span>` : ""}${gradeSeg(g, "cgrade")}`)}
  <div class="split wide">
    <aside class="card sticky">
      <div class="card-b tight"><div class="search">${ic("search")}<input id="cq" type="search" placeholder="Search units, texts, terms" value="${esc(S.cq)}" aria-label="Search outcomes"></div></div>
      <div class="olist" style="border-top:1px solid var(--line2)">
        ${groups.length ? groups.map(gr => `<div class="ogroup">${esc(gr.k)}</div>${gr.items.map(s => `<button class="oitem" data-act="cursel" data-code="${s.code}" aria-current="${s.code===so.code}"><span class="code">${sc(s.code)}</span><span>${esc(s.title)}</span>${S.plan.grade===s.grade && S.plan.sos.includes(s.code) ? `<span class="pin" title="In weekly plan"></span>` : "<span></span>"}</button>`).join("")}`).join("") : `<p class="muted small" style="padding:14px">No outcomes match “${esc(S.cq)}”.</p>`}
      </div>
    </aside>
    <article class="card">
      <div class="card-h" style="align-items:flex-start">
        <div style="min-width:0">
          <div class="row" style="gap:8px;margin-bottom:6px"><span class="code">${dc(so.code)}</span><span class="eyebrow">${esc(so.sub)}</span></div>
          <h2 style="font-size:1.4rem">${esc(so.title)}</h2>
        </div>
        <button class="btn ${inPlan ? "ghost" : ""}" data-act="toggleplan" data-code="${so.code}">${inPlan ? ic("check") + "In weekly plan" : ic("plus") + "Add to weekly plan"}</button>
      </div>
      <div class="sec"><div class="eyebrow">Unit outcome</div><p>${esc(so.outcome)}</p></div>
      <div class="sec"><div class="eyebrow">Organizing ideas</div><div class="pos">${so.pos.map(p => `<div><span class="code">${p}</span><span>${esc(POS[p])} <span class="xs muted">· ${esc(GOSHORT[p[0]])}</span></span></div>`).join("")}</div></div>
      <div class="sec"><div class="eyebrow">Unit focusing questions</div><ul style="margin:0;padding-left:18px">${UNITS[so.sk].fq.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="sec"><div class="eyebrow">Essential questions</div><ul style="margin:0;padding-left:18px">${so.eq.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="sec"><div class="eyebrow">Lesson topics and learning objectives</div>
        <ol class="lessonsteps">${so.lessons.map((t,i) => `<li><div style="min-width:0"><b>${esc(t)}</b><div class="small muted">${esc(objectiveOf(so,i))}</div></div><button class="btn ghost sm" data-act="openlesson" data-code="${so.code}" data-i="${i}">Open lesson</button></li>`).join("")}</ol></div>
      <div class="sec"><div class="eyebrow">Unit key concepts</div><div class="chips">${UNITS[so.sk].kc.map(v => `<span class="chip">${esc(v)}</span>`).join("")}</div></div>
      <div class="sec"><div class="eyebrow">Vocabulary and terms</div><div class="chips">${so.vocab.map(v => `<span class="chip">${esc(v)}</span>`).join("")}</div></div>
      <div class="sec"><div class="eyebrow">Suggested texts and resources</div><p class="small">${esc(UNITS[so.sk].mat[0].toUpperCase() + UNITS[so.sk].mat.slice(1))}.</p></div>
      <div class="sec"><div class="eyebrow">Subject</div><div class="stack" style="gap:6px">${Object.entries(GOS).map(([k,v]) => `<div class="${goOf(so).includes(k) ? "" : "go-off"}"><span class="muted">${esc(v)}</span></div>`).join("")}<p class="xs muted">Highlighted outcomes are developed in this unit. Wording is paraphrased from the Program of Studies.</p></div></div>
      ${refOf(so.grade).length ? `<div class="sec"><div class="eyebrow">${"Reference"}</div><div class="stack" style="gap:8px"><div class="refgrid">${refOf(so.grade).map(([k,v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")}</div>${COURSES[so.grade].diploma ? `<p class="xs muted">Check the current program of studies on alberta.ca.</p>` : ""}</div></div>` : ""}
      <div class="sec"><div class="eyebrow">Assessment</div><div class="stack" style="gap:8px">${assessPlan(so).map(([k,v]) => `<div><b>${k}.</b> <span class="muted">${esc(v)}</span></div>`).join("")}</div></div>
      <div class="sec"><div class="eyebrow">Proficiency descriptors</div><div class="desc">${descriptors(so).map(([l,t]) => `<div><span class="lv lv${l}">${LV[l]}</span><span>${esc(t)}</span></div>`).join("")}</div></div>
    </article>
  </div>`;
}

// ---------- Weekly plan ----------
function rWeek(){
  const p = S.plan, list = sessions(p), d0 = iso(today0());
  const weeks = [];
  if (list.length) { let mon = mondayOf(list[0].date); const last = list[list.length-1].date; while (mon <= last) { weeks.push(mon); mon = addDays(mon, 7); } }
  const byDate = Object.fromEntries(list.map(s => [iso(s.date), s]));
  const skip = new Set((p.skip||"").split(/[\s,]+/).filter(Boolean));
  const nL = list.filter(s => s.type === "lesson").length;
  return `
  ${ph("Weekly plan", "Lessons laid out on your teaching days, with a practice workshop, a review day and a check-in quiz after each outcome. Select a day to open its plan.")}
  <div class="split">
    <aside class="card sticky">
      <div class="card-h"><h2>Plan settings</h2></div>
      <div class="card-b stack" style="gap:14px">
        <label class="f">Course<select id="pGrade">${courseOpts(p.grade)}</select></label>
        <div class="row" style="align-items:flex-end;flex-wrap:nowrap">
          <label class="f" style="flex:1;min-width:0">First day<input type="date" id="pStart" value="${p.start}"></label>
          <label class="f" style="width:90px;flex:none">Minutes<input type="number" id="pPeriod" min="30" max="120" step="5" value="${p.period}"></label>
        </div>
        <div class="stack" style="gap:6px"><span class="eyebrow">Teaching days</span><div class="chips">${[1,2,3,4,5].map(d => `<label class="pick"><input type="checkbox" data-act="pday" data-d="${d}" ${p.days.includes(d)?"checked":""}>${DOW[d]}</label>`).join("")}</div></div>
        <label class="f">No-school dates<input id="pSkip" placeholder="2026-11-11, 2026-11-12" value="${esc(p.skip)}"></label>
        <div class="stack" style="gap:8px"><label class="row small" style="gap:8px;flex-wrap:nowrap"><input type="checkbox" id="pWs" ${p.ws?"checked":""}>Practice workshop after each outcome</label><label class="row small" style="gap:8px;flex-wrap:nowrap"><input type="checkbox" id="pReview" ${p.review?"checked":""}>Review day after each outcome</label><label class="row small" style="gap:8px;flex-wrap:nowrap"><input type="checkbox" id="pQuiz" ${p.quiz?"checked":""}>Check-in quiz after each outcome</label></div>
        <div class="stack" style="gap:6px"><span class="eyebrow">Outcomes (${p.sos.length})</span>
          <div class="stack" style="gap:2px;max-height:300px;overflow-y:auto">${gradeSOs(p.grade).map(s => `<label class="row small" style="gap:8px;flex-wrap:nowrap;padding:3px 0;cursor:pointer"><input type="checkbox" data-act="toplan" data-code="${s.code}" ${p.sos.includes(s.code)?"checked":""}><span class="code">${sc(s.code)}</span><span style="min-width:0">${esc(s.title)}</span></label>`).join("")}</div></div>
      </div>
    </aside>
    <section style="min-width:0">
      ${list.length ? `
      <div class="card" style="margin-bottom:18px"><div class="card-b row between">
        <div class="row" style="gap:24px">
          <div class="stat"><span class="n">${nL}</span><span class="l">Lessons</span></div>
          <div class="stat"><span class="n">${list.length - nL}</span><span class="l">Workshop, review and check-in days</span></div>
          <div class="stat"><span class="n">${weeks.length}</span><span class="l">Weeks · ${fmtS(list[0].date)} – ${fmtS(list[list.length-1].date)}</span></div>
        </div>
        <div class="legend">${typeBadge("lesson")}${typeBadge("ws")}${typeBadge("review")}${typeBadge("quiz")}</div>
      </div></div>
      ${weeks.map((mon,wi) => `<div class="wk"><div class="wk-h"><b>Week ${wi+1}</b><span class="small muted">${fmtS(mon)} – ${fmtS(addDays(mon,4))}</span></div>
        <div class="days">${[0,1,2,3,4].map(k => { const d = addDays(mon,k), key = iso(d), s = byDate[key];
          if (!s) return `<div class="dc off"><span class="dn">${DOW[d.getDay()]} ${d.getDate()}</span><span class="xs">${skip.has(key) ? "No school" : p.days.includes(d.getDay()) ? "" : "No lesson"}</span></div>`;
          return `<button class="dc ${key===d0?"today":""}" data-act="openday" data-ix="${s.ix}"><div class="top"><span class="dn">${DOW[d.getDay()]} ${d.getDate()}</span>${typeBadge(s.type)}</div><span class="t">${esc(s.title)}</span><span class="o"><span class="code">${sc(s.code)}</span>${s.type==="lesson" ? ` Lesson ${s.i+1} of ${SO[s.code].lessons.length}` : ""}</span></button>`; }).join("")}</div></div>`).join("")}`
      : `<div class="card"><div class="empty"><h2>No outcomes selected</h2><p>Tick one or more outcomes in Plan settings to build the calendar.</p></div></div>`}
    </section>
  </div>`;
}

// ---------- Daily plan ----------
function rDay(){
  const list = sessions(S.plan);
  if (!list.length) return `${ph("Daily plan", "")}<div class="card"><div class="empty"><h2>No plan yet</h2><p>Add outcomes to the weekly plan first.</p><button class="btn" style="margin-top:12px" data-act="tab" data-t="week">Go to weekly plan</button></div></div>`;
  if (S.daySel == null) S.daySel = currentSessionIndex(list);
  S.daySel = Math.max(0, Math.min(S.daySel, list.length-1));
  const s = list[S.daySel], so = SO[s.code], P = S.plan.period, m = minutes(P, s.type), prev = list[S.daySel-1];
  let rows, focus;
  const W = WSFORM[so.grade] || {};
  if (s.type === "lesson") {
    focus = [["Learning objective", objectiveOf(so,s.i)], ["Student target", iCanOf(so,s.i)], ["Essential question", so.eq[s.i % so.eq.length]]];
    rows = [
      prev && prev.type === "lesson" ? `Retrieval: two quick questions on “${esc(prev.title)}”, then a one-minute quick-write linking it to today. Share two responses.` : `Bell-ringer: a short quotation, image or question linking students' lives to ${esc(lc(so.title))}. Students write for two minutes, then pair and share.`,
      `Mini-lesson on <b>${esc(lc(s.title))}</b>. Pose the essential question, name the key terms, and model the thinking aloud with the first worked example on the lesson page.`,
      `Work through the activity on the Activity tab together: read or set up the task, fill in the organizer in pairs, and discuss the questions. Circulate and ask “How do you know?”`,
      `Students apply the skill: practice questions from Basic to Challenge on the lesson page, using today's vocabulary in their answers.`,
      `Exit ticket on today's objective plus a confidence rating (1–4). Sort responses into EX, PR, AD and LM for ${dc(so.code)}.`
    ];
  } else if (s.type === "ws") {
    focus = [[isELA(so) ? "Writing task" : "Task", W.task || `A hands-on task or short written explanation for ${dc(so.code)}`], ["Look for", W.cats || "Understanding, strategy, communication and accuracy"], ["After class", "Score the response with the scoring categories and record it in the markbook."]];
    rows = [
      `Unpack the prompt together: underline key words, restate it in students' own words and brainstorm three possible ideas linked to ${esc(lc(so.title))}. Each student chooses a direction and a text.`,
      `Sustained drafting time. Students use the planning organizer from a ${sc(so.code)} lesson and the writing reference on the Curriculum page. Keep the room quiet; conference with three or four students.`,
      `Peer response in pairs with two stars and a wish tied to the scoring categories. Students mark one sentence they want to strengthen.`,
      `Revise for ideas and support first, then edit for sentence variety, precise word choice and conventions. Students read their draft aloud quietly to catch errors.`,
      `Students write a short reflection: what changed in revision and what they want feedback on. Collect drafts or set the final due date.`
    ];
  } else if (s.type === "review") {
    focus = [["Focus", `Consolidate ${dc(so.code)}: ${so.title}`], ["Student targets", so.lessons.map((t,i) => iCanOf(so,i)).join(" ")]];
    rows = [
      `Warm-up: one quick question per lesson topic. Students answer silently, then compare with a partner.`,
      `Quick recap of each lesson topic: ${so.lessons.map(esc).join("; ")}. Students add one example from class to each.`,
      `Stations, one per lesson topic. Students choose the stations that match their lowest exit-ticket results.`,
      `The 20-question practice test from the lesson page, self-marked with the answer key. Students note which questions they missed and why.`,
      `Self-assessment against each “I can” statement; students set one goal for the check-in.`
    ];
  } else {
    focus = [["Assessment", `Check-in quiz on ${dc(so.code)}: ${so.title}`], ["After class", "Mark with proficiency levels and record the results in the markbook."]];
    rows = [
      `Calm start: a two-minute quick-write and a reminder of the success criteria.`,
      `Clarify instructions and show which questions match which lesson topic. Remind students to read each question carefully.`,
      `Part A: questions covering each lesson topic.`,
      `Part B: one written response (a paragraph) that applies the unit's key ideas and gives evidence for EX.`,
      `Collect quizzes. Students note the lesson topic that felt hardest.`
    ];
  }
  let t = 0;
  const action = s.type === "lesson" ? `<button class="btn" data-act="openlesson" data-code="${so.code}" data-i="${s.i}">${ic("lesson")}Open lesson materials</button>`
    : s.type === "quiz" ? `<button class="btn" data-act="quizassess" data-code="${so.code}">${ic("marks")}Record quiz in markbook</button>`
    : s.type === "ws" ? `<span class="row"><button class="btn" data-act="opentext" data-code="${so.code}">${ic("open")}Open text studies</button><button class="btn ghost" data-act="wsassess" data-code="${so.code}">${ic("marks")}Record written response</button></span>`
    : `<button class="btn ghost" data-act="openlesson" data-code="${so.code}" data-i="0">${ic("lesson")}Lesson materials</button>`;
  return `
  ${ph("Daily plan", `${P}-minute lesson plans for every day in the weekly plan.`,
    `<button class="btn ghost" data-act="dstep" data-d="-1" ${S.daySel===0?"disabled":""} aria-label="Previous day">${ic("left")}</button>
     <select id="daySel" aria-label="Choose a day" style="max-width:min(320px,60vw)">${list.map(x => `<option value="${x.ix}" ${x.ix===S.daySel?"selected":""}>${fmt(x.date)} · ${sc(x.code)} · ${esc(x.title)}</option>`).join("")}</select>
     <button class="btn ghost" data-act="dstep" data-d="1" ${S.daySel===list.length-1?"disabled":""} aria-label="Next day">${ic("right")}</button>`)}
  <div class="split rev">
    <article class="card">
      <div class="card-h" style="align-items:flex-start">
        <div style="min-width:0">
          <div class="row" style="gap:8px;margin-bottom:6px">${typeBadge(s.type)}<span class="eyebrow">${fmt(s.date)} · ${CN(so.grade)} · ${esc(so.sub)}</span></div>
          <h2 style="font-size:1.35rem"><span class="code" style="vertical-align:3px">${sc(so.code)}</span> ${esc(s.title)}</h2>
        </div>
        ${action}
      </div>
      <div class="card-b stack" style="gap:20px">
        <div class="tbar" aria-hidden="true">${m.map(([n,min],k) => `<span style="flex:${min};background:${SEGCOL[k]};color:var(--surface)" title="${n}: ${min} min">${min}′</span>`).join("")}</div>
        <ol class="tl">${m.map(([n,min],k) => { const a = t; t += min; return `<li><span class="tm">${a}–${t} min</span><span class="rail"><i style="background:${SEGCOL[k]}"></i></span><div class="body"><b>${n}</b><div class="small">${rows[k]}</div></div></li>`; }).join("")}</ol>
      </div>
    </article>
    <aside class="stack">
      <div class="card"><div class="card-b">${focus.map(([k,v]) => `<div class="kv"><span class="eyebrow">${k}</span><span>${esc(v)}</span></div>`).join("")}</div></div>
      <div class="card"><div class="card-b"><div class="kv"><span class="eyebrow">Key vocabulary</span><div class="chips">${so.vocab.map(v => `<span class="chip">${esc(v)}</span>`).join("")}</div></div>
        <div class="kv"><span class="eyebrow">Texts and materials</span><span class="small">${esc(MODELS[so.sk][0].toUpperCase() + MODELS[so.sk].slice(1))}; annotation highlighters; exit-ticket slips.</span></div></div></div>
      <div class="card"><div class="card-b"><div class="kv"><span class="eyebrow">Support</span><span class="small">Read-aloud of instructions, manipulatives or visuals, a partly completed organizer, sentence starters and a vocabulary sheet; start at Basic questions. Allow speech-to-text for drafting.</span></div>
        <div class="kv"><span class="eyebrow">Extension</span><span class="small">Challenge questions, an open-ended extension task, or teaching the skill to a classmate.</span></div>
        <div class="kv"><span class="eyebrow">Discussion norms</span><span class="small">Refer to the text, build on or question others' ideas, and invite quieter voices in (GO 5).</span></div></div></div>
    </aside>
  </div>`;
}

// ---------- Lessons ----------
function rLessons(){
  const so = SO[S.lesson.code], i = S.lesson.i, key = so.code + "_" + i, L = S.lessons[key], g = so.grade;
  const b = L?.body || {}, tst = L?.test || {};
  const counts = {vocab: b.vocabulary?.length, text: b.study?.passage ? 1 : 0, examples: b.examples?.length, practice: b.practice?.length, test: tst.items?.length};
  const LT = [["overview","Overview"],["vocab","Vocabulary"],["text","Activity"],["examples","Examples"],["practice","Practice"],["test","Practice test"]];
  return `
  ${ph("Lessons", "Every lesson comes with a learning objective, key vocabulary, a learning activity (a studio task, scene, listening or playing task, design challenge, field activity, dilemma or dialogue), worked examples, 15 practice questions and a 20-question practice test.")}
  <div class="split">
    <aside class="card sticky">
      <div class="card-b stack" style="gap:12px">
        ${gradeSeg(g, "lgrade")}
        <label class="f">Unit outcome<select id="lSO">${gradeSOs(g).map(s => `<option value="${s.code}" ${s.code===so.code?"selected":""}>${sc(s.code)} · ${esc(s.title)}</option>`).join("")}</select></label>
      </div>
      <div class="olist" style="border-top:1px solid var(--line2)">
        <div class="ogroup">Lessons in ${dc(so.code)}</div>
        ${so.lessons.map((t,k) => `<button class="oitem" data-act="lsel" data-i="${k}" aria-current="${k===i}"><span class="code">${k+1}</span><span>${esc(t)}</span>${S.lessons[so.code+"_"+k] ? `<span title="Generated" style="color:var(--l3)">${ic("check")}</span>` : "<span></span>"}</button>`).join("")}
      </div>
    </aside>
    <article class="card" style="min-width:0">
      <div class="card-h" style="align-items:flex-start">
        <div style="min-width:0">
          <div class="row" style="gap:8px;margin-bottom:6px"><span class="code">${dc(so.code)}</span><span class="eyebrow">${CN(g)} · ${esc(so.title)} · Lesson ${i+1}</span></div>
          <h2 style="font-size:1.35rem">${esc(so.lessons[i])}</h2>
        </div>
        <div class="row">
          ${S.busy === key ? `<span class="row small"><span class="spinner"></span>${esc(S.busyMsg)}</span>` : `
          ${L?.builtin ? `<span class="badge b-lesson" title="Written in advance and included with the app">Built-in lesson</span>` : L ? `<span class="badge b-review" title="Your saved version">Your version</span>` : ""}
          ${window.PB_PLATFORM ? `<button class="btn ghost" data-act="assignlesson" data-code="${so.code}" data-i="${i}">${ic("users")}Open for students</button>` : ""}
          ${L && downloadsCap ? `<button class="btn" data-act="dl">${ic("download")}Download</button>` : ""}
          ${sampleCap ? `<button class="btn ghost" data-act="gen" ${S.busy ? "disabled" : ""}>${ic("spark")}${L ? "Rewrite with Claude" : "Generate lesson"}</button>` : ""}
          ${sampleCap && so.lessons.some((_,k) => !S.lessons[so.code+"_"+k]) ? `<button class="btn quiet" data-act="genall" ${S.busy ? "disabled" : ""} title="Write every missing lesson in ${dc(so.code)}">${ic("spark")}Generate all missing</button>` : ""}`}
        </div>
      </div>
      ${!L && S.loadingLessons === so.code ? `<div class="card-b row" style="padding-bottom:0"><span class="spinner"></span><span class="muted small">Loading lesson…</span></div>` : ""}
      ${S.genErr ? `<div class="card-b" style="padding-bottom:0"><p class="note warn">${ic("alert")}<span>${esc(S.genErr)}</span></p></div>` : ""}
      <div class="tabs" role="tablist" style="margin-top:6px">${LT.map(([k,l]) => `<button role="tab" data-act="ltab" data-v="${k}" aria-selected="${S.ltab===k}">${l}${counts[k] && k !== "text" ? `<span class="n">${counts[k]}</span>` : ""}</button>`).join("")}
        ${L && (S.ltab === "practice" || S.ltab === "test" || S.ltab === "examples") ? `<label class="row small" style="margin-left:auto;gap:7px;padding:0 8px;white-space:nowrap;flex-wrap:nowrap"><input type="checkbox" id="showAns" ${S.showAns?"checked":""}>Show answers</label>` : ""}</div>
      <div class="card-b">${lessonTab(so, i, L)}</div>
    </article>
  </div>`;
}
function needGen(what){ return `<div class="empty" style="padding:30px 10px"><p>${what} for this lesson ${S.loadingLessons ? "are loading…" : "aren't available yet."}</p>${sampleCap && !S.busy && !S.loadingLessons ? `<button class="btn" style="margin-top:12px" data-act="gen">${ic("spark")}Generate lesson</button>` : ""}</div>`; }
function lessonTab(so, i, L){
  const b = L?.body || {}, t = L?.test || {}, A = S.showAns;
  if (S.ltab === "overview") return `<div class="stack" style="gap:18px">
    <div class="meta">
      <div class="kv"><span class="eyebrow">Unit</span><span class="small">${esc(CN(so.grade))} · ${esc(so.sub)}</span></div>
      <div class="kv"><span class="eyebrow">Topic → lesson</span><span class="small">${esc(so.title)} → <b>${esc(so.lessons[i])}</b></span></div>
      <div class="kv" style="grid-column:1/-1"><span class="eyebrow">Unit outcome ${dc(so.code)}</span><span class="small">${esc(so.outcome)}</span></div>
      <div class="kv" style="grid-column:1/-1"><span class="eyebrow">Organizing ideas</span><div class="chips">${so.pos.map(p => `<span class="chip" title="${esc(POS[p])}"><b>${p}</b> ${esc(POS[p])}</span>`).join("")}</div></div>
    </div>
    <div class="meta">
      <div class="kv"><span class="eyebrow">Learning objective</span><span>${esc(b.objective || objectiveOf(so,i))}</span></div>
      <div class="kv"><span class="eyebrow">Student target</span><span>${esc(b.iCan || iCanOf(so,i))}</span></div>
      <div class="kv"><span class="eyebrow">Essential question</span><span>${esc(so.eq[i % so.eq.length])}</span></div>
    </div>
    ${b.successCriteria?.length ? `<div class="kv"><span class="eyebrow">Success criteria</span><ul style="margin:0;padding-left:18px">${b.successCriteria.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
    ${b.hook ? `<div class="kv"><span class="eyebrow">Hook</span><p class="explore" style="font-size:.95rem">${esc(b.hook)}</p></div>` : ""}
    ${b.misconceptions?.length || b.exitTicket?.length ? `<div class="cols">
      ${b.misconceptions?.length ? `<div class="kv"><span class="eyebrow">Common misconceptions</span><ul style="margin:0;padding-left:18px">${b.misconceptions.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      ${b.exitTicket?.length ? `<div class="kv"><span class="eyebrow">Exit ticket</span><ol style="margin:0;padding-left:18px">${b.exitTicket.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>` : ""}</div>` : ""}
    ${!L ? `<div class="kv"><span class="eyebrow">Vocabulary for this outcome</span><div class="chips">${so.vocab.map(v => `<span class="chip">${esc(v)}</span>`).join("")}</div></div>` : ""}
  </div>`;
  if (S.ltab === "vocab") return b.vocabulary?.length ? `<div class="vocab">${b.vocabulary.map(v => `<div><b>${esc(v.term)}</b><span class="small">${esc(v.definition)}</span></div>`).join("")}</div>` : needGen("Vocabulary definitions");
  if (S.ltab === "text") { const x = b.study; if (!x?.passage) return needGen("The activity");
    const li = a => (a||[]).map(v => `<li>${esc(v)}</li>`).join("");
    return `<div class="stack" style="gap:16px">
      <div><h3 style="font-size:1.12rem">${esc(x.title || "Activity")}</h3>${x.type ? `<span class="eyebrow">${esc(x.type)}</span>` : ""}</div>
      <div class="kv"><span class="eyebrow">Focus question</span><span>${esc(x.question)}</span></div>
      <div><div class="passage">${esc(x.passage)}</div>${x.source ? `<p class="xs muted">${esc(x.source)}</p>` : ""}</div>
      <div class="kv"><span class="eyebrow">Steps</span><ol class="lessonsteps">${(x.steps||[]).map(v => `<li><span style="min-width:0">${esc(v)}</span><span></span></li>`).join("")}</ol></div>
      ${x.organizer?.length ? `<div class="kv"><span class="eyebrow">Organizer</span><div class="tablewrap"><table><thead><tr>${x.organizer.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${[0,1,2].map(() => `<tr>${x.organizer.map(() => "<td>&nbsp;</td>").join("")}</tr>`).join("")}</tbody></table></div></div>` : ""}
      <div class="kv"><span class="eyebrow">Discussion questions</span><ol style="margin:0;padding-left:18px">${li(x.discussion)}</ol></div>
      ${x.product ? `<div class="kv"><span class="eyebrow">Writing task</span><p class="explore">${esc(x.product)}</p></div>` : ""}
    </div>`; }
  if (S.ltab === "examples") return b.examples?.length ? `<div class="stack" style="gap:12px">${b.examples.map((e,k) => `<div class="ex">
      <div class="hd"><span class="num">Example ${k+1}</span><b>${esc(e.title||"")}</b></div><div>${esc(e.problem)}</div>
      ${A && e.steps?.length ? `<ol class="small">${e.steps.map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}${A && e.answer ? `<div class="ans">Answer: ${esc(e.answer)}</div>` : ""}
      ${e.explore ? `<div class="explore"><b>Explore:</b> ${esc(e.explore)}</div>` : ""}</div>`).join("")}${!A ? `<p class="xs muted">Turn on “Show answers” to see the worked steps.</p>` : ""}</div>` : needGen("Worked examples");
  if (S.ltab === "practice") return b.practice?.length ? `<ol class="qs">${b.practice.map(q => `<li><div>${esc(q.q)}<span class="lvl ${esc(q.level||"")}">${esc(q.level||"")}</span>${A ? `<div class="ans">${esc(q.a)}</div>` : ""}</div></li>`).join("")}</ol>` : needGen("Practice questions");
  if (S.ltab === "test") return t.items?.length ? `<div class="stack" style="gap:6px"><h3>${esc(t.title || "Practice test")}</h3><ol class="qs">${t.items.map(q => `<li><div>${esc(q.q)}<span class="lvl ${esc(q.level||"")}">${esc(q.level||"")}</span>${q.options?.length ? `<div class="opts">${q.options.map(o => `<span>${esc(o)}</span>`).join("")}</div>` : ""}${A ? `<div class="ans">Answer: ${esc(q.answer)}</div>` : ""}</div></li>`).join("")}</ol></div>` : (L && !S.busy ? `<div class="empty"><p>The practice test wasn't generated.</p><button class="btn" style="margin-top:12px" data-act="gen">${ic("spark")}Regenerate lesson</button></div>` : needGen("The 20-question practice test"));
  return "";
}
function ctx(so, i){
  return `You are an experienced Alberta junior high ${SUBJ(so).name} teacher writing classroom materials.
Course: ${CN(so.grade)} (Grade ${COURSES[so.grade].grade}, Alberta ${SUBJ(so).name} program of studies, a junior high complementary course). Unit: ${UNITS[so.sk].title}. Guiding questions: ${UNITS[so.sk].fq.join(" ")}
Unit outcome ${dc(so.code)}: ${so.outcome}
Organizing ideas: ${so.pos.map(p => POS[p]).join("; ")}
Lesson focus: ${so.lessons[i]}
Unit key concepts: ${UNITS[so.sk].kc.join(", ")}
Key vocabulary: ${so.vocab.join(", ")}
Suggested materials: ${UNITS[so.sk].mat}.
${COURSES[so.grade].diploma ? "Provincial Achievement Test reference: " + refOf(so.grade).slice(0,6).map(([k,v]) => k + ": " + v).join("; ") + "." : ""}
Write for ${CN(so.grade)} students (about 12 to 15 years old): clear, engaging and practical. ${isLang(so) ? "This is a beginner second-language course: give target-language words and sentences with English meanings, keep the language at this grade's level, and check spelling, accents and grammar carefully." + (so.subj === "CHI" ? " Give simplified characters with pinyin and tone marks." : "") : ""} For hands-on, studio, kitchen, shop or outdoor work, include clear safety steps. Plain text only: no LaTeX and no markdown. Use Canadian spelling and Canadian or Alberta contexts where natural. Passages must be your own original writing, or public-domain text published before 1929 with its author and title; never quote copyrighted works or song lyrics. Check every answer, term and attribution carefully.`;
}
async function generate(code = S.lesson.code, i = S.lesson.i){
  const so = SO[code], key = so.code + "_" + i;
  if (!sampleCap || S.busy) return;
  S.busy = key; S.genErr = ""; S.busyMsg = "Writing lesson and practice…"; render();
  const rec = {kind:"lesson", key, code:so.code, i, at:new Date().toISOString(), body:null, test:null};
  try {
    rec.body = await sampleCap.json(ctx(so,i) + `
Reply with only a JSON object of this shape:
{"objective":"Students will be able to ...","iCan":"I can ...","successCriteria":["three short criteria"],"hook":"a 2-3 sentence opener that connects to students' lives","vocabulary":[{"term":"","definition":"student-friendly definition"}],"study":{"title":"","type":"Studio, Performance, Rehearsal, Listening, Design challenge, Field activity, Case study, Dialogue or Discussion","question":"the focus question","passage":"the material for the activity, 80-250 words: studio steps for Art, a scene, game or script excerpt for Drama, a listening or performance task for Music, a design brief for CTF, a field task for Outdoor Ed, a case or dilemma for Ethics, or a dialogue or short text with English support for a language","source":"Original passage written for this lesson, or the public-domain author, title and year","steps":["4 or 5 steps for students"],"organizer":["3 or 4 column headings for a graphic organizer"],"discussion":["4 questions about the activity"],"product":"a short task for students to do or write"},"examples":[{"title":"","problem":"a short passage, line or scenario with a task","steps":["reasoning step"],"answer":"a model answer","explore":"a follow-up question for students to explore"}],"practice":[{"q":"","a":"a model or sample answer","level":"Basic"}],"misconceptions":["three common misconceptions"],"exitTicket":["question 1","question 2"]}
Give 5 to 8 vocabulary terms, one learning activity, exactly 4 worked examples of increasing difficulty, and exactly 15 practice questions (5 Basic, 6 Intermediate, 4 Challenge) with answers. Questions that ask about a text must include the lines or passage they refer to. "level" is one of Basic, Intermediate, Challenge.`, {modelTier:"default"});
    S.lessons[key] = rec; S.busyMsg = "Writing the practice test…"; render();
    rec.test = await sampleCap.json(ctx(so,i) + `
Write a 20-question practice test for this lesson focus: 12 multiple-choice questions with 4 options each labelled "A) ", "B) ", "C) ", "D) " (include the short passage or lines each question refers to, in the question), and 8 written-response questions including at least 2 that ask students to analyze a short passage. Give a model answer for each written question. Order from easier to harder.
Reply with only a JSON object: {"title":"Practice test: ...","items":[{"type":"mc","q":"","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"B) ...","level":"Basic"}]} with exactly 20 items. Short-answer items use "type":"short" and no options. "level" is one of Basic, Intermediate, Challenge.`, {modelTier:"default"});
  } catch(e) {
    const c = e?.code;
    S.genErr = c === "not_granted" ? "Lesson writing isn't allowed for this page yet. Allow it from the page's permissions, then try again." :
               c === "rate_limited" ? "You've reached the current usage limit. Try again a little later." :
               (e?.userMessage || "The lesson couldn't be generated completely. Try Generate again.");
  }
  if (rec.body) { S.lessons[key] = rec; await store.set("l_" + key, rec); }
  S.busy = null; render();
}
async function generateAll(){
  const so = SO[S.lesson.code]; if (!sampleCap || S.busy) return;
  for (let k = 0; k < so.lessons.length; k++) {
    if (S.lessons[so.code+"_"+k]) continue;
    S.lesson.i = k; await generate(so.code, k); if (S.genErr) break;
  }
  if (!S.genErr) toast(`All ${dc(so.code)} lessons are ready`);
}
const BUILTIN = {}, LOADED = {};
let BUILTIN_INDEX;
async function builtinIndex(){
  if (BUILTIN_INDEX !== undefined) return BUILTIN_INDEX;
  try { const r = await fetch("lessons/index.json"); BUILTIN_INDEX = r.ok ? new Set(await r.json()) : null; } catch(e) { BUILTIN_INDEX = null; }
  return BUILTIN_INDEX;
}
async function builtinFor(code){
  if (BUILTIN[code] !== undefined) return BUILTIN[code];
  try {
    if (window.PB_PLATFORM?.lessonFile) BUILTIN[code] = await PB_PLATFORM.lessonFile(code);
    else {
      const ix = await builtinIndex();
      if (ix && !ix.has(code)) BUILTIN[code] = null;
      else { const r = await fetch(`lessons/${code}.json`); BUILTIN[code] = r.ok ? await r.json() : null; }
    }
  } catch(e) { BUILTIN[code] = null; }
  return BUILTIN[code];
}
async function loadLessonsFor(code){
  const so = SO[code]; if (!so) return;
  S.loadingLessons = code; if (S.tab === "lessons") render();
  if (LOADED[code]) { if (S.loadingLessons === code) S.loadingLessons = null; if (S.tab === "lessons" || S.tab === "test") render(); return; }
  const b = await builtinFor(code);
  if (b) b.lessons.forEach(l => { if (!S.lessons[l.key]) S.lessons[l.key] = l; });
  if (S.storeReady) await Promise.all(so.lessons.map(async (t,k) => { const key = code + "_" + k; if (S.lessons[key] && !S.lessons[key].builtin) return; const r = await store.get("l_" + key); if (r && r.body) S.lessons[key] = r; }));
  if (S.storeReady) LOADED[code] = true;
  if (S.loadingLessons === code) S.loadingLessons = null;
  if (S.tab === "lessons" || S.tab === "test") render();
}
async function downloadLesson(){
  const so = SO[S.lesson.code], i = S.lesson.i, L = S.lessons[so.code+"_"+i]; if (!L || !downloadsCap) return;
  const b = L.body||{}, t = L.test||{};
  const li = a => (a||[]).map(x => `<li>${esc(x)}</li>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${dc(so.code)} Lesson ${i+1}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:30px auto;line-height:1.5;padding:0 16px}h1{font-size:22px}h2{font-size:17px;border-bottom:1px solid #ccc;padding-bottom:3px;margin-top:26px}.a{color:#2e7d4f}.pb{page-break-before:always}</style></head><body>
<h1>${CN(so.grade)} · ${dc(so.code)}: ${esc(so.lessons[i])}</h1>
<p><b>Unit:</b> ${esc(so.sub)}<br><b>Outcome ${dc(so.code)}:</b> ${esc(so.outcome)}<br><b>Topic:</b> ${esc(so.title)} · <b>Lesson:</b> ${esc(so.lessons[i])}</p>
<p><b>Learning objective:</b> ${esc(b.objective||objectiveOf(so,i))}<br><b>Essential question:</b> ${esc(so.eq[i%so.eq.length])}</p>
<h2>Success criteria</h2><ul>${li(b.successCriteria)}</ul><p>${esc(b.hook)}</p>
<h2>Key vocabulary</h2><ul>${(b.vocabulary||[]).map(v=>`<li><b>${esc(v.term)}</b>: ${esc(v.definition)}</li>`).join("")}</ul>
${b.study ? `<h2>${esc(b.study.title||"Activity")}</h2><p><b>Focus question:</b> ${esc(b.study.question)}</p><blockquote style="font-family:Georgia,serif;border-left:3px solid #999;margin:0;padding:6px 16px;white-space:pre-line">${esc(b.study.passage)}</blockquote><p style="font-size:12px;color:#555">${esc(b.study.source||"")}</p><p><b>Steps</b></p><ol>${li(b.study.steps)}</ol>${b.study.organizer?.length ? `<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%"><tr>${b.study.organizer.map(h=>`<th>${esc(h)}</th>`).join("")}</tr>${[0,1,2,3].map(()=>`<tr>${b.study.organizer.map(()=>"<td>&nbsp;</td>").join("")}</tr>`).join("")}</table>` : ""}<p><b>Discussion</b></p><ol>${li(b.study.discussion)}</ol><p><b>Writing task:</b> ${esc(b.study.product)}</p>` : ""}
<h2>Examples to explore</h2>${(b.examples||[]).map((e,k)=>`<p><b>Example ${k+1}: ${esc(e.title)}</b><br>${esc(e.problem)}</p><ol>${li(e.steps)}</ol><p class="a">Answer: ${esc(e.answer)}</p><p><i>Explore:</i> ${esc(e.explore)}</p>`).join("")}
<h2 class="pb">Practice questions</h2><ol>${(b.practice||[]).map(q=>`<li>${esc(q.q)} <i>(${esc(q.level)})</i></li>`).join("")}</ol>
<h2 class="pb">${esc(t.title||"Practice test")}</h2><ol>${(t.items||[]).map(q=>`<li>${esc(q.q)}${q.options?`<br>${q.options.map(esc).join("<br>")}`:""}<br><br></li>`).join("")}</ol>
<h2 class="pb">Answer key</h2><p><b>Practice</b></p><ol>${(b.practice||[]).map(q=>`<li>${esc(q.a)}</li>`).join("")}</ol><p><b>Test</b></p><ol>${(t.items||[]).map(q=>`<li>${esc(q.answer)}</li>`).join("")}</ol>
<h2>Exit ticket</h2><ol>${li(b.exitTicket)}</ol><h2>Common misconceptions</h2><ul>${li(b.misconceptions)}</ul></body></html>`;
  try { await downloadsCap.save({filename:`${so.code.replace(".","-")}-lesson-${i+1}.html`, data:html}); toast("Lesson saved"); } catch(e) { if (e?.code !== "declined") toast("The file couldn't be saved."); }
}

// ---------- Markbook ----------
const curClass = () => S.classes.find(c => c.id === S.classSel) || null;
const classAssess = c => S.assess.filter(a => a.classId === c?.id).sort((a,b) => (a.date||"").localeCompare(b.date||""));
function pctDone(a, c){ const tot = c.students.length * a.sos.length; if (!tot) return 0; let n = 0; c.students.forEach(s => a.sos.forEach(k => { if (a.marks?.[s.id]?.[k] != null) n++; })); return Math.round(100*n/tot); }
const ring = p => { const r = 14, C = 2*Math.PI*r; return `<svg class="ring" viewBox="0 0 34 34" role="img" aria-label="${p}% entered"><circle cx="17" cy="17" r="${r}" fill="none" stroke="var(--sunk2)" stroke-width="4"/><circle cx="17" cy="17" r="${r}" fill="none" stroke="${p===100?"var(--l3)":"var(--accent)"}" stroke-width="4" stroke-dasharray="${C*p/100} ${C}" transform="rotate(-90 17 17)" stroke-linecap="round"/><text x="17" y="20.5" text-anchor="middle" style="font-size:9px;font-weight:700;fill:var(--ink)">${p}</text></svg>`; };
function classTabs(c, withNew=true){
  return `<div class="classtabs">${S.classes.map(x => `<button class="ctab" data-act="selclass" data-id="${x.id}" aria-pressed="${x.id===c?.id}">${esc(x.name)}<span class="g">${esc(CS(x.grade))}</span></button>`).join("")}
    ${withNew ? `<button class="btn quiet sm" data-act="newclass">${ic("plus")}New class</button>` : ""}</div>`;
}
function classForm(){
  return `<div class="row" style="align-items:flex-end"><label class="f" style="flex:1;min-width:170px">Class name<input id="cName" placeholder="e.g. Art 8 Block C"></label><label class="f">Course<select id="cGrade">${courseOpts(S.newAssess ? SO[S.newAssess.sos[0]]?.grade : "ART7")}</select></label><button class="btn" data-act="addclass">Create class</button></div>`;
}
function rMarks(){
  if (!S.storeReady) return `${ph("Markbook","")}<div class="card"><div class="card-b row"><span class="spinner"></span>Loading your saved marks…</div></div>`;
  const note = (store.mode === "db" || store.mode === "supabase") ? "" : `<p class="note" style="margin-bottom:16px">${ic("info")}<span>${store.mode === "local" ? "Marks are saved in this browser only. Open this page in claude.ai while signed in to keep them in your account." : "Marks can't be saved in this view."}</span></p>`;
  const scale = `<div class="legend">${[4,3,2,1,0].map(l => `<span><span class="lv lv${l}">${LV[l]}</span> ${LVNAME[l]}</span>`).join("")}</div>`;
  if (!S.classes.length) return `${ph("Markbook", "Record each student's proficiency level for every outcome you assess.")}${note}
    <div class="card" style="max-width:640px"><div class="card-h"><h2>Set up your first class</h2></div><div class="card-b stack">${classForm()}
      <div class="row between" style="border-top:1px solid var(--line2);padding-top:14px"><span class="small muted">Or explore with 12 example students and four assessments.</span><button class="btn ghost" data-act="sample">Load example class</button></div></div></div>
    <div style="margin-top:16px">${scale}</div>`;
  const c = curClass() || S.classes[0]; S.classSel = c.id;
  const as = classAssess(c);
  const a = as.find(x => x.id === S.assessSel) || as[as.length-1] || null; S.assessSel = a?.id || null;
  return `
  ${ph("Markbook", "Proficiency levels by outcome. Changes save automatically.", scale)}
  ${note}
  ${classTabs(c)}
  ${S.newClass ? `<div class="card" style="margin-bottom:16px"><div class="card-h"><h2>New class</h2><button class="btn quiet sm" data-act="cancelclass">Cancel</button></div><div class="card-b">${classForm()}</div></div>` : ""}
  <div class="split">
    <aside class="stack">
      <div class="card">
        <div class="card-h"><h2>Assessments</h2><button class="btn sm" data-act="newassess">${ic("plus")}New</button></div>
        ${S.newAssess ? `<div class="card-b" style="border-bottom:1px solid var(--line2)">${assessForm(c)}</div>` : ""}
        <div class="alist">${as.length ? as.slice().reverse().map(x => `<button class="aitem" data-act="selassess" data-id="${x.id}" aria-current="${x.id===a?.id}"><span style="min-width:0"><b>${esc(x.name)}</b><br><span class="xs muted">${esc(x.date)} · ${esc(x.type)}</span><span class="row" style="gap:4px;margin-top:5px">${x.sos.map(k => `<span class="code">${sc(k)}</span>`).join("")}</span></span><span data-ring="${x.id}">${ring(pctDone(x,c))}</span></button>`).join("") : `<p class="muted small" style="padding:16px">No assessments yet. Create one, then enter a level for each student.</p>`}</div>
      </div>
      <div class="card">
        <button class="card-h" data-act="classpanel" aria-expanded="${S.classPanel}" style="width:100%;font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:left"><h2 class="row" style="gap:8px">${ic("users")}Students (${c.students.length})</h2><span class="small muted">${S.classPanel ? "Hide" : "Manage"}</span></button>
        ${S.classPanel ? `<div class="card-b stack" style="gap:12px">
          <div class="chips">${c.students.map(s => `<span class="chip" style="display:flex;gap:4px;align-items:center;padding-right:4px">${esc(s.name)}<button class="btn quiet sm" style="padding:0 6px" aria-label="Remove ${esc(s.name)}" data-act="rmstudent" data-id="${s.id}">×</button></span>`).join("") || `<span class="small muted">No students yet.</span>`}</div>
          <label class="f">Add students, one name per line<textarea id="newStudents" placeholder="Student name"></textarea></label>
          <div class="row between"><button class="btn sm" data-act="addstudents">${ic("plus")}Add students</button>
            ${S.confirm === "class:"+c.id ? `<span class="row"><button class="btn danger sm" data-act="delclass">Delete class and marks</button><button class="btn quiet sm" data-act="cancel">Keep</button></span>` : `<button class="btn quiet sm" data-act="ask" data-k="class:${c.id}">${ic("trash")}Delete class</button>`}</div>
        </div>` : ""}
      </div>
    </aside>
    <section class="card" style="min-width:0">${a ? markGrid(a, c) : `<div class="empty"><h2>No assessment selected</h2><p>Create an assessment to start entering levels.</p></div>`}</section>
  </div>`;
}
function assessForm(c){
  const n = S.newAssess;
  return `<div class="stack" style="gap:12px">
    <label class="f">Name<input id="aName" value="${esc(n.name)}" placeholder="e.g. Short story analysis"></label>
    <div class="row" style="align-items:flex-end"><label class="f" style="flex:1">Date<input type="date" id="aDate" value="${n.date}"></label>
    <label class="f" style="flex:1">Type<select id="aType">${["Quiz","Unit test","Written response","Personal response","Narrative","Presentation","Discussion","Exit ticket","Assignment","Project"].map(t => `<option ${t===n.type?"selected":""}>${t}</option>`).join("")}</select></label></div>
    <div class="stack" style="gap:6px"><span class="eyebrow">Outcomes assessed</span><div class="chips">${gradeSOs(c.grade).map(s => `<label class="pick" title="${esc(s.title)}"><input type="checkbox" data-act="aso" data-code="${s.code}" ${n.sos.includes(s.code)?"checked":""}>${sc(s.code)}</label>`).join("")}</div></div>
    <div class="row"><button class="btn sm" data-act="saveassess">Create assessment</button><button class="btn quiet sm" data-act="cancelassess">Cancel</button></div></div>`;
}
function markGrid(a, c){
  return `<div class="card-h" style="align-items:flex-start">
      <div style="min-width:0"><h2>${esc(a.name)}</h2><div class="small muted">${esc(a.date)} · ${esc(a.type)} · ${c.students.length} students</div></div>
      <div class="row">${S.confirm === "assess:"+a.id ? `<button class="btn danger sm" data-act="delassess">Delete assessment</button><button class="btn quiet sm" data-act="cancel">Keep</button>` : `<button class="btn quiet sm" data-act="ask" data-k="assess:${a.id}">${ic("trash")}Delete</button>`}</div>
    </div>
    ${c.students.length ? `<div class="tablewrap"><table class="marks"><thead><tr><th>Student</th>${a.sos.map(k => `<th>${sc(k)}<span class="t" title="${esc(SO[k]?.title)}">${esc(SO[k]?.title||"")}</span></th>`).join("")}</tr></thead><tbody>
      ${c.students.map(s => `<tr><td>${esc(s.name)}</td>${a.sos.map(k => { const v = a.marks?.[s.id]?.[k];
        return `<td><div class="lvpick" role="group" aria-label="${esc(s.name)} ${k}">${[4,3,2,1,0].map(l => `<button class="p${l}" data-act="lv" data-s="${s.id}" data-k="${k}" data-v="${l}" aria-pressed="${v===l}" title="${LVNAME[l]}">${LV[l]}</button>`).join("")}</div></td>`; }).join("")}</tr>`).join("")}
    </tbody></table></div><p class="xs muted" style="padding:10px 18px;border-top:1px solid var(--line2)">Select a level to record it; select it again to clear.</p>`
    : `<div class="empty"><p>Add students to this class first.</p><button class="btn ghost" style="margin-top:10px" data-act="classpanel">${ic("users")}Manage students</button></div>`}`;
}
function sampleData(){
  const names = ["Aisha K.","Ben T.","Chloe M.","Daniyal R.","Emma S.","Farah N.","Gabriel L.","Hana Y.","Isaac P.","Jana W.","Kofi A.","Lina D."];
  const c = {id:"sample"+uid(), name:"Art 7 example class", grade:"ART7", students:names.map(n => ({id:uid(), name:n}))};
  let seed = 7; const rnd = () => (seed = (seed*9301+49297) % 233280) / 233280;
  const base = [3.4,2.9,3.7,1.8,3.1,2.4,3.9,2.2,1.6,3.3,2.7,3.5];
  const weak = {3:"ART7.B1",5:"ART7.C1",7:"ART7.A1",8:"ART7.B1",10:"ART7.C1"};
  const mk = (name, date, type, sos) => {
    const a = {kind:"assess", id:uid(), classId:c.id, name, date, type, sos, marks:{}, example:true};
    c.students.forEach((s,ix) => { a.marks[s.id] = {}; sos.forEach(k => {
      const v = base[ix] + (rnd()-.5)*1.4 - (weak[ix]===k ? 1.2 : 0) - (ix===8 ? .3 : 0);
      a.marks[s.id][k] = rnd() < .04 ? 0 : Math.max(1, Math.min(4, Math.round(v)));
    }); });
    return a;
  };
  return {c, as:[
    mk("Artwork critique (example)","2026-09-15","Written response",["ART7.A1"]),
    mk("Natural forms drawing (example)","2026-09-24","Performance task",["ART7.B1"]),
    mk("Colour wheel check-in (example)","2026-10-06","Quiz",["ART7.C1"]),
    mk("Term 1 portfolio check (example)","2026-10-14","Unit test",["ART7.A1","ART7.B1","ART7.C1"])
  ]};
}

// ---------- Test builder ----------
S.tb = {course:"ART7", sos:[], mc:2, sa:1, lv:["Basic","Intermediate","Challenge"], order:"level", shuf:true, title:"", seed:1};
const TB_PEND = {};
function tbEnsure(code){
  if (!S.storeReady || LOADED[code] || TB_PEND[code]) return;
  TB_PEND[code] = true;
  loadLessonsFor(code).finally(() => { TB_PEND[code] = false; });
}
function tbRand(seed){ let s = (seed * 7919 + 13) % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function tbShuffle(a, r){ a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const tbStrip = o => String(o).replace(/^[A-E]\)\s*/, "");
function tbBuild(){
  const T = S.tb, r = tbRand(T.seed), order = SOS.map(s => s.code), lvOrd = {Basic:0, Intermediate:1, Challenge:2};
  const codes = T.sos.filter(c => SO[c] && SO[c].grade === T.course).sort((a,b) => order.indexOf(a) - order.indexOf(b));
  const mc = [], sa = [], missing = [];
  codes.forEach(code => SO[code].lessons.forEach((t, i) => {
    const L = S.lessons[code + "_" + i], all = L?.test?.items || [];
    if (!all.length) { missing.push({code, i, t}); return; }
    const items = all.filter(q => T.lv.includes(q.level || "Intermediate"));
    tbShuffle(items.filter(q => q.type === "mc"), r).slice(0, T.mc).forEach(q => {
      let options = q.options || [], answer = q.answer;
      if (T.shuf && options.length) {
        const right = tbStrip(q.answer), mixed = tbShuffle(options.map(tbStrip), r);
        options = mixed.map((o, k) => `${"ABCDE"[k]}) ${o}`);
        answer = options[mixed.indexOf(right)] || q.answer;
      }
      mc.push({...q, options, answer, code, i});
    });
    tbShuffle(items.filter(q => q.type !== "mc"), r).slice(0, T.sa).forEach(q => sa.push({...q, code, i}));
  }));
  const arrange = x => T.order === "mixed" ? tbShuffle(x, r)
    : T.order === "level" ? x.sort((a,b) => (lvOrd[a.level] ?? 1) - (lvOrd[b.level] ?? 1) || order.indexOf(a.code) - order.indexOf(b.code))
    : x;
  const A = arrange(mc), B = arrange(sa);
  const map = codes.map(code => ({code, nums: [...A.map((q,k) => q.code === code ? k + 1 : 0), ...B.map((q,k) => q.code === code ? A.length + k + 1 : 0)].filter(Boolean)}));
  const title = T.title.trim() || (codes.length === 1 ? `${CN(T.course)} test: ${SO[codes[0]].title}` : `${CN(T.course)} unit test`);
  return {title, course:T.course, codes, A, B, map, missing};
}
function tbQ(q, A, num){
  return `<li><div>${esc(q.q)}<span class="lvl ${esc(q.level||"")}">${esc(q.level||"")}</span><span class="code" style="margin-left:6px;font-size:.66rem">${sc(q.code)}</span>
    ${q.options?.length ? `<div class="opts">${q.options.map(o => `<span>${esc(o)}</span>`).join("")}</div>` : ""}
    ${A ? `<div class="ans">Answer: ${esc(q.answer)}</div>` : ""}</div></li>`;
}
function rTest(){
  const T = S.tb, list = gradeSOs(T.course);
  T.sos.forEach(tbEnsure);
  const loading = T.sos.some(c => !LOADED[c]);
  const groups = []; list.forEach(s => { let g = groups.find(x => x.k === s.sub); if (!g) groups.push(g = {k:s.sub, items:[]}); g.items.push(s); });
  const B = tbBuild(), n = B.A.length + B.B.length, A = S.showAns;
  const controls = `
    <aside class="card sticky">
      <div class="card-h"><h2>Test settings</h2></div>
      <div class="card-b stack" style="gap:14px">
        ${gradeSeg(T.course, "tbcourse")}
        <label class="f">Title<input id="tbTitle" data-act="tbtitle" value="${esc(T.title)}" placeholder="${esc(B.title)}"></label>
        <div class="row" style="flex-wrap:nowrap;align-items:flex-end">
          <label class="f" style="flex:1">Multiple choice<select data-act="tbmc">${[0,1,2,3,4].map(k => `<option value="${k}" ${T.mc===k?"selected":""}>${k} per lesson</option>`).join("")}</select></label>
          <label class="f" style="flex:1">Written<select data-act="tbsa">${[0,1,2,3].map(k => `<option value="${k}" ${T.sa===k?"selected":""}>${k} per lesson</option>`).join("")}</select></label>
        </div>
        <div class="stack" style="gap:6px"><span class="eyebrow">Levels</span><div class="chips">${["Basic","Intermediate","Challenge"].map(l => `<label class="pick"><input type="checkbox" data-act="tblv" data-v="${l}" ${T.lv.includes(l)?"checked":""}>${l}</label>`).join("")}</div></div>
        <div class="stack" style="gap:6px"><span class="eyebrow">Question order</span>${seg(T.order, "tborder", [["level","Easy to hard"],["outcome","By outcome"],["mixed","Shuffled"]])}</div>
        <label class="row small" style="gap:8px;flex-wrap:nowrap"><input type="checkbox" data-act="tbshuf" ${T.shuf?"checked":""}>Shuffle answer choices</label>
      </div>
      <div class="olist" style="border-top:1px solid var(--line2)">
        ${groups.map(g => { const all = g.items.every(s => T.sos.includes(s.code));
          return `<div class="ogroup" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span>${esc(g.k)}</span><button class="btn quiet sm" style="padding:2px 6px;font-size:.7rem" data-act="tbunit" data-unit="${esc(g.k)}">${all ? "Clear" : "Select all"}</button></div>
          ${g.items.map(s => `<label class="row small" style="gap:8px;flex-wrap:nowrap;padding:6px 14px;cursor:pointer"><input type="checkbox" data-act="tbso" data-code="${s.code}" ${T.sos.includes(s.code)?"checked":""}><span class="code">${sc(s.code)}</span><span style="min-width:0">${esc(s.title)}</span></label>`).join("")}`; }).join("")}
      </div>
    </aside>`;
  let body;
  if (!B.codes.length) body = `<div class="card"><div class="empty"><h2>Choose outcomes</h2><p>Tick the outcomes this test covers. Questions are drawn from every lesson's practice test, and the preview updates as you change the settings.</p></div></div>`;
  else body = `<article class="card" style="min-width:0">
    <div class="card-h" style="align-items:flex-start">
      <div style="min-width:0">
        <div class="row" style="gap:8px;margin-bottom:6px"><span class="badge b-quiz">Version ${T.seed}</span><span class="eyebrow">${CN(B.course)} · ${n} questions · ${B.codes.length} outcome${B.codes.length>1?"s":""}</span></div>
        <h2 style="font-size:1.35rem">${esc(B.title)}</h2>
      </div>
      <div class="row">
        <button class="btn ghost" data-act="tbver">${ic("shuffle")}New version</button>
        <button class="btn ghost" data-act="tbrec" ${n ? "" : "disabled"}>${ic("marks")}Add to markbook</button>
        ${downloadsCap ? `<button class="btn" data-act="tbdl" ${n ? "" : "disabled"}>${ic("download")}Download</button>` : ""}
      </div>
    </div>
    ${loading ? `<div class="card-b row" style="padding-bottom:0"><span class="spinner"></span><span class="muted small">Loading questions…</span></div>` : ""}
    ${!loading && B.missing.length ? `<div class="card-b" style="padding-bottom:0"><p class="note warn">${ic("alert")}<span>${B.missing.length} lesson${B.missing.length>1?"s have":" has"} no practice test yet, so ${B.missing.length>1?"they're":"it's"} not included: ${B.missing.map(m => `${sc(m.code)} lesson ${m.i+1}`).join(", ")}. Open ${B.missing.length>1?"them":"it"} in Lessons to generate one.</span></p></div>` : ""}
    <div class="card-b stack" style="gap:18px">
      <div class="row between"><div class="kv" style="min-width:0"><span class="eyebrow">Questions by outcome</span><div class="chips">${B.map.map(m => `<span class="chip" title="${esc(SO[m.code].title)}"><b>${sc(m.code)}</b> ${m.nums.length ? "Q" + m.nums.join(", ") : "none"}</span>`).join("")}</div></div>
        <label class="row small" style="gap:7px;flex-wrap:nowrap"><input type="checkbox" id="tbAns" ${A?"checked":""}>Show answers</label></div>
      ${B.A.length ? `<div class="stack" style="gap:4px"><h3>Part A · Multiple choice (${B.A.length})</h3><ol class="qs">${B.A.map(q => tbQ(q, A)).join("")}</ol></div>` : ""}
      ${B.B.length ? `<div class="stack" style="gap:4px"><h3>Part B · Written response (${B.B.length})</h3><ol class="qs" style="counter-reset:q ${B.A.length}">${B.B.map(q => tbQ(q, A)).join("")}</ol></div>` : ""}
      ${!n && !loading ? `<p class="muted">No questions match these settings. Add a level or raise the number of questions per lesson.</p>` : ""}
    </div>
  </article>`;
  const presets = `<button class="btn ghost" data-act="tbreview">${ic("shuffle")}Whole-course review</button>${COURSES[T.course]?.diploma ? `<button class="btn" data-act="tbdip">${ic("spark")}Part B reading practice</button>` : ""}`;
  return `${ph("Test builder", "Build a unit test from the practice tests in your lessons. Each question is tagged with its outcome, so you can mark the test by proficiency level.", presets)}
  <div class="split">${controls}<section style="min-width:0">${body}</section></div>`;
}
async function tbDownload(){
  const B = tbBuild(); if (!downloadsCap || !(B.A.length + B.B.length)) return;
  const li = q => `<li>${esc(q.q)}${q.options?.length ? `<div class="o">${q.options.map(esc).join("<br>")}</div>` : `<div class="w"></div><div class="w"></div>`}</li>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(B.title)}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:30px auto;line-height:1.5;padding:0 16px}h1{font-size:22px;margin-bottom:4px}h2{font-size:17px;border-bottom:1px solid #ccc;padding-bottom:3px;margin-top:26px}li{margin-bottom:14px}.o{margin-top:4px}.w{height:90px}.hd{display:flex;gap:30px;margin:14px 0}.hd span{flex:1;border-bottom:1px solid #000;padding-bottom:2px}.pb{page-break-before:always}table{border-collapse:collapse}td,th{border:1px solid #bbb;padding:5px 9px;text-align:left}</style></head><body>
<h1>${esc(B.title)}</h1><p>${CN(B.course)} · Version ${S.tb.seed} · ${B.A.length + B.B.length} questions</p>
<div class="hd"><span>Name:</span><span>Date:</span><span>Block:</span></div>
<p><i>Read each question carefully before answering. For written questions, answer in complete sentences and show or explain your thinking. Each outcome is reported as EX, PR, AD or LM.</i></p>
${B.A.length ? `<h2>Part A · Multiple choice</h2><ol>${B.A.map(li).join("")}</ol>` : ""}
${B.B.length ? `<h2>Part B · Written response</h2><ol start="${B.A.length + 1}">${B.B.map(li).join("")}</ol>` : ""}
<h2 class="pb">Answer key · Version ${S.tb.seed}</h2>
<ol>${[...B.A, ...B.B].map(q => `<li>${esc(q.answer)} <i>(${esc(sc(q.code))}, ${esc(q.level)})</i></li>`).join("")}</ol>
<h2>Questions by outcome</h2><table><tr><th>Outcome</th><th>Questions</th></tr>${B.map.map(m => `<tr><td><b>${esc(dc(m.code))}</b> ${esc(SO[m.code].title)}</td><td>${m.nums.join(", ")}</td></tr>`).join("")}</table>
</body></html>`;
  const fn = B.title.replace(/[^\w-]+/g, "_").slice(0, 60) + `-v${S.tb.seed}.html`;
  try { await downloadsCap.save({filename:fn, data:html}); toast("Test saved"); } catch(e) { if (e?.code !== "declined") toast("The file couldn't be saved."); }
}
function tbClick(el, act){
  const T = S.tb;
  if (act === "tbcourse") { if (T.course !== el.dataset.v) { T.course = el.dataset.v; T.sos = []; } render(); }
  else if (act === "tborder") { T.order = el.dataset.v; render(); }
  else if (act === "tbver") { T.seed++; render(); }
  else if (act === "tbreview" || act === "tbdip") {
    const dip = act === "tbdip";
    Object.assign(T, {sos: gradeSOs(T.course).map(s => s.code), mc: 1, sa: dip ? 0 : 1, lv: ["Basic","Intermediate","Challenge"], order: dip ? "mixed" : "outcome", shuf: true,
      title: dip ? `${CN(T.course)} Part B reading practice` : `${CN(T.course)} course review`});
    T.seed++; render(); toast(dip ? "Part B-style reading practice built from every outcome" : "Review test built from every outcome");
  }
  else if (act === "tbunit") {
    const codes = gradeSOs(T.course).filter(s => s.sub === el.dataset.unit).map(s => s.code), all = codes.every(c => T.sos.includes(c));
    T.sos = all ? T.sos.filter(c => !codes.includes(c)) : [...new Set([...T.sos, ...codes])]; render();
  }
  else if (act === "tbdl") tbDownload();
  else if (act === "tbrec") {
    const B = tbBuild(), cls = S.classes.find(c => c.grade === B.course);
    if (cls) S.classSel = cls.id; else S.newClass = true;
    S.newAssess = {name: B.title, date: iso(new Date()), type:"Unit test", sos: B.codes};
    setTab("marks"); if (!cls) toast(`Create a ${CN(B.course)} class first`);
  }
}
function tbChange(el, act){
  const T = S.tb;
  if (act === "tbso") T.sos = el.checked ? [...new Set([...T.sos, el.dataset.code])] : T.sos.filter(c => c !== el.dataset.code);
  else if (act === "tbmc") T.mc = +el.value;
  else if (act === "tbsa") T.sa = +el.value;
  else if (act === "tblv") { T.lv = el.checked ? [...new Set([...T.lv, el.dataset.v])] : T.lv.filter(x => x !== el.dataset.v); }
  else if (act === "tbshuf") T.shuf = el.checked;
  else if (act === "tbtitle") T.title = el.value;
  render();
}


// ---------- Analysis ----------
function analyze(c){
  const as = classAssess(c), sosSet = [];
  as.forEach(a => a.sos.forEach(k => { if (!sosSet.includes(k)) sosSet.push(k); }));
  const order = SOS.map(s => s.code); sosSet.sort((a,b) => order.indexOf(a) - order.indexOf(b));
  const val = {};
  c.students.forEach(s => { val[s.id] = {}; sosSet.forEach(k => {
    const xs = as.map(a => a.marks?.[s.id]?.[k]).filter(v => v != null && v > 0);
    val[s.id][k] = !xs.length ? null : S.an.mode === "recent" ? xs[xs.length-1] : xs.reduce((p,q) => p+q, 0) / xs.length;
  }); });
  const thr = S.an.thr === "lm" ? 1.5 : 2.5;
  const perSO = sosSet.map(k => {
    const vs = c.students.map(s => val[s.id][k]).filter(v => v != null);
    const dist = [0,0,0,0,0]; vs.forEach(v => dist[band(v)]++);
    return {k, avg: vs.length ? vs.reduce((p,q) => p+q, 0)/vs.length : null, n:vs.length, dist,
      flagged: c.students.filter(s => val[s.id][k] != null && val[s.id][k] < thr).map(s => ({s, v:val[s.id][k]})).sort((x,y) => x.v - y.v),
      missing: c.students.filter(s => val[s.id][k] == null)};
  });
  const trend = as.map(a => { const xs = []; c.students.forEach(s => a.sos.forEach(k => { const v = a.marks?.[s.id]?.[k]; if (v > 0) xs.push(v); })); return {a, avg: xs.length ? xs.reduce((p,q)=>p+q,0)/xs.length : null}; }).filter(t => t.avg != null);
  let all = 0, prof = 0; c.students.forEach(s => sosSet.forEach(k => { const v = val[s.id][k]; if (v != null) { all++; if (v >= 2.5) prof++; } }));
  const students = c.students.map(s => ({s, weak: sosSet.filter(k => val[s.id][k] != null && val[s.id][k] < thr)})).filter(x => x.weak.length).sort((a,b) => b.weak.length - a.weak.length);
  const perGO = Object.keys(GOS).map(g => { const ks = sosSet.filter(k => SO[k]?.pos.some(p => p[0] === g)); const vs = [];
    c.students.forEach(s => ks.forEach(k => { const v = val[s.id][k]; if (v != null) vs.push(v); }));
    const dist = [0,0,0,0,0]; vs.forEach(v => dist[band(v)]++);
    return {g, ks, avg: vs.length ? vs.reduce((p,q) => p+q, 0)/vs.length : null, dist}; });
  return {as, sosSet, val, perSO, perGO, trend, pctProf: all ? Math.round(100*prof/all) : null, students};
}
function rAnalysis(){
  if (!S.storeReady) return `${ph("Analysis","")}<div class="card"><div class="card-b row"><span class="spinner"></span>Loading your saved marks…</div></div>`;
  if (!S.classes.length) return `${ph("Analysis","")}<div class="card"><div class="empty"><h2>No classes yet</h2><p>Create a class and record marks in the markbook to see the analysis.</p><button class="btn" style="margin-top:12px" data-act="tab" data-t="marks">Go to markbook</button></div></div>`;
  const c = curClass() || S.classes[0]; S.classSel = c.id;
  const R = analyze(c), thrLabel = S.an.thr === "lm" ? "Limited" : "Limited or Adequate";
  const controls = `<label class="f">Level used<select id="anMode"><option value="recent" ${S.an.mode==="recent"?"selected":""}>Most recent evidence</option><option value="avg" ${S.an.mode==="avg"?"selected":""}>Average of all evidence</option></select></label>
    <label class="f">Flag students at<select id="anThr"><option value="ad" ${S.an.thr==="ad"?"selected":""}>Limited or Adequate</option><option value="lm" ${S.an.thr==="lm"?"selected":""}>Limited only</option></select></label>`;
  return `
  ${ph("Analysis", "Results by outcome and lesson topic, with intervention groups for reteaching.", controls)}
  ${classTabs(c, false)}
  ${!R.sosSet.length ? `<div class="card"><div class="empty"><h2>No marks yet</h2><p>Record marks for ${esc(c.name)} in the markbook.</p><button class="btn" style="margin-top:12px" data-act="tab" data-t="marks">Go to markbook</button></div></div>` : `
  <div class="stack" style="gap:18px">
    <div class="kpis">
      <div class="card kpi stat"><span class="n">${c.students.length}</span><span class="l">Students</span></div>
      <div class="card kpi stat"><span class="n">${R.as.length}</span><span class="l">Assessments across ${R.sosSet.length} outcomes</span></div>
      <div class="card kpi stat"><span class="n">${R.pctProf ?? "–"}%</span><span class="l">Results at Proficient or Excellent</span></div>
      <div class="card kpi stat"><span class="n" style="color:${R.students.length ? "var(--l1)" : "var(--l3)"}">${R.students.length}</span><span class="l">Students flagged (${thrLabel})</span></div>
    </div>
    <div class="cols">
      <div class="card"><div class="card-h"><div><h2>Average level by outcome</h2><p class="xs muted">Dashed line marks Proficient</p></div></div><div class="card-b chartwrap">${barChart(R.perSO)}</div></div>
      <div class="card"><div class="card-h"><div><h2>Level distribution</h2><p class="xs muted">Share of students at each level</p></div></div><div class="card-b">${distChart(R.perSO)}
        <div class="legend" style="margin-top:14px">${[4,3,2,1].map(l => `<span><span class="lv lv${l}">${LV[l]}</span> ${LVNAME[l]}</span>`).join("")}</div></div></div>
    </div>
    <div class="card"><div class="card-h"><div><h2>By subject</h2><p class="xs muted">Every result counts toward the subject of its outcome</p></div></div><div class="card-b dist">${R.perGO.map(x => { const tot = x.dist.slice(1).reduce((a,b) => a+b, 0);
      return `<div class="gorow"><span><b>${esc(GOSHORT[x.g])}</b></span>${tot ? `<div class="bar100" title="EX ${x.dist[4]}, PR ${x.dist[3]}, AD ${x.dist[2]}, LM ${x.dist[1]}">${[4,3,2,1].map(l => x.dist[l] ? `<span style="width:${100*x.dist[l]/tot}%;background:${BCOL[l]}"></span>` : "").join("")}</div>` : `<span class="xs muted">No evidence yet</span>`}<span class="lv lv${band(x.avg)}" title="Average level">${x.avg != null ? x.avg.toFixed(1) : "–"}</span></div>`; }).join("")}</div></div>
    ${R.trend.length > 1 ? `<div class="card"><div class="card-h"><div><h2>Class average over time</h2><p class="xs muted">Mean level on each assessment</p></div></div><div class="card-b chartwrap">${trendChart(R.trend)}</div></div>` : ""}
    <section class="stack" style="gap:12px">
      <div class="row between"><h2 style="font-size:1.3rem">Intervention groups by lesson topic</h2><span class="small muted">Students at ${thrLabel}</span></div>
      <div class="igrid">${R.perSO.map(p => { const so = SO[p.k]; return `<div class="card igroup">
        <div class="card-h"><div style="min-width:0"><span class="code">${sc(p.k)}</span> <b>${esc(so.title)}</b></div><span class="lv lv${band(p.avg)}" title="Class average">${p.avg!=null?p.avg.toFixed(1):"–"}</span></div>
        <div class="card-b stack" style="gap:10px">
        ${p.flagged.length ? `<ul class="names">${p.flagged.map(f => `<li>${esc(f.s.name)} <span class="lv lv${band(f.v)}">${LV[band(f.v)]}</span></li>`).join("")}</ul>
          <div class="kv"><span class="eyebrow">Reteach focus</span><span class="small">${so.lessons.map(esc).join(" · ")}</span></div>
          <div><button class="btn ghost sm" data-act="openlesson" data-code="${p.k}" data-i="0">${ic("lesson")}Reteach lessons</button></div>` : `<p class="small row" style="color:var(--l3);gap:6px">${ic("check")}No students flagged</p>`}
        ${p.missing.length ? `<p class="xs muted">No evidence yet: ${p.missing.map(s => esc(s.name)).join(", ")}</p>` : ""}
        </div></div>`; }).join("")}</div>
    </section>
    <div class="card">
      <div class="card-h"><h2>Students needing intervention</h2>${downloadsCap ? `<button class="btn ghost sm" data-act="csv">${ic("download")}Export CSV</button>` : ""}</div>
      ${R.students.length ? `<div class="tablewrap"><table><thead><tr><th>Student</th><th>Flagged</th><th>Needs support in</th></tr></thead><tbody>${R.students.map(x => `<tr><td><b>${esc(x.s.name)}</b></td><td>${x.weak.length} of ${R.sosSet.length}</td><td><div class="stack" style="gap:3px">${x.weak.map(k => `<span><span class="code">${sc(k)}</span> ${esc(SO[k].title)}</span>`).join("")}</div></td></tr>`).join("")}</tbody></table></div>` : `<p class="card-b" style="color:var(--l3)">No students are below the threshold.</p>`}
    </div>
    <div class="card"><div class="card-h"><h2>Student × outcome heat map</h2></div><div class="tablewrap"><table class="heat"><thead><tr><th>Student</th>${R.sosSet.map(k => `<th title="${esc(SO[k].title)}">${sc(k)}</th>`).join("")}</tr></thead><tbody>
      ${c.students.map(s => `<tr><td>${esc(s.name)}</td>${R.sosSet.map(k => { const v = R.val[s.id][k]; return `<td>${v==null ? `<span class="lv lv0">–</span>` : `<span class="lv lv${band(v)}" title="${v.toFixed(2)}">${S.an.mode==="avg" ? v.toFixed(1) : LV[v]}</span>`}</td>`; }).join("")}</tr>`).join("")}
    </tbody></table></div></div>
  </div>`}`;
}
function barChart(per){
  const n = per.length, L = 30, Rr = 10, T = 18, B = 30, bw = 36, step = 64;
  const W = Math.max(420, L + Rr + n*step), H = 230, ph_ = H - T - B, y = v => T + ph_ - (v/4)*ph_;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Average level by outcome">`;
  [1,2,3,4].forEach(v => s += `<line class="gl" x1="${L}" x2="${W-Rr}" y1="${y(v)}" y2="${y(v)}"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${LV[v]}</text>`);
  s += `<line x1="${L}" x2="${W-Rr}" y1="${y(0)}" y2="${y(0)}" stroke="var(--muted)" stroke-width="1"/>`;
  per.forEach((p,i) => { const cx = L + step*i + step/2; if (p.avg != null) {
    s += `<rect x="${cx-bw/2}" y="${y(p.avg)}" width="${bw}" height="${y(0)-y(p.avg)}" rx="4" fill="${BCOL[band(p.avg)]}"/><text x="${cx}" y="${y(p.avg)-6}" text-anchor="middle" style="fill:var(--ink);font-weight:700">${p.avg.toFixed(1)}</text>`; }
    s += `<text x="${cx}" y="${H-B+18}" text-anchor="middle" style="font-family:var(--f-mono);font-weight:700">${sc(p.k)}</text>`; });
  s += `<line x1="${L}" x2="${W-Rr}" y1="${y(3)}" y2="${y(3)}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  return s + `</svg>`;
}
function distChart(per){
  return `<div class="dist">${per.map(p => { const tot = p.dist.slice(1).reduce((a,b) => a+b, 0) || 1;
    return `<div class="r"><span class="code" style="text-align:center">${sc(p.k)}</span><div class="bar100" title="EX ${p.dist[4]}, PR ${p.dist[3]}, AD ${p.dist[2]}, LM ${p.dist[1]}">${[4,3,2,1].map(l => p.dist[l] ? `<span style="width:${100*p.dist[l]/tot}%;background:${BCOL[l]}"></span>` : "").join("")}</div><span class="xs muted">${Math.round(100*(p.dist[3]+p.dist[4])/tot)}% PR+</span></div>`; }).join("")}</div>`;
}
function trendChart(tr){
  const n = tr.length, L = 30, Rr = 20, T = 22, B = 40;
  const W = Math.max(480, L + Rr + (n-1)*130 + 80), H = 220, ph_ = H - T - B, pw = W - L - Rr - 80;
  const x = i => L + 40 + (n === 1 ? pw/2 : i*pw/(n-1)), y = v => T + ph_ - ((v-1)/3)*ph_;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Class average over time">`;
  [1,2,3,4].forEach(v => s += `<line class="gl" x1="${L}" x2="${W-Rr}" y1="${y(v)}" y2="${y(v)}"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${LV[v]}</text>`);
  const pts = tr.map((t,i) => `${x(i)},${y(t.avg)}`).join(" ");
  s += `<polygon points="${x(0)},${y(1)} ${pts} ${x(n-1)},${y(1)}" fill="var(--accent)" opacity=".12"/><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`;
  tr.forEach((t,i) => { const nm = t.a.name.replace(/\s*\(example\)/i,""); s += `<circle cx="${x(i)}" cy="${y(t.avg)}" r="${i===n-1?5.5:4}" fill="var(--accent)"/><text x="${x(i)}" y="${y(t.avg)-11}" text-anchor="middle" style="fill:var(--ink);font-weight:700">${t.avg.toFixed(2)}</text><text x="${x(i)}" y="${H-B+18}" text-anchor="middle">${esc(nm.length>18?nm.slice(0,17)+"…":nm)}</text><text x="${x(i)}" y="${H-B+32}" text-anchor="middle">${esc(t.a.date)}</text>`; });
  return s + `</svg>`;
}
async function exportCSV(){
  const c = curClass(); if (!c || !downloadsCap) return; const R = analyze(c);
  const q = v => `"${String(v).replace(/"/g,'""')}"`;
  const rows = [["Student", ...R.sosSet.map(k => `${dc(k)} ${SO[k].title}`), "Outcomes flagged"].map(q).join(",")];
  c.students.forEach(s => { const w = R.sosSet.filter(k => R.val[s.id][k] != null && R.val[s.id][k] < (S.an.thr==="lm"?1.5:2.5));
    rows.push([s.name, ...R.sosSet.map(k => { const v = R.val[s.id][k]; return v==null ? "" : S.an.mode==="avg" ? v.toFixed(2) : LV[v]; }), w.join(" ")].map(q).join(",")); });
  try { await downloadsCap.save({filename:`${c.name.replace(/[^\w-]+/g,"_")}-proficiency.csv`, data:rows.join("\n")}); toast("CSV saved"); } catch(e) { if (e?.code !== "declined") toast("The file couldn't be saved."); }
}

// ---------- Students (online practice and tests) ----------
S.pt = {ready:false, loading:false, err:"", classes:[], enroll:[], asg:[], att:[], sel:null, newClass:false, addCode:null, addI:0, detail:null, ans:null, confirm:null, tmsg:"", treq:[]};
const ptSb = () => window.PB_PLATFORM?.sb;
const ptClass = () => S.pt.classes.find(c => c.id === S.pt.sel) || S.pt.classes[0] || null;
const keyOf = (code, i) => `${code}_${i}`;
const keyParts = k => { const m = /^(.+)_(\d+)$/.exec(k); return m ? {code:m[1], i:+m[2]} : null; };
async function ptLoad(){
  const sb = ptSb(); if (!sb || S.pt.loading) return;
  S.pt.loading = true;
  const [c, e, a, t] = await Promise.all([
    sb.from("pb_classes").select("*").order("created_at"),
    sb.from("pb_enrollments").select("class_id, student_id, display_name, joined_at").order("display_name"),
    sb.from("pb_assignments").select("*").order("created_at"),
    sb.from("pb_attempts").select("id, class_id, student_id, lesson_key, kind, score, total, level, detail, created_at").order("created_at")
  ]);
  const err = c.error || e.error || a.error || t.error;
  S.pt.err = err ? "Couldn't load student data. Refresh to try again." : "";
  if (!err) { S.pt.classes = c.data.filter(x => x.subject === "complementary_ms" && COURSES[x.course]).map(x => ({...x, grade: x.course})); /* maths and sciences classes share this table */ S.pt.enroll = e.data; S.pt.asg = a.data; S.pt.att = t.data; }
  if (!err) { const r = await sb.rpc("pb_list_teacher_requests"); S.pt.treq = r.error ? [] : (r.data || []); }
  S.pt.ready = true; S.pt.loading = false;
  if (!err && S.storeReady) await ptSync();
  if (S.tab === "students") render();
}
async function ptSync(){
  let bookChanged = false;
  for (const pc of S.pt.classes) {
    const c = S.classes.find(x => x.id === pc.book_class_id); if (!c) continue;
    for (const en of S.pt.enroll.filter(x => x.class_id === pc.id)) {
      const s = c.students.find(x => x.id === en.student_id);
      if (!s) { c.students.push({id:en.student_id, name:en.display_name, online:true}); bookChanged = true; }
      else if (s.online && s.name !== en.display_name) { s.name = en.display_name; bookChanged = true; }
    }
    for (const asg of S.pt.asg.filter(x => x.class_id === pc.id)) {
      const tests = S.pt.att.filter(x => x.kind === "test" && x.class_id === pc.id && x.lesson_key === asg.lesson_key && x.level);
      if (!tests.length) continue;
      const id = "on_" + asg.id;
      let a = S.assess.find(x => x.id === id), changed = false;
      if (!a) { a = {kind:"assess", id, classId:c.id, name:`Online test: ${asg.title}`, date:tests[0].created_at.slice(0,10), type:"Online test", sos:[asg.code], marks:{}, src:{}, online:true}; S.assess.push(a); changed = true; }
      a.src = a.src || {}; a.marks = a.marks || {};
      for (const t of tests) if (a.src[t.student_id] !== t.id) { a.marks[t.student_id] = {...(a.marks[t.student_id] || {}), [asg.code]: t.level}; a.src[t.student_id] = t.id; changed = true; }
      if (changed) await store.set("a_" + id, a);
    }
  }
  if (bookChanged) saveBook();
}
const pctOf = x => x && x.total ? Math.round(100 * x.score / x.total) : 0;
const bestPractice = (sid, cls, k) => S.pt.att.filter(x => x.kind === "practice" && x.student_id === sid && x.class_id === cls && x.lesson_key === k).reduce((m, x) => !m || pctOf(x) > pctOf(m) ? x : m, null);
const testOf = (sid, cls, k) => S.pt.att.find(x => x.kind === "test" && x.student_id === sid && x.class_id === cls && x.lesson_key === k) || null;

function rStudents(){
  const site = location.origin + "/student";
  const head = ph("Students", `Students sign in at <b>${esc(site)}</b> with their own email, join with your class code, and see only the lessons you open. Test results go into your markbook automatically as proficiency levels.`);
  if (!S.pt.ready) { ptLoad(); return `${head}<div class="card"><div class="card-b row"><span class="spinner"></span>Loading student data…</div></div>`; }
  if (S.pt.err) return `${head}<div class="card"><div class="card-b">${esc(S.pt.err)}</div></div>`;
  const c = ptClass(); if (c) S.pt.sel = c.id;
  const form = ptClassForm();
  if (!c) return `${head}<div class="card" style="max-width:640px"><div class="card-h"><h2>Create your first online class</h2></div><div class="card-b">${form}</div></div>${ptTeachers()}`;
  const book = S.classes.find(x => x.id === c.book_class_id);
  const enrolled = S.pt.enroll.filter(x => x.class_id === c.id);
  const asg = S.pt.asg.filter(x => x.class_id === c.id);
  return `${head}
  <div class="classtabs">${S.pt.classes.map(x => `<button class="ctab" data-act="ptsel" data-id="${x.id}" aria-pressed="${x.id===c.id}">${esc(x.name)}<span class="g">${esc(CS(x.grade))}</span></button>`).join("")}
    <button class="btn quiet sm" data-act="ptnew">${ic("plus")}New online class</button></div>
  ${S.pt.newClass ? `<div class="card" style="margin-bottom:16px"><div class="card-h"><h2>New online class</h2><button class="btn quiet sm" data-act="ptcancel">Cancel</button></div><div class="card-b">${form}</div></div>` : ""}
  <div class="card" style="margin-bottom:16px"><div class="card-b row between" style="align-items:center;gap:14px">
    <div class="row" style="gap:16px;align-items:center"><div><div class="eyebrow">Class code</div><div style="font-family:var(--f-mono);font-weight:700;font-size:1.8rem;letter-spacing:.12em">${esc(c.join_code)}</div></div>
      <div class="small muted">${enrolled.length} student${enrolled.length===1?"":"s"} joined<br>Markbook class: ${book ? `<b>${esc(book.name)}</b>` : "not linked"}</div></div>
    <div class="row"><button class="btn ghost sm" data-act="ptcopy" data-v="${esc(c.join_code)}">Copy code</button><button class="btn ghost sm" data-act="ptcopy" data-v="${esc(`Go to ${site}, create a student account and use class code ${c.join_code}.`)}">Copy instructions</button>
      ${S.pt.confirm === "class" ? `<button class="btn danger sm" data-act="ptdelclass">Delete online class</button><button class="btn quiet sm" data-act="ptno">Keep</button>` : `<button class="btn quiet sm" data-act="ptask" data-k="class">${ic("trash")}Delete</button>`}</div>
  </div></div>
  <div class="split">
    <aside class="stack">
      <div class="card"><div class="card-h"><h2>Open lessons</h2></div>
        <div class="card-b stack" style="gap:10px;border-bottom:1px solid var(--line2)">${ptAddForm(c)}</div>
        <div class="alist">${asg.length ? asg.slice().reverse().map(a => { const n = S.pt.att.filter(x => x.kind==="test" && x.class_id===c.id && x.lesson_key===a.lesson_key).length;
          return `<div class="aitem" aria-current="${S.pt.detail===a.id}" style="cursor:default"><span style="min-width:0;flex:1"><button class="btn quiet sm" style="padding:0;text-align:left;white-space:normal;color:var(--ink);background:none" data-act="ptdetail" data-id="${a.id}"><b>${esc(a.title)}</b></button><br>
            <span class="row" style="gap:6px;margin-top:5px"><span class="code">${esc(a.code)}</span><span class="xs muted">${n}/${enrolled.length} tests</span></span>
            <span class="row" style="gap:6px;margin-top:8px">
              <button class="btn ${a.open?"ghost":"quiet"} sm" data-act="ptopen" data-id="${a.id}" title="Students can see this lesson">${a.open ? "Visible" : "Hidden"}</button>
              <button class="btn ${a.test_open?"ghost":"quiet"} sm" data-act="pttest" data-id="${a.id}">${a.test_open ? "Test open" : "Test closed"}</button>
              ${S.pt.confirm === "asg:"+a.id ? `<button class="btn danger sm" data-act="ptdelasg" data-id="${a.id}">Remove + results</button>` : `<button class="btn quiet sm" data-act="ptask" data-k="asg:${a.id}" aria-label="Remove">${ic("trash")}</button>`}</span></span></div>`; }).join("") : `<p class="muted small" style="padding:16px">No lessons open yet. Choose one above.</p>`}</div>
      </div>
      <div class="card"><div class="card-h"><h2 class="row" style="gap:8px">${ic("users")}Students (${enrolled.length})</h2></div>
        <div class="card-b">${enrolled.length ? `<div class="chips">${enrolled.map(en => `<span class="chip" style="display:flex;gap:4px;align-items:center;padding-right:4px">${esc(en.display_name)}${S.pt.confirm === "stu:"+en.student_id ? `<button class="btn danger sm" style="padding:0 6px" data-act="ptrmstu" data-id="${en.student_id}">Remove</button>` : `<button class="btn quiet sm" style="padding:0 6px" aria-label="Remove ${esc(en.display_name)}" data-act="ptask" data-k="stu:${en.student_id}">×</button>`}</span>`).join("")}</div>` : `<p class="small muted">No students yet. Share the class code.</p>`}</div></div>
    </aside>
    <section class="card" style="min-width:0">${S.pt.detail && asg.find(a => a.id === S.pt.detail) ? ptDetail(c, asg.find(a => a.id === S.pt.detail), enrolled) : ptOverview(c, asg, enrolled)}</section>
  </div>
  ${ptTeachers()}`;
}
function ptClassForm(){
  return `<div class="stack" style="gap:12px"><div class="row" style="align-items:flex-end"><label class="f" style="flex:1;min-width:170px">Class name<input id="ptName" placeholder="e.g. Art 8 Block C"></label>
    <label class="f">Course<select id="ptGrade">${courseOpts("ART7")}</select></label></div>
    <label class="f">Markbook class for test results<select id="ptBook"><option value="">Create a new markbook class</option>${S.classes.map(x => `<option value="${esc(x.id)}">${esc(x.name)} (${esc(CN(x.grade))})</option>`).join("")}</select></label>
    <div><button class="btn" data-act="ptcreate">Create online class</button></div></div>`;
}
function ptAddForm(c){
  const sos = gradeSOs(c.grade); const code = SO[S.pt.addCode]?.grade === c.grade ? S.pt.addCode : sos[0].code; S.pt.addCode = code;
  const so = SO[code];
  return `<label class="f">Outcome<select id="ptCode">${sos.map(s => `<option value="${s.code}" ${s.code===code?"selected":""}>${sc(s.code)} · ${esc(s.title)}</option>`).join("")}</select></label>
    <label class="f">Lesson<select id="ptLesson">${so.lessons.map((t,i) => `<option value="${i}" ${i===S.pt.addI?"selected":""}>${i+1}. ${esc(t)}</option>`).join("")}</select></label>
    <div><button class="btn sm" data-act="ptassign">${ic("plus")}Open for students</button></div>`;
}
function ptOverview(c, asg, enrolled){
  if (!asg.length || !enrolled.length) return `<div class="empty"><h2>Results appear here</h2><p>${!enrolled.length ? "Share the class code so students can join." : "Open a lesson for this class."} Each student's practice and test results show up as soon as they submit.</p></div>`;
  return `<div class="card-h"><div><h2>Results</h2><p class="xs muted">Test level (score) · practice best in grey. Select a lesson for answers.</p></div><button class="btn quiet sm" data-act="ptrefresh">Refresh</button></div>
    <div class="tablewrap"><table class="heat"><thead><tr><th>Student</th>${asg.map(a => `<th title="${esc(a.title)}"><button class="btn quiet sm" style="padding:0" data-act="ptdetail" data-id="${a.id}">${esc(a.lesson_key.replace("_", "·L").replace(/L(\d+)$/, (m, n) => "L" + (+n + 1)))}</button></th>`).join("")}</tr></thead><tbody>
    ${enrolled.map(en => `<tr><td>${esc(en.display_name)}</td>${asg.map(a => { const t = testOf(en.student_id, c.id, a.lesson_key), p = bestPractice(en.student_id, c.id, a.lesson_key);
      return `<td>${t ? `<span class="lv lv${t.level}" title="${t.score}/${t.total}">${LV[t.level]}</span> <span class="xs">${t.score}/${t.total}</span>` : ""}${p ? `<div class="xs muted">P ${pctOf(p)}%</div>` : t ? "" : `<span class="xs muted">–</span>`}</td>`; }).join("")}</tr>`).join("")}
    </tbody></table></div>
    <p class="xs muted" style="padding:10px 18px;border-top:1px solid var(--line2)">Levels from test scores: EX 80%+, PR 65–79%, AD 50–64%, LM below 50%. Written answers ("explain", "describe") aren't auto-marked; read them in each lesson's results.</p>`;
}
function ptDetail(c, a, enrolled){
  const kp = keyParts(a.lesson_key), lesson = BUILTIN[kp.code]?.lessons?.find(l => l.i === kp.i);
  if (BUILTIN[kp.code] === undefined) builtinFor(kp.code).then(() => { if (S.tab === "students") render(); });
  const items = lesson?.test?.items || [];
  const rows = enrolled.map(en => ({en, t: testOf(en.student_id, c.id, a.lesson_key), p: bestPractice(en.student_id, c.id, a.lesson_key)}));
  const done = rows.filter(r => r.t), avg = done.length ? Math.round(done.reduce((s, r) => s + pctOf(r.t), 0) / done.length) : null;
  const qStats = items.map((_, ix) => { const ms = done.map(r => r.t.detail?.marks?.[ix]).filter(m => m === true || m === false); return ms.length ? Math.round(100 * ms.filter(Boolean).length / ms.length) : null; });
  return `<div class="card-h" style="align-items:flex-start"><div style="min-width:0"><span class="code">${esc(a.code)}</span> <h2 style="display:inline">${esc(a.title)}</h2>
      <div class="small muted">${done.length} of ${enrolled.length} tests submitted${avg != null ? ` · class average ${avg}%` : ""}</div></div>
      <div class="row"><button class="btn quiet sm" data-act="ptrefresh">Refresh</button><button class="btn quiet sm" data-act="ptdetail" data-id="">Back to all results</button></div></div>
    <div class="tablewrap"><table><thead><tr><th>Student</th><th>Test</th><th>Level</th><th>Practice best</th><th></th></tr></thead><tbody>
    ${rows.map(({en, t, p}) => `<tr><td><b>${esc(en.display_name)}</b></td><td>${t ? `${t.score}/${t.total} (${pctOf(t)}%)<div class="xs muted">${esc(t.created_at.slice(0,10))}</div>` : `<span class="muted">Not taken</span>`}</td>
      <td>${t ? `<span class="lv lv${t.level}">${LV[t.level]}</span>` : ""}</td><td>${p ? `${p.score}/${p.total}` : `<span class="muted">–</span>`}</td>
      <td style="text-align:right;white-space:nowrap">${t ? `<button class="btn quiet sm" data-act="ptans" data-id="${en.student_id}">${S.pt.ans === en.student_id ? "Hide answers" : "Answers"}</button>${S.pt.confirm === "retake:"+t.id ? `<button class="btn danger sm" data-act="ptretake" data-id="${t.id}">Delete result</button>` : `<button class="btn quiet sm" data-act="ptask" data-k="retake:${t.id}">Allow retake</button>`}` : ""}</td></tr>
      ${S.pt.ans === en.student_id && t ? `<tr><td colspan="5" style="background:var(--sunk)"><ol class="qs">${items.map((it, ix) => { const m = t.detail?.marks?.[ix], an = t.detail?.answers?.[ix];
        return `<li><div>${esc(it.q)}<div class="small" style="margin-top:4px">Answer: <b>${esc(an || "—")}</b> ${m === true ? `<span style="color:var(--l3)">✓</span>` : m === false ? `<span style="color:var(--l1)">✗</span>` : `<span class="muted">(read)</span>`}</div><div class="xs muted">Key: ${esc(it.answer)}</div></div></li>`; }).join("")}</ol></td></tr>` : ""}`).join("")}
    </tbody></table></div>
    ${items.length && done.length ? `<div class="card-b" style="border-top:1px solid var(--line2)"><div class="eyebrow" style="margin-bottom:8px">Questions most often missed</div>
      ${qStats.map((v, ix) => ({v, ix})).filter(x => x.v != null).sort((x, y) => x.v - y.v).slice(0, 5).map(x => `<div class="row" style="gap:10px;margin-bottom:6px"><span class="lv lv${x.v>=80?4:x.v>=65?3:x.v>=50?2:1}">${x.v}%</span><span class="small">Q${x.ix+1}. ${esc(items[x.ix].q)}</span></div>`).join("")}</div>` : ""}`;
}
function ptTeachers(){
  return `<div class="card" style="margin-top:16px;max-width:640px"><div class="card-h"><h2>Teachers</h2></div><div class="card-b stack" style="gap:10px">
    <p class="small muted" style="margin:0">Teacher accounts are managed in the teacher portal. New teachers sign up there with their subject and grades, and the administrator approves them. Each teacher sees only their own subjects and classes.</p>
    <div class="row"><a class="btn ghost" href= + PORTAL + >Open the teacher portal</a><span class="small muted">Sign-up link to share: <b>https://www.millardmiddleschoolmaths.live/teacher</b></span></div></div></div>`;
}
const ptClick = async (el, act) => {
  const sb = ptSb(); const c = ptClass();
  if (act === "ptsel") { S.pt.sel = el.dataset.id; S.pt.detail = null; S.pt.confirm = null; render(); }
  else if (act === "ptnew") { S.pt.newClass = true; render(); }
  else if (act === "ptcancel") { S.pt.newClass = false; render(); }
  else if (act === "ptask") { S.pt.confirm = el.dataset.k; render(); }
  else if (act === "ptno") { S.pt.confirm = null; render(); }
  else if (act === "ptrefresh") { S.pt.ready = false; render(); }
  else if (act === "ptcopy") { try { await navigator.clipboard.writeText(el.dataset.v); toast("Copied"); } catch(e) { toast(el.dataset.v); } }
  else if (act === "ptcreate") {
    const name = $("#ptName").value.trim(), grade = $("#ptGrade").value; let bookId = $("#ptBook").value;
    if (!name) { toast("Enter a class name"); return; }
    if (!bookId) { const bc = {id:uid(), name, grade, students:[]}; S.classes.push(bc); saveBook(); bookId = bc.id; }
    const { data, error } = await sb.from("pb_classes").insert({name, grade: COURSES[grade].grade, course: grade, subject: "complementary_ms", book_class_id:bookId}).select().single();
    if (error) { toast("Couldn't create the class. Try again."); return; }
    data.grade = data.course; S.pt.classes.push(data); S.pt.sel = data.id; S.pt.newClass = false; render(); toast("Online class created. Share the code with students.");
  }
  else if (act === "ptdelclass") { const { error } = await sb.from("pb_classes").delete().eq("id", c.id); if (error) { toast("Couldn't delete. Try again."); return; } S.pt.confirm = null; S.pt.sel = null; S.pt.ready = false; render(); toast("Online class deleted. Markbook marks were kept."); }
  else if (act === "ptassign") {
    const code = $("#ptCode").value, i = +$("#ptLesson").value, k = keyOf(code, i);
    if (S.pt.asg.some(a => a.class_id === c.id && a.lesson_key === k)) { toast("That lesson is already open"); return; }
    const { data, error } = await sb.from("pb_assignments").insert({class_id:c.id, lesson_key:k, code, title:SO[code].lessons[i]}).select().single();
    if (error) { toast("Couldn't open the lesson. Try again."); return; }
    S.pt.asg.push(data); render(); toast("Lesson opened for students");
  }
  else if (act === "ptopen" || act === "pttest") {
    const a = S.pt.asg.find(x => x.id === el.dataset.id), field = act === "ptopen" ? "open" : "test_open";
    const { error } = await sb.from("pb_assignments").update({[field]: !a[field]}).eq("id", a.id);
    if (error) { toast("Couldn't update. Try again."); return; } a[field] = !a[field]; render();
  }
  else if (act === "ptdelasg") { const id = el.dataset.id, a = S.pt.asg.find(x => x.id === id);
    const { error } = await sb.from("pb_assignments").delete().eq("id", id); if (error) { toast("Couldn't remove. Try again."); return; }
    await sb.from("pb_attempts").delete().eq("class_id", a.class_id).eq("lesson_key", a.lesson_key);
    S.pt.asg = S.pt.asg.filter(x => x.id !== id); S.pt.att = S.pt.att.filter(x => !(x.class_id === a.class_id && x.lesson_key === a.lesson_key)); S.pt.confirm = null; if (S.pt.detail === id) S.pt.detail = null; render(); }
  else if (act === "ptdetail") { S.pt.detail = el.dataset.id || null; S.pt.ans = null; render(); }
  else if (act === "ptans") { S.pt.ans = S.pt.ans === el.dataset.id ? null : el.dataset.id; render(); }
  else if (act === "ptretake") { const { error } = await sb.from("pb_attempts").delete().eq("id", el.dataset.id); if (error) { toast("Couldn't delete. Try again."); return; } S.pt.att = S.pt.att.filter(x => x.id !== el.dataset.id); S.pt.confirm = null; render(); toast("The student can take the test again"); }
  else if (act === "ptrmstu") { const { error } = await sb.from("pb_enrollments").delete().eq("class_id", c.id).eq("student_id", el.dataset.id); if (error) { toast("Couldn't remove. Try again."); return; } S.pt.enroll = S.pt.enroll.filter(x => !(x.class_id === c.id && x.student_id === el.dataset.id)); S.pt.confirm = null; render(); }
  else if (act === "ptapprove" || act === "ptdecline") { const r = S.pt.treq.find(x => x.id === el.dataset.id); if (!r) return; el.disabled = true;
    const { error } = await sb.rpc("pb_decide_teacher", {p_id: r.id, p_approve: act === "ptapprove"});
    if (error) { toast(error.message || "Couldn't update. Try again."); el.disabled = false; return; }
    S.pt.treq = S.pt.treq.filter(x => x.id !== r.id); S.pt.tmsg = act === "ptapprove" ? `${r.full_name} (${r.email}) is approved. They can refresh the page to start.` : `Declined ${r.email}.`; render(); }
  else if (act === "ptaddteacher") { const email = $("#ptTeacher").value.trim(); if (!email) return; const { error } = await sb.rpc("pb_add_teacher", {p_email: email}); S.pt.tmsg = error ? error.message : `${email} can now use the Planbook as a teacher.`; render(); }
  else if (act === "assignlesson") { S.pt.addCode = el.dataset.code; S.pt.addI = +el.dataset.i; const g = SO[el.dataset.code].grade; const pc = S.pt.classes.find(x => x.grade === g); if (pc) S.pt.sel = pc.id; S.pt.detail = null; setTab("students"); if (!pc && S.pt.ready) toast(`Create a ${CN(g)} online class first`); }
};

// ---------- events ----------
document.addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b && !b.closest("#app")) setTab(b.dataset.tab); });
const app = document.getElementById("app");
function togglePlan(code, on){
  const p = S.plan, g = SO[code].grade;
  if (p.grade !== g) { p.grade = g; p.sos = []; }
  const has = p.sos.includes(code); on = on ?? !has;
  p.sos = on ? [...new Set([...p.sos, code])] : p.sos.filter(c => c !== code);
  S.daySel = null; savePlan(); toast(on ? `${dc(code)} added to the weekly plan` : `${dc(code)} removed from the weekly plan`);
}
app.addEventListener("click", async e => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  if (el.tagName === "INPUT" || el.tagName === "SELECT") return;
  const act = el.dataset.act;
  if (act.startsWith("pt") || act === "assignlesson") return ptClick(el, act);
  if (act === "cgrade") { S.curGrade = el.dataset.v; S.curSel = gradeSOs(S.curGrade)[0].code; render(); }
  else if (act === "cursel") { S.curSel = el.dataset.code; render(); if (innerWidth <= 1080) app.querySelector("article.card")?.scrollIntoView({block:"start"}); }
  else if (act === "toggleplan") { togglePlan(el.dataset.code); render(); }
  else if (act === "lgrade") { const g = el.dataset.v; S.lesson = {code: gradeSOs(g)[0].code, i:0}; S.genErr = ""; render(); loadLessonsFor(S.lesson.code); }
  else if (act === "lsel") { S.lesson.i = +el.dataset.i; S.genErr = ""; render(); }
  else if (act === "ltab") { S.ltab = el.dataset.v; render(); }
  else if (act === "tab") setTab(el.dataset.t);
  else if (act === "openday") { S.daySel = +el.dataset.ix; setTab("day"); }
  else if (act === "dstep") { S.daySel += +el.dataset.d; render(); }
  else if (act === "openlesson") { S.lesson = {code: el.dataset.code, i: +el.dataset.i}; S.genErr = ""; S.ltab = "overview"; setTab("lessons"); loadLessonsFor(S.lesson.code); }
  else if (act === "gen") generate();
  else if (act === "genall") generateAll();
  else if (act === "dl") downloadLesson();
  else if (act === "classanalysis") { S.classSel = el.dataset.id; setTab("analysis"); }
  else if (act === "quizassess") {
    const code = el.dataset.code, g = SO[code].grade, cls = S.classes.find(c => c.grade === g);
    if (cls) S.classSel = cls.id; else S.newClass = true;
    S.newAssess = cls ? {name:`Check-in quiz: ${SO[code].title}`, date: iso(new Date()), type:"Quiz", sos:[code]} : null;
    setTab("marks"); if (!cls) toast(`Create a ${CN(g)} class first`);
  }
  else if (act === "sample") { const {c, as} = sampleData(); S.classes.push(c); S.assess.push(...as); S.classSel = c.id; saveBook(); for (const a of as) await store.set("a_"+a.id, a); render(); toast("Example class loaded"); }
  else if (act === "selclass") { S.classSel = el.dataset.id; S.assessSel = null; S.confirm = null; S.newAssess = null; render(); }
  else if (act === "newclass") { S.newClass = true; render(); $("#cName")?.focus(); }
  else if (act === "cancelclass") { S.newClass = false; render(); }
  else if (act === "addclass") {
    const name = $("#cName").value.trim(); if (!name) { toast("Enter a class name"); $("#cName").focus(); return; }
    const c = {id:uid(), name, grade:$("#cGrade").value, students:[]}; S.classes.push(c); S.classSel = c.id; S.newClass = false; S.classPanel = true;
    if (S.newAssess && SO[S.newAssess.sos[0]]?.grade !== c.grade) S.newAssess = null;
    saveBook(); render(); $("#newStudents")?.focus(); toast("Class created. Add your students.");
  }
  else if (act === "classpanel") { S.classPanel = !S.classPanel; render(); }
  else if (act === "addstudents") { const c = curClass(); const names = $("#newStudents").value.split(/\n/).map(s => s.trim()).filter(Boolean); if (!names.length) return; names.forEach(n => c.students.push({id:uid(), name:n})); saveBook(); render(); toast(`${names.length} student${names.length>1?"s":""} added`); }
  else if (act === "rmstudent") { const c = curClass(); c.students = c.students.filter(s => s.id !== el.dataset.id); saveBook(); render(); }
  else if (act === "ask") { S.confirm = el.dataset.k; render(); }
  else if (act === "cancel") { S.confirm = null; render(); }
  else if (act === "delclass") { const c = curClass(); for (const a of classAssess(c)) await store.del("a_"+a.id); S.assess = S.assess.filter(a => a.classId !== c.id); S.classes = S.classes.filter(x => x.id !== c.id); S.classSel = S.classes[0]?.id || null; S.confirm = null; saveBook(); render(); toast("Class deleted"); }
  else if (act === "delassess") { const id = S.assessSel; await store.del("a_"+id); S.assess = S.assess.filter(a => a.id !== id); S.assessSel = null; S.confirm = null; render(); toast("Assessment deleted"); }
  else if (act === "newassess") { S.newAssess = {name:"", date:iso(new Date()), type:"Quiz", sos:[]}; render(); $("#aName")?.focus(); }
  else if (act === "cancelassess") { S.newAssess = null; render(); }
  else if (act === "saveassess") {
    const n = S.newAssess; n.name = $("#aName").value.trim(); n.date = $("#aDate").value; n.type = $("#aType").value;
    if (!n.name) { toast("Give the assessment a name"); return; } if (!n.sos.length) { toast("Choose at least one outcome"); return; }
    const a = {kind:"assess", id:uid(), classId:S.classSel, name:n.name, date:n.date, type:n.type, sos:n.sos, marks:{}};
    S.assess.push(a); S.assessSel = a.id; S.newAssess = null; await store.set("a_"+a.id, a); render(); toast("Assessment created");
  }
  else if (act === "selassess") { S.assessSel = el.dataset.id; S.confirm = null; render(); }
  else if (act === "lv") {
    const a = S.assess.find(x => x.id === S.assessSel); if (!a) return;
    const sid = el.dataset.s, k = el.dataset.k, v = +el.dataset.v;
    a.marks = a.marks || {}; a.marks[sid] = a.marks[sid] || {};
    const clear = a.marks[sid][k] === v;
    if (clear) delete a.marks[sid][k]; else a.marks[sid][k] = v;
    el.parentElement.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(!clear && +b.dataset.v === v)));
    saveAssess(a);
    const r = app.querySelector(`[data-ring="${a.id}"]`); if (r) r.innerHTML = ring(pctDone(a, curClass()));
  }
  else if (act === "csv") exportCSV();
  else if (act === "opentext") { S.lesson = {code: el.dataset.code, i: 0}; S.genErr = ""; S.ltab = "text"; setTab("lessons"); loadLessonsFor(S.lesson.code); }
  else if (act === "wsassess") {
    const code = el.dataset.code, g = SO[code].grade, cls = S.classes.find(c => c.grade === g);
    if (cls) S.classSel = cls.id; else S.newClass = true;
    S.newAssess = {name:`Written response: ${SO[code].title}`, date: iso(new Date()), type:"Written response", sos:[code]};
    setTab("marks"); if (!cls) toast(`Create a ${CN(g)} class first`);
  }
  else if (act.startsWith("tb")) tbClick(el, act);
});
function courseAct(act, v){
  if (act === "cgrade") { S.curGrade = v; S.curSel = gradeSOs(v)[0].code; render(); }
  else if (act === "lgrade") { S.lesson = {code: gradeSOs(v)[0].code, i:0}; S.genErr = ""; render(); loadLessonsFor(S.lesson.code); }
  else if (act === "tbcourse") { if (S.tb.course !== v) { S.tb.course = v; S.tb.sos = []; } render(); }
}
app.addEventListener("input", e => {
  if (e.target.id === "cq") { S.cq = e.target.value; const pos = e.target.selectionStart; render(); const i = $("#cq"); i.focus(); try { i.setSelectionRange(pos, pos); } catch(_) {} }
});
app.addEventListener("change", e => {
  const el = e.target, act = el.dataset.act, id = el.id, p = S.plan;
  if (el.dataset.cact) { courseAct(el.dataset.cact, el.value); return; }
  if (act === "toplan") { togglePlan(el.dataset.code, el.checked); render(); }
  else if (act === "pday") { const d = +el.dataset.d; p.days = el.checked ? [...new Set([...p.days, d])].sort() : p.days.filter(x => x !== d); if (!p.days.length) p.days = [d]; S.daySel = null; savePlan(); render(); }
  else if (act === "aso") { const n = S.newAssess; n.name = $("#aName").value; n.date = $("#aDate").value; n.type = $("#aType").value; n.sos = el.checked ? [...n.sos, el.dataset.code] : n.sos.filter(c => c !== el.dataset.code); }
  else if (id === "pGrade") { p.grade = el.value; p.sos = [gradeSOs(p.grade)[0].code]; S.daySel = null; savePlan(); render(); }
  else if (id === "pStart") { if (el.value) { p.start = el.value; S.daySel = null; savePlan(); render(); } }
  else if (id === "pPeriod") { p.period = Math.max(30, Math.min(120, +el.value || 60)); savePlan(); }
  else if (id === "pSkip") { p.skip = el.value; savePlan(); render(); }
  else if (id === "pWs") { p.ws = el.checked; S.daySel = null; savePlan(); render(); }
  else if (id === "pReview") { p.review = el.checked; S.daySel = null; savePlan(); render(); }
  else if (id === "pQuiz") { p.quiz = el.checked; S.daySel = null; savePlan(); render(); }
  else if (id === "daySel") { S.daySel = +el.value; render(); }
  else if (id === "lSO") { S.lesson = {code:el.value, i:0}; S.genErr = ""; render(); loadLessonsFor(el.value); }
  else if (id === "showAns" || id === "tbAns") { S.showAns = el.checked; render(); }
  else if (act && act.startsWith("tb")) tbChange(el, act);
  else if (id === "anMode") { S.an.mode = el.value; render(); }
  else if (id === "anThr") { S.an.thr = el.value; render(); }
  else if (id === "ptCode") { S.pt.addCode = el.value; S.pt.addI = 0; render(); }
  else if (id === "ptLesson") { S.pt.addI = +el.value; }
});

// ---------- boot ----------
(function boot(){
  const h = (location.hash || "").slice(1);
  if (TABS.includes(h)) S.tab = h;
  setTab(S.tab);
  (async () => {
    if (window.PB_PLATFORM) {
      await PB_PLATFORM.ready;
      PB_ALLOWED = PB_PLATFORM.allowed || null;
      Object.assign(store, PB_PLATFORM.store); sampleCap = PB_PLATFORM.sample; downloadsCap = PB_PLATFORM.downloads;
    } else {
      await store.init();
      try { if (window.claude?.use) { [sampleCap, downloadsCap] = await Promise.all([claude.use("sample"), claude.use("downloads")]); } } catch(e) {}
    }
    const [plan, book, as] = await Promise.all([store.get("planner"), store.get("gradebook"), store.listAssess()]);
    if (plan && plan.sos) { const {kind, ...rest} = plan; S.plan = {...S.plan, ...rest}; }
    if (book && book.classes) S.classes = book.classes;
    S.assess = as || [];
    S.storeReady = true;
    const st = {supabase:["ok","Synced to Supabase"], db:["ok","Saved to your account"], local:["","Saved in this browser only"], none:["","Not saved in this view"]}[store.mode];
    document.querySelectorAll(".st-dot").forEach(d => d.className = "dot st-dot " + st[0]);
    document.querySelectorAll(".st-text").forEach(t => t.textContent = st[1]);
    render(); loadLessonsFor(S.lesson.code);
    if (window.PB_PLATFORM) ptLoad();
  })();
})();
