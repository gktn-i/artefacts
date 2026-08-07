/* ============================================================================
   ARTEFAKTE · SUCH-PALETTE  (geteilt von Legacy- und Astro-Seiten)
   ----------------------------------------------------------------------------
   Zwei Ebenen in einem Fenster:
     1. Struktur-Treffer aus der Registry (Hubs, Module, Abschnitte) — sofort.
     2. Volltext-Treffer aus dem Pagefind-Index (/pagefind/…) — nachgeladen.
   Öffnen über window.HBXPAL.open(); ⌘K und "/" bindet die Palette nur, wenn
   die Seite keine eigene Suche (#pal) mitbringt.
   ========================================================================== */
(function () {
  "use strict";

  const el = (tag, cls, txt) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const pal = el("div", "hbx-pal");
  pal.innerHTML =
    '<div class="box" role="dialog" aria-modal="true" aria-label="Artefakte durchsuchen">' +
    '<input type="search" autocomplete="off" spellcheck="false" placeholder="Alles durchsuchen — Module, Abschnitte, Volltext …">' +
    '<div class="out"></div>' +
    '<div class="hint"><span>↑↓ wählen</span><span>⏎ öffnen</span><span>esc schließen</span></div>' +
    "</div>";
  const palIn = pal.querySelector("input");
  const palOut = pal.querySelector(".out");

  const A = () => window.ARTEFAKTE || null;
  const hubColors = () => {
    const dark = document.documentElement.getAttribute("data-hbx-theme") === "dark";
    const map = {};
    const a = A();
    if (a) a.hubs.forEach((h) => (map[h.id] = dark ? h.accent.d : h.accent.l));
    return map;
  };
  const fmtDate = (s) => {
    const p = (s || "").split("-");
    return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : s || "";
  };

  /* ---- Pagefind: einmalig laden, still scheitern (z. B. im Dev-Server) ---- */
  let pf = null, pfTried = false;
  async function pagefind() {
    if (pfTried) return pf;
    pfTried = true;
    try {
      pf = await import("/pagefind/pagefind.js");
      await pf.options({ excerptLength: 18 });
    } catch (e) { pf = null; }
    return pf;
  }

  /* ---- Rendering ---- */
  let rows = [], sel = 0, ticket = 0;

  function group(label) {
    palOut.appendChild(el("div", "gl", label));
  }
  function addRow(node) {
    palOut.appendChild(node);
    rows.push(node);
    if (rows.length === 1) node.classList.add("sel");
  }
  function structRow(entry, q, colors) {
    const a = el("a", "r");
    a.href = entry.href;
    a.style.setProperty("--rc", colors[entry.hub.id] || "");
    let title = esc(entry.title);
    if (q) {
      const i = entry.title.toLowerCase().indexOf(q);
      if (i >= 0)
        title = esc(entry.title.slice(0, i)) + "<mark>" + esc(entry.title.slice(i, i + q.length)) + "</mark>" + esc(entry.title.slice(i + q.length));
    }
    a.innerHTML =
      '<span class="dot"></span><span class="tx"><span class="tt">' + title +
      '</span><span class="sb">' + esc(entry.sub || "") + "</span></span>" +
      '<span class="kd">' + esc(entry.kind) + "</span>";
    return a;
  }
  function textRow(hit, colors) {
    const a = el("a", "r");
    a.href = hit.url;
    const mod = A() && A().moduleByFile(hit.url.replace(/^\//, "").split("#")[0]);
    if (mod) a.style.setProperty("--rc", colors[mod.hub.id] || "");
    a.innerHTML =
      '<span class="dot"></span><span class="tx"><span class="tt">' + esc(hit.title) +
      '</span><span class="ex">' + hit.excerpt + "</span></span>" +
      '<span class="kd">volltext</span>';
    return a;
  }

  function reset() {
    palOut.innerHTML = "";
    rows = [];
    sel = 0;
  }

  function startView() {
    reset();
    const a = A();
    if (!a) return;
    const colors = hubColors();
    group("Hubs");
    a.searchIndex().filter((e) => e.kind === "hub").forEach((e) => addRow(structRow(e, "", colors)));
    group("Zuletzt aktualisiert");
    a.modules
      .slice()
      .sort((x, y) => (y.updated || "").localeCompare(x.updated || ""))
      .slice(0, 5)
      .forEach((m) =>
        addRow(structRow({ kind: "modul", title: m.name, sub: m.hub.name + " · zuletzt " + fmtDate(m.updated), href: m.file, hub: m.hub }, "", colors))
      );
  }

  async function search(raw) {
    const q = raw.trim().toLowerCase();
    const my = ++ticket;
    if (!q) return startView();
    reset();
    const a = A();
    const colors = hubColors();

    /* 1. Struktur */
    const hits = [];
    if (a)
      a.searchIndex().forEach((e) => {
        const t = e.title.toLowerCase();
        const i = t.indexOf(q);
        let score;
        if (i === 0) score = 0;
        else if (i > 0) score = 1;
        else if ((e.extra || "").toLowerCase().indexOf(q) >= 0) score = 3;
        else return;
        hits.push({ e, s: score * 4 + e.w });
      });
    hits.sort((x, y) => x.s - y.s || x.e.title.length - y.e.title.length);
    const top = hits.slice(0, 9).map((h) => h.e);
    if (top.length) {
      group("Navigation");
      top.forEach((e) => addRow(structRow(e, q, colors)));
    }

    /* 2. Volltext (asynchron nachgereicht) */
    const engine = await pagefind();
    if (!engine || my !== ticket) {
      if (!rows.length && my === ticket) palOut.innerHTML = '<div class="msg">Nichts gefunden für „' + esc(raw.trim()) + "“.</div>";
      return;
    }
    const res = await engine.debouncedSearch(raw.trim(), {}, 160);
    if (!res || my !== ticket) return;
    const datas = await Promise.all(res.results.slice(0, 6).map((r) => r.data()));
    if (my !== ticket) return;
    if (datas.length) {
      group("Im Inhalt");
      datas.forEach((d) => {
        const sub = (d.sub_results || []).find((s) => s.url && s.url.indexOf("#") >= 0);
        addRow(textRow({
          url: (sub && sub.url) || d.url,
          title: (d.meta && d.meta.title) || d.url,
          excerpt: (sub && sub.excerpt) || d.excerpt || ""
        }, colors));
      });
    }
    if (!rows.length) palOut.innerHTML = '<div class="msg">Nichts gefunden für „' + esc(raw.trim()) + "“.</div>";
  }

  function move(d) {
    if (!rows.length) return;
    rows[sel] && rows[sel].classList.remove("sel");
    sel = (sel + d + rows.length) % rows.length;
    rows[sel].classList.add("sel");
    rows[sel].scrollIntoView({ block: "nearest" });
  }

  function open() {
    if (!pal.parentNode) document.body.appendChild(pal);
    pal.classList.add("open");
    palIn.value = "";
    startView();
    palIn.focus();
    pagefind(); /* Index schon mal anwärmen */
  }
  function close() {
    pal.classList.remove("open");
  }

  palIn.addEventListener("input", () => search(palIn.value));
  palIn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { e.preventDefault(); if (rows[sel]) rows[sel].click(); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  });
  pal.addEventListener("click", (e) => { if (e.target === pal) close(); });

  document.addEventListener("keydown", (e) => {
    /* Seiten mit eigener Suche (#pal) behalten ihre Kürzel — dort öffnet nur
       der Knopf in der Leiste die globale Palette. */
    const hasLocal = !!document.getElementById("pal");
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || "");
    if (!hasLocal && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pal.classList.contains("open") ? close() : open();
    } else if (!hasLocal && e.key === "/" && !typing && !pal.classList.contains("open")) {
      e.preventDefault();
      open();
    } else if (e.key === "Escape" && pal.classList.contains("open")) {
      close();
    }
  });

  window.HBXPAL = { open: open, close: close };
})();
