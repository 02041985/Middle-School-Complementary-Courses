// Student site: Smart board assignments. Students write on the teacher's PDF (or blank, lined or squared pages), or
// attach their own PDF copy, with an electronic pen, finger or mouse. Work saves as they go; "Hand in" puts it in the
// teacher's folder. Once the teacher returns it, the student sees the teacher's pen marks, level and feedback.
(function () {
  const APP = document.currentScript?.dataset.app || "";
  const cfg = window.PB_CONFIG; if (!cfg || !window.supabase) return;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });
  const LV = { 1: "LM", 2: "AD", 3: "PR", 4: "EX" }, LVN = { 1: "Limited", 2: "Adequate", 3: "Proficient", 4: "Excellent" };
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const STATUS = { null: ["To do", "todo"], draft: ["Started", "dra"], submitted: ["Handed in", "sub"], returned: ["Marked", "ret"] };
  const fmtDate = d => d ? new Date(d + "T12:00:00").toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" }) : "";
  const fmtTime = d => d ? new Date(d).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
  const main = document.getElementById("app");
  const box = document.createElement("section"); box.className = "spage"; box.id = "smartboard"; box.hidden = true; box.style.paddingTop = "0";
  (document.getElementById("assessments") || main)?.after(box);
  const S = { list: [], user: null, attachFor: null, err: "" };
  const say = m => { const t = document.getElementById("toast"); if (t) { t.textContent = m; t.hidden = false; clearTimeout(say._t); say._t = setTimeout(() => (t.hidden = true), 3000); } };

  async function refresh() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { box.hidden = true; return; }
    S.user = session.user;
    const { data } = await sb.rpc("pb_board_my", { p_app: APP });
    S.list = Array.isArray(data) ? data : [];
    draw();
  }
  function draw() {
    if (!S.list.length || (main && main.hidden)) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `<section class="card"><div class="card-h"><h2>Smart board</h2><span class="small muted">Write your answers with a pen, finger or mouse</span></div>
      ${S.list.map(a => { const st = STATUS[a.status] || STATUS.null; return `<div class="lessonrow"><div style="min-width:0"><div class="row" style="gap:8px;flex-wrap:wrap"><b>${esc(a.title)}</b><span class="bd-st ${st[1]}">${st[0]}${a.level ? " · " + LV[a.level] : ""}</span></div>
        <div class="meta">${a.class ? `<span class="pill">${esc(a.class)}</span>` : ""}${a.due ? `<span class="pill">Due ${esc(fmtDate(a.due))}</span>` : ""}${a.my_pdf ? `<span class="pill">My PDF: ${esc(a.my_pdf)}</span>` : a.paper === "student" ? `<span class="pill">Attach your PDF</span>` : ""}${a.open ? "" : `<span class="pill">Closed</span>`}</div></div>
        <div class="row" style="gap:6px;flex-wrap:wrap">${a.open && a.status !== "returned" ? `<button class="btn ghost sm" data-sbd="attach" data-id="${a.id}">${a.my_pdf ? "Change my PDF" : "Attach my PDF"}</button>` : ""}<button class="btn sm" data-sbd="open" data-id="${a.id}">${a.status === "returned" ? "See marking" : a.status ? "Continue" : "Start"}</button></div></div>`; }).join("")}
      <p class="small muted" style="margin:0;padding:10px 16px 14px">Your work saves as you write. Press <b>Hand in</b> when you're finished; you can still change it until your teacher marks it. Attach your own PDF if you have your own copy to write on.</p></section>`;
  }

  // ---------- attaching my own PDF ----------
  function chooseFile() {
    return new Promise(ok => {
      const inp = document.createElement("input"); inp.type = "file"; inp.accept = "application/pdf,.pdf"; inp.style.display = "none";
      inp.onchange = () => { ok(inp.files?.[0] || null); inp.remove(); };
      document.body.appendChild(inp); inp.click();
    });
  }
  async function attach(asgId, file, B) {
    if (!file) return false;
    const fail = m => { (B ? B.toast(m) : say(m)); return false; };
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") return fail("Choose a PDF file.");
    if (file.size > 25 * 1048576) return fail("That PDF is larger than 25 MB.");
    let pages;
    try { pages = (await window.PBBoard.pdfInfo(await file.arrayBuffer())).pages; } catch (e) { return fail("That file couldn't be read as a PDF."); }
    if (pages > 60) return fail("That PDF has more than 60 pages.");
    const { data: { session } } = await sb.auth.getSession(); if (!session) return fail("Sign in again.");
    B ? B.setStatus("Uploading your PDF…") : say("Uploading your PDF…");
    const path = `s/${session.user.id}/${asgId}-${Date.now()}.pdf`;
    const up = await sb.storage.from("pb-board").upload(path, file, { contentType: "application/pdf" });
    if (up.error) return fail("Couldn't upload: " + up.error.message);
    const { data, error } = await sb.rpc("pb_board_attach", { p_asg: asgId, p_path: path, p_name: file.name, p_pages: pages });
    if (error) { await sb.storage.from("pb-board").remove([path]); return fail(error.message); }
    if (data?.old) sb.storage.from("pb-board").remove([data.old]);
    try { localStorage.removeItem(`pbbs_${session.user.id}_${asgId}`); } catch (e) {}
    return true;
  }
  async function attachFlow(asgId, B) {
    const a = S.list.find(x => x.id === asgId);
    const file = await chooseFile(); if (!file) return;
    const hasWork = B ? Object.keys(B.getInk()).length : (a && a.status);
    if (hasWork) {
      const msg = "Write on your own PDF instead? What you've written so far on this assignment will be removed.";
      if (B ? !(await B.confirm(msg, "Use my PDF")) : !window.confirm(msg)) return;
    }
    if (B) { B.dirty = false; try { localStorage.removeItem(B.opts.localKey); } catch (e) {} }
    if (await attach(asgId, file, B)) { if (B) await B.close(true); await refresh(); openBoard(asgId); }
  }

  // ---------- the board ----------
  async function signed(path) { const { data, error } = await sb.storage.from("pb-board").createSignedUrl(path, 3600); if (error) throw error; return data.signedUrl; }
  async function openBoard(id) {
    const { data: a, error } = await sb.rpc("pb_board_get", { p_asg: id });
    if (error || !a) { say(error?.message || "This assignment isn't available."); return; }
    if (a.paper === "student" && !a.my_pdf_path) {
      if (!a.open) { say("This assignment is closed."); return; }
      say("Attach your PDF to start this assignment."); return attachFlow(id);
    }
    let url = null;
    try { if (a.my_pdf_path) url = await signed(a.my_pdf_path); else if (a.paper === "pdf" && a.pdf_path) url = await signed(a.pdf_path); }
    catch (e) { say("The PDF couldn't be opened. Try again."); return; }
    const returned = a.status === "returned", editable = a.open && !returned;
    const uid = S.user?.id || "";
    const actions = editable ? [{ id: "attach", label: a.my_pdf_path ? "Change my PDF" : "Attach my PDF" }, { id: "handin", label: a.status === "submitted" ? "Hand in again" : "Hand in", primary: true }]
      : [{ id: "dl", label: returned ? "Download marked copy" : "Download" }];
    const B = window.PBBoard.open({
      role: "student", title: a.title, subtitle: returned ? "Marked by your teacher" : !a.open ? "Closed: you can look but not change it" : a.status === "submitted" ? "Handed in · you can still change it until it's marked" : (a.due ? "Due " + fmtDate(a.due) : "Write your answers"),
      pdfUrl: url, paper: url ? "pdf" : a.paper, pages: a.my_pages || a.pages,
      ink: editable ? (a.ink || {}) : null, layers: editable ? [] : [{ ink: a.ink || {} }], top: returned ? [{ ink: a.mark_ink || {} }] : [],
      localKey: editable ? `pbbs_${uid}_${id}` : null, serverTime: a.updated_at, autosaveMs: 5000,
      onSave: editable ? async ink => { const { error: er } = await sb.rpc("pb_board_save", { p_asg: id, p_ink: ink, p_submit: false }); if (er) throw new Error(er.message); } : null,
      actions,
      side: () => `<span class="eyebrow">${returned ? "Marked" : a.status === "submitted" ? "Handed in" : "Assignment"}</span><h3>${esc(a.title)}</h3>
        ${a.due ? `<div class="small">Due ${esc(fmtDate(a.due))}</div>` : ""}
        ${a.my_pdf_name ? `<div class="small">Writing on your PDF: ${esc(a.my_pdf_name)}</div>` : ""}
        ${a.instructions ? `<div class="sb-k">Instructions</div><p style="margin:0;white-space:pre-wrap">${esc(a.instructions)}</p>` : ""}
        ${returned ? `<div class="sb-k">Your level</div>${a.level ? `<p style="margin:0"><b style="font-size:1.4rem">${LV[a.level]}</b> ${LVN[a.level]}</p>` : `<p class="small muted" style="margin:0">No level given.</p>`}
          ${a.feedback ? `<div class="sb-k">Feedback</div><p style="margin:0;white-space:pre-wrap">${esc(a.feedback)}</p>` : ""}<p class="small muted">Your teacher's marks are drawn over your work.</p>`
          : `<div class="sb-k">How it works</div><p class="small" style="margin:0">Write with the pen. Use the eraser to remove a stroke and the hand to move around. Your work saves by itself. Press <b>Hand in</b> when you're finished.</p>`}`,
      onAction: async (act, B) => {
        if (act === "dl") return B.exportPdf(a.title + (returned ? " (marked)" : ""));
        if (act === "attach") return attachFlow(id, B);
        if (act === "handin") {
          if (!Object.keys(B.getInk()).length && !(await B.confirm("You haven't written anything yet. Hand in anyway?", "Hand in"))) return;
          if (Object.keys(B.getInk()).length && !(await B.confirm("Hand this in to your teacher? You can still change it until your teacher marks it.", "Hand in"))) return;
          clearTimeout(B._as); B.setStatus("Handing in…");
          const { error: er } = await sb.rpc("pb_board_save", { p_asg: id, p_ink: B.getInk(), p_submit: true });
          if (er) { B.setStatus("Not handed in: " + er.message); return; }
          B.dirty = false; try { localStorage.removeItem(B.opts.localKey); } catch (e) {}
          a.status = "submitted"; B.setStatus("Handed in " + fmtTime(new Date().toISOString())); B.renderSide();
          B.toast("Handed in. It's in your teacher's folder.", 3600); refresh();
        }
      },
      onClose: () => refresh()
    });
  }

  box.addEventListener("click", e => {
    const el = e.target.closest("[data-sbd]"); if (!el) return;
    if (el.dataset.sbd === "open") openBoard(el.dataset.id);
    else if (el.dataset.sbd === "attach") attachFlow(el.dataset.id);
  });
  // keep the list in step with the student page (it hides while a lesson or quiz is open)
  if (main) new MutationObserver(() => draw()).observe(main, { attributes: true, attributeFilter: ["hidden"] });
  sb.auth.onAuthStateChange(ev => { if (ev === "SIGNED_OUT") { S.list = []; box.hidden = true; } else setTimeout(refresh, 500); });
  setTimeout(refresh, 900);
  setInterval(() => { if (!document.querySelector(".sb-root") && document.visibilityState === "visible") refresh(); }, 120000);
})();
