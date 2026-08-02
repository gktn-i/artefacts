# Artefakte

Statische Nachschlagewerke, gehostet auf <https://bib.gktn.dev> (GitHub Pages, kein Build-Schritt).

## Aufbau

Drei Ebenen, mehr nicht:

```
index.html          Übersicht über alle Hubs
  hub-<id>.html     ein Hub pro Lebensbereich, gruppiert seine Module in Bereiche
    <modul>.html    das eigentliche Artefakt
```

| Hub | Datei | Bereiche |
|---|---|---|
| 🔧 Werkstatt | `hub-werkstatt.html` | Elektronik · Mechanik & Werkzeug · 3D-Druck |
| 🍳 Küche | `hub-kueche.html` | Grundlagen & Technik · Fleisch |
| 🖥️ Homelab | `hub-homelab.html` | Server & Betrieb |

## Gemeinsame Teile

| Datei | Zweck |
|---|---|
| `assets/registry.js` | **Einzige Datenquelle.** Hubs, Bereiche, Module, Abschnitte. |
| `assets/chrome.css` | Kopfleiste + globale Suche, auf jeder Seite. Alles unter `hbx-` gekapselt. |
| `assets/shell.js` | Baut Breadcrumb, Modul-Wechsler, Suche und die Nachbar-Leiste am Seitenende. |
| `assets/hub.css` | Design der Hub- und Index-Seiten (nicht in den Artefakten geladen). |
| `assets/hubpage.js` | Rendert eine Hub-Seite aus der Registry. |
| `assets/indexpage.js` | Rendert die Startseite aus der Registry. |

Die Artefakte behalten ihr eigenes Design. Sie binden nur das Chrome ein — die drei
Zeilen stehen direkt vor `</head>`, also **nach** dem eigenen `<style>`:

```html
<link rel="stylesheet" href="assets/chrome.css">
<script defer src="assets/registry.js"></script>
<script defer src="assets/shell.js"></script>
```

## Deep-Links

Jeder Tab bzw. jede Ansicht eines Artefakts ist über `datei.html#abschnitt` direkt
erreichbar; Hub-Seiten und Suche verlinken ausschließlich so. Wer ein Artefakt mit
Tabs ergänzt, hängt die Umschaltung an `location.hash` (Muster: `history.replaceState`
beim Wechsel, `hashchange`-Listener, Hash-Auswertung beim Start).

## Neues Modul aufnehmen

1. HTML-Datei ins Wurzelverzeichnis legen, die drei Chrome-Zeilen einbinden.
2. Eintrag in `assets/registry.js` im passenden `areas[].modules[]` ergänzen —
   `sections` sind die Tabs mit ihrem Hash.
3. Fertig. Index, Hub-Seite, Breadcrumb, Modul-Wechsler und Suche ziehen automatisch nach.

Feste Themes: Artefakte ohne `prefers-color-scheme` bekommen in der Registry ein
`theme: "dark"` bzw. `"light"`, damit die Kopfleiste dazu passt.

## Bekannte Baustelle

`fleisch-cuts-explorer.html` lädt React, ReactDOM und Babel zur Laufzeit von unpkg.
Ohne Netz oder bei CDN-Ausfall bleibt die Seite leer. Alle anderen Artefakte kommen
ohne externe Abhängigkeiten aus (nur Google Fonts, mit Fallback).
