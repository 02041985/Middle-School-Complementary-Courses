// Smart board: a full-screen writing surface over a PDF (or blank, lined or squared paper) for electronic pens,
// fingers and mice. Used by the student site (answering assignments) and the planbook (marking them).
// Ink is stored as vector strokes in page units (page width = 10000), so it stays sharp at any size:
//   { "<page index>": [ { t: "p" | "h", c: "#rrggbb", w: width in thousandths of page width, p: [x, y, pressure 0-100, ...] } ] }
(function () {
  if (window.PBBoard) return;
  // PDF.js 3.11.174 (legacy build, for older smart-board browsers) is served with the planbook
  const PDFJS = (document.currentScript?.src || location.href).replace(/[^/]*$/, "") + "vendor/pdfjs/";
  const U = 10000, A4 = 1.4142;
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const scripts = {};
  const loadScript = src => scripts[src] || (scripts[src] = new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => { delete scripts[src]; no(new Error("Couldn't load " + src)); }; document.head.appendChild(s); }));
  async function pdfjs() {
    await loadScript(PDFJS + "pdf.js");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.js";
    return window.pdfjsLib;
  }
  // pages in a PDF (used when a teacher uploads one)
  async function pdfInfo(src) {
    const lib = await pdfjs();
    const doc = await lib.getDocument(src instanceof ArrayBuffer ? { data: src } : { url: src }).promise;
    return { pages: doc.numPages, doc };
  }

  const P = {
    pen: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",
    hl: "M9 15l-4 5h6l2-2M8 13l7-7 4 4-7 7zM15 6l3-3 4 4-3 3",
    eraser: "M8 20h12M5 15l9-9 5 5-8 8H8z",
    hand: "M8 12V5a1.5 1.5 0 0 1 3 0v6M11 11V3.5a1.5 1.5 0 0 1 3 0V11M14 11V5a1.5 1.5 0 0 1 3 0v8c0 4-2 7-6 7-3 0-4-1-6-4l-2-4a1.4 1.4 0 0 1 2.4-1.4L8 13",
    tick: "M4 12l5 5L20 6",
    cross: "M6 6l12 12M18 6L6 18",
    undo: "M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
    redo: "M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3",
    minus: "M5 12h14",
    plus: "M12 5v14M5 12h14",
    fit: "M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4",
    full: "M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5",
    close: "M6 6l12 12M18 6L6 18",
    trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
    side: "M4 4h16v16H4zM14 4v16",
    dl: "M12 4v11M7 10l5 5 5-5M5 20h14",
    pen2: "M12 19l7-7-3-3-7 7-1 4zM15 6l3 3"
  };
  const ico = n => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n]}"/></svg>`;
  const COLORS = { student: ["#1b1b1f", "#1f4fd1", "#c62828", "#2e7d32", "#ef6c00", "#7b1fa2"], teacher: ["#d81b1b", "#1b1b1f", "#1f4fd1", "#2e7d32", "#ef6c00", "#7b1fa2"] };
  const HL = ["#ffeb3b", "#7cf29a", "#7fd3ff", "#ff9bd2"];
  const SIZES = { p: [1.6, 3, 5.5], h: [14, 22, 32] };

  // ---------- drawing ----------
  function strokePath(ctx, pts, k) {
    const n = pts.length / 3;
    ctx.beginPath(); ctx.moveTo(pts[0] * k, pts[1] * k);
    if (n === 1) { ctx.lineTo(pts[0] * k + 0.01, pts[1] * k); return; }
    for (let i = 1; i < n - 1; i++) {
      const x = pts[i * 3] * k, y = pts[i * 3 + 1] * k, nx = pts[i * 3 + 3] * k, ny = pts[i * 3 + 4] * k;
      ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
    }
    ctx.lineTo(pts[(n - 1) * 3] * k, pts[(n - 1) * 3 + 1] * k);
  }
  function drawStroke(ctx, s, W) {
    const pts = s.p; if (!pts || pts.length < 3) return;
    const k = W / U, base = Math.max(0.6, (s.w / 1000) * W);
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = s.c;
    if (s.t === "h") {
      ctx.globalAlpha = 0.38; ctx.globalCompositeOperation = "multiply"; ctx.lineCap = "butt"; ctx.lineWidth = base;
      strokePath(ctx, pts, k); ctx.stroke();
    } else {
      const n = pts.length / 3; let varies = false;
      for (let i = 1; i < n; i++) if (pts[i * 3 + 2] !== pts[2]) { varies = true; break; }
      if (!varies || n < 3) { ctx.lineWidth = base * (pts[2] >= 0 && pts[2] !== 50 ? 0.35 + pts[2] / 100 * 1.3 : 1); strokePath(ctx, pts, k); ctx.stroke(); }
      else {
        let px = pts[0] * k, py = pts[1] * k, mx = px, my = py;
        for (let i = 1; i < n; i++) {
          const x = pts[i * 3] * k, y = pts[i * 3 + 1] * k, pr = (pts[i * 3 + 2] + pts[i * 3 - 1]) / 2;
          const ex = i < n - 1 ? (x + pts[i * 3 + 3] * k) / 2 : x, ey = i < n - 1 ? (y + pts[i * 3 + 4] * k) / 2 : y;
          ctx.beginPath(); ctx.moveTo(mx, my); ctx.quadraticCurveTo(x, y, ex, ey);
          ctx.lineWidth = base * (0.35 + pr / 100 * 1.3); ctx.stroke();
          mx = ex; my = ey; px = x; py = y;
        }
      }
    }
    ctx.restore();
  }
  function drawPaper(ctx, paper, W, H) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    if (paper === "lined") {
      const g = W * 0.034; ctx.strokeStyle = "#b9cbe6"; ctx.lineWidth = Math.max(1, W / 1400);
      for (let y = g * 3; y < H - g; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = "#e9a3a3"; ctx.beginPath(); ctx.moveTo(W * 0.1, 0); ctx.lineTo(W * 0.1, H); ctx.stroke();
    } else if (paper === "grid") {
      const g = W * 0.04; ctx.strokeStyle = "#d3dceb"; ctx.lineWidth = Math.max(1, W / 1600);
      for (let x = g; x < W; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = g; y < H; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
  }
  // stamps (teacher marking): a tick or a cross at the tap point, as ordinary strokes
  function stampStrokes(kind, x, y, c) {
    const s = 380, pts = kind === "tick" ? [[-0.5, 0], [-0.12, 0.42], [0.62, -0.55]] : null;
    const mk = arr => ({ t: "p", c, w: 4, p: arr.flatMap(([a, b]) => [Math.round(x + a * s), Math.round(y + b * s), 50]) });
    if (pts) return [mk(pts)];
    return [mk([[-0.45, -0.45], [0.45, 0.45]]), mk([[0.45, -0.45], [-0.45, 0.45]])];
  }
  // a minimal PDF writer: one JPEG image per page (used for "Download PDF")
  function jpegPdf(pages) { // pages: [{ jpg: Uint8Array, w, h (px), pw, ph (pt) }]
    const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
    const put = x => { const b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); len += b.length; };
    const obj = (n, body) => { offs[n] = len; put(`${n} 0 obj\n`); body(); put("\nendobj\n"); };
    put("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
    const n = pages.length, kids = pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ");
    obj(1, () => put("<< /Type /Catalog /Pages 2 0 R >>"));
    obj(2, () => put(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`));
    pages.forEach((p, i) => {
      const pg = 3 + i * 3, ct = pg + 1, im = pg + 2, cs = `q ${p.pw.toFixed(2)} 0 0 ${p.ph.toFixed(2)} 0 0 cm /Im0 Do Q`;
      obj(pg, () => put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${p.pw.toFixed(2)} ${p.ph.toFixed(2)}] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${ct} 0 R >>`));
      obj(ct, () => { put(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`); });
      obj(im, () => { put(`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpg.length} >>\nstream\n`); put(p.jpg); put("\nendstream"); });
    });
    const total = 3 + n * 3, xref = len;
    put(`xref\n0 ${total}\n0000000000 65535 f \n` + Array.from({ length: total - 1 }, (_, i) => String(offs[i + 1]).padStart(10, "0") + " 00000 n \n").join(""));
    put(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(parts, { type: "application/pdf" });
  }
  const dataUrlBytes = u => { const b = atob(u.split(",")[1]), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; };
  const cleanInk = ink => { const o = {}; Object.keys(ink || {}).forEach(k => { const a = (ink[k] || []).filter(s => s && Array.isArray(s.p) && s.p.length >= 3); if (a.length) o[k] = a; }); return o; };

  // ---------- the board ----------
  // opts: title, subtitle, pdfUrl | null, paper ("pdf"|"blank"|"lined"|"grid"), pages, role ("student"|"teacher"),
  //   layers: [{ ink }] read-only ink drawn under the editable layer, top: [{ ink }] read-only ink drawn above it,
  //   ink: the editable layer (or null for read-only), onSave(ink) -> Promise, localKey, serverTime,
  //   side(board) -> HTML for the side panel, onSide(board, el, event), actions: [{ id, label, primary }], onAction(id, board),
  //   stamps, onClose(board)
  function open(opts) {
    const role = opts.role || "student", editable = !!opts.ink;
    const B = {
      opts, ink: cleanInk(opts.ink || {}), pages: [], zoom: 1, tool: "pen", color: COLORS[role][0], hl: HL[0], size: 1,
      penOnly: false, penSeen: false, undo: [], redo: [], dirty: false, saving: false, savedAt: null, err: "", doc: null, closed: false
    };
    // a newer copy on this device (for example saved while offline) wins over the server copy
    if (editable && opts.localKey) {
      try { const l = JSON.parse(localStorage.getItem(opts.localKey) || "null"); if (l && l.t && (!opts.serverTime || l.t > Date.parse(opts.serverTime) + 1000)) { B.ink = cleanInk(l.ink); B.dirty = true; } } catch (e) {}
    }
    const root = document.createElement("div"); root.className = "sb-root"; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", opts.title || "Smart board");
    root.innerHTML = `<div class="sb-top">
        <button class="sb-b" data-b="close" title="Close">${ico("close")}</button>
        <div class="sb-title"><b>${esc(opts.title || "Smart board")}</b>${opts.subtitle ? `<span>${esc(opts.subtitle)}</span>` : ""}</div>
        <div class="sb-tools" ${editable ? "" : "hidden"}>
          <div class="sb-grp"><button class="sb-b" data-b="tool" data-v="pen" title="Pen">${ico("pen")}</button><button class="sb-b" data-b="tool" data-v="hl" title="Highlighter">${ico("hl")}</button><button class="sb-b" data-b="tool" data-v="eraser" title="Eraser (touch a stroke to remove it)">${ico("eraser")}</button>${opts.stamps ? `<button class="sb-b" data-b="tool" data-v="tick" title="Tick stamp">${ico("tick")}</button><button class="sb-b" data-b="tool" data-v="cross" title="Cross stamp">${ico("cross")}</button>` : ""}<button class="sb-b" data-b="tool" data-v="hand" title="Move the page">${ico("hand")}</button></div>
          <div class="sb-grp sb-colors"></div>
          <div class="sb-grp sb-sizes">${[0, 1, 2].map(i => `<button class="sb-b sb-size" data-b="size" data-v="${i}" title="${["Thin", "Medium", "Thick"][i]}"><i style="width:${4 + i * 5}px;height:${4 + i * 5}px"></i></button>`).join("")}</div>
          <div class="sb-grp"><button class="sb-b" data-b="undo" title="Undo (Ctrl+Z)">${ico("undo")}</button><button class="sb-b" data-b="redo" title="Redo (Ctrl+Y)">${ico("redo")}</button><button class="sb-b" data-b="clear" title="Clear this page">${ico("trash")}</button></div>
        </div>
        <div class="sb-grp sb-view"><button class="sb-b" data-b="zout" title="Zoom out">${ico("minus")}</button><button class="sb-b" data-b="fit" title="Fit to width">${ico("fit")}</button><button class="sb-b" data-b="zin" title="Zoom in">${ico("plus")}</button><button class="sb-b" data-b="full" title="Full screen">${ico("full")}</button>${opts.side ? `<button class="sb-b" data-b="side" title="Show or hide the side panel">${ico("side")}</button>` : ""}</div>
      </div>
      <div class="sb-sub"><span class="sb-page">Loading…</span>${editable ? `<label class="sb-pen"><input type="checkbox" data-b="penonly"> Pen only (fingers move the page)</label>` : ""}<span class="sb-status" aria-live="polite"></span><span class="sb-acts">${(opts.actions || []).map(a => `<button class="sb-act ${a.primary ? "pri" : ""}" data-b="act" data-v="${esc(a.id)}">${esc(a.label)}</button>`).join("")}</span></div>
      <div class="sb-body"><div class="sb-scroll" tabindex="0"><div class="sb-pages"></div></div>${opts.side ? `<aside class="sb-side"></aside>` : ""}</div>
      <div class="sb-modal" hidden></div>`;
    document.body.appendChild(root); document.documentElement.classList.add("sb-lock");
    const $ = s => root.querySelector(s);
    const scroller = $(".sb-scroll"), pagesEl = $(".sb-pages"), side = $(".sb-side");
    B.root = root; B.sideEl = side;

    function paintTools() {
      root.querySelectorAll('[data-b="tool"]').forEach(b => b.classList.toggle("on", b.dataset.v === B.tool));
      const cols = B.tool === "hl" ? HL : COLORS[role], cur = B.tool === "hl" ? B.hl : B.color;
      const cg = $(".sb-colors"); if (cg) cg.innerHTML = cols.map(c => `<button class="sb-b sb-color ${c === cur ? "on" : ""}" data-b="color" data-v="${c}" title="Colour" style="--c:${c}"><i></i></button>`).join("");
      root.querySelectorAll('[data-b="size"]').forEach(b => b.classList.toggle("on", +b.dataset.v === B.size));
      const u = $('[data-b="undo"]'), r = $('[data-b="redo"]'); if (u) u.disabled = !B.undo.length; if (r) r.disabled = !B.redo.length;
      const po = $('[data-b="penonly"]'); if (po) po.checked = B.penOnly;
      scroller.classList.toggle("hand", B.tool === "hand");
    }
    function status() {
      const el = $(".sb-status"); if (!el) return;
      el.className = "sb-status" + (B.err ? " err" : "");
      el.textContent = !editable ? "" : B.err ? B.err : B.saving ? "Saving…" : B.dirty ? "Not saved yet" : B.savedAt ? "Saved " + B.savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Saved";
    }
    B.setStatus = t => { const el = $(".sb-status"); if (el) { el.className = "sb-status"; el.textContent = t; } };
    B.toast = (m, ms = 2600) => { let t = root.querySelector(".sb-toast"); if (!t) { t = document.createElement("div"); t.className = "sb-toast"; root.appendChild(t); } t.textContent = m; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), ms); };
    B.getInk = () => cleanInk(B.ink);
    B.renderSide = () => { if (side && opts.side) side.innerHTML = opts.side(B); };
    B.confirm = (msg, yes, no = "Cancel") => new Promise(ok => {
      const m = $(".sb-modal"); m.hidden = false;
      m.innerHTML = `<div class="sb-dlg" role="alertdialog"><p>${esc(msg)}</p><div class="sb-dlg-a"><button class="sb-act" data-m="0">${esc(no)}</button><button class="sb-act pri" data-m="1">${esc(yes)}</button></div></div>`;
      m.onclick = e => { const b = e.target.closest("[data-m]"); if (!b && e.target !== m) return; m.hidden = true; m.innerHTML = ""; ok(b?.dataset.m === "1"); };
    });

    // ---------- pages ----------
    const baseWidth = () => Math.max(280, Math.min(scroller.clientWidth - 32, 1150));
    const pageW = () => Math.round(baseWidth() * B.zoom);
    function buildPages(aspects) {
      B.pages = aspects.map((a, i) => {
        const el = document.createElement("div"); el.className = "sb-p"; el.dataset.i = i;
        el.innerHTML = `<canvas class="bg"></canvas><canvas class="ink"></canvas><canvas class="live"></canvas><span class="sb-pn">${i + 1}</span>`;
        pagesEl.appendChild(el);
        return { i, a, el, bg: el.children[0], inkc: el.children[1], live: el.children[2], shown: false, drawn: 0 };
      });
      layout();
      B.io = new IntersectionObserver(es => es.forEach(e => { const p = B.pages[+e.target.dataset.i]; if (!p) return; if (e.isIntersecting) show(p); else hide(p); }), { root: scroller, rootMargin: "1400px 0px" });
      B.pages.forEach(p => B.io.observe(p.el));
      B.pio = new IntersectionObserver(() => pageLabel(), { root: scroller, threshold: [0, 0.5, 1] });
      B.pages.forEach(p => B.pio.observe(p.el));
      pageLabel();
    }
    function layout() {
      const W = pageW();
      B.pages.forEach(p => { p.el.style.width = W + "px"; p.el.style.height = Math.round(W * p.a) + "px"; if (p.shown) { p.drawn = 0; render(p); } });
    }
    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
    function sizeCanvas(c, W, H) { const d = dpr(), cw = Math.round(W * d), ch = Math.round(H * d); if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; } c.style.width = W + "px"; c.style.height = H + "px"; const x = c.getContext("2d"); x.setTransform(d, 0, 0, d, 0, 0); return x; }
    function show(p) { if (p.shown) return; p.shown = true; render(p); }
    function hide(p) { if (!p.shown) return; p.shown = false; p.drawn = 0; [p.bg, p.inkc, p.live].forEach(c => { c.width = 1; c.height = 1; }); }
    async function render(p) {
      const W = pageW(), H = Math.round(W * p.a), stamp = ++p.drawn;
      redrawInk(p, W, H);
      const ctx = sizeCanvas(p.bg, W, H);
      if (B.doc) {
        drawPaper(ctx, "blank", W, H);
        try {
          const page = await B.doc.getPage(p.i + 1); if (stamp !== p.drawn || !p.shown) return;
          const vp1 = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: (W * dpr()) / vp1.width });
          const tmp = document.createElement("canvas"); tmp.width = Math.round(vp.width); tmp.height = Math.round(vp.height);
          await page.render({ canvasContext: tmp.getContext("2d"), viewport: vp }).promise;
          if (stamp !== p.drawn || !p.shown) return;
          ctx.drawImage(tmp, 0, 0, W, H);
        } catch (e) { ctx.fillStyle = "#c62828"; ctx.font = "16px sans-serif"; ctx.fillText("This page couldn't be shown.", 20, 40); }
      } else drawPaper(ctx, opts.paper, W, H);
    }
    function redrawInk(p, W, H) {
      W = W || pageW(); H = H || Math.round(W * p.a);
      const ctx = sizeCanvas(p.inkc, W, H); ctx.clearRect(0, 0, W, H);
      const k = String(p.i);
      (opts.layers || []).forEach(l => (l.ink?.[k] || []).forEach(s => drawStroke(ctx, s, W)));
      (B.ink[k] || []).forEach(s => drawStroke(ctx, s, W));
      (opts.top || []).forEach(l => (l.ink?.[k] || []).forEach(s => drawStroke(ctx, s, W)));
    }
    B.redraw = () => B.pages.forEach(p => p.shown && redrawInk(p));
    function pageLabel() {
      const el = $(".sb-page"); if (!el || !B.pages.length) return;
      const mid = scroller.scrollTop + scroller.clientHeight / 2; let cur = 0;
      B.pages.forEach(p => { if (p.el.offsetTop <= mid) cur = p.i; });
      B.cur = cur; el.textContent = `Page ${cur + 1} of ${B.pages.length}`;
    }
    scroller.addEventListener("scroll", () => { cancelAnimationFrame(B._pl); B._pl = requestAnimationFrame(pageLabel); }, { passive: true });
    function setZoom(z) {
      const old = pagesEl.scrollHeight || 1, rel = (scroller.scrollTop + scroller.clientHeight / 2) / old;
      B.zoom = Math.max(0.5, Math.min(3, z)); layout();
      scroller.scrollTop = rel * pagesEl.scrollHeight - scroller.clientHeight / 2;
    }
    let rw; const onResize = () => { clearTimeout(rw); rw = setTimeout(layout, 150); };
    window.addEventListener("resize", onResize);

    // ---------- input ----------
    let act = null; // current pointer action
    const ptOf = (p, e) => { const r = p.el.getBoundingClientRect(), W = r.width; return [Math.round((e.clientX - r.left) / W * U), Math.round((e.clientY - r.top) / W * U)]; };
    const pressureOf = e => e.pointerType === "pen" ? Math.max(5, Math.min(100, Math.round((e.pressure || 0.5) * 100))) : 50;
    function commit(page, strokes) { const k = String(page); (B.ink[k] = B.ink[k] || []).push(...strokes); B.undo.push({ t: "add", k, n: strokes.length }); B.redo = []; changed(); }
    function changed() {
      B.dirty = true; B.err = ""; status(); paintTools();
      if (opts.localKey) { try { localStorage.setItem(opts.localKey, JSON.stringify({ t: Date.now(), ink: B.ink })); } catch (e) {} }
      clearTimeout(B._as); if (opts.onSave) B._as = setTimeout(() => B.save(), opts.autosaveMs || 6000);
    }
    function eraseAt(p, x, y, list) {
      const k = String(p.i), arr = B.ink[k]; if (!arr || !arr.length) return;
      const r = 120; // hit radius in page units
      for (let j = arr.length - 1; j >= 0; j--) {
        const s = arr[j], pts = s.p, rr = r + s.w * 5;
        for (let q = 0; q < pts.length; q += 3) { const dx = pts[q] - x, dy = pts[q + 1] - y; if (dx * dx + dy * dy < rr * rr) { list.push({ j, s }); arr.splice(j, 1); break; } }
      }
    }
    function down(e) {
      const pe = e.target.closest(".sb-p"); if (!pe) return;
      const p = B.pages[+pe.dataset.i]; if (!p) return;
      if (e.pointerType === "pen" && !B.penSeen) { B.penSeen = true; if (!B.penOnly && editable) { B.penOnly = true; paintTools(); B.toast("Pen found: fingers now move the page and your hand won't leave marks. Untick \"Pen only\" to write with a finger.", 4200); } }
      const pan = !editable || B.tool === "hand" || (B.penOnly && e.pointerType === "touch") || e.button === 1;
      if (act && act.id !== e.pointerId) { if (act.pan || pan) return; return; } // one drawing pointer at a time
      e.preventDefault();
      try { e.target.setPointerCapture(e.pointerId); } catch (x) {}
      if (pan) { act = { id: e.pointerId, pan: true, x: e.clientX, y: e.clientY, sl: scroller.scrollLeft, st: scroller.scrollTop }; return; }
      const [x, y] = ptOf(p, e);
      const erase = B.tool === "eraser" || (e.buttons & 32) === 32;
      if (erase) { act = { id: e.pointerId, erase: true, p, removed: [] }; eraseAt(p, x, y, act.removed); if (act.removed.length) redrawInk(p); return; }
      if (B.tool === "tick" || B.tool === "cross") { const st = stampStrokes(B.tool, x, y, B.color); commit(p.i, st); redrawInk(p); act = { id: e.pointerId, stamp: true }; return; }
      const hl = B.tool === "hl";
      const s = { t: hl ? "h" : "p", c: hl ? B.hl : B.color, w: (hl ? SIZES.h : SIZES.p)[B.size], p: [x, y, hl ? 50 : pressureOf(e)] };
      const W = p.el.getBoundingClientRect().width, H = W * p.a;
      act = { id: e.pointerId, draw: true, p, s, W, ctx: sizeCanvas(p.live, W, H) };
      drawLive();
    }
    function drawLive() { if (!act?.draw) return; const { ctx, W, p, s } = act; ctx.clearRect(0, 0, W, W * p.a); drawStroke(ctx, s, W); }
    function move(e) {
      if (!act || act.id !== e.pointerId) return;
      e.preventDefault();
      if (act.pan) { scroller.scrollLeft = act.sl - (e.clientX - act.x); scroller.scrollTop = act.st - (e.clientY - act.y); return; }
      const co = e.getCoalescedEvents ? e.getCoalescedEvents() : null, evs = co && co.length ? co : [e];
      if (act.erase) { evs.forEach(ev => { const [x, y] = ptOf(act.p, ev); eraseAt(act.p, x, y, act.removed); }); if (act.removed.length) redrawInk(act.p); return; }
      if (!act.draw) return;
      const pts = act.s.p, hl = act.s.t === "h";
      evs.forEach(ev => {
        const [x, y] = ptOf(act.p, ev), lx = pts[pts.length - 3], ly = pts[pts.length - 2];
        if ((x - lx) * (x - lx) + (y - ly) * (y - ly) < 64) return; // skip points under ~0.08% of the width apart
        pts.push(x, y, hl ? 50 : pressureOf(ev));
      });
      cancelAnimationFrame(act.raf); act.raf = requestAnimationFrame(drawLive);
    }
    function up(e) {
      if (!act || act.id !== e.pointerId) return;
      const a = act; act = null;
      if (a.erase && a.removed.length) { B.undo.push({ t: "erase", k: String(a.p.i), items: a.removed.reverse() }); B.redo = []; changed(); }
      if (a.draw) {
        cancelAnimationFrame(a.raf); a.ctx.clearRect(0, 0, a.W, a.W * a.p.a);
        if (e.type !== "pointercancel" || a.s.p.length > 6) { commit(a.p.i, [a.s]); drawStroke(a.p.inkc.getContext("2d"), a.s, a.W); if (opts.top?.length) redrawInk(a.p); }
      }
    }
    pagesEl.addEventListener("pointerdown", down);
    pagesEl.addEventListener("pointermove", move);
    pagesEl.addEventListener("pointerup", up);
    pagesEl.addEventListener("pointercancel", up);
    pagesEl.addEventListener("contextmenu", e => e.preventDefault());
    // mouse wheel / trackpad: ctrl + wheel zooms
    scroller.addEventListener("wheel", e => { if (e.ctrlKey) { e.preventDefault(); setZoom(B.zoom * (e.deltaY < 0 ? 1.1 : 0.9)); } }, { passive: false });

    function undo() {
      const a = B.undo.pop(); if (!a) return;
      const arr = B.ink[a.k] = B.ink[a.k] || [];
      if (a.t === "add") a.s = arr.splice(arr.length - a.n, a.n);
      else if (a.t === "erase") a.items.slice().reverse().forEach(it => arr.splice(it.j, 0, it.s));
      else if (a.t === "clear") B.ink[a.k] = a.all;
      B.redo.push(a); changed(); B.redraw();
    }
    function redo() {
      const a = B.redo.pop(); if (!a) return;
      const arr = B.ink[a.k] = B.ink[a.k] || [];
      if (a.t === "add") arr.push(...a.s);
      else if (a.t === "erase") a.items.forEach(it => { const ix = arr.indexOf(it.s); if (ix >= 0) arr.splice(ix, 1); });
      else if (a.t === "clear") B.ink[a.k] = [];
      B.undo.push(a); changed(); B.redraw();
    }
    const onKey = e => {
      if (B.closed || !document.body.contains(root)) return;
      if (e.target.closest && e.target.closest("input,textarea,select")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); }
      else if (e.key === "Escape" && document.fullscreenElement) document.exitFullscreen?.();
    };
    document.addEventListener("keydown", onKey);

    // ---------- saving ----------
    B.save = async (force) => {
      clearTimeout(B._as);
      if (!opts.onSave || (!B.dirty && !force)) return true;
      if (B.saving) { B._again = true; return B._saveP; }
      B.saving = true; B.err = ""; status();
      const snapshot = JSON.stringify(B.ink);
      B._saveP = (async () => {
        try {
          await opts.onSave(B.getInk(), B);
          if (JSON.stringify(B.ink) === snapshot) { B.dirty = false; if (opts.localKey) { try { localStorage.removeItem(opts.localKey); } catch (e) {} } }
          B.savedAt = new Date(); return true;
        } catch (e) { B.err = (e && e.message) ? "Not saved: " + e.message : "Not saved. Check the connection; your work is kept on this device."; return false; }
        finally { B.saving = false; status(); if (B._again) { B._again = false; if (B.dirty) setTimeout(() => B.save(), 300); } }
      })();
      return B._saveP;
    };
    const onVis = () => { if (document.visibilityState === "hidden" && B.dirty) B.save(); };
    document.addEventListener("visibilitychange", onVis);

    B.close = async (skip) => {
      if (B.closed) return;
      if (!skip && editable && B.dirty && opts.onSave) {
        B.setStatus("Saving…");
        const ok = await B.save();
        if (!ok && !(await B.confirm("Your latest changes couldn't be saved to the school website. They are kept on this device and will be offered next time you open this. Close anyway?", "Close", "Stay"))) return;
      }
      B.closed = true; clearTimeout(B._as);
      try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (e) {}
      B.io?.disconnect(); B.pio?.disconnect();
      window.removeEventListener("resize", onResize); document.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onVis);
      root.remove(); document.documentElement.classList.remove("sb-lock");
      opts.onClose && opts.onClose(B);
    };

    // a flattened copy (background + all ink) as a PDF the viewer can keep
    B.exportPdf = async (name) => {
      B.setStatus("Making the PDF…");
      try {
        const out = [], W = 1240;
        for (const p of B.pages) {
          const H = Math.round(W * p.a), c = document.createElement("canvas"); c.width = W; c.height = H; const ctx = c.getContext("2d");
          drawPaper(ctx, B.doc ? "blank" : opts.paper, W, H);
          if (B.doc) { const page = await B.doc.getPage(p.i + 1), vp1 = page.getViewport({ scale: 1 }); await page.render({ canvasContext: ctx, viewport: page.getViewport({ scale: W / vp1.width }) }).promise; }
          const k = String(p.i);
          [...(opts.layers || []).map(l => l.ink), B.ink, ...(opts.top || []).map(l => l.ink)].forEach(ink => (ink?.[k] || []).forEach(s => drawStroke(ctx, s, W)));
          out.push({ jpg: dataUrlBytes(c.toDataURL("image/jpeg", 0.86)), w: W, h: H, pw: 595.28, ph: 595.28 * H / W });
        }
        const url = URL.createObjectURL(jpegPdf(out)), a = document.createElement("a");
        a.href = url; a.download = (name || opts.title || "smart-board").replace(/[^\w\- ]+/g, "").trim().slice(0, 80) + ".pdf";
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
        status();
      } catch (e) { B.setStatus("The PDF couldn't be made: " + (e.message || e)); }
    };

    // ---------- toolbar ----------
    root.addEventListener("click", async e => {
      const b = e.target.closest("[data-b]"); if (!b || b.tagName === "INPUT") return;
      const v = b.dataset.v;
      switch (b.dataset.b) {
        case "close": B.close(); break;
        case "tool": B.tool = v; paintTools(); break;
        case "color": if (B.tool === "hl") B.hl = v; else { B.color = v; if (B.tool === "eraser" || B.tool === "hand") B.tool = "pen"; } paintTools(); break;
        case "size": B.size = +v; if (B.tool === "eraser" || B.tool === "hand") B.tool = "pen"; paintTools(); break;
        case "undo": undo(); break;
        case "redo": redo(); break;
        case "clear": {
          const k = String(B.cur || 0); if (!(B.ink[k] || []).length) { B.toast("Nothing of yours to clear on this page."); break; }
          if (await B.confirm(`Clear everything you wrote on page ${+k + 1}? You can undo this.`, "Clear page")) { B.undo.push({ t: "clear", k, all: B.ink[k] }); B.ink[k] = []; B.redo = []; changed(); B.redraw(); }
          break; }
        case "zin": setZoom(B.zoom * 1.25); break;
        case "zout": setZoom(B.zoom / 1.25); break;
        case "fit": setZoom(1); break;
        case "full": try { if (document.fullscreenElement) await document.exitFullscreen(); else await root.requestFullscreen(); setTimeout(layout, 200); } catch (x) { B.toast("Full screen isn't available in this browser."); } break;
        case "side": root.classList.toggle("sb-noside"); setTimeout(layout, 50); break;
        case "act": opts.onAction && opts.onAction(v, B); break;
      }
    });
    root.addEventListener("change", e => { if (e.target.dataset.b === "penonly") { B.penOnly = e.target.checked; } });
    if (side) { side.addEventListener("click", e => opts.onSide && opts.onSide(B, side, e)); side.addEventListener("input", e => opts.onSide && opts.onSide(B, side, e)); side.addEventListener("change", e => opts.onSide && opts.onSide(B, side, e)); }

    paintTools(); status(); B.renderSide();
    if (window.matchMedia("(max-width: 900px)").matches) root.classList.add("sb-noside");

    // ---------- load the paper ----------
    (async () => {
      try {
        if (opts.pdfUrl) {
          const lib = await pdfjs();
          B.doc = await lib.getDocument({ url: opts.pdfUrl }).promise;
          const aspects = [];
          for (let i = 1; i <= B.doc.numPages; i++) { const vp = (await B.doc.getPage(i)).getViewport({ scale: 1 }); aspects.push(vp.height / vp.width); }
          buildPages(aspects);
        } else buildPages(Array.from({ length: Math.max(1, Math.min(60, opts.pages || 1)) }, () => A4));
        if (B.dirty) { B.toast("Your unsaved work from this device was restored.", 3600); if (opts.onSave) B._as = setTimeout(() => B.save(), 1500); }
        status();
      } catch (e) { $(".sb-page").textContent = "The assignment PDF couldn't be opened. Check the connection and try again."; }
    })();
    return B;
  }

  window.PBBoard = { open, pdfInfo, loadScript, drawStroke, cleanInk };
})();
