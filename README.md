# Artefakte

Nachschlagewerke für Werkstatt, Küche und Homelab — <https://bib.gktn.dev>.

Gebaut mit [Astro](https://astro.build), Volltextsuche über [Pagefind](https://pagefind.app).
Jeder Push auf `main` baut und deployt automatisch (GitHub Actions → Pages).

## Struktur

```
src/data/registry.json     EINZIGE Datenquelle: Hubs → Bereiche → Module → Abschnitte
src/content/<modul>/       native Inhalte, eine .astro-Datei pro Abschnitt
src/pages/index.astro      Startseite
src/pages/[slug].astro     Hub-Seiten + native Modulseiten (URL bleibt <name>.html)
src/layouts/, components/  Base-Layout, Chrome-Leiste, Hub-Karte
src/styles/site.css        Design-Tokens, Hub-/Modul-Layout, Content-System
public/<modul>.html        Legacy-Artefakte (eigenständige HTML-Monolithen)
public/assets/             chrome.css + shell.js (Legacy-Brücke) + palette.js (Suche, geteilt)
```

Drei Ebenen: **Index → Hub → Modul.** Hubs: 🔧 Werkstatt · 🍳 Küche · 🖥️ Homelab.

## Zwei Sorten Module

**Nativ** (`src/content/<id>/`): Inhalte in kleinen Dateien, ein Abschnitt = eine Datei.
Layout, Sidebar, Hash-Router, Suche und Dark Mode kommen vom System. Ein Modul ist
nativ, sobald sein Content-Ordner existiert — der Build prüft, dass Registry-Abschnitte
und Dateien deckungsgleich sind.

**Legacy** (`public/<id>.html`): unangetastete Monolithen mit eigenem Design. Sie
bekommen Chrome-Leiste + Suche zur Laufzeit über `shell.js`/`palette.js` injiziert;
`/assets/registry.js` wird beim Build aus `registry.json` generiert.

Migration = Inhalte nach `src/content/<id>/<hash>.astro` zerlegen, Legacy-Datei
löschen. URLs und `#hash`-Deep-Links bleiben identisch (`build.format: "file"`).

## Arbeiten

```
npm install
npm run dev        # Dev-Server (ohne Volltextindex)
npm run build      # dist/ inkl. Pagefind-Index
npm run preview
```

Neues Modul: Eintrag in `registry.json` + Content-Ordner (nativ) oder HTML in
`public/` (Legacy). Index, Hub-Seite, Breadcrumb, Suche, verwandte Module ziehen nach.

**Verwandte Module:** `related: ["id", …]` in der Registry, einseitig gepflegt,
wird symmetrisch aufgelöst und quer über die Hubs angezeigt.

**Suche (⌘K):** Registry-Treffer (Hubs/Module/Abschnitte) sofort, Volltext aus dem
Pagefind-Index nachgeladen — auch über die Legacy-Seiten. Nur `dist` nach `npm run
build` enthält den Index; im Dev-Server gibt es nur die Registry-Treffer.

## Stand der Migration

| Modul | Status |
|---|---|
| Küchen-Basics, Perfektes Steak | ✅ nativ |
| Löten, Elektronik 101 | ✅ nativ (eigenes Modul-CSS `_style.css` + `public/assets/mod-*.js` für Rechner/Tabellen/Folds) |
| übrige 9 (`public/*.html`) | Legacy, Migration modulweise |

`fleisch-cuts-explorer.html` lädt React/Babel zur Laufzeit von unpkg — einziges
Modul mit externer Abhängigkeit; beim Migrieren neu bauen statt zerlegen.
