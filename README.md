# Artefakte

Nachschlagewerke für Werkstatt, Mechatronik, Küche, Homelab, Fotografie und Messer — <https://bib.gktn.dev>.

Gebaut mit [Astro](https://astro.build), Volltextsuche über [Pagefind](https://pagefind.app).
Jeder Push auf `main` baut und deployt automatisch (GitHub Actions → Pages).
Alle 26 Module sind native Astro-Module — alle Inhalte werden server-gerendert,
damit die Volltextsuche sie findet und die Seiten auch ohne JavaScript
vollständig lesbar sind.

## Die Werkbank-Shell

Die UI ist als **ein zusammenhängender Hub** gebaut, nicht als Seiten-Stapel:

- **Navigations-Rail** (links, auf jeder Seite identisch), in zwei Zonen:
  *Bibliothek* — alle Hubs kompakt, Modullisten klappen auf Wunsch auf
  (auf Index- und Hub-Seiten ist der aktive Hub offen); *Modul* — auf
  Modulseiten ein abgesetztes Panel mit den Abschnitten des aktiven Moduls
  samt Gruppen und Überschriften-Subnav. Auf Mobilgeräten wird die Rail
  zur Schublade.
- **Topbar**: Brotkrumen (inkl. aktivem Abschnitt) + Suche.
- **Suchpalette (⌘K oder `/`)**: Registry-Treffer sofort, Pagefind-Volltext
  nachgeladen.
- **Startseite** ist ein Schaltpult: Suche, Hub-Kacheln, Modulverzeichnis,
  letzte Aktualisierungen — kein Blockstapel.
- Links werden per Hover vorgeladen (`prefetch` in `astro.config.mjs`),
  Seitenwechsel fühlen sich wie Panelwechsel an.

Design-System: warme Papier-/Kohle-Töne (hell/dunkel folgt dem System),
Schrift **Fraunces** (Display) · **Instrument Sans** (UI) · **IBM Plex Mono**
(Daten). Alle Tokens liegen in `src/styles/app.css`.

## Struktur

```
src/data/registry.json     EINZIGE Datenquelle: Hubs → Bereiche → Module → Abschnitte
                           (inkl. groups für die Abschnitts-Navigation, alias für
                           alte Anker, related für Quervernetzung, tasks je Hub
                           für den Schnellzugriff nach Aufgabe)
src/content/<modul>/       Inhalte: eine .astro-Datei pro Abschnitt
                           + optional _style.css (modulspezifisches, gescopetes CSS)
src/pages/index.astro      Startseite (Schaltpult)
src/pages/[slug].astro     Hub-Panels + Modulseiten (URL bleibt <name>.html)
src/layouts/Base.astro     Werkbank-Shell (Rail + Topbar + Inhalt)
src/components/            Rail, Topbar, CutsSection, Profiles (Eignungskarten)
src/styles/app.css         Design-Tokens, Shell, Palette, Dashboard, Panels,
                           Modul-Workspace, Content-System (.mx-sys)
public/assets/mod-<id>.js  Funktions-JS einzelner Module (Rechner, Tabellen, Folds)
public/assets/palette.js   globale Suche (⌘K): Registry-Treffer + Pagefind-Volltext
```

Drei Ebenen: **Übersicht → Hub → Modul** — aber alle drei sind jederzeit über
die Rail erreichbar.

**Schnellzugriff nach Aufgabe.** Ein Hub kann in der Registry `tasks` tragen:
Aufgaben wie *Projekt starten*, *Bauteil finden*, *Vorgehen nachschlagen*,
*Rechnen*, *Begriff klären*, *Lernen* — jede mit Direktlinks auf die passenden
Abschnitte quer durch die Module (auch in andere Hubs). Sie erscheinen als
Karten oben im Hub-Panel (`#t-<id>`), als aufklappbarer Block in der Rail auf
allen Seiten des Hubs und in der Suchpalette (Startansicht und als Treffer
vom Typ *aufgabe*, gefunden über `k`-Stichwörter). Man muss nicht mehr wissen,
in welchem Modul etwas liegt. Der Build prüft jeden Link gegen Modul und
Abschnitt. Bisher nutzt das der Mechatronik-Hub.
Hubs: 🔧 Werkstatt · ⚙️ Mechatronik · 🍳 Küche · 🖥️ Homelab · 📷 Foto & Video ·
🔪 Messer — zusammen 26 Module mit 270 Abschnitten.

Module werden bewusst breit geschnitten: ein Thema, ein Modul. Wo früher
Technische Mechanik, Maschinenelemente, Werkstoffkunde und Konstruktion
nebeneinander standen, gibt es heute *Mechanik & Konstruktion* mit vier
Abschnittsgruppen. `public/*.html` enthält Weiterleitungs-Stubs, damit die
URLs der aufgelösten Module weiter funktionieren — inklusive Anker.

## Wie ein Modul funktioniert

- **Registry-Eintrag** bestimmt Name, Hub, Abschnitte (`sections`), Gruppen
  (`groups`), Anker-Aliase (`alias`) und Quervernetzung (`related`).
- **Ein Abschnitt = eine Datei** unter `src/content/<id>/<hash>.astro`. Der Build
  bricht ab, wenn Registry und Dateien auseinanderlaufen.
- **Shell liefert:** Rail mit Abschnitts-Navigation, Überschriften-Subnav mit
  Scrollspy, Hash-Router (`<name>.html#<hash>`, auch `#abschnitt--überschrift`
  und Alt-Anker über `alias`), Abschnitts-Pager, Verwandt-Leisten, Dark/Light.
- **Modul-Verhalten** (Rechner, sortierbare Tabellen, Filter, Faltabschnitte) liegt in
  `public/assets/mod-<id>.js` und wird über die `PAGE_SCRIPTS`-Map in
  `src/pages/[slug].astro` eingebunden.
- **Modul-Design:** `_style.css` im Content-Ordner, alles unter `.mx-<id>` gescoped —
  kollidiert mit nichts. Kleine Module kommen ganz ohne aus (Content-System in app.css).
- **Gemeinsame Stylesheets über Modulgrenzen hinweg** sind möglich: `[slug].astro`
  hängt bei Bedarf eine zweite Klasse an den Content-Container (`mx-sys` für die
  Küche, `mx-mecha` für den Mechatronik-Hub und die Technik-Module der Werkstatt,
  siehe `MECHA_MODULES`). Das Stylesheet liegt einmal als `src/content/_mecha.css`
  und wird von jedem `_style.css` nur importiert; ein Modul kann darüber hinaus
  eigene Regeln ergänzen (so macht es `dremel` für seine Drehzahlskala).
- **Ein Skript für viele Module:** `public/assets/mod-mecha.js` bedient alle
  Mechatronik-Module, die Technik-Module der Werkstatt und den Messer-Hub —
  Faltabschnitte, sortierbare Tabellen, Katalog- und Glossarfilter, die Rechner
  (darunter der § 42a-Check und der Schärfwinkel-Rechner) und die
  PID-Simulation. Jeder Baustein prüft zuerst, ob seine Elemente vorkommen.
  Ein Modul kann mehrere Skripte laden (`PAGE_SCRIPTS` nimmt auch ein Array,
  so kombiniert *3D-Druck* das Technik-Skript mit seinem Simulator).
- **Eignungskarten für Vergleiche:** `src/components/Profiles.astro` rendert je
  Kandidat eine Karte mit Punkten je Kriterium (1–5, höher = besser) und den
  drei Sätzen *Stark / Schwach / Nimm es für*. Im Abschnitt importieren und
  `criteria`, `items` (`name`, `tag?`, `scores`, `pro`, `con`, `use`) sowie
  optional `note`/`labels` übergeben; abweichende Punktzahl bricht den Build.
  Im Einsatz für Motoren, Schrittmotortreiber, Fluidantriebe, Positionsgeber,
  Mikrocontroller-Familien, Bussysteme, Getriebebauarten, Funktechniken und
  FPV-Videosysteme. Design im Block PROFILE von `src/content/_mecha.css`.
- **Inhalte gehören ins HTML, nicht ins JavaScript.** Tabellen und Kataloge werden
  server-gerendert und im JS nur gefiltert und sortiert. Nur so landen sie im
  Pagefind-Index und funktionieren ohne JavaScript.

Neues Modul: Registry-Eintrag + Content-Ordner. Rail, Verzeichnis, Hub-Panel,
Brotkrumen, Suche und Verwandt-Links ziehen automatisch nach.

## Arbeiten

```
npm install
npm run dev        # Dev-Server (ohne Volltextindex)
npm run build      # dist/ inkl. Pagefind-Index
npm run preview
```

**Suche (⌘K):** Registry-Treffer (Hubs/Module/Abschnitte) sofort, Volltext aus dem
Pagefind-Index nachgeladen. Nur `dist` nach `npm run build` enthält den Index.

**Keine externen Abhängigkeiten zur Laufzeit** außer Google Fonts.
