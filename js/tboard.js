// Planbook: Smart board assignments. The teacher gives a PDF (or blank, lined or squared pages) to an online class,
// students write their answers on it with an electronic pen on the student site, and every student's work lands in
// one folder per assignment, where the teacher marks it with the pen, gives a level and feedback, and returns it.
(function () {
  const P = () => window.PB_PLATFORM;
  const SB = () => P()?.sb;
  const LV = { 4: "EX", 3: "PR", 2: "AD", 1: "LM" }, LVN = { 4: "Excellent", 3: "Proficient", 2: "Adequate", 1: "Limited" };
  const e_ = v => (typeof esc === "function" ? esc(v) : String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));
  const say = m => (typeof toast === "function" ? toast(m) : console.log(m));
  const rerender = () => { if (typeof render === "function") render(); };
  const icn = n => (typeof ic === "function" ? ic(n) : "");
  const appKey = () => P()?.app || "";
  const classApp = c => (c.subject || "math") === "math" ? (+c.grade >= 10 ? "maths_hs" : "maths") : c.subject;
  const allSOS = () => (typeof SOS !== "undefined" ? SOS : []);
  const courseName = k => { try { if (typeof CN === "function") { const n = CN(isNaN(+k) ? k : +k); if (n && n !== "undefined") return n; } } catch (e) {} return isNaN(+k) ? k : (+k === 0 ? "Kindergarten" : "Grade " + k); };
  const PAPER = { pdf: "PDF", blank: "Blank pages", lined: "Lined pages", grid: "Squared pages", student: "Students attach their own PDF" };
  const pagesText = a => a.paper === "student" ? "" : ` · ${a.pages} page${a.pages === 1 ? "" : "s"}`;
  const STATUS = { none: ["Not started", ""], draft: ["Working on it", "dra"], submitted: ["Handed in", "sub"], returned: ["Returned", "ret"] };
  const fmtDate = d => { if (!d) return ""; const x = new Date(String(d).length <= 10 ? d + "T12:00:00" : d); return x.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" }); };
  const fmtTime = d => d ? new Date(d).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
  const BD = { classes: null, loading: false, asgs: [], subs: {}, sizes: {}, filter: "all", view: "list", cur: null, folder: [], busy: "", err: "", form: null, del: null };
  window.PB_BOARD = BD;

  async function load() {
    if (BD.loading) return; BD.loading = true; BD.err = "";
    try {
      const u = P()?.getUser?.();
      const { data: cl, error } = await SB().from("pb_classes").select("id,name,grade,subject,course,section").eq("teacher_id", u.id).order("created_at");
      if (error) throw error;
      BD.classes = (cl || []).filter(c => classApp(c) === appKey()).map(c => ({ id: c.id, name: c.name + (c.section ? ` (${c.section})` : ""), course: String(c.course || c.grade), grade: c.grade }));
      await loadAsgs();
    } catch (e) { BD.classes = BD.classes || []; BD.err = "Couldn't load your smart board assignments. Refresh to try again."; }
    BD.loading = false; rerender();
  }
  async function loadAsgs() {
    const ids = BD.classes.map(c => c.id);
    if (!ids.length) { BD.asgs = []; return; }
    const { data, error } = await SB().from("pb_board_assignments").select("*").eq("app", appKey()).in("class_id", ids).order("created_at", { ascending: false });
    if (error) throw error;
    BD.asgs = data || [];
    BD.subs = {}; BD.sizes = {};
    if (BD.asgs.length) {
      const { data: s } = await SB().from("pb_board_submissions").select("assignment_id,status").in("assignment_id", BD.asgs.map(a => a.id));
      (s || []).forEach(r => { const o = BD.subs[r.assignment_id] = BD.subs[r.assignment_id] || { draft: 0, submitted: 0, returned: 0 }; o[r.status]++; });
      const { data: en } = await SB().from("pb_enrollments").select("class_id").in("class_id", [...new Set(BD.asgs.map(a => a.class_id))]);
      (en || []).forEach(r => (BD.sizes[r.class_id] = (BD.sizes[r.class_id] || 0) + 1));
    }
  }
  const clsOf = id => (BD.classes || []).find(c => c.id === id);

  // ---------- page ----------
  window.rBoard = function () {
    const head = (typeof ph === "function") ? ph("Smart board", "Give students a PDF or blank pages to answer with an electronic pen. Their work is saved in one folder per assignment, where you mark it with the pen and return it with a level.", BD.classes?.length && BD.view === "list" ? `<button class="btn" data-bd="new">${icn("plus")}New assignment</button>` : "") : "<h1>Smart board</h1>";
    if (!P() || !SB()) return head + `<div class="card"><div class="empty"><p>The smart board works on the school website, where your classes and students are saved.</p></div></div>`;
    if (BD.classes === null) { load(); return head + `<div class="card"><div class="card-b row"><span class="spinner"></span>Loading…</div></div>`; }
    if (!BD.classes.length) return head + `<div class="card"><div class="empty"><h2>No online classes yet</h2><p>Smart board assignments go to an online class. Create one on the Students tab (students join with their class group or a class code), then come back.</p><div class="row" style="justify-content:center;margin-top:12px"><button class="btn" data-act="tab" data-t="students">Go to Students</button></div></div></div>`;
    const err = BD.err ? `<p class="note">${e_(BD.err)}</p>` : "";
    if (BD.view === "new") return head + err + formView();
    if (BD.view === "folder" && BD.cur) return head + err + folderView();
    return head + err + listView();
  };

  function listView() {
    const shown = BD.asgs.filter(a => BD.filter === "all" || a.class_id === BD.filter);
    return `<div class="stack" style="gap:16px">
      <div class="card"><div class="card-b row" style="gap:12px;flex-wrap:wrap"><label class="f">Class<select data-bd="filter"><option value="all">All classes</option>${BD.classes.map(c => `<option value="${c.id}" ${BD.filter === c.id ? "selected" : ""}>${e_(c.name)} · ${e_(courseName(c.course))}</option>`).join("")}</select></label>
        <p class="small muted" style="margin:0;flex:1 1 260px">Students find these on the student site under <b>Smart board</b>. They write with a pen, finger or mouse; work saves automatically and they hand it in when finished.</p></div></div>
      ${!shown.length ? `<div class="card"><div class="empty"><h2>No assignments yet</h2><p>Upload a worksheet as a PDF, or give blank, lined or squared pages.</p><div class="row" style="justify-content:center;margin-top:12px"><button class="btn" data-bd="new">${icn("plus")}New assignment</button></div></div></div>` :
      `<div class="bd-grid">${shown.map(card).join("")}</div>`}
    </div>`;
  }
  function card(a) {
    const c = clsOf(a.class_id), s = BD.subs[a.id] || { draft: 0, submitted: 0, returned: 0 }, n = BD.sizes[a.class_id] || 0;
    const toMark = s.submitted;
    return `<section class="card bd-card"><div class="card-b stack" style="gap:8px">
      <div class="row between" style="gap:8px;align-items:flex-start"><div style="min-width:0"><b style="font-size:1.05rem">${e_(a.title)}</b><div class="small muted">${e_(c?.name || "")}${a.due ? " · due " + e_(fmtDate(a.due)) : ""}</div></div>${a.open ? `<span class="bd-st sub">Open</span>` : `<span class="bd-st">Closed</span>`}</div>
      <div class="meta"><span class="pill">${e_(PAPER[a.paper])}${pagesText(a)}</span>${a.outcome ? `<span class="pill">Tracker: ${e_(a.outcome)} ${a.slot === "I" ? "informal" : "formal"}</span>` : ""}</div>
      <div class="small">${s.submitted + s.returned} of ${n} handed in · ${s.returned} returned${toMark ? ` · <b>${toMark} to mark</b>` : ""}</div>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:4px"><button class="btn sm" data-bd="folder" data-id="${a.id}">Open folder</button>
        <button class="btn ghost sm" data-bd="toggle" data-id="${a.id}">${a.open ? "Close to students" : "Open to students"}</button>
        ${BD.del === a.id ? `<span class="row" style="gap:6px"><span class="small">Delete it and all student work?</span><button class="btn sm" data-bd="delyes" data-id="${a.id}">Delete</button><button class="btn quiet sm" data-bd="delno">Keep</button></span>` : `<button class="btn quiet sm" data-bd="del" data-id="${a.id}">Delete</button>`}</div>
    </div></section>`;
  }

  function formView() {
    const f = BD.form, c = clsOf(f.class_id) || BD.classes[0];
    const sos = c ? allSOS().filter(s => String(s.grade) === String(c.course)) : [];
    return `<section class="card"><div class="card-h"><h2>New smart board assignment</h2><button class="btn quiet sm" data-bd="cancel">Cancel</button></div><div class="card-b">
      <div class="bd-form">
        <label class="f wide">Title<input data-bf="title" maxlength="160" value="${e_(f.title)}" placeholder="e.g. Fractions worksheet 2"></label>
        <label class="f">Class<select data-bf="class_id">${BD.classes.map(x => `<option value="${x.id}" ${x.id === c?.id ? "selected" : ""}>${e_(x.name)} · ${e_(courseName(x.course))}</option>`).join("")}</select></label>
        <label class="f">Due date (optional)<input type="date" data-bf="due" value="${e_(f.due || "")}"></label>
        <div class="f wide"><span>What do students write on?</span><div class="seg" role="radiogroup" style="flex-wrap:wrap">${Object.entries(PAPER).map(([k, v]) => `<button type="button" class="btn ${f.paper === k ? "" : "ghost"} sm" data-bd="paper" data-v="${k}">${v === "PDF" ? "A PDF worksheet" : k === "student" ? "Each student attaches a PDF" : v}</button>`).join("")}</div></div>
        ${f.paper === "pdf" ? `<div class="f wide"><label class="bd-drop" data-bd="drop"><input type="file" accept="application/pdf,.pdf" data-bf="file" hidden>${f.file ? `<b>${e_(f.file.name)}</b> · ${f.pages || "?"} page${f.pages === 1 ? "" : "s"} · ${(f.file.size / 1048576).toFixed(1)} MB<br><span class="small muted">Choose a different PDF</span>` : `<b>Choose a PDF</b> or drop it here<br><span class="small muted">Up to 25 MB and 60 pages. Scanned worksheets work too.</span>`}</label></div>`
          : f.paper === "student" ? `<p class="small muted wide" style="margin:0">Each student attaches their own PDF (for example a copy of a worksheet or a scanned page) on the student site, writes on it with the pen and hands it in to this folder.</p>`
          : `<label class="f">Number of pages<input type="number" min="1" max="20" data-bf="pages" value="${f.pages || 1}"></label>`}
        <label class="f wide">Instructions for students (optional)<textarea data-bf="instructions" maxlength="2000" rows="3" placeholder="e.g. Show your working for every question.">${e_(f.instructions || "")}</textarea></label>
        <label class="f">Put levels in the assessment tracker?<select data-bf="outcome"><option value="">No</option>${sos.map(s => `<option value="${e_(s.code)}" ${f.outcome === s.code ? "selected" : ""}>${e_(s.code)} ${e_(String(s.title).slice(0, 70))}</option>`).join("")}</select></label>
        ${f.outcome ? `<label class="f">As the outcome's<select data-bf="slot"><option value="F1" ${f.slot !== "I" ? "selected" : ""}>Formal assessment</option><option value="I" ${f.slot === "I" ? "selected" : ""}>Informal check</option></select></label>` : ""}
      </div>
      ${BD.formErr ? `<p class="note" style="margin-top:12px">${e_(BD.formErr)}</p>` : ""}
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn" data-bd="create" ${BD.busy === "create" ? "disabled" : ""}>${BD.busy === "create" ? "Saving…" : "Give to the class"}</button><button class="btn ghost" data-bd="preview">Try it on the board</button></div>
      <p class="small muted" style="margin:10px 0 0">Students can also attach their own PDF copy to any assignment instead of your pages. The class sees it straight away on the student site. You can close it later so no more changes are made.</p>
    </div></section>`;
  }

  function folderView() {
    const a = BD.cur, c = clsOf(a.class_id), rows = BD.folder;
    const done = rows.filter(r => r.status === "submitted").length;
    return `<div class="stack" style="gap:16px">
      <button class="btn quiet sm" data-bd="back" style="align-self:flex-start;margin:-6px 0 0 -10px">← All assignments</button>
      <section class="card"><div class="card-h"><div><h2>${e_(a.title)}</h2><div class="small muted">${e_(c?.name || "")} · ${e_(PAPER[a.paper])}${pagesText(a)}${a.due ? " · due " + e_(fmtDate(a.due)) : ""}${a.open ? "" : " · closed"}</div></div>
        <div class="row" style="gap:8px;flex-wrap:wrap">${done ? `<button class="btn sm" data-bd="next">Mark next (${done})</button>` : ""}${a.paper === "student" ? "" : `<button class="btn ghost sm" data-bd="preview">Open on the board</button>`}<button class="btn ghost sm" data-bd="toggle" data-id="${a.id}">${a.open ? "Close to students" : "Open to students"}</button><button class="btn quiet sm" data-bd="reload">Refresh</button></div></div>
        ${a.instructions ? `<div class="card-b small" style="padding-top:0">${e_(a.instructions)}</div>` : ""}
        ${BD.busy === "folder" ? `<div class="card-b row"><span class="spinner"></span>Loading the folder…</div>` : !rows.length ? `<div class="empty"><p>No students in this class yet.</p></div>` :
        `<div class="tablewrap"><table class="bd-table"><thead><tr><th>Student</th><th>Status</th><th>Pages written</th><th>Level</th><th>Last change</th><th></th></tr></thead><tbody>
          ${rows.map(r => { const st = STATUS[r.status] || STATUS.none; return `<tr><td><b>${e_(r.name)}</b></td><td><span class="bd-st ${st[1]}">${st[0]}</span></td><td>${r.submission ? r.pages_done : "–"}${r.pdf_name ? `<div class="xs muted">Own PDF: ${e_(r.pdf_name)}</div>` : ""}</td><td>${r.level ? `<b>${LV[r.level]}</b>` : "–"}</td><td class="small muted">${e_(fmtTime(r.submitted_at || r.updated_at))}</td>
            <td style="text-align:right">${r.submission ? `<button class="btn ${r.status === "submitted" ? "" : "ghost"} sm" data-bd="mark" data-sid="${r.submission}">${r.status === "submitted" ? "Mark" : r.status === "returned" ? "View" : "Look"}</button>` : ""}</td></tr>`; }).join("")}
        </tbody></table></div>`}
      </section>
      <p class="xs muted">Handed in = ready to mark. "Working on it" means the student has started but not handed in; you can look at it. Returned work shows your pen marks, level and feedback on the student's site.</p>
    </div>`;
  }

  async function openFolder(id) {
    BD.cur = BD.asgs.find(a => a.id === id); BD.view = "folder"; BD.busy = "folder"; BD.folder = []; rerender();
    const { data, error } = await SB().rpc("pb_board_folder", { p_asg: id });
    BD.busy = ""; if (error) BD.err = error.message; BD.folder = Array.isArray(data) ? data : []; rerender();
  }
  async function pdfUrl(a) {
    if (a.paper !== "pdf" || !a.pdf_path) return null;
    const { data, error } = await SB().storage.from("pb-board").createSignedUrl(a.pdf_path, 3600);
    if (error) throw error; return data.signedUrl;
  }

  // ---------- marking ----------
  async function mark(subId) {
    const a = BD.cur, row = BD.folder.find(r => r.submission === subId);
    const { data: s, error } = await SB().from("pb_board_submissions").select("*").eq("id", subId).single();
    if (error || !s) { say("Couldn't open this work."); return; }
    let url = null; try { url = s.pdf_path ? (await SB().storage.from("pb-board").createSignedUrl(s.pdf_path, 3600)).data?.signedUrl : await pdfUrl(a); } catch (e) { say("Couldn't open the PDF."); return; }
    if (s.pdf_path && !url) { say("Couldn't open the student's PDF."); return; }
    const M = { level: s.level || null, feedback: s.feedback || "", status: s.status };
    const withWork = BD.folder.filter(r => r.submission);
    const ix = withWork.findIndex(r => r.submission === subId);
    const save = async (ink, ret) => {
      const { data: r, error: er } = await SB().rpc("pb_board_mark", { p_sub: subId, p_mark_ink: ink, p_level: M.level, p_feedback: M.feedback, p_return: ret === undefined ? null : ret });
      if (er) throw new Error(er.message);
      M.status = r.status; if (row) { row.status = r.status; row.level = r.level; }
      return r;
    };
    const B = window.PBBoard.open({
      role: "teacher", title: `${row?.name || "Student"} · ${a.title}`, subtitle: `${STATUS[s.status][0]}${s.submitted_at ? " " + fmtTime(s.submitted_at) : ""} · your marks are in red by default`,
      pdfUrl: url, paper: s.pdf_path ? "pdf" : a.paper, pages: s.pages || a.pages, layers: [{ ink: s.ink }], ink: s.mark_ink || {}, stamps: true,
      localKey: "pbbm_" + subId, serverTime: s.marked_at, autosaveMs: 5000,
      onSave: ink => save(ink),
      actions: [{ id: "prev", label: "← Previous" }, { id: "next", label: "Next →" }, { id: "dl", label: "Download PDF" }, { id: "return", label: "Return to student", primary: true }],
      side: () => `<span class="eyebrow">${e_(row?.name || "Student")}</span><h3>${e_(a.title)}</h3>
        <div class="small">${e_(STATUS[M.status][0])}${s.submitted_at ? " · " + e_(fmtTime(s.submitted_at)) : ""}</div>
        ${M.status === "draft" ? `<div class="sb-note">Not handed in yet: the student may still be working on this.</div>` : ""}
        <div class="sb-k">Level</div><div class="sb-lv">${[4, 3, 2, 1].map(l => `<button data-lv="${l}" class="${M.level === l ? "on" : ""}">${LV[l]}<small>${LVN[l]}</small></button>`).join("")}</div>
        <div class="sb-k">Feedback</div><textarea data-fb placeholder="What went well, and the next step">${e_(M.feedback)}</textarea>
        ${a.outcome ? `<p class="small muted" style="margin:8px 0 0">Returning puts the level in the assessment tracker under ${e_(a.outcome)} (${a.slot === "I" ? "informal check" : "formal assessment"}).</p>` : ""}
        <div class="sb-sidebtns"><button class="btn" data-sbx="return">${M.status === "returned" ? "Save and return again" : "Return to student"}</button>${M.status === "returned" ? `<button class="btn ghost" data-sbx="unreturn">Take back</button>` : ""}</div>
        <p class="xs muted" style="margin-top:12px">Pen, highlighter, tick and cross go on your own layer, so the student's writing is never changed. Your marks save automatically.</p>`,
      onSide: (B, el, e) => {
        if (e.type === "click") {
          const lv = e.target.closest("[data-lv]"); if (lv) { M.level = M.level === +lv.dataset.lv ? null : +lv.dataset.lv; B.renderSide(); B.dirty = true; B.save(true); return; }
          const x = e.target.closest("[data-sbx]"); if (x) doAction(x.dataset.sbx, B);
        } else if (e.target.matches("[data-fb]")) { M.feedback = e.target.value; clearTimeout(B._fb); B._fb = setTimeout(() => B.save(true), 1200); }
      },
      onAction: (id, B) => doAction(id, B),
      onClose: () => { loadAsgs().catch(() => {}); rerender(); }
    });
    async function doAction(id, B) {
      if (id === "dl") return B.exportPdf(`${row?.name || "student"} - ${a.title}`);
      if (id === "prev" || id === "next") {
        const to = withWork[ix + (id === "next" ? 1 : -1)];
        if (!to) { B.toast(id === "next" ? "This is the last student with work." : "This is the first student with work."); return; }
        await B.close(); if (B.closed) mark(to.submission); return;
      }
      if (id === "unreturn") { try { await B.save(true); await save(B.getInk(), false); B.renderSide(); B.toast("Taken back. The student can't see your marking until you return it."); } catch (e) { B.toast(e.message); } return; }
      if (id === "return") {
        if (!M.level && !(await B.confirm("Return without a level?", "Return"))) return;
        try {
          clearTimeout(B._as); await save(B.getInk(), true); B.dirty = false; try { localStorage.removeItem("pbbm_" + subId); } catch (e) {}
          if (a.outcome && M.level && row) await toTracker(a, row.student_id, M.level);
          B.renderSide();
          const nxt = withWork.slice(ix + 1).find(r => r.status === "submitted") || withWork.find(r => r.status === "submitted" && r.submission !== subId);
          if (nxt && await B.confirm(`Returned to ${row?.name || "the student"}. Mark the next one (${nxt.name})?`, "Next student", "Stay here")) { await B.close(true); mark(nxt.submission); }
          else B.toast("Returned. The student can now see your marking.");
        } catch (e) { B.toast("Couldn't return it: " + e.message); }
      }
    }
  }
  // the level goes into the assessment tracker column for this outcome
  async function toTracker(a, studentId, level) {
    try {
      const c = clsOf(a.class_id), ref = "pt:" + a.class_id, slot = a.slot || "F1";
      let { data: it } = await SB().from("pb_tracker_items").select("id").eq("class_ref", ref).eq("unit", a.outcome).eq("slot", slot).maybeSingle();
      if (!it) {
        const so = allSOS().find(s => s.code === a.outcome);
        const r = await SB().from("pb_tracker_items").insert({ app: appKey(), class_ref: ref, course: c?.course || String(a.course || ""), unit: a.outcome, slot, kind: slot === "I" ? "informal" : "formal", method: "Smart board", title: a.title.slice(0, 120), unit_title: so ? `${so.code} ${so.title}`.slice(0, 200) : null, grade: c?.grade ?? null, source: "manual" }).select("id").single();
        if (r.error) throw r.error; it = r.data;
      }
      const { error } = await SB().from("pb_tracker_marks").upsert({ item_id: it.id, student_ref: studentId, level, source: "manual", updated_at: new Date().toISOString() });
      if (error) throw error;
      if (window.PB_TRACKER) window.PB_TRACKER.list = null; // reload the tracker next time it opens
    } catch (e) { say("Returned, but the level couldn't be put in the tracker: " + (e.message || e)); }
  }

  // ---------- create ----------
  async function pickFile(file) {
    BD.formErr = "";
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") { BD.formErr = "Choose a PDF file."; return rerender(); }
    if (file.size > 25 * 1048576) { BD.formErr = "That PDF is larger than 25 MB. Save it smaller (for example, scan at a lower resolution) and try again."; return rerender(); }
    BD.form.file = file; BD.form.pages = null; rerender();
    try { const info = await window.PBBoard.pdfInfo(await file.arrayBuffer()); BD.form.pages = info.pages; if (info.pages > 60) BD.formErr = "That PDF has more than 60 pages. Split it into smaller assignments."; if (!BD.form.title) BD.form.title = file.name.replace(/\.pdf$/i, "").slice(0, 160); }
    catch (e) { BD.formErr = "That file couldn't be read as a PDF."; BD.form.file = null; }
    rerender();
  }
  async function create() {
    const f = BD.form; BD.formErr = "";
    if (!String(f.title || "").trim()) BD.formErr = "Give the assignment a title.";
    else if (f.paper === "pdf" && (!f.file || !f.pages)) BD.formErr = "Choose the PDF worksheet.";
    else if (f.paper === "pdf" && f.pages > 60) BD.formErr = "That PDF has more than 60 pages.";
    if (BD.formErr) return rerender();
    BD.busy = "create"; rerender();
    try {
      const u = P().getUser(), c = clsOf(f.class_id) || BD.classes[0], id = crypto.randomUUID();
      let path = null;
      if (f.paper === "pdf") {
        path = `${u.id}/${id}.pdf`;
        const { error } = await SB().storage.from("pb-board").upload(path, f.file, { contentType: "application/pdf", upsert: false });
        if (error) throw error;
      }
      const row = { id, app: appKey(), class_id: c.id, course: c.course, title: f.title.trim().slice(0, 160), instructions: (f.instructions || "").trim() || null, paper: f.paper, pages: f.paper === "pdf" ? f.pages : f.paper === "student" ? 1 : Math.max(1, Math.min(20, +f.pages || 1)), pdf_path: path, pdf_name: f.file?.name || null, due: f.due || null, outcome: f.outcome || null, slot: f.outcome ? (f.slot || "F1") : null };
      const { error } = await SB().from("pb_board_assignments").insert(row);
      if (error) { if (path) await SB().storage.from("pb-board").remove([path]); throw error; }
      BD.form = null; BD.view = "list"; BD.filter = c.id; await loadAsgs(); say("Given to " + c.name);
    } catch (e) { BD.formErr = "Couldn't save: " + (e.message || e); }
    BD.busy = ""; rerender();
  }
  function preview(a) {
    const go = url => window.PBBoard.open({ role: "teacher", title: (a.title || "Preview") + " · on the board", subtitle: "Nothing you write here is saved", pdfUrl: url, paper: a.paper, pages: a.pages, ink: {}, stamps: true, actions: [{ id: "dl", label: "Download PDF" }], onAction: (id, B) => id === "dl" && B.exportPdf(a.title) });
    if (a.file) { const url = URL.createObjectURL(a.file); go(url); return; }
    if (a.paper === "student") { say("Each student attaches their own PDF, so there is nothing to preview yet."); return; }
    if (a.paper !== "pdf") { go(null); return; }
    pdfUrl(a).then(go).catch(() => say("Couldn't open the PDF."));
  }

  // ---------- events (the planbook routes clicks inside #view; ours use data-bd / data-bf) ----------
  document.addEventListener("click", async e => {
    const el = e.target.closest("[data-bd]"); if (!el || el.closest(".sb-root")) return;
    const a = el.dataset.bd, id = el.dataset.id;
    if (a === "drop") return; // the label opens the file picker
    e.preventDefault();
    if (a === "new") { const c = BD.filter !== "all" ? BD.filter : BD.classes[0]?.id; BD.form = { title: "", class_id: c, paper: "pdf", pages: 1, slot: "F1" }; BD.formErr = ""; BD.view = "new"; rerender(); }
    else if (a === "cancel") { BD.form = null; BD.view = "list"; rerender(); }
    else if (a === "paper") { BD.form.paper = el.dataset.v; if (el.dataset.v !== "pdf") BD.form.pages = BD.form.pages && BD.form.pages <= 20 ? BD.form.pages : 1; rerender(); }
    else if (a === "create") create();
    else if (a === "preview") preview(BD.view === "new" ? BD.form : BD.cur);
    else if (a === "folder") openFolder(id);
    else if (a === "back") { BD.view = "list"; BD.cur = null; loadAsgs().then(rerender); rerender(); }
    else if (a === "reload") openFolder(BD.cur.id);
    else if (a === "next") { const r = BD.folder.find(x => x.status === "submitted"); if (r) mark(r.submission); }
    else if (a === "mark") mark(el.dataset.sid);
    else if (a === "toggle") { const x = BD.asgs.find(q => q.id === id); if (!x) return; const { error } = await SB().from("pb_board_assignments").update({ open: !x.open }).eq("id", id); if (error) say(error.message); else { x.open = !x.open; say(x.open ? "Open: students can work on it" : "Closed: students can look but not change it"); rerender(); } }
    else if (a === "del") { BD.del = id; rerender(); }
    else if (a === "delno") { BD.del = null; rerender(); }
    else if (a === "delyes") { const x = BD.asgs.find(q => q.id === id); const { error } = await SB().from("pb_board_assignments").delete().eq("id", id); if (error) say(error.message); else { if (x?.pdf_path) await SB().storage.from("pb-board").remove([x.pdf_path]); BD.del = null; await loadAsgs(); say("Deleted"); } rerender(); }
  });
  const onField = e => {
    const el = e.target.closest("[data-bf], [data-bd='filter']"); if (!el || el.closest(".sb-root")) return;
    if (el.dataset.bd === "filter") { BD.filter = el.value; rerender(); return; }
    const k = el.dataset.bf;
    if (k === "file") { pickFile(el.files?.[0]); return; }
    BD.form[k] = k === "pages" ? +el.value : el.value;
    if ((k === "class_id" || k === "outcome") && e.type === "change") { if (k === "class_id") BD.form.outcome = ""; rerender(); }
  };
  document.addEventListener("input", e => { if (e.target.dataset?.bf && e.target.dataset.bf !== "file" && e.target.tagName !== "SELECT") onField(e); });
  document.addEventListener("change", onField);
  document.addEventListener("dragover", e => { const d = e.target.closest?.(".bd-drop"); if (d) { e.preventDefault(); d.classList.add("on"); } });
  document.addEventListener("dragleave", e => { const d = e.target.closest?.(".bd-drop"); if (d) d.classList.remove("on"); });
  document.addEventListener("drop", e => { const d = e.target.closest?.(".bd-drop"); if (d) { e.preventDefault(); d.classList.remove("on"); pickFile(e.dataTransfer.files?.[0]); } });
})();
