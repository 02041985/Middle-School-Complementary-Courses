// Maplewood school calendar: breaks and public holidays are never teaching days in any planbook. The weekly plan,
// daily plans, plans folder, assessment tracker dates and the Calendar skip them, on top of each teacher's own
// "No-school dates". The list below is built in; holidays the administrator adds or changes on the school calendar
// (www.millardmiddleschoolmaths.live/calendar, type "Holiday or break") are read from the database and used too.
(function () {
  const BUILT_IN = [
    { from: "2026-10-12", to: "2026-10-16", name: "Mid-term break" },
    { from: "2026-12-02", to: "2026-12-04", name: "Eid Al Etihad (public holiday)" },
    { from: "2026-12-14", to: "2027-01-01", name: "Winter break" },
    { from: "2027-03-08", to: "2027-03-12", name: "Eid Al Fitr (public holiday)" },
    { from: "2027-04-05", to: "2027-04-09", name: "Spring break" },
    { from: "2027-05-15", to: "2027-05-18", name: "Day of Arafat and Eid Al Adha (public holiday)" },
    { from: "2027-07-05", to: "2027-08-29", name: "Summer break" }
  ];
  const pad = n => String(n).padStart(2, "0");
  const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const day = s => { const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
  let CAL = BUILT_IN, OFF = new Map();
  const CACHE = "pb_school_holidays_v1";
  function build(list) {
    const m = new Map();
    list.forEach(b => { for (let d = day(b.from), end = day(b.to || b.from), g = 0; d <= end && g < 400; d.setDate(d.getDate() + 1), g++) m.set(key(d), b.name); });
    CAL = list; OFF = m;
  }
  try { const c = JSON.parse(localStorage.getItem(CACHE) || "null"); build(Array.isArray(c) && c.length ? c : BUILT_IN); } catch (e) { build(BUILT_IN); }

  // name of the break or holiday on a date ("YYYY-MM-DD" or a Date), or ""
  window.schoolOff = v => OFF.get(v instanceof Date ? key(v) : String(v || "").slice(0, 10)) || "";
  // the teacher's own no-school dates (single dates, or ranges like "2026-12-21 to 2027-01-01") plus the school calendar
  window.schoolSkip = str => {
    const set = new Set(), bad = [];
    String(str || "").split(/,|\n|;/).map(s => s.trim()).filter(Boolean).forEach(part => {
      const r = /^(\d{4}-\d{2}-\d{2})\s*(?:to|–|—|-\s)\s*(\d{4}-\d{2}-\d{2})$/.exec(part);
      if (r) { for (let d = day(r[1]), e = day(r[2]), g = 0; d <= e && g < 400; d.setDate(d.getDate() + 1), g++) set.add(key(d)); return; }
      part.split(/\s+/).forEach(p => { if (/^\d{4}-\d{2}-\d{2}$/.test(p)) set.add(p); else if (p) bad.push(p); });
    });
    OFF.forEach((_, k) => set.add(k));
    return { set, bad };
  };
  const fmt = s => day(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // short note for Plan settings
  window.schoolCalNote = () => `<details class="schoolcal" style="margin-top:-6px"><summary class="xs muted" style="cursor:pointer">School holidays are already left out (${CAL.length})</summary>
    <div class="stack xs" style="gap:2px;margin-top:4px">${CAL.map(b => `<span><b>${fmt(b.from)}${b.to && b.to !== b.from ? " – " + fmt(b.to) : ""}</b> · ${esc(b.name)}</span>`).join("")}</div>
    <span class="xs muted">Add any other days off in No-school dates.</span></details>`;

  // holidays from the school calendar in the database (public rows), cached for the next visit
  async function refresh() {
    const cfg = window.PB_CONFIG; if (!cfg || !window.fetch) return;
    try {
      const r = await fetch(`${cfg.supabaseUrl}/rest/v1/pb_cal_events?select=title,date,end_date&scope=eq.school&kind=eq.holiday&order=date`, { headers: { apikey: cfg.supabaseKey } });
      if (!r.ok) return;
      const rows = await r.json(); if (!Array.isArray(rows)) return;
      const list = rows.map(x => ({ from: x.date, to: x.end_date || x.date, name: x.title }));
      const before = JSON.stringify(CAL);
      if (!list.length) return;
      build(list);
      try { localStorage.setItem(CACHE, JSON.stringify(list)); } catch (e) {}
      if (JSON.stringify(list) !== before && typeof render === "function" && document.getElementById("app")) { try { render(); } catch (e) {} }
    } catch (e) {}
  }
  window.PBSchoolCal = { refresh, get list() { return CAL; } };
  setTimeout(refresh, 400);
})();
