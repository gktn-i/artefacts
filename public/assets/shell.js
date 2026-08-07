/* ============================================================================
   ARTEFAKTE · LEGACY-SHELL
   ----------------------------------------------------------------------------
   Baut auf den noch nicht migrierten Artefakten die Kopfleiste (Breadcrumb +
   Modul-Wechsler) und unter dem Inhalt die Leiste mit Nachbar- und verwandten
   Modulen. Die Suche liefert assets/palette.js, die Daten assets/registry.js.

   Auf nativen Astro-Seiten läuft dieses Skript nicht — dort rendert das
   Layout die Leiste serverseitig. Wandert ein Modul nach src/content/, fliegt
   hier nur seine Datei aus public/ raus; dieses Skript bleibt unverändert.
   ========================================================================== */
(function () {
  "use strict";

  const A = window.ARTEFAKTE;
  if (!A) return;

  /* -------------------------------------------------- Ort in der Struktur */
  const FILE = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const MOD = A.moduleByFile(FILE);
  const HUB = MOD ? MOD.hub : A.hubByFile(FILE);

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

  /* Seiten mit eigener Suche bekommen ein anderes Label — sonst stehen auf
     dem Handy zweimal fast identische Knöpfe untereinander. */
  const HAS_LOCAL_SEARCH = !!document.getElementById("pal");
  const searchBtn = el("button", "hbx-act");
  searchBtn.type = "button";
  searchBtn.innerHTML =
    '<span aria-hidden="true">🔍</span><span class="lbl">' +
    (HAS_LOCAL_SEARCH ? "Alle Artefakte" : "Suchen") +
    '</span><span class="lbl-s">' + (HAS_LOCAL_SEARCH ? "Alle" : "Suche") + "</span>" +
    (HAS_LOCAL_SEARCH ? "" : '<span class="k">⌘K</span>');
  searchBtn.title = "Über alle Hubs, Module und Volltexte suchen";
  searchBtn.addEventListener("click", () => {
    if (window.HBXPAL) window.HBXPAL.open();
  });
  bar.appendChild(searchBtn);

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

    /* Verwandte Module — auch quer über die Hubs */
    const rel = (A.relatedOf ? A.relatedOf(MOD.id) : []).filter((m) => m.hub.id !== HUB.id);
    if (rel.length) {
      foot.appendChild(el("div", "hd", "Verwandt in anderen Hubs"));
      const rr = el("div", "row");
      rel.forEach((m) => {
        const a = el("a");
        a.href = m.file;
        a.innerHTML = "<span>" + m.icon + "</span><span>" + esc(m.name) + '</span><span class="hx">' + m.hub.icon + " " + esc(m.hub.name) + "</span>";
        rr.appendChild(a);
      });
      foot.appendChild(rr);
    }
    return foot;
  }

  /* ================================================================ MOUNT */
  function mount() {
    document.body.insertBefore(bar, document.body.firstChild);
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
