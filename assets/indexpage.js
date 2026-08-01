/* ============================================================================
   ARTEFAKTE · INDEX
   ----------------------------------------------------------------------------
   Rendert die Startseite aus assets/registry.js: Hub-Karten, Zuletzt-
   aktualisiert-Streifen und die flache, nach Hub filterbare Modulliste.
   ========================================================================== */
(function () {
  "use strict";
  const A = window.ARTEFAKTE;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const dark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  const hubColor = (h) => (dark() ? h.accent.d : h.accent.l);
  const fmt = (s) => { const p = (s || "").split("-"); return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : s || ""; };

  /* ---- Kennzahlen ---- */
  const totalMods = A.modules.length;
  document.getElementById("stats").innerHTML =
    "<span><b>" + A.hubs.length + "</b> Hubs</span>" +
    "<span><b>" + totalMods + "</b> Module</span>" +
    "<span><b>" + A.sectionCount + "</b> Abschnitte</span>" +
    "<span>zuletzt <b>" + fmt(A.modules.map((m) => m.updated).sort().pop()) + "</b></span>";
  document.getElementById("hubn").textContent = A.hubs.length;
  document.getElementById("modn").textContent = totalMods;
  document.getElementById("foot").textContent = totalMods + " Module · " + A.sectionCount + " Abschnitte";

  /* ---- Hub-Karten ---- */
  document.getElementById("hubs").innerHTML = A.hubs
    .map((h, i) => {
      const shown = h.modules.slice(0, 5);
      const rest = h.modules.length - shown.length;
      return (
        '<a class="hubcard rise" href="' + h.file + '" style="--c:' + hubColor(h) + ";animation-delay:" + i * 60 + 'ms">' +
        '<div class="top"><span class="ic">' + h.icon + "</span><h2>" + esc(h.name) + "</h2></div>" +
        '<div class="tag">' + esc(h.tagline) + "</div>" +
        "<p>" + esc(h.desc) + "</p>" +
        '<div class="mods">' +
        shown.map((m) => "<span>" + esc(m.name) + "</span>").join("") +
        (rest > 0 ? '<span class="more">+' + rest + " weitere</span>" : "") +
        "</div>" +
        '<div class="foot"><span>' + h.modules.length + " Module</span><span>" + h.sectionCount +
        ' Abschnitte</span><span class="go">Hub öffnen →</span></div>' +
        "</a>"
      );
    })
    .join("");

  /* ---- Zuletzt aktualisiert ---- */
  document.getElementById("recent").innerHTML = A.modules
    .slice()
    .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""))
    .slice(0, 4)
    .map(
      (m) =>
        '<a href="' + m.file + '" style="--fc:' + hubColor(m.hub) + '">' +
        '<div class="dt">' + fmt(m.updated) + "</div>" +
        '<div class="nm"><span>' + m.icon + "</span>" + esc(m.name) + "</div>" +
        '<div class="hb">' + m.hub.icon + " " + esc(m.hub.name) + " · " + esc(m.area.name) + "</div>" +
        "</a>"
    )
    .join("");

  /* ---- Filter + flache Liste ---- */
  let active = "alle";
  const filtersEl = document.getElementById("filters");
  const listEl = document.getElementById("list");

  function renderFilters() {
    filtersEl.innerHTML =
      '<button data-h="alle" aria-pressed="' + (active === "alle") + '"><span class="dot"></span>Alle <span>' + totalMods + "</span></button>" +
      A.hubs
        .map(
          (h) =>
            '<button data-h="' + h.id + '" style="--fc:' + hubColor(h) + '" aria-pressed="' + (active === h.id) + '">' +
            '<span class="dot"></span>' + h.icon + " " + esc(h.name) + " <span>" + h.modules.length + "</span></button>"
        )
        .join("");
    filtersEl.querySelectorAll("button").forEach((b) => {
      b.onclick = () => { active = b.dataset.h; renderFilters(); renderList(); };
    });
  }

  function renderList() {
    const items = A.modules.filter((m) => active === "alle" || m.hub.id === active);
    if (!items.length) {
      listEl.innerHTML = '<div class="none">Keine Module in diesem Hub.</div>';
      return;
    }
    listEl.innerHTML = items
      .map(
        (m) =>
          '<a href="' + m.file + '" style="--fc:' + hubColor(m.hub) + '">' +
          '<span class="dot"></span>' +
          '<span class="nm">' + m.icon + " <span>" + esc(m.name) + "</span></span>" +
          '<span class="ds">' + esc(m.desc) + "</span>" +
          '<span class="mt">' + esc(m.kind) + " · " + (m.sections.length || "—") + " Abschn.</span>" +
          '<span class="ar">→</span>' +
          "</a>"
      )
      .join("");
  }

  renderFilters();
  renderList();

  /* ---- Suche ---- */
  document.getElementById("go").onclick = () => window.HBX && window.HBX.search();
})();