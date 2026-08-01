/* ============================================================================
   ARTEFAKTE · HUB-SEITE
   ----------------------------------------------------------------------------
   Rendert eine komplette Hub-Seite aus assets/registry.js. Die HTML-Datei
   selbst enthält nur noch das Gerüst und sagt über `<body data-hub="…">`,
   welcher Hub gemeint ist.

   Neuer Hub: hub-werkstatt.html kopieren, `data-hub` und <title> anpassen,
   Eintrag in registry.js ergänzen — fertig.
   ========================================================================== */
(function () {
  "use strict";

  const A = window.ARTEFAKTE;
  const hub = A && A.hubById(document.body.dataset.hub);
  if (!hub) return;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const dark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  const fmt = (s) => { const p = (s || "").split("-"); return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : s || ""; };
  const SHOWN = 8; /* Abschnitts-Chips pro Karte, bevor eingeklappt wird */

  document.documentElement.style.setProperty("--c", dark() ? hub.accent.d : hub.accent.l);

  /* ------------------------------------------------------------------ Hero */
  const q = (sel) => document.querySelector(sel);
  q("#kicker").textContent = hub.tagline;
  q("#title").innerHTML = '<span class="ic">' + hub.icon + "</span>" + esc(hub.name);
  q("#lead").textContent = hub.desc;
  q("#stats").innerHTML =
    "<span><b>" + hub.modules.length + "</b> Module</span>" +
    "<span><b>" + hub.sectionCount + "</b> Abschnitte</span>" +
    "<span><b>" + hub.areas.length + "</b> Bereiche</span>" +
    "<span>zuletzt <b>" + fmt(hub.updated) + "</b></span>";
  q("#jump").innerHTML = hub.areas
    .map(
      (ar) =>
        '<a href="#a-' + ar.id + '">' + esc(ar.name) +
        ' <span class="ct">' + ar.modules.length + "</span></a>"
    )
    .join("");

  document.title = hub.name + " · Artefakte";
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", hub.name + " — " + hub.desc);

  /* --------------------------------------------------------------- Bereiche */
  function modCard(m) {
    const secs = m.sections;
    const head = secs.slice(0, SHOWN);
    const tail = secs.slice(SHOWN);
    const chip = (s) => '<a href="' + m.file + "#" + s.h + '">' + esc(s.t) + "</a>";
    return (
      '<article class="mod">' +
      '<div class="hd"><span class="ic">' + m.icon + "</span>" +
      '<h3><a href="' + m.file + '">' + esc(m.name) + "</a></h3>" +
      '<span class="kind">' + esc(m.kind) + "</span></div>" +
      "<p>" + esc(m.desc) + "</p>" +
      (secs.length
        ? '<div class="secs">' +
          head.map(chip).join("") +
          (tail.length
            ? '<span class="rest" style="display:none">' + tail.map(chip).join("") + "</span>" +
              '<button type="button" data-more>+' + tail.length + " weitere</button>"
            : "") +
          "</div>"
        : "") +
      '<div class="foot"><span>' + (secs.length ? secs.length + " Abschnitte" : "Einzelseite") + "</span>" +
      "<span>" + fmt(m.updated) + "</span>" +
      '<a class="open" href="' + m.file + '">öffnen →</a></div>' +
      "</article>"
    );
  }

  q("#areas").innerHTML = hub.areas
    .map(
      (ar) =>
        '<section class="area" id="a-' + ar.id + '">' +
        '<div class="area-head"><h2>' + esc(ar.name) + '</h2><span class="ct">' +
        ar.modules.length + " Module</span></div>" +
        '<p class="d">' + esc(ar.desc) + "</p>" +
        '<div class="modgrid">' + ar.modules.map(modCard).join("") + "</div>" +
        "</section>"
    )
    .join("");

  /* Abschnitts-Chips aufklappen */
  q("#areas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-more]");
    if (!b) return;
    const rest = b.parentElement.querySelector(".rest");
    if (!rest) return;
    rest.style.display = "contents";
    b.remove();
  });

  /* -------------------------------------------------------- Andere Hubs */
  q("#others").innerHTML = A.hubs
    .filter((h) => h.id !== hub.id)
    .map(
      (h) =>
        '<a class="hubcard" href="' + h.file + '" style="--c:' + (dark() ? h.accent.d : h.accent.l) + '">' +
        '<div class="top"><span class="ic">' + h.icon + "</span><h2>" + esc(h.name) + "</h2></div>" +
        '<div class="tag">' + esc(h.tagline) + "</div>" +
        "<p>" + esc(h.desc) + "</p>" +
        '<div class="foot"><span>' + h.modules.length + " Module</span><span>" +
        h.sectionCount + ' Abschnitte</span><span class="go">Hub öffnen →</span></div>' +
        "</a>"
    )
    .join("");

  q("#go").onclick = () => window.HBX && window.HBX.search();
})();
