// Student site: each student chooses Male or Female once. Teachers see the counts (Boys / Girls) on the
// lesson plans in their Plans folder. The choice can be changed from the small line at the top of the page.
(function () {
  const cfg = window.PB_CONFIG; if (!cfg || !window.supabase) return;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });
  const main = document.getElementById("app"); if (!main) return;
  const box = document.createElement("section"); box.className = "spage sgender"; box.hidden = true; box.style.paddingBottom = "0";
  main.before(box);
  const S = { gender: undefined, edit: false, busy: false, err: "", signedIn: false };
  const LABEL = { male: "Male", female: "Female" };

  async function refresh() {
    const { data: { session } } = await sb.auth.getSession();
    S.signedIn = !!session;
    if (!session) { S.gender = undefined; draw(); return; }
    const { data, error } = await sb.rpc("pb_my_profile");
    S.gender = error ? undefined : (data && data.gender) || null;
    draw();
  }
  function draw() {
    // nothing for signed-out visitors, while a lesson or quiz is open, or if the profile couldn't be read
    if (!S.signedIn || S.gender === undefined || main.hidden || !main.querySelector(".card")) { box.hidden = true; return; }
    box.hidden = false;
    if (S.gender && !S.edit) {
      box.innerHTML = `<div class="row small muted" style="gap:8px;justify-content:flex-end">Gender: <b style="color:var(--ink,inherit)">${LABEL[S.gender]}</b><button type="button" class="linkbtn xs" data-sg="edit">Change</button></div>`;
      return;
    }
    box.innerHTML = `<section class="card"><div class="card-h"><h2>${S.gender ? "Change your gender" : "Choose your gender"}</h2></div>
      <div class="card-b stack" style="gap:12px">
        <div class="row" style="gap:10px;flex-wrap:wrap" role="radiogroup" aria-label="Gender">
          ${["male", "female"].map(g => `<button type="button" class="btn ${S.gender === g ? "" : "ghost"}" data-sg="set" data-v="${g}" ${S.busy ? "disabled" : ""} aria-pressed="${S.gender === g}">${LABEL[g]}</button>`).join("")}
          ${S.gender ? `<button type="button" class="btn quiet" data-sg="cancel">Cancel</button>` : ""}
        </div>
        ${S.err ? `<p class="small" style="margin:0;color:var(--l1,#b42318)">${S.err}</p>` : ""}
        <p class="small muted" style="margin:0">Your teacher uses this to count boys and girls in the class.</p>
      </div></section>`;
  }
  box.addEventListener("click", async e => {
    const b = e.target.closest("[data-sg]"); if (!b) return;
    if (b.dataset.sg === "edit") { S.edit = true; S.err = ""; draw(); return; }
    if (b.dataset.sg === "cancel") { S.edit = false; S.err = ""; draw(); return; }
    S.busy = true; S.err = ""; draw();
    const { data, error } = await sb.rpc("pb_set_my_gender", { p_gender: b.dataset.v });
    S.busy = false;
    if (error) { S.err = error.message.includes("Only students") ? "Teacher accounts don't need this." : "Couldn't save. Check your connection and try again."; draw(); return; }
    S.gender = data && data.gender; S.edit = false; draw();
  });
  // follow the student page: hide while a lesson is open, show again on the home view
  new MutationObserver(() => draw()).observe(main, { attributes: true, attributeFilter: ["hidden"], childList: true });
  sb.auth.onAuthStateChange(ev => { if (ev === "SIGNED_OUT") { S.signedIn = false; S.gender = undefined; draw(); } else setTimeout(refresh, 400); });
  setTimeout(refresh, 700);
})();
