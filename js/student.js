// Course keys look like ART7, FSL8, CHI9 or ETH.
const elLabel = k => { const m = /^(ART|DR|MU|IM|CTF|EOE|FSL|SPA|CHI)([789])$/.exec(String(k || "")); const N = {ART:"Art",DR:"Drama",MU:"General Music",IM:"Instrumental Music",CTF:"CTF",EOE:"Outdoor Education",FSL:"French",SPA:"Spanish",CHI:"Mandarin"}; return k === "ETH" ? "Ethics" : m ? `${N[m[1]]} ${m[2]}` : String(k || ""); };
// Student site: sign in, join a class, see assigned lessons, practise and take tests.
(function () {
  const cfg = window.PB_CONFIG;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Show x^2 as a superscript; everything else stays as plain, escaped text.
  const mth = v => esc(v).replace(/\^(\([^()]{1,20}\)|-?\d+(?:\.\d+)?|-?[a-zA-Z]\w*)/g, (m, e) => `<sup>${e.replace(/^\((.*)\)$/, "$1")}</sup>`);
  const LV = { 1: "LM", 2: "AD", 3: "PR", 4: "EX" };
  const LVNAME = { 1: "Limited", 2: "Adequate", 3: "Proficient", 4: "Excellent" };
  const app = $("#app");
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 2600); }

  const S = { user: null, name: "", classes: [], assignments: [], attempts: [], view: "home", key: null, lesson: null, tab: "learn", practice: null, test: null, busy: false, joinErr: "" };

  // ---------- drafts (per student, per lesson) ----------
  const draftKey = (k, kind) => `pbs_${S.user?.id}_${k}_${kind}`;
  const loadDraft = (k, kind) => { try { return JSON.parse(localStorage.getItem(draftKey(k, kind))) || []; } catch (e) { return []; } };
  const saveDraft = (k, kind, a) => { try { localStorage.setItem(draftKey(k, kind), JSON.stringify(a)); } catch (e) {} };
  const clearDraft = (k, kind) => { try { localStorage.removeItem(draftKey(k, kind)); } catch (e) {} };

  // ---------- API ----------
  async function api(method, qs, body) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error("Sign in again.");
    const r = await fetch("/api/student" + (qs || ""), {
      method, headers: { authorization: "Bearer " + session.access_token, "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error || "Something went wrong. Try again."); e.status = r.status; throw e; }
    return j;
  }

  async function loadData() {
    const [enr, asg, att] = await Promise.all([
      sb.from("pb_enrollments").select("class_id, display_name, pb_classes(name, grade, subject, course)").eq("student_id", S.user.id),
      sb.from("pb_assignments").select("id, class_id, lesson_key, code, title, test_open, created_at").order("created_at"),
      sb.from("pb_attempts").select("id, class_id, lesson_key, kind, score, total, level, detail, created_at").eq("student_id", S.user.id).order("created_at")
    ]);
    S.classes = (enr.data || []).filter(e => e.pb_classes?.subject === "complementary_ms").map(e => ({ id: e.class_id, name: e.pb_classes?.name || "Class", grade: e.pb_classes?.course || e.pb_classes?.grade, me: e.display_name }));
    S.name = S.classes[0]?.me || S.user.user_metadata?.pb_join?.name || S.user.email;
    S.assignments = asg.data || [];
    S.attempts = att.data || [];
    $("#whoName").textContent = S.name;
  }
  const attemptsFor = (k, kind) => S.attempts.filter(a => a.lesson_key === k && a.kind === kind);

  // ---------- views ----------
  function render() {
    if (S.view === "lesson") return renderLesson();
    renderHome();
  }

  function joinForm() {
    return `<div class="card" style="max-width:520px"><div class="card-h"><h2>Join your class</h2></div><div class="card-b stack" style="gap:12px">
      <p class="small muted">Enter the class code your teacher gave you.</p>
      <label class="f">Class code<input id="jCode" maxlength="12" style="text-transform:uppercase" autocomplete="off"></label>
      <label class="f">Your name<input id="jName" maxlength="60" value="${esc(S.user.user_metadata?.pb_join?.name || "")}"></label>
      ${S.joinErr ? `<p class="auth-msg err">${esc(S.joinErr)}</p>` : ""}
      <div><button class="btn" data-act="join">Join class</button></div></div></div>`;
  }

  function renderHome() {
    if (!S.classes.length) {
      app.innerHTML = `<h1>Welcome</h1><p class="muted" style="margin:0 0 18px">You're not in a class yet.</p>${joinForm()}`;
      return;
    }
    const byClass = S.classes.map(c => ({ c, list: S.assignments.filter(a => a.class_id === c.id) }));
    app.innerHTML = `<h1>My lessons</h1><p class="muted" style="margin:0 0 20px">Open a lesson to see examples, practise, and take the test.</p>
      <div class="stack" style="gap:18px">${byClass.map(({ c, list }) => `<section class="card">
        <div class="card-h"><h2>${esc(c.name)}</h2><span class="small muted">${esc(elLabel(c.grade))}</span></div>
        ${list.length ? list.map(a => {
          const pr = attemptsFor(a.lesson_key, "practice"), best = pr.reduce((m, x) => (!m || x.score / (x.total || 1) > m.score / (m.total || 1) ? x : m), null);
          const t = attemptsFor(a.lesson_key, "test")[0];
          return `<div class="lessonrow"><div style="min-width:0"><div class="row" style="gap:8px"><span class="code">${esc(a.code)}</span><b>${esc(a.title)}</b></div>
            <div class="meta">${best ? `<span class="pill">Practice best ${best.score}/${best.total}</span>` : `<span class="pill">Practice not started</span>`}
            ${t ? `<span class="pill ok">Test ${t.score}/${t.total} · ${LV[t.level] || ""}</span>` : a.test_open ? `<span class="pill todo">Test to do</span>` : `<span class="pill">Test closed</span>`}</div></div>
            <button class="btn sm" data-act="open" data-k="${esc(a.lesson_key)}">Open</button></div>`;
        }).join("") : `<p class="card-b muted small">Your teacher hasn't opened any lessons for this class yet.</p>`}
      </section>`).join("")}
      <details class="card"><summary class="card-b" style="cursor:pointer;font-weight:700">Join another class</summary><div class="card-b" style="padding-top:0">${joinForm().replace(/^<div class="card"[^>]*>/, "<div>")}</div></details></div>`;
  }

  function renderLesson() {
    const L = S.lesson;
    const head = `<button class="btn quiet sm" data-act="home" style="margin:-6px 0 10px -10px">← My lessons</button>`;
    if (!L) { app.innerHTML = head + `<div class="row"><span class="spinner"></span><span class="muted">Loading lesson…</span></div>`; return; }
    const t = attemptsFor(L.key, "test")[0];
    const tabs = [["learn", "Learn"], ["practice", `Practice <span class="n">${L.practice.length}</span>`], ["test", `Test <span class="n">${L.test.items.length}</span>`]];
    app.innerHTML = `${head}<div class="row" style="gap:8px;margin-bottom:4px"><span class="code">${esc(L.code)}</span><span class="small muted">${esc((SO[L.code] || HS_SO[L.code])?.title || "")}</span></div>
      <h1>${esc(L.title)}</h1>
      <div class="card" style="margin-top:16px">
        <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-act="tab" data-t="${k}" aria-selected="${S.tab === k}">${l}</button>`).join("")}</div>
        ${S.tab === "learn" ? learnView(L) : S.tab === "practice" ? practiceView(L) : testView(L, t)}
      </div>`;
  }

  function learnView(L) {
    return `<div class="card-b stack" style="gap:18px">
      <div><span class="eyebrow">Learning goal</span><p style="margin:4px 0 0">${mth(L.iCan || L.objective)}</p></div>
      ${L.hook ? `<p class="note">${mth(L.hook)}</p>` : ""}
      ${L.vocabulary?.length ? `<div><span class="eyebrow">Key words</span><dl class="stack" style="gap:8px;margin:8px 0 0">${L.vocabulary.map(v => `<div><dt style="font-weight:700">${esc(v.term)}</dt><dd style="margin:0" class="muted">${mth(v.definition)}</dd></div>`).join("")}</dl></div>` : ""}
      ${L.study?.passage ? `<div class="stack" style="gap:8px"><span class="eyebrow">Activity</span><b>${esc(L.study.title || "")}</b><p class="small" style="margin:0">${esc(L.study.question || "")}</p><div style="font-family:Georgia,serif;font-size:1.02rem;line-height:1.7;background:var(--sunk);border-left:3px solid var(--accent);border-radius:0 9px 9px 0;padding:12px 16px;white-space:pre-line">${esc(L.study.passage)}</div>${L.study.source ? `<span class="xs muted">${esc(L.study.source)}</span>` : ""}${L.study.steps?.length ? `<ol class="small" style="margin:0;padding-left:18px">${L.study.steps.map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}${L.study.discussion?.length ? `<span class="xs muted">Questions to think about:</span><ol class="small" style="margin:0;padding-left:18px">${L.study.discussion.map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}${L.study.product ? `<p class="note small" style="margin:0"><b>Writing task:</b> ${esc(L.study.product)}</p>` : ""}</div>` : ""}
      <div class="stack" style="gap:12px"><span class="eyebrow">Examples</span>${(L.examples || []).map((e, i) => `<div class="ex"><div class="hd"><span class="num">${i + 1}</span><b>${esc(e.title)}</b></div>
        <div>${mth(e.problem)}</div><ol>${(e.steps || []).map(s => `<li>${mth(s)}</li>`).join("")}</ol>
        <div><b>Answer:</b> ${mth(e.answer)}</div>${e.explore ? `<div class="small muted"><b>Try this:</b> ${mth(e.explore)}</div>` : ""}</div>`).join("")}</div>
      <div><button class="btn" data-act="tab" data-t="practice">Start practice</button></div></div>`;
  }

  function qInput(kind, it, ix, val, disabled) {
    if (it.type === "mc") return `<div class="choices" role="radiogroup">${it.options.map(o => `<label class="choice"><input type="radio" name="${kind}${ix}" value="${esc(o)}" data-ix="${ix}" data-kind="${kind}" ${val === o ? "checked" : ""} ${disabled ? "disabled" : ""}><span>${mth(o)}</span></label>`).join("")}</div>`;
    if (it.open) return `<textarea data-ix="${ix}" data-kind="${kind}" ${disabled ? "disabled" : ""} placeholder="Write your answer">${esc(val || "")}</textarea><div class="openhint">Your teacher reads this answer. It isn't part of the automatic score.</div>`;
    return `<input type="text" data-ix="${ix}" data-kind="${kind}" value="${esc(val || "")}" ${disabled ? "disabled" : ""} autocomplete="off" placeholder="Your answer">`;
  }

  function practiceView(L) {
    const P = S.practice, res = P.result;
    return `${res ? `<div class="card-b"><div class="scorebox"><div><div class="eyebrow">Practice score</div><div class="big">${res.score}/${res.total}</div></div><div class="small">${res.pct >= 80 ? "Great work. Try the test when you're ready." : "Check the corrections below, then try again."}</div></div></div>` : `<div class="card-b small muted" style="padding-bottom:0">Answer each question, then check your answers. You can practise as many times as you like.</div>`}
      <div class="card-b">${L.practice.map((it, ix) => {
        const r = res?.results[ix];
        const cls = r ? (r.correct === true ? "right" : r.correct === false ? "wrong" : "") : "";
        return `<div class="q ${cls}"><span class="n">${ix + 1}</span><div><div class="qt">${mth(it.q)} <span class="lvl ${esc(it.level)}">${esc(it.level)}</span></div>${qInput("p", it, ix, P.answers[ix], !!res)}
          ${r ? r.correct === true ? `<div class="fb right"><span>✓ Correct</span></div>` : r.correct === false ? `<div class="fb wrong"><span>✗ Not quite. Answer: ${mth(r.answer)}</span></div>` : `<div class="fb read"><span>Model answer: ${mth(r.answer)}</span></div>` : ""}</div></div>`;
      }).join("")}</div>
      <div class="actions">${res ? `<button class="btn" data-act="retry">Try again</button><button class="btn ghost" data-act="tab" data-t="test">Go to test</button>` : `<span class="small muted">${P.answers.filter(Boolean).length} of ${L.practice.length} answered</span><button class="btn" data-act="checkp" ${S.busy ? "disabled" : ""}>${S.busy ? "Checking…" : "Check my answers"}</button>`}</div>`;
  }

  function testView(L, done) {
    if (done) {
      const marks = done.detail?.marks || [], answers = done.detail?.answers || [];
      return `<div class="card-b"><div class="scorebox"><div><div class="eyebrow">Your test result</div><div class="big">${done.score}/${done.total}</div></div>
        <span class="lvbig lv${done.level}">${LV[done.level] || ""}</span><span class="small">${LVNAME[done.level] || ""} · ${Math.round(100 * done.score / (done.total || 1))}%</span></div>
        <p class="small muted" style="margin:12px 0 0">Your teacher has your result. Keep practising to strengthen the questions you missed.</p></div>
        <div class="card-b">${L.test.items.map((it, ix) => `<div class="q ${marks[ix] === true ? "right" : marks[ix] === false ? "wrong" : ""}"><span class="n">${ix + 1}</span><div><div class="qt">${mth(it.q)}</div>
          <div class="small muted" style="margin-top:6px">Your answer: ${mth(answers[ix] || "—")}</div>
          <div class="fb ${marks[ix] === true ? "right" : marks[ix] === false ? "wrong" : "read"}">${marks[ix] === true ? "✓ Correct" : marks[ix] === false ? "✗ Incorrect" : "Your teacher will read this answer"}</div></div></div>`).join("")}</div>`;
    }
    if (!L.testOpen) return `<div class="empty"><h2>The test is closed</h2><p>Your teacher will open it when it's time.</p></div>`;
    const T = S.test, answered = T.answers.filter(Boolean).length;
    return `<div class="card-b"><p class="note">You can submit this test once. Check every answer before you submit. Your answers are saved on this device while you work.</p></div>
      <div class="card-b">${L.test.items.map((it, ix) => `<div class="q"><span class="n">${ix + 1}</span><div><div class="qt">${mth(it.q)}</div>${qInput("t", it, ix, T.answers[ix], S.busy)}</div></div>`).join("")}</div>
      <div class="actions"><span class="small muted">${answered} of ${L.test.items.length} answered</span>
        ${T.confirm ? `<span class="row"><span class="small">${answered < L.test.items.length ? `${L.test.items.length - answered} unanswered. ` : ""}Submit now?</span><button class="btn" data-act="submitt" ${S.busy ? "disabled" : ""}>${S.busy ? "Submitting…" : "Yes, submit"}</button><button class="btn quiet" data-act="nosubmit">Keep working</button></span>`
          : `<button class="btn" data-act="asksubmit">Submit test</button>`}</div>`;
  }

  // ---------- actions ----------
  async function openLesson(k) {
    S.view = "lesson"; S.key = k; S.lesson = null; S.tab = "learn"; render(); window.scrollTo(0, 0);
    try {
      const L = await api("GET", "?key=" + encodeURIComponent(k));
      S.lesson = L;
      S.practice = { answers: loadDraft(k, "p"), result: null };
      S.test = { answers: loadDraft(k, "t"), confirm: false };
    } catch (e) { toast(e.message); S.view = "home"; }
    render();
  }

  app.addEventListener("click", async e => {
    const el = e.target.closest("[data-act]"); if (!el || el.tagName === "INPUT") return;
    const act = el.dataset.act;
    if (act === "open") openLesson(el.dataset.k);
    else if (act === "home") { S.view = "home"; render(); window.scrollTo(0, 0); }
    else if (act === "tab") { S.tab = el.dataset.t; render(); }
    else if (act === "retry") { S.practice = { answers: [], result: null }; clearDraft(S.key, "p"); render(); window.scrollTo(0, 0); }
    else if (act === "checkp") {
      S.busy = true; render();
      try { S.practice.result = await api("POST", "", { key: S.key, kind: "practice", answers: S.practice.answers }); await loadData(); }
      catch (err) { toast(err.message); }
      S.busy = false; render();
    }
    else if (act === "asksubmit") { S.test.confirm = true; render(); }
    else if (act === "nosubmit") { S.test.confirm = false; render(); }
    else if (act === "submitt") {
      S.busy = true; render();
      try { await api("POST", "", { key: S.key, kind: "test", answers: S.test.answers }); clearDraft(S.key, "t"); toast("Test submitted"); }
      catch (err) { toast(err.message); }
      await loadData(); S.busy = false; S.test.confirm = false; render(); window.scrollTo(0, 0);
    }
    else if (act === "join") {
      const code = $("#jCode").value.trim(), name = $("#jName").value.trim();
      if (!code || !name) { S.joinErr = "Enter the class code and your name."; render(); return; }
      const { error } = await sb.rpc("pb_join_class", { p_code: code, p_name: name });
      S.joinErr = error ? error.message : "";
      if (!error) { await loadData(); toast("You've joined the class"); }
      render();
    }
  });
  app.addEventListener("input", e => {
    const el = e.target, ix = +el.dataset.ix, kind = el.dataset.kind; if (!kind || isNaN(ix)) return;
    const st = kind === "p" ? S.practice : S.test; st.answers[ix] = el.value; saveDraft(S.key, kind, st.answers);
  });
  app.addEventListener("change", e => {
    const el = e.target; if (el.type !== "radio") return;
    const ix = +el.dataset.ix, kind = el.dataset.kind, st = kind === "p" ? S.practice : S.test;
    st.answers[ix] = el.value; saveDraft(S.key, kind, st.answers);
    if (kind === "t") { const s = app.querySelector(".actions .small"); if (s) s.textContent = `${st.answers.filter(Boolean).length} of ${S.lesson.test.items.length} answered`; }
  });

  // ---------- sign in ----------
  let mode = "signin";
  const msg = $("#aMsg");
  function setMode(m) {
    mode = m; msg.textContent = ""; msg.className = "auth-msg";
    document.querySelectorAll("[data-tab]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.tab === m)));
    $("#authTabs").hidden = m === "reset" || m === "newpass";
    $("#nameRow").hidden = $("#codeRow").hidden = m !== "signup";
    $("#emailRow").hidden = m === "newpass"; $("#passRow").hidden = m === "reset";
    $("#forgot").hidden = m !== "signin"; $("#back").hidden = !(m === "reset" || m === "newpass");
    $("#aPass").autocomplete = m === "signin" ? "current-password" : "new-password";
    $("#passLabel").textContent = m === "newpass" ? "New password" : "Password";
    $("#aSubmit").textContent = { signin: "Sign in", signup: "Create account", reset: "Send reset link", newpass: "Save new password" }[m];
    $("#authTitle").textContent = { signin: "Student sign in", signup: "Create your student account", reset: "Reset your password", newpass: "Choose a new password" }[m];
  }
  const show = (t, ok) => { msg.textContent = t; msg.className = "auth-msg " + (ok ? "ok" : "err"); };
  document.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.tab)));
  $("#forgot").addEventListener("click", () => setMode("reset"));
  $("#back").addEventListener("click", () => setMode("signin"));
  $("#authForm").addEventListener("submit", async e => {
    e.preventDefault();
    const email = $("#aEmail").value.trim(), password = $("#aPass").value, btn = $("#aSubmit");
    btn.disabled = true;
    try {
      if (mode === "signin") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) show(error.message === "Email not confirmed" ? "Confirm your email first: open the link we sent you, then sign in." : "Email or password is incorrect.");
      } else if (mode === "signup") {
        const name = $("#aName").value.trim(), code = $("#aCode").value.trim().toUpperCase();
        if (!name) return show("Enter your name.");
        if (!code) return show("Enter the class code from your teacher.");
        if (password.length < 8) return show("Use at least 8 characters for your password.");
        const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + "/student", data: { pb_role: "student", pb_join: { code, name } } } });
        if (error) show(error.message);
        else if (!data.session) { setMode("signin"); show("Account created. Open the confirmation link in your email, then sign in here.", true); }
      } else if (mode === "reset") {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/student" });
        show(error ? error.message : "If that email has an account, a reset link is on its way.", !error);
      } else if (mode === "newpass") {
        if (password.length < 8) return show("Use at least 8 characters for your password.");
        const { error } = await sb.auth.updateUser({ password });
        if (error) show(error.message); else { show("Password updated.", true); enter((await sb.auth.getUser()).data.user); }
      }
    } finally { btn.disabled = false; }
  });
  $("#signOut").addEventListener("click", async () => { await sb.auth.signOut(); location.reload(); });

  let entered = false;
  async function enter(u) {
    if (!u || entered) return; entered = true;
    S.user = u; $("#auth").hidden = true; $("#who").hidden = false;
    const { data: role } = await sb.rpc("pb_role");
    if (role === "teacher") {
      app.innerHTML = `<div class="card" style="max-width:560px"><div class="card-b stack"><h2>This is a teacher account</h2><p class="muted">Teachers use the Planbook to assign lessons and see results.</p><div class="row"><a class="btn" href="/">Open the Planbook</a><button class="btn ghost" id="outT">Sign out</button></div></div></div>`;
      $("#outT").addEventListener("click", async () => { await sb.auth.signOut(); location.reload(); });
      return;
    }
    const pending = u.user_metadata?.pb_join;
    if (pending?.code && role !== "student") {
      const { error } = await sb.rpc("pb_join_class", { p_code: pending.code, p_name: pending.name || u.email });
      if (error) S.joinErr = error.message;
    }
    if (pending?.code) sb.auth.updateUser({ data: { pb_join: null } }).catch(() => {});
    await loadData(); render();
  }
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") { $("#auth").hidden = false; setMode("newpass"); return; }
    if (session?.user && mode !== "newpass") enter(session.user);
  });
  sb.auth.getSession().then(({ data }) => {
    if (data.session?.user && mode !== "newpass") enter(data.session.user);
    else { $("#auth").hidden = false; setMode(mode === "newpass" ? "newpass" : "signin"); $("#aEmail").focus(); }
  });
})();
