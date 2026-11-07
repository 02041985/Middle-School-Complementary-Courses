// Student site: "My calendar" (every subject). Lessons, assessments and smart board due dates from the student's own
// teachers (for their classes and class group), plus school holidays and events. The database decides what each
// student may see (pb_calendar).
(function () {
  const cfg = window.PB_CONFIG; if (!cfg || !window.supabase || !window.PBCal) return;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });
  const main = document.getElementById("app");
  const box = document.createElement("section"); box.className = "spage"; box.id = "mycalendar"; box.hidden = true; box.style.paddingTop = "0";
  const anchor = document.getElementById("smartboard") || document.getElementById("assessments") || main;
  anchor?.after(box);
  let signed = false, mounted = false;
  function show() {
    const vis = signed && !(main && main.hidden);
    box.hidden = !vis;
    if (vis && !mounted) {
      box.innerHTML = `<section class="card"><div class="card-h"><h2>My calendar</h2><span class="small muted">All your subjects · lessons, assessments, due dates and school holidays</span></div><div class="card-b"><div id="scal-host"></div></div></section>`;
      window.PBCal.mount(document.getElementById("scal-host"), { sb, key: "student", view: "list", compact: true, heading: false, noEdit: true });
      mounted = true;
    }
  }
  if (main) new MutationObserver(show).observe(main, { attributes: true, attributeFilter: ["hidden"] });
  sb.auth.onAuthStateChange((ev, session) => { signed = !!session; if (ev === "SIGNED_OUT") { mounted = false; box.innerHTML = ""; } show(); if (mounted && ev === "SIGNED_IN") window.PBCal.reload("student"); });
  sb.auth.getSession().then(({ data }) => { signed = !!data.session; show(); });
})();
