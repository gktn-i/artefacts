/* ============================================================================
   Generiert /assets/registry.js für die Legacy-Artefakte.
   Quelle ist src/data/registry.json — dieselben Daten, die auch Index, Hubs
   und die nativen Modulseiten rendern. Die Legacy-Seiten (shell.js/palette.js)
   lesen daraus window.ARTEFAKTE.
   ========================================================================== */
import type { APIRoute } from "astro";
import raw from "../../data/registry.json";

const runtime = `(function () {
  "use strict";
  const HUBS = __DATA__;

  const modules = [];
  HUBS.forEach((hub) => {
    hub.areas.forEach((area) => {
      area.modules.forEach((m) => {
        m.hub = hub;
        m.area = area;
        modules.push(m);
      });
    });
    hub.modules = hub.areas.reduce((a, ar) => a.concat(ar.modules), []);
    hub.sectionCount = hub.modules.reduce((a, m) => a + m.sections.length, 0);
    hub.updated = hub.modules.map((m) => m.updated).sort().pop();
  });

  const byFile = {};
  const byId = {};
  modules.forEach((m) => { byFile[m.file] = m; byId[m.id] = m; });
  const hubByFile = {};
  HUBS.forEach((h) => (hubByFile[h.file] = h));

  /* related symmetrisch aufloesen */
  const rel = {};
  modules.forEach((m) => (rel[m.id] = new Set(m.related || [])));
  modules.forEach((m) => (m.related || []).forEach((r) => { if (rel[r]) rel[r].add(m.id); }));

  /* Schnellzugriff (hub.tasks): Links {m, h, t?} zu Zielen aufloesen. */
  HUBS.forEach((h) => {
    h.tasks = (h.tasks || []).map((t) => {
      const items = (t.links || []).map((l) => {
        const m = byId[l.m];
        const s = m && m.sections.find((x) => x.h === l.h);
        return m && s ? { href: m.file + "#" + s.h, label: l.t || s.t, mod: m } : null;
      }).filter(Boolean);
      return Object.assign({}, t, { items: items, href: h.file + "#t-" + t.id, hub: h });
    });
  });

  /* Hub der aktuellen Seite (Hub-Panel oder Modulseite), sonst null. */
  const hereHub = () => {
    const f = location.pathname.split("/").pop() || "index.html";
    const m = byFile[f];
    return m ? m.hub : hubByFile[f] || null;
  };

  window.ARTEFAKTE = {
    hubs: HUBS,
    modules: modules,
    hubById: (id) => HUBS.find((h) => h.id === id) || null,
    moduleByFile: (f) => byFile[f] || null,
    hubByFile: (f) => hubByFile[f] || null,
    hereHub: hereHub,
    relatedOf: (id) => Array.from(rel[id] || []).map((r) => byId[r]).filter(Boolean),
    sectionCount: modules.reduce((a, m) => a + m.sections.length, 0),
    searchIndex: function () {
      if (this._idx) return this._idx;
      const out = [];
      HUBS.forEach((h) => {
        out.push({ kind: "hub", title: h.name, sub: h.tagline, href: h.file, hub: h, w: 0 });
        h.tasks.forEach((t) => {
          out.push({
            kind: "aufgabe", title: t.t, sub: h.name + " · Schnellzugriff: " + t.d,
            href: t.href, hub: h, task: t,
            extra: t.d + " " + (t.k || "") + " " + t.items.map((i) => i.label).join(" "), w: 0.5
          });
        });
      });
      modules.forEach((m) => {
        out.push({
          kind: "modul", title: m.name, sub: m.hub.name + " · " + m.kind,
          href: m.file, hub: m.hub, mod: m,
          extra: m.desc + " " + m.tags.join(" "), w: 1
        });
        m.sections.forEach((s) => {
          out.push({
            kind: "abschnitt", title: s.t, sub: m.name + " · " + m.hub.name,
            href: m.file + "#" + s.h, hub: m.hub, mod: m, w: 2
          });
        });
      });
      this._idx = out;
      return out;
    }
  };
})();
`;

export const GET: APIRoute = () =>
  new Response(
    "/* Generiert aus src/data/registry.json — nicht von Hand editieren. */\n" +
      runtime.replace("__DATA__", JSON.stringify(raw.hubs)),
    { headers: { "Content-Type": "text/javascript; charset=utf-8" } },
  );
