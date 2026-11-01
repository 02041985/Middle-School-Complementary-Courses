// Live Markbook, Assessment tracker and Analysis: while one of these pages is open, students' new online test and
// practice results (and their names when they join) come in by themselves every 45 seconds and whenever the teacher
// returns to the tab. A small "Live" tag by the page title shows when it last updated.
(function () {
  if (typeof S === "undefined" || typeof render !== "function") return;
  const PAGES = ["marks", "tracker", "analysis", "students"];
  const EVERY = 45000;
  let busy = false, last = 0, lastOk = null;
  const online = () => !!window.PB_PLATFORM && typeof ptLoad === "function";
  // don't redraw under the teacher's hands: typing, a menu open, or a dialog
  const typing = () => { const a = document.activeElement; return !!(a && a.closest && a.closest("#app") && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)); };

  async function tick(force) {
    if (busy || !online() || !PAGES.includes(S.tab) || document.visibilityState !== "visible") return;
    if (!force && Date.now() - last < EVERY - 1000) return;
    busy = true; last = Date.now();
    try {
      if (S.pt && !S.pt.loading) await ptLoad();
      if (window.PB_NEEDS && typeof window.PB_NEEDS.reload === "function" && S.tab === "students") await window.PB_NEEDS.reload();
      await relink();
      if (S.tab === "tracker" && window.PB_TRACKER && typeof window.PB_TRACKER.refresh === "function") await window.PB_TRACKER.refresh();
      lastOk = new Date();
      if (!typing() && (S.tab === "marks" || S.tab === "analysis")) render(); else tag();
    } catch (e) {}
    busy = false;
  }
  // an online class whose markbook class is missing gets the markbook class of the same grade and group (made if there
  // isn't one), so its students and results flow in again
  async function relink() {
    if (!S.storeReady || !S.pt || !S.pt.ready || !Array.isArray(S.pt.classes) || !Array.isArray(S.classes) || typeof ptSync !== "function") return;
    let fixed = 0;
    for (const pc of S.pt.classes) {
      if (pc.book_class_id && S.classes.some(x => x.id === pc.book_class_id)) continue;
      const g = String(pc.course || pc.grade), sec = String(pc.section || "").toUpperCase();
      const m = S.classes.filter(x => String(x.grade) === g && (typeof ctxGroupOf === "function" ? ctxGroupOf(x, g) : String(x.section || "").toUpperCase()) === sec);
      if (m.length > 1) continue;
      // no markbook class for this grade and group yet: make one, named like the online class
      let bc = m[0], made = false;
      if (!bc) { if (typeof uid !== "function" || typeof saveBook !== "function") continue; bc = { id: uid(), name: pc.name, grade: isNaN(+g) ? g : +g, section: sec || undefined, students: [] }; S.classes.push(bc); made = true; }
      const { error } = await window.PB_PLATFORM.sb.from("pb_classes").update({ book_class_id: bc.id }).eq("id", pc.id);
      if (!error) { pc.book_class_id = bc.id; fixed++; if (made) saveBook(); }
      else if (made) S.classes = S.classes.filter(x => x !== bc);
    }
    if (fixed) await ptSync();
  }
  function tag() {
    if (!online() || !PAGES.includes(S.tab)) return;
    const h = document.querySelector("#app .ph h1"); if (!h) return;
    let t = h.querySelector(".live-tag");
    if (!t) { t = document.createElement("span"); t.className = "live-tag"; h.appendChild(t); }
    const tm = lastOk ? lastOk.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
    t.innerHTML = `<i></i>Live${tm ? ` · ${tm}` : ""}`;
    t.title = "Students' online results come in by themselves while this page is open";
  }
  if (!document.getElementById("live-css")) {
    const st = document.createElement("style"); st.id = "live-css";
    st.textContent = ".live-tag{display:inline-flex;align-items:center;gap:6px;margin-left:12px;vertical-align:middle;font:600 .72rem/1 var(--f-body,system-ui,sans-serif);letter-spacing:.02em;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 9px}.live-tag i{width:7px;height:7px;border-radius:50%;background:#1a9a5b;box-shadow:0 0 0 3px rgba(26,154,91,.18)}";
    document.head.appendChild(st);
  }
  const _render = render;
  // eslint-disable-next-line no-global-assign
  render = function () { const r = _render.apply(this, arguments); try { tag(); } catch (e) {} return r; };
  window.render = render;

  setInterval(() => tick(false), 5000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") tick(true); });
  window.addEventListener("focus", () => tick(false));
  setTimeout(() => tick(true), 4000);
  window.PB_LIVE = { tick, relink };
})();
