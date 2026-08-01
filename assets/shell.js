/* ============================================================================
   ARTEFAKTE · SHELL
   ----------------------------------------------------------------------------
   Baut auf jeder Seite dieselbe Kopfleiste (Breadcrumb + Modul-Wechsler +
   globale Suche) und unter den Inhalt eine Leiste mit den Nachbar-Modulen
   desselben Hubs.

   Einbinden — die drei Zeilen gehören direkt vor </head> jeder Datei, also
   NACH deren eigenem <style>, damit die Leiste sich durchsetzen kann:

     <link rel="stylesheet" href="assets/chrome.css">
     <script defer src="assets/registry.js"></script>
     <script defer src="assets/shell.js"></script>

   Die Seite selbst muss nichts weiter tun: Hub, Nachbarn, Farbe und Theme
   kommen aus assets/registry.js, erkannt über den Dateinamen.
   ========================================================================== */
(function () {
  "use strict";

  const A = window.ARTEFAKTE;
  if (!A) return;

  /* -------------------------------------------------- Ort in der Struktur */
  const FILE = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const MOD = A.moduleByFile(FILE);
  const HUB = MOD ? MOD.hub : A.hubByFile(FILE);
  const IS_INDEX = !MOD && !HUB;

  const el = (tag, cls, txt) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ------------------------------------------------------------- Theme */
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function applyTheme() {
    const fixed = MOD && MOD.theme && MOD.theme !== "auto" ? MOD.theme : null;
    const dark = fixed ? fixed === "dark" : darkQuery.matches;
    document.documentElement.setAttribute("data-hbx-theme", dark ? "dark" : "light");
    if (HUB) {
      document.documentElement.style.setProperty("--hbx-c", dark ? HUB.accent.d : HUB.accent.l);
    }
  }
  applyTheme();
  if (darkQuery.addEventListener) darkQuery.addEventListener("change", applyTheme);

  /* ============================================================ KOPFLEISTE */
  const bar = el("div", "hbx-bar");
  bar.setAttribute("role", "navigation");
  bar.setAttribute("aria-label", "Artefakte");

  const home = el("a", "hbx-home");
  home.href = "index.html";
  home.innerHTML = '<span class="m"></span><span>Artefakte</span>';
  home.title = "Zur Übersicht aller Hubs";
  bar.appendChild(home);

  function sep() {
    return el("span", "hbx-sep", "/");
  }

  /* Menü-Baustein: Button + Klappliste ---------------------------------- */
  function picker(label, icon, groups, currentHref) {
    const wrap = el("div", "hbx-pick");
    const btn = el("button");
    btn.type = "button";
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = (icon ? '<span class="i">' + icon + "</span>" : "") + '<span class="cv">' + esc(label) + "</span>";
    const menu = el("div", "hbx-menu");
    groups.forEach((g) => {
      if (g.label) menu.appendChild(el("div", "gl", g.label));
      g.items.forEach((it) => {
        const a = el("a");
        a.href = it.href;
        if (it.href === currentHref) a.className = "on";
        a.innerHTML =
          '<span class="i">' + (it.icon || "") + "</span><span>" + esc(it.name) + "</span>" +
          (it.note ? '<span class="k">' + esc(it.note) + "</span>" : "");
        menu.appendChild(a);
      });
    });
    const close = () => {
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = wrap.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    return wrap;
  }

  if (HUB) {
    bar.appendChild(sep());
    if (MOD) {
      /* Artefakt-Seite:  Artefakte / Hub / [Modul ▾] */
      const hl = el("a", "hbx-crumb hub");
      hl.href = HUB.file;
      hl.innerHTML = '<span class="i">' + HUB.icon + '</span><span class="t">' + esc(HUB.name) + "</span>";
      hl.title = HUB.name + "-Hub öffnen";
      bar.appendChild(hl);
      bar.appendChild(sep());

      const groups = HUB.areas
        .map((ar) => ({
          label: ar.name,
          items: ar.modules.map((m) => ({ href: m.file, name: m.name, icon: m.icon, note: m.kind }))
        }))
        .filter((g) => g.items.length);
      groups.unshift({ label: null, items: [{ href: HUB.file, name: HUB.name + "-Hub", icon: HUB.icon }] });
      bar.appendChild(picker(MOD.name, MOD.icon, groups, FILE));
    } else {
      /* Hub-Seite:  Artefakte / [Hub ▾] */
      const groups = [
        {
          label: "Hubs",
          items: A.hubs.map((h) => ({
            href: h.file,
            name: h.name,
            icon: h.icon,
            note: h.modules.length + " Module"
          }))
        }
      ];
      bar.appendChild(picker(HUB.name, HUB.icon, groups, FILE));
    }
  }

  bar.appendChild(el("span", "hbx-spacer"));

  /* Eigene Suche der Seite? Dann keine Tastenkürzel doppelt belegen. */
  const HAS_LOCAL_SEARCH = !!document.getElementById("pal");

  const searchBtn = el("button", "hbx-act");
  searchBtn.type = "button";
  /* Seiten mit eigener Suche bekommen ein anderes Label — sonst stehen auf
     dem Handy zweimal fast identische Knöpfe untereinander. */
  searchBtn.innerHTML =
    '<span aria-hidden="true">🔍</span><span class="lbl">' +
    (HAS_LOCAL_SEARCH ? "Alle Artefakte" : "Suchen") +
    '</span><span class="lbl-s">' + (HAS_LOCAL_SEARCH ? "Alle" : "Suche") + "</span>" +
    (HAS_LOCAL_SEARCH ? "" : '<span class="k">⌘K</span>');
  searchBtn.title = "Über alle Hubs, Module und Abschnitte suchen";
  bar.appendChild(searchBtn);

  /* ================================================================ SUCHE */
  const pal = el("div", "hbx-pal");
  pal.innerHTML =
    '<div class="box" role="dialog" aria-modal="true" aria-label="Artefakte durchsuchen">' +
    '<input type="search" autocomplete="off" spellcheck="false" placeholder="Hub, Modul oder Abschnitt suchen …">' +
    '<div class="out"></div>' +
    '<div class="hint"><span>↑↓ wählen</span><span>⏎ öffnen</span><span>esc schließen</span></div>' +
    "</div>";
  const palIn = pal.querySelector("input");
  const palOut = pal.querySelector(".out");

  const KINDCOLOR = () => {
    const dark = document.documentElement.getAttribute("data-hbx-theme") === "dark";
    const map = {};
    A.hubs.forEach((h) => (map[h.id] = dark ? h.accent.d : h.accent.l));
    return map;
  };

  function rowFor(entry, q, colors) {
    const a = el("a", "r");
    a.href = entry.href;
    a.style.setProperty("--rc", colors[entry.hub.id] || "");
    let title = esc(entry.title);
    if (q) {
      const i = entry.title.toLowerCase().indexOf(q);
      if (i >= 0) {
        title =
          esc(entry.title.slice(0, i)) +
          "<mark>" + esc(entry.title.slice(i, i + q.length)) + "</mark>" +
          esc(entry.title.slice(i + q.length));
      }
    }
    a.innerHTML =
      '<span class="dot"></span><span class="tx"><span class="tt">' + title +
      '</span><span class="sb">' + esc(entry.sub || "") + "</span></span>" +
      '<span class="kd">' + esc(entry.kind) + "</span>";
    return a;
  }

  let rows = [];
  let sel = 0;

  function paint(list, q) {
    const colors = KINDCOLOR();
    palOut.innerHTML = "";
    rows = [];
    sel = 0;
    if (!list.length) {
      palOut.innerHTML = '<div class="msg">Nichts gefunden für „' + esc(q) + "“.</div>";
      return;
    }
    let lastKind = null;
    list.forEach((e) => {
      if (e.kind !== lastKind) {
        lastKind = e.kind;
        palOut.appendChild(el("div", "gl", { hub: "Hubs", modul: "Module", abschnitt: "Abschnitte" }[e.kind] || e.kind));
      }
      const r = rowFor(e, q, colors);
      palOut.appendChild(r);
      rows.push(r);
    });
    if (rows[0]) rows[0].classList.add("sel");
  }

  function startView() {
    const idx = A.searchIndex();
    const hubs = idx.filter((e) => e.kind === "hub");
    const recent = A.modules
      .slice()
      .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""))
      .slice(0, 5)
      .map((m) => ({
        kind: "modul",
        title: m.name,
        sub: m.hub.name + " · zuletzt " + fmtDate(m.updated),
        href: m.file,
        hub: m.hub
      }));
    paint(hubs.concat(recent), "");
  }

  function fmtDate(s) {
    if (!s) return "";
    const p = s.split("-");
    return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : s;
  }

  function search(raw) {
    const q = raw.trim().toLowerCase();
    if (!q) return startView();
    const hits = [];
    A.searchIndex().forEach((e) => {
      const t = e.title.toLowerCase();
      const i = t.indexOf(q);
      let score;
      if (i === 0) score = 0;
      else if (i > 0) score = 1;
      else if ((e.extra || "").toLowerCase().indexOf(q) >= 0) score = 3;
      else return;
      hits.push({ e: e, s: score * 4 + e.w });
    });
    hits.sort((a, b) => a.s - b.s || a.e.title.length - b.e.title.length);
    paint(hits.slice(0, 40).map((h) => h.e), q);
  }

  function move(d) {
    if (!rows.length) return;
    rows[sel].classList.remove("sel");
    sel = (sel + d + rows.length) % rows.length;
    rows[sel].classList.add("sel");
    rows[sel].scrollIntoView({ block: "nearest" });
  }

  function openPal() {
    pal.classList.add("open");
    palIn.value = "";
    startView();
    palIn.focus();
  }
  function closePal() {
    pal.classList.remove("open");
  }

  searchBtn.addEventListener("click", openPal);
  palIn.addEventListener("input", () => search(palIn.value));
  palIn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { e.preventDefault(); if (rows[sel]) rows[sel].click(); }
    else if (e.key === "Escape") { e.preventDefault(); closePal(); }
  });
  pal.addEventListener("click", (e) => {
    if (e.target === pal) closePal();
  });
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || "");
    if (!HAS_LOCAL_SEARCH && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pal.classList.contains("open") ? closePal() : openPal();
    } else if (!HAS_LOCAL_SEARCH && e.key === "/" && !typing) {
      e.preventDefault();
      openPal();
    } else if (e.key === "Escape" && pal.classList.contains("open")) {
      closePal();
    }
  });
  window.HBX = { search: openPal };

  /* ==================================================== NACHBARN AM ENDE */
  function neighbours() {
    if (!MOD) return null;
    const foot = el("div", "hbx-foot");
    foot.appendChild(el("div", "hd", "Weiter im Hub " + HUB.name));
    const row = el("div", "row");

    const hubLink = el("a", "up");
    hubLink.href = HUB.file;
    hubLink.innerHTML = "<span>" + HUB.icon + "</span><span>Alle " + HUB.modules.length + " Module im " + esc(HUB.name) + "-Hub</span>";
    row.appendChild(hubLink);

    HUB.modules
      .filter((m) => m.file !== MOD.file)
      .forEach((m) => {
        const a = el("a");
        a.href = m.file;
        a.innerHTML = "<span>" + m.icon + "</span><span>" + esc(m.name) + "</span>";
        row.appendChild(a);
      });
    foot.appendChild(row);
    return foot;
  }

  /* ================================================================ MOUNT */
  function mount() {
    document.body.insertBefore(bar, document.body.firstChild);
    document.body.appendChild(pal);
    document.body.classList.add("hbx-on");
    if (document.getElementById("side")) document.body.classList.add("hbx-app");

    const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hbx-h")) || 44;
    const pad = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
    document.body.style.paddingTop = pad + h + "px";

    const foot = neighbours();
    if (foot) (document.querySelector("main") || document.body).appendChild(foot);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
