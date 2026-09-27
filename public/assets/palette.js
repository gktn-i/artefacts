/* ============================================================================
   ARTEFAKTE · SUCHPALETTE
   ----------------------------------------------------------------------------
   Zwei Ebenen in einem Fenster:
     1. Struktur-Treffer aus der Registry (Hubs, Module, Abschnitte) — sofort.
     2. Volltext-Treffer aus dem Pagefind-Index (/pagefind/…) — nachgeladen.
        Jede Überschrift trägt seit dem Build eine ID, deshalb führt ein
        Treffer direkt an die Fundstelle (Abschnitt › Überschrift).
   Öffnet sich über jedes Element mit [data-pal], über ⌘K/Strg+K und "/".
   Technik: natives <dialog> mit showModal() — Fokus bleibt im Fenster, der
   Rest der Seite ist gesperrt, Esc schließt, der Fokus kehrt danach zurück.
   Eingabe und Trefferliste folgen dem Combobox-Muster (aria-activedescendant),
   damit Screenreader die Auswahl mit den Pfeiltasten mitlesen.
   Styling liegt im Design-System (src/styles/app.css, Block SUCHPALETTE).
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

  const pal = el("dialog", "pal");
  pal.setAttribute("aria-label", "Artefakte durchsuchen");
  pal.innerHTML =
    '<div class="box">' +
    '<div class="in">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>' +
    '<input type="search" autocomplete="off" spellcheck="false" enterkeyhint="go" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list" aria-label="Suchbegriff" placeholder="Alles durchsuchen — Module, Abschnitte, Volltext …">' +
    "</div>" +
    '<div class="out" id="pal-list" role="listbox" aria-label="Treffer"></div>' +
    '<div class="hint" aria-hidden="true"><span>↑↓ wählen</span><span>⏎ öffnen</span><span>esc schließen</span></div>' +
    '<div class="sr-only" role="status" aria-live="polite"></div>' +
    "</div>";
  const palIn = pal.querySelector("input");
  const palOut = pal.querySelector(".out");
  const palLive = pal.querySelector("[role=status]");

  const A = () => window.ARTEFAKTE || null;
  const isDark = () => {
    const t = document.documentElement.getAttribute("data-hbx-theme");
    if (t) return t === "dark";
    return matchMedia("(prefers-color-scheme: dark)").matches;
  };
  const hubColors = () => {
    const dark = isDark();
    const map = {};
    const a = A();
    if (a) a.hubs.forEach((h) => (map[h.id] = dark ? h.accent.d : h.accent.l));
    return map;
  };
  const fmtDate = (s) => {
    const p = (s || "").split("-");
    return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : s || "";
  };

  /* Tastenkürzel passend zum System beschriften: ⌘K auf Apple-Geräten, sonst Strg K. */
  const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
  if (!/mac|iphone|ipad|ipod/i.test(platform)) {
    document.querySelectorAll("[data-pal] kbd").forEach((k) => (k.textContent = "Strg K"));
  }

  /* ---- Pagefind: einmal laden, still scheitern (z. B. im Dev-Server) -------
     Alle Aufrufer teilen sich dasselbe Promise. Wer tippt, während der Index
     noch lädt, bekommt die Volltext-Treffer, sobald er da ist. */
  let pfLoad = null;
  const pagefind = () =>
    pfLoad ||
    (pfLoad = import("/pagefind/pagefind.js")
      .then(async (pf) => {
        await pf.options({ excerptLength: 18 });
        pf.init();
        return pf;
      })
      .catch(() => null));

  /* ---- Rendering ---- */
  let rows = [], sel = 0, ticket = 0, box = palOut, sayTimer = 0;

  function say(msg) {
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => (palLive.textContent = msg), 450);
  }
  function group(label) {
    box = el("div", "grp");
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", label);
    const l = el("div", "gl", label);
    l.setAttribute("aria-hidden", "true");
    box.appendChild(l);
    palOut.appendChild(box);
  }
  function addRow(node) {
    node.id = "pal-o" + rows.length;
    node.setAttribute("role", "option");
    node.setAttribute("aria-selected", "false");
    node.tabIndex = -1;
    box.appendChild(node);
    rows.push(node);
    if (rows.length === 1) select(0, false);
  }
  function select(i, scroll) {
    if (!rows.length) return;
    const old = rows[sel];
    if (old) {
      old.classList.remove("sel");
      old.setAttribute("aria-selected", "false");
    }
    sel = (i + rows.length) % rows.length;
    const r = rows[sel];
    r.classList.add("sel");
    r.setAttribute("aria-selected", "true");
    palIn.setAttribute("aria-activedescendant", r.id);
    if (scroll !== false) r.scrollIntoView({ block: "nearest" });
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
  /* Volltext-Treffer: Titel ist die Überschrift der Fundstelle, darunter der
     Pfad (Modul › Abschnitt) und der Textauszug mit markierten Wörtern. */
  function textRow(hit, colors) {
    const a = el("a", "r ft");
    a.href = hit.url;
    const [path, hash = ""] = hit.url.replace(/^\//, "").split("#");
    const mod = A() && A().moduleByFile(path);
    if (mod) a.style.setProperty("--rc", colors[mod.hub.id] || "");
    const key = decodeURIComponent(hash).split("--")[0];
    const sec = mod && mod.sections.find((s) => s.h === key);
    const where = [mod ? mod.name : hit.page];
    if (sec && sec.t !== hit.title) where.push(sec.t);
    a.innerHTML =
      '<span class="dot"></span><span class="tx"><span class="tt">' + esc(hit.title) +
      '</span><span class="sb">' + esc(where.join(" › ")) +
      '</span><span class="ex">' + hit.excerpt + "</span></span>" +
      '<span class="kd">volltext</span>';
    return a;
  }

  /* Die ergiebigsten Fundstellen einer Seite nach Pagefind-Gewicht: höchstens
     zwei je Modul, die beste zuerst, und die zweite nur, wenn sie mit der
     ersten mithalten kann (mindestens ein Viertel ihres Gewichts). */
  function bestSubs(d) {
    const page = (d.meta && d.meta.title) || d.url;
    const subs = (d.sub_results || []).filter((s) => s.url && s.url.indexOf("#") > 0);
    if (!subs.length) return [{ url: d.url, title: page, page: page, excerpt: d.excerpt || "" }];
    const weight = (s) =>
      (s.weighted_locations || []).reduce((n, w) => n + (w.balanced_score || 0), 0) || (s.locations || []).length;
    const ranked = subs.map((s) => ({ s: s, w: weight(s) })).sort((x, y) => y.w - x.w);
    return ranked
      .filter((x, i) => i < 2 && x.w >= ranked[0].w / 4)
      .map((x) => ({ url: x.s.url, title: x.s.title || page, page: page, excerpt: x.s.excerpt || "" }));
  }

  function reset() {
    palOut.textContent = "";
    rows = [];
    sel = 0;
    box = palOut;
    palIn.removeAttribute("aria-activedescendant");
  }
  function nothing(raw) {
    const m = el("div", "msg", "Nichts gefunden für „" + raw.trim() + "“.");
    m.setAttribute("role", "presentation");
    palOut.appendChild(m);
    say("Keine Treffer");
  }

  function startView() {
    ticket++;
    reset();
    const a = A();
    if (!a) return;
    const colors = hubColors();
    /* Schnellzugriff des Hubs, in dem man gerade steht: erst die Aufgabe,
       dann das Fach — man muss nicht wissen, in welchem Modul etwas liegt. */
    const here = a.hereHub && a.hereHub();
    if (here && here.tasks.length) {
      group("Schnellzugriff · " + here.name);
      here.tasks.forEach((t) =>
        addRow(structRow({ kind: "aufgabe", title: t.icon + " " + t.t, sub: t.d, href: t.href, hub: here }, "", colors))
      );
    }
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
    if (!q) return startView();
    const my = ++ticket;
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
    if (my !== ticket) return;
    if (!engine) {
      if (rows.length) say(rows.length + " Treffer");
      else nothing(raw);
      return;
    }
    const res = await engine.debouncedSearch(raw.trim(), {}, 160);
    if (!res || my !== ticket) return;
    const datas = await Promise.all(res.results.slice(0, 5).map((r) => r.data()));
    if (my !== ticket) return;
    /* Was die Navigation schon zeigt, taucht nicht noch einmal auf. */
    const shown = new Set(rows.map((r) => r.getAttribute("href")));
    const found = [];
    datas.forEach((d) =>
      bestSubs(d).forEach((h) => {
        if (!shown.has(h.url.replace(/^\//, "")) && found.length < 8) found.push(h);
      })
    );
    if (found.length) {
      group("Im Inhalt");
      found.forEach((h) => addRow(textRow(h, colors)));
    }
    if (rows.length) say(rows.length + " Treffer");
    else nothing(raw);
  }

  let back = null;
  function open(q) {
    if (!pal.isConnected) document.body.appendChild(pal);
    if (!pal.open) {
      back = document.activeElement;
      pal.showModal();
    }
    palIn.value = q || "";
    if (q) search(q);
    else startView();
    palIn.focus();
    pagefind(); /* Index schon mal anwärmen */
  }
  function close() {
    if (pal.open) pal.close();
  }
  /* Nach dem Schließen dorthin zurück, wo man herkam (Suchknopf, Link …). */
  pal.addEventListener("close", () => {
    ticket++;
    if (back && back.isConnected && back !== document.body && typeof back.focus === "function") {
      back.focus({ preventScroll: true });
    }
    back = null;
  });

  palIn.addEventListener("input", () => search(palIn.value));
  palIn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); select(sel + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); select(sel - 1); }
    else if (e.key === "Home" && rows.length && !palIn.value) { e.preventDefault(); select(0); }
    else if (e.key === "End" && rows.length && !palIn.value) { e.preventDefault(); select(rows.length - 1); }
    else if (e.key === "Enter") { e.preventDefault(); if (rows[sel]) rows[sel].click(); }
  });
  /* Klick neben das Fenster schließt; ein Treffer schließt ebenfalls — wichtig,
     wenn er nur einen Abschnitt derselben Seite öffnet. Strg/⌘-Klick öffnet
     einen neuen Tab und lässt die Palette offen. */
  pal.addEventListener("click", (e) => {
    if (e.target === pal) return close();
    const r = e.target.closest && e.target.closest(".r");
    if (r && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) close();
  });

  /* Trigger: jedes [data-pal]-Element öffnet die Palette. */
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-pal]");
    if (b) { e.preventDefault(); open(); }
  });

  document.addEventListener("keydown", (e) => {
    const a = document.activeElement || {};
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName || "") || a.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pal.open ? close() : open();
    } else if (e.key === "/" && !typing && !pal.open && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      open();
    }
  });

  window.PAL = { open: open, close: close };
  window.HBXPAL = window.PAL; /* alte Aufrufer */
})();
