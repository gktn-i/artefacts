# Artefakte

Nachschlagewerke für Werkstatt, Küche und Homelab — <https://bib.gktn.dev>.

Gebaut mit [Astro](https://astro.build), Volltextsuche über [Pagefind](https://pagefind.app).
Jeder Push auf `main` baut und deployt automatisch (GitHub Actions → Pages).
Alle 13 Module sind native Astro-Module — es gibt keine HTML-Monolithen mehr.

## Struktur

```
src/data/registry.json     EINZIGE Datenquelle: Hubs → Bereiche → Module → Abschnitte
                           (inkl. groups für die Sidebar, alias für alte Anker,
                           related für Quervernetzung)
src/content/<modul>/       Inhalte: eine .astro-Datei pro Abschnitt
                           + optional _style.css (modulspezifisches, gescopetes CSS)
src/pages/index.astro      Startseite
src/pages/[slug].astro     Hub-Seiten + Modulseiten (URL bleibt <name>.html)
src/layouts/, components/  Base-Layout, Chrome-Leiste, Hub-Karte, CutsSection
src/styles/site.css        Design-Tokens, Hub-/Modul-Layout, Content-System
public/assets/mod-<id>.js  Funktions-JS einzelner Module (Rechner, Tabellen, Folds)
public/assets/palette.js   globale Suche (⌘K): Registry-Treffer + Pagefind-Volltext
public/assets/chrome.css   Kopfleiste + Palette (gemeinsames Chrome)
```

Drei Ebenen: **Index → Hub → Modul.** Hubs: 🔧 Werkstatt · 🍳 Küche · 🖥️ Homelab.

## Wie ein Modul funktioniert

- **Registry-Eintrag** bestimmt Name, Hub, Abschnitte (`sections`), Sidebar-Gruppen
  (`groups`), Anker-Aliase (`alias`) und Quervernetzung (`related`).
- **Ein Abschnitt = eine Datei** unter `src/content/<id>/<hash>.astro`. Der Build
  bricht ab, wenn Registry und Dateien auseinanderlaufen.
- **Layout liefert:** Chrome-Leiste, Abschnitts-Sidebar mit Überschriften-Subnav und
  Scrollspy, Hash-Router (`<name>.html#<hash>`, auch `#abschnitt--überschrift`),
  mobile Schublade, Verwandt-/Nachbar-Leisten, Dark/Light.
- **Modul-Verhalten** (Rechner, sortierbare Tabellen, Filter, Faltabschnitte) liegt in
  `public/assets/mod-<id>.js` und wird über die `PAGE_SCRIPTS`-Map in
  `src/pages/[slug].astro` eingebunden.
- **Modul-Design:** `_style.css` im Content-Ordner, alles unter `.mx-<id>` gescoped —
  kollidiert mit nichts. Kleine Module kommen ganz ohne aus (Content-System in site.css).

Neues Modul: Registry-Eintrag + Content-Ordner. Index, Hub-Seite, Breadcrumb, Suche
und Verwandt-Links ziehen automatisch nach.

## Arbeiten

```
npm install
npm run dev        # Dev-Server (ohne Volltextindex)
npm run build      # dist/ inkl. Pagefind-Index
npm run preview
```

**Suche (⌘K):** Registry-Treffer (Hubs/Module/Abschnitte) sofort, Volltext aus dem
Pagefind-Index nachgeladen. Nur `dist` nach `npm run build` enthält den Index.

**Keine externen Abhängigkeiten zur Laufzeit** außer Google Fonts: der frühere
React/Babel/Tailwind-CDN-Explorer (Cuts Atlas) ist server-gerendert neu gebaut
(`src/components/CutsSection.astro` + `src/content/cuts-atlas/_data.json`).
