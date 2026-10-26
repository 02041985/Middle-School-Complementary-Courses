// Student site: formal quizzes and unit tests the teacher has opened (assessment tracker).
// Results are marked on the server and the proficiency level goes into the teacher's tracker automatically.
(function () {
  const APP = document.currentScript?.dataset.app || "";
  const cfg = window.PB_CONFIG; if (!cfg || !window.supabase) return;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });
  const LV = { 1: "LM", 2: "AD", 3: "PR", 4: "EX" }, LVN = { 1: "Limited", 2: "Adequate", 3: "Proficient", 4: "Excellent" };
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const main = document.getElementById("app");
  const box = document.createElement("section"); box.className = "spage"; box.id = "assessments"; box.hidden = true; box.style.paddingTop = "0";
  main?.after(box);
  const Q = { list: [], cur: null, answers: [], result: null, busy: false, err: "" };
  const draftKey = id => "pbq_" + id;
  const loadDraft = id => { try { return JSON.parse(localStorage.getItem(draftKey(id))) || []; } catch (e) { return []; } };
  const saveDraft = (id, a) => { try { localStorage.setItem(draftKey(id), JSON.stringify(a)); } catch (e) {} };

  async function refresh() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { box.hidden = true; return; }
    const { data } = await sb.rpc("pb_my_quizzes", { p_app: APP });
    Q.list = Array.isArray(data) ? data : [];
    draw();
  }
  function listView() {
    if (!Q.list.length) return "";
    return `<section class="card"><div class="card-h"><h2>Assessments</h2><span class="small muted">Quizzes and unit tests from your teacher</span></div>
      ${Q.list.map(q => `<div class="lessonrow"><div style="min-width:0"><div class="row" style="gap:8px"><span class="code">${q.kind === "summative" ? "Unit test" : "Quiz"}</span><b>${esc(q.title)}</b></div>
        <div class="meta"><span class="pill">${q.n} questions</span>${q.class ? `<span class="pill">${esc(q.class)}</span>` : ""}${q.attempt ? `<span class="pill ok">${q.attempt.score}/${q.attempt.total}${q.attempt.level ? " · " + LV[q.attempt.level] : ""}</span>` : `<span class="pill todo">To do</span>`}</div></div>
        <button class="btn sm" data-q="open" data-id="${q.id}">${q.attempt ? "See result" : "Start"}</button></div>`).join("")}</section>`;
  }
  function quizView() {
    const q = Q.cur, done = q.attempt || Q.result, marks = Q.result?.results || (q.attempt?.detail?.marks || []).map(m => ({ correct: m }));
    const ans = done ? (q.attempt?.detail?.answers || Q.answers) : Q.answers;
    const n = q.items.length, answered = Q.answers.filter(x => String(x || "").trim()).length;
    const res = Q.result || q.attempt;
    return `<button class="btn quiet sm" data-q="back" style="margin:-6px 0 10px -10px">← Back</button>
      <h1>${esc(q.title)}</h1>
      <div class="card" style="margin-top:16px">
      ${res ? `<div class="card-b"><div class="scorebox"><div><div class="eyebrow">Your result</div><div class="big">${res.score}/${res.total}</div></div>${res.level ? `<span class="lvbig lv${res.level}">${LV[res.level]}</span><span class="small">${LVN[res.level]}</span>` : ""}</div><p class="small muted" style="margin:12px 0 0">Your teacher has your result. Questions that need the teacher's judgement are not in the score.</p></div>`
        : `<div class="card-b"><p class="note">You can submit this ${q.kind === "summative" ? "unit test" : "quiz"} once. Your answers are saved on this device while you work.</p></div>`}
      <div class="card-b">${q.items.map((it, ix) => { const r = marks[ix]; const cls = r ? (r.correct === true ? "right" : r.correct === false ? "wrong" : "") : "";
        return `<div class="q ${cls}"><span class="n">${ix + 1}</span><div><div class="qt">${esc(it.q)}</div>
          ${it.type === "mc" ? `<div class="choices" role="radiogroup">${(it.options || []).map(o => `<label class="choice"><input type="radio" name="sq${ix}" value="${esc(o)}" data-ix="${ix}" ${ans[ix] === o ? "checked" : ""} ${done ? "disabled" : ""}><span>${esc(o)}</span></label>`).join("")}</div>`
            : `<input type="text" data-ix="${ix}" value="${esc(ans[ix] || "")}" ${done ? "disabled" : ""} autocomplete="off" placeholder="Your answer" dir="auto">`}
          ${r ? (r.correct === true ? `<div class="fb right">✓ Correct</div>` : r.correct === false ? `<div class="fb wrong">✗ Not quite${r.answer ? ". Answer: " + esc(r.answer) : ""}</div>` : `<div class="fb read">Your teacher will read this answer</div>`) : ""}</div></div>`; }).join("")}</div>
      ${done ? "" : `<div class="actions"><span class="small muted" data-q="count">${answered} of ${n} answered</span>${Q.err ? `<span class="auth-msg err">${esc(Q.err)}</span>` : ""}
        ${Q.confirm ? `<span class="row"><span class="small">${answered < n ? `${n - answered} unanswered. ` : ""}Submit now?</span><button class="btn" data-q="submit" ${Q.busy ? "disabled" : ""}>${Q.busy ? "Submitting…" : "Yes, submit"}</button><button class="btn quiet" data-q="nosubmit">Keep working</button></span>` : `<button class="btn" data-q="ask">Submit</button>`}</div>`}
      </div>`;
  }
  function draw() {
    if (Q.cur) { box.hidden = false; box.innerHTML = quizView(); main.hidden = true; return; }
    main.hidden = false;
    const html = listView(); box.innerHTML = html; box.hidden = !html;
  }
  async function open(id) {
    const { data, error } = await sb.rpc("pb_quiz_for_student", { p_quiz: id });
    if (error || !data) { alertMsg(error?.message || "This assessment isn't open."); return; }
    Q.cur = data; Q.result = null; Q.err = ""; Q.confirm = false; Q.answers = data.attempt ? (data.attempt.detail?.answers || []) : loadDraft(id);
    draw(); window.scrollTo(0, 0);
  }
  function alertMsg(m) { const t = document.getElementById("toast"); if (t) { t.textContent = m; t.hidden = false; setTimeout(() => (t.hidden = true), 2600); } }
  async function submit() {
    Q.busy = true; Q.err = ""; draw();
    try {
      const { data: { session } } = await sb.auth.getSession();
      const r = await fetch("/api/quiz", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + session.access_token }, body: JSON.stringify({ quiz: Q.cur.id, answers: Q.answers }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Your answers couldn't be saved. Try again.");
      Q.result = j; try { localStorage.removeItem(draftKey(Q.cur.id)); } catch (e) {}
      await refresh();
    } catch (e) { Q.err = e.message; }
    Q.busy = false; Q.confirm = false; draw(); window.scrollTo(0, 0);
  }
  box.addEventListener("click", e => {
    const el = e.target.closest("[data-q]"); if (!el || el.tagName === "INPUT") return; const a = el.dataset.q;
    if (a === "open") open(el.dataset.id);
    else if (a === "back") { Q.cur = null; Q.result = null; draw(); window.scrollTo(0, 0); }
    else if (a === "ask") { Q.confirm = true; draw(); }
    else if (a === "nosubmit") { Q.confirm = false; draw(); }
    else if (a === "submit") submit();
  });
  const onInput = e => { const el = e.target; if (el.dataset.ix == null || !Q.cur) return; Q.answers[+el.dataset.ix] = el.value; saveDraft(Q.cur.id, Q.answers);
    const c = box.querySelector('[data-q="count"]'); if (c) c.textContent = `${Q.answers.filter(x => String(x || "").trim()).length} of ${Q.cur.items.length} answered`; };
  box.addEventListener("input", onInput); box.addEventListener("change", onInput);
  sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") { Q.cur = null; box.hidden = true; } else setTimeout(refresh, 400); });
  setTimeout(refresh, 800);
})();
