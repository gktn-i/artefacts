/* ============================================================================
   Registry-Ableitungen für die Astro-Seiten (Server-seitig).
   Die Daten liegen in src/data/registry.json — hier nur die Sichten darauf.
   ========================================================================== */
import raw from "../data/registry.json";

/* Klonen, bevor Rückverweise (mod.hub, mod.area) entstehen — der Endpoint
   serialisiert dasselbe JSON-Modul und darf keine Zyklen sehen. */
export const hubs = structuredClone(raw).hubs;

/* Flache Modulliste; jedes Modul kennt Hub und Bereich. */
export const modules = [];
for (const hub of hubs) {
  for (const area of hub.areas) {
    for (const mod of area.modules) {
      mod.hub = hub;
      mod.area = area;
      modules.push(mod);
    }
  }
  hub.modules = hub.areas.flatMap((a) => a.modules);
  hub.sectionCount = hub.modules.reduce((n, m) => n + m.sections.length, 0);
  hub.updated = hub.modules.map((m) => m.updated).sort().at(-1);
}

export const sectionCount = modules.reduce((n, m) => n + m.sections.length, 0);
export const lastUpdated = modules.map((m) => m.updated).sort().at(-1);

const byId = new Map(modules.map((m) => [m.id, m]));
export const moduleById = (id) => byId.get(id) || null;
export const hubById = (id) => hubs.find((h) => h.id === id) || null;

/* related ist einseitig gepflegt — hier symmetrisch aufgelöst. */
const relSets = new Map(modules.map((m) => [m.id, new Set(m.related || [])]));
for (const m of modules) {
  for (const r of m.related || []) {
    if (!byId.has(r)) throw new Error(`registry: related "${r}" in "${m.id}" existiert nicht`);
    relSets.get(r).add(m.id);
  }
}
export const relatedOf = (id) =>
  [...(relSets.get(id) || [])].map((r) => byId.get(r)).filter(Boolean);

/* Schnellzugriff: ein Hub kann `tasks` tragen — Aufgaben („Projekt starten",
   „Bauteil finden" …), die quer durch die Module auf die passenden Abschnitte
   zeigen. Jeder Link {m, h, t?} wird hier gegen die Registry geprüft und zu
   {href, label, mod, cross} aufgelöst; ein Tippfehler bricht den Build. */
for (const hub of hubs) {
  hub.tasks = (hub.tasks || []).map((task) => ({
    ...task,
    items: task.links.map((l) => {
      const mod = byId.get(l.m);
      if (!mod) throw new Error(`registry: tasks/${hub.id}/${task.id} → Modul "${l.m}" existiert nicht`);
      const sec = mod.sections.find((s) => s.h === l.h);
      if (!sec) throw new Error(`registry: tasks/${hub.id}/${task.id} → Abschnitt "${l.m}#${l.h}" existiert nicht`);
      return { href: `${mod.file}#${sec.h}`, label: l.t || sec.t, mod, cross: mod.hub.id !== hub.id };
    }),
  }));
}

export const fmtDate = (s) => {
  const p = (s || "").split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : s || "";
};
