// Web platform layer: Supabase sign-in and storage, lesson writing via /api/generate, file downloads.
(function () {
  const cfg = window.PB_CONFIG;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const TABLE = "planbook_docs";
  // Same table as the Maths and Sciences apps, so Complementary rows are namespaced: key "mcc:<key>", kind "mcc_<kind>".
  const K = k => "mcc:" + k, KIND = k => (k ? "mcc_" + k : "mcc");
  let user = null, resolveReady, started = false;
  const ready = new Promise(r => (resolveReady = r));
  const say = msg => (typeof toast === "function" ? toast(msg) : console.warn(msg));

  const store = {
    mode: "supabase",
    async init() {},
    async get(k) {
      const { data, error } = await sb.from(TABLE).select("data").eq("key", K(k)).maybeSingle();
      if (error) { console.warn(error); return null; }
      return data ? data.data : null;
    },
    async set(k, v) {
      const { error } = await sb.from(TABLE).upsert(
        { user_id: user.id, key: K(k), kind: KIND(v && v.kind), data: v },
        { onConflict: "user_id,key" }
      );
      if (error) { console.warn(error); say("Couldn't save to Supabase. Check your connection and try again."); return false; }
      return true;
    },
    async del(k) {
      const { error } = await sb.from(TABLE).delete().eq("key", K(k));
      if (error) say("Couldn't delete. Try again.");
    },
    async listAssess() {
      const { data, error } = await sb.from(TABLE).select("data").eq("kind", KIND("assess"));
      return error ? [] : data.map(r => r.data);
    }
  };

  const sample = {
    async json(prompt) {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) throw { code: "not_signed", userMessage: "Sign in again to write lessons." };
      let r;
      try {
        r = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: "Bearer " + session.access_token },
          body: JSON.stringify({ prompt })
        });
      } catch (e) { throw { code: "network", userMessage: "Couldn't reach the lesson service. Check your connection." }; }
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw { code: j.code || "unavailable", userMessage: j.error };
      return j.data;
    }
  };

  const downloads = {
    async save({ filename, data }) {
      const type = filename.endsWith(".csv") ? "text/csv" : "text/html";
      const url = URL.createObjectURL(new Blob([data], { type }));
      const a = Object.assign(document.createElement("a"), { href: url, download: filename });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return { status: "saved" };
    }
  };

  // ---------- sign-in screen ----------
  const auth = document.getElementById("auth");
  const form = document.getElementById("authForm");
  const msg = document.getElementById("authMsg");
  const emailEl = document.getElementById("authEmail");
  const passEl = document.getElementById("authPass");
  const submit = document.getElementById("authSubmit");
  let mode = "signin"; // signin | signup | reset | newpass
  // Teacher portal: one sign-up and sign-in for every planbook; access is per subject.
  const PB_APP = "complementary_ms", PORTAL = "https://www.millardmiddleschoolmaths.live/teacher";
  // /teacher is the teacher sign-in link (like /student for students)
  const TEACHER_PAGE = /\/teacher\/?$/.test(location.pathname);
  if (TEACHER_PAGE) {
    const intro = document.createElement("p");
    intro.id = "teacherIntro"; intro.className = "small muted"; intro.style.margin = "0";
    intro.textContent = "New teacher? Choose Create account, confirm your email, then sign in and request access. A teacher who already uses the planbook will approve you. Already approved? Just sign in.";
    document.getElementById("authTitle").after(intro);
    document.getElementById("studentLink").hidden = true;
  }

  function setMode(m) {
    mode = m; msg.textContent = ""; msg.className = "auth-msg";
    document.querySelectorAll("[data-auth-tab]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.authTab === m)));
    document.getElementById("authTabs").hidden = m === "reset" || m === "newpass";
    document.getElementById("emailRow").hidden = m === "newpass";
    document.getElementById("passRow").hidden = m === "reset";
    document.getElementById("forgot").hidden = m !== "signin";
    document.getElementById("backToSignin").hidden = !(m === "reset" || m === "newpass");
    passEl.autocomplete = m === "signin" ? "current-password" : "new-password";
    document.getElementById("passLabel").firstChild.textContent = m === "newpass" ? "New password" : "Password";
    submit.textContent = { signin: "Sign in", signup: "Create account", reset: "Send reset link", newpass: "Save new password" }[m];
    document.getElementById("authTitle").textContent = { signin: "Sign in to Middle School Complementary Courses", signup: "Create your Middle School Complementary Courses account", reset: "Reset your password", newpass: "Choose a new password" }[m];
    if (TEACHER_PAGE && (m === "signin" || m === "signup")) document.getElementById("authTitle").textContent = m === "signin" ? "Teacher sign-in" : "Create your teacher account";
    const ti = document.getElementById("teacherIntro"); if (ti) ti.hidden = !(m === "signin" || m === "signup");
  }
  document.querySelector('[data-auth-tab="signup"]')?.addEventListener("click", e => { e.stopImmediatePropagation(); location.href = PORTAL; }, true);
  function show(text, ok) { msg.textContent = text; msg.className = "auth-msg " + (ok ? "ok" : "err"); }

  document.querySelectorAll("[data-auth-tab]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.authTab)));
  document.getElementById("forgot").addEventListener("click", () => setMode("reset"));
  document.getElementById("backToSignin").addEventListener("click", () => setMode("signin"));

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const email = emailEl.value.trim(), password = passEl.value;
    submit.disabled = true;
    try {
      if (mode === "signin") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) show(error.message === "Email not confirmed" ? "Confirm your email first: open the link we sent you, then sign in." : "Email or password is incorrect.");
      } else if (mode === "signup") {
        if (password.length < 8) { show("Use at least 8 characters for your password."); return; }
        const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } });
        if (error) show(error.message);
        else if (!data.session) { show("Account created. Check your email for a confirmation link, then sign in here.", true); setTimeout(() => { setMode("signin"); show("Account created. Confirm your email, then sign in.", true); }, 50); }
      } else if (mode === "reset") {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
        show(error ? error.message : "If that email has an account, a reset link is on its way.", !error);
      } else if (mode === "newpass") {
        if (password.length < 8) { show("Use at least 8 characters for your password."); return; }
        const { error } = await sb.auth.updateUser({ password });
        if (error) show(error.message); else { show("Password updated.", true); enter((await sb.auth.getUser()).data.user); }
      }
    } finally { submit.disabled = false; }
  });

  function addAccountControls() {
    document.querySelectorAll(".acct").forEach(el => el.remove());
    const make = () => {
      const d = document.createElement("div");
      d.className = "acct";
      d.innerHTML = `<span class="acct-email"></span><button type="button" class="acct-out">Sign out</button>`;
      d.querySelector(".acct-email").textContent = user.email || "";
      d.querySelector(".acct-out").addEventListener("click", async () => { await sb.auth.signOut(); location.reload(); });
      return d;
    };
    document.querySelector(".side .foot")?.prepend(make());
    document.querySelector(".topbar")?.appendChild(make());
  }

  let checking = false, blocked = false, allowedCourses = null;
  async function enter(u) {
    if (!u || started || checking || blocked) return;
    checking = true;
    const { data: role, error } = await sb.rpc("pb_app_role", { p_app: PB_APP });
    checking = false;
    if (error) { auth.hidden = false; show("Couldn't check your account. Refresh the page to try again."); return; }
    if (role !== "teacher") {
      blocked = true;
      if (role === "student" || u.user_metadata?.pb_role === "student") { location.replace("/student"); return; }
      auth.hidden = false;
      form.hidden = true; document.getElementById("authTabs").hidden = true; document.getElementById("forgot").hidden = true; document.getElementById("studentLink").hidden = true;
      document.getElementById("teacherIntro")?.remove();
      msg.className = "auth-msg"; msg.textContent = "";
      const box = document.createElement("div"); box.className = "stack"; box.style.gap = "12px";
      msg.after(box);
      const stuHref = document.querySelector("#studentLink a")?.getAttribute("href") || "/student";
      document.getElementById("authTitle").textContent = "This account doesn't have access to Middle School Complementary Courses";
      box.innerHTML = `<p style="margin:0"></p><div class="row"><a class="btn" href="${PORTAL}">Open the teacher portal</a></div><div class="row"><a class="btn ghost" href="${stuHref}">I'm a student</a><button type="button" class="btn ghost" data-out>Sign out</button></div>`;
      box.querySelector("p").textContent = `Signed in as ${u.email}. Teachers sign up and request their subjects in the teacher portal. Once the administrator approves you, your subjects open from there.`;
      box.querySelector("[data-out]").addEventListener("click", async () => { await sb.auth.signOut(); location.reload(); });
      return;
    }
    const { data: courses } = await sb.rpc("pb_my_courses", { p_app: PB_APP });
    allowedCourses = Array.isArray(courses) && courses.length ? courses.map(String) : null; // null = every grade/course
    user = u; auth.hidden = true;
    addAccountControls();
    started = true; resolveReady();
  }

  sb.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") { auth.hidden = false; setMode("newpass"); return; }
    if (session?.user && mode !== "newpass") enter(session.user);
    if (event === "SIGNED_OUT" && started) location.reload();
  });
  // one-time sign-in token from the teacher portal (#pbh=...), exchanged for this site's own session
  const handoff = /[#&]pbh=([^&]+)/.exec(location.hash);
  const boot = handoff
    ? sb.auth.verifyOtp({ token_hash: decodeURIComponent(handoff[1]), type: "email" }).catch(() => null)
        .then(() => history.replaceState(null, "", location.pathname + location.search))
    : Promise.resolve();
  boot.then(() => sb.auth.getSession()).then(({ data }) => {
    if (data.session?.user && mode !== "newpass") enter(data.session.user);
    else { auth.hidden = false; setMode(mode === "newpass" ? "newpass" : "signin"); emailEl.focus(); }
  });

  // Built-in lessons with answers come from a teacher-only endpoint, so students can't read them.
  async function lessonFile(code) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return null;
    const r = await fetch("/api/lesson?code=" + encodeURIComponent(code), { headers: { authorization: "Bearer " + session.access_token } });
    return r.ok ? r.json() : null;
  }

  window.PB_PLATFORM = { ready, store, sample, downloads, lessonFile, sb, getUser: () => user, get allowed() { return allowedCourses; } };
})();
