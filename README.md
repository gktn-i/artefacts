# Artefakte

Nachschlagewerke für Werkstatt, Mechatronik, Küche, Homelab und Fotografie — <https://bib.gktn.dev>.

Gebaut mit [Astro](https://astro.build), Volltextsuche über [Pagefind](https://pagefind.app).
Jeder Push auf `main` baut und deployt automatisch (GitHub Actions → Pages).
Alle 30 Module sind native Astro-Module — es gibt keine HTML-Monolithen mehr,
und alle Inhalte werden server-gerendert, damit die Volltextsuche sie findet
und die Seiten auch ohne JavaScript vollständig lesbar sind.

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

Drei Ebenen: **Index → Hub → Modul.**
Hubs: 🔧 Werkstatt · ⚙️ Mechatronik · 🍳 Küche · 🖥️ Homelab · 📷 Foto & Video —
zusammen 30 Module mit 298 Abschnitten.

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
- **Gemeinsame Stylesheets über Modulgrenzen hinweg** sind möglich: `[slug].astro`
  hängt bei Bedarf eine zweite Klasse an den Content-Container (`mx-sys` für die
  Küche, `mx-mecha` für den Mechatronik-Hub und die Technik-Module der Werkstatt,
  siehe `MECHA_MODULES`). Das Stylesheet liegt einmal als `src/content/_mecha.css`
  und wird von jedem `_style.css` nur importiert; ein Modul kann darüber hinaus
  eigene Regeln ergänzen (so macht es `dremel` für seine Drehzahlskala).
- **Ein Skript für viele Module:** `public/assets/mod-mecha.js` bedient alle 16
  Mechatronik-Module und die vier Technik-Module der Werkstatt — Faltabschnitte,
  sortierbare Tabellen, Katalog- und Glossarfilter, 24 Rechner und die
  PID-Simulation. Jeder Baustein prüft zuerst, ob seine Elemente vorkommen.
- **Inhalte gehören ins HTML, nicht ins JavaScript.** Tabellen und Kataloge werden
  server-gerendert und im JS nur gefiltert und sortiert. Nur so landen sie im
  Pagefind-Index und funktionieren ohne JavaScript.

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
