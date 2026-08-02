/* ============================================================================
   ARTEFAKTE · REGISTRY
   ----------------------------------------------------------------------------
   Einzige Quelle der Wahrheit für Index, Hub-Seiten, Breadcrumb und Suche.

   Struktur:   HUB  →  BEREICH  →  MODUL  →  ABSCHNITT

   Neues Modul aufnehmen:
     1. Objekt in den passenden `areas[].modules[]` eintragen.
     2. `sections` = die Tabs/Ansichten der Datei; `h` ist der URL-Hash,
        mit dem die Datei direkt auf diesem Abschnitt öffnet.
     3. In der Datei `assets/chrome.css`, `assets/registry.js` und
        `assets/shell.js` einbinden (siehe README-Kommentar in shell.js).

   Neuer Hub: Objekt in HUBS ergänzen + `hub-<id>.html` aus einer bestehenden
   Hub-Seite kopieren und dort `data-hub` anpassen.
   ========================================================================== */
(function () {
  "use strict";

  const HUBS = [
    /* ---------------------------------------------------------------- */
    {
      id: "werkstatt",
      name: "Werkstatt",
      icon: "🔧",
      file: "hub-werkstatt.html",
      tagline: "Elektronik · Löten · Mechanik · 3D-Druck",
      desc:
        "Alles, was an der Werkbank passiert. Von der Grundlagenformel über die " +
        "Lötspitze und das richtige Fett bis zum Filament auf der Rolle.",
      accent: { l: "#0e7c8c", d: "#38c6d9" },
      areas: [
        {
          id: "elektronik",
          name: "Elektronik",
          desc: "Verstehen, messen, verbinden — von der Theorie bis zur Lötstelle.",
          modules: [
            {
              id: "elektronik-101",
              file: "elektronik-grundlagen.html",
              name: "Elektronik 101",
              icon: "⚡",
              kind: "Referenz",
              updated: "2026-07-09",
              desc:
                "Die große Referenz: Grundgrößen, Schaltpläne lesen, Leistungselektronik, " +
                "Messtechnik, Fehlersuche, Fachbegriffe — mit eingebauten Rechnern.",
              tags: ["grundlagen", "schaltplan", "messen", "pwm", "fehlersuche", "rechner"],
              sections: [
                { h: "grundlagen", t: "Basics" },
                { h: "schaltplan", t: "Schaltplan lesen" },
                { h: "leistung", t: "Leistung & PWM" },
                { h: "rechner", t: "Rechner" },
                { h: "begriffe", t: "Fachbegriffe" },
                { h: "komponenten", t: "Bauteil-Datenbank" },
                { h: "displays", t: "Displays" },
                { h: "motoren", t: "Motoren" },
                { h: "mcu", t: "Mikrocontroller" },
                { h: "messgeraet", t: "Multimeter" },
                { h: "oszilloskop", t: "Oszilloskop" },
                { h: "lcrp1", t: "LCR-P1" },
                { h: "netzteil", t: "Labornetzteil" },
                { h: "sicherheit", t: "Sicherheit" },
                { h: "praxis", t: "Praxis & Aufbau" }
              ]
            },
            {
              id: "loeten",
              file: "loeten-referenz.html",
              name: "Löten",
              icon: "🔥",
              kind: "Referenz",
              updated: "2026-08-01",
              desc:
                "Werkzeug, Verbrauchsmaterial und Technik: THT, SMD, Heißluft, Reflow und " +
                "BGA-Reballing — inklusive Mikroskop-Setup und Fehlerbildern.",
              tags: ["flux", "smd", "tht", "reflow", "reballing", "bga", "mikroskop"],
              sections: [
                { h: "methoden", t: "Methoden" },
                { h: "workflow", t: "Workflow" },
                { h: "equipment", t: "Equipment" },
                { h: "mikroskop", t: "Mikroskop" },
                { h: "material", t: "Material" },
                { h: "tht", t: "THT löten" },
                { h: "smd", t: "SMD löten" },
                { h: "heissluft", t: "Heißluft & Reflow" },
                { h: "reballing", t: "Reballing" },
                { h: "temp", t: "Temperaturen" },
                { h: "bauteile", t: "Bauteile" },
                { h: "soc", t: "SoC & BGA-Typen" },
                { h: "fehler", t: "Fehler & Regeln" },
                { h: "sicherheit", t: "Sicherheit" }
              ]
            },
            {
              id: "robotik",
              file: "robotik-referenz.html",
              name: "Robotik",
              icon: "🤖",
              kind: "Referenz",
              updated: "2026-03-14",
              desc:
                "Aktorik, Sensorik, Steuerung und Software-Stack — plus Lernpfad vom " +
                "ersten Servo bis zum Robot Learning.",
              tags: ["motoren", "sensoren", "steuerung", "ros", "lernpfad"],
              sections: [
                { h: "grund", t: "Grundlagen" },
                { h: "hw", t: "Hardware" },
                { h: "steu", t: "Steuerung" },
                { h: "sw", t: "Software" },
                { h: "rl", t: "Robot Learning" },
                { h: "pfad", t: "Lernpfad" },
                { h: "gloss", t: "Glossar" }
              ]
            }
          ]
        },
        {
          id: "mechanik",
          name: "Mechanik & Werkzeug",
          desc: "Was zusammenhält, sich dreht und geschmiert werden will.",
          modules: [
            {
              id: "maker-komponenten",
              file: "maker-komponenten.html",
              name: "Maker-Komponenten",
              icon: "🔩",
              kind: "Datenbank",
              updated: "2026-03-02",
              desc:
                "Schrauben, Muttern, Lager, Profile, Magnete und Klebstoffe mit Normen, " +
                "Größen und Auswahlhilfe — dazu Drehmoment- und Gewindetabellen.",
              tags: ["schrauben", "normteile", "lager", "gewinde", "drehmoment"],
              sections: [
                { h: "komp", t: "Komponenten" },
                { h: "torque", t: "Drehmoment" },
                { h: "thread", t: "Gewinde & Bohren" },
                { h: "glossar", t: "Glossar" }
              ]
            },
            {
              id: "maschinenbau",
              file: "mechanical-engineering-cheatsheet.html",
              name: "Maschinenbau",
              icon: "📐",
              kind: "Cheatsheet",
              updated: "2026-03-20",
              desc:
                "Kernkonzepte, Formeln, Werkstoffkennwerte und Do's & Don'ts für " +
                "Festigkeit, Statik, Toleranzen und Antriebe.",
              tags: ["formeln", "festigkeit", "werkstoffe", "toleranzen"],
              sections: [
                { h: "konzepte", t: "Konzepte" },
                { h: "formeln", t: "Formeln" },
                { h: "material", t: "Werkstoffe" },
                { h: "dodont", t: "Do's & Don'ts" },
                { h: "glossar", t: "Glossar" }
              ]
            },
            {
              id: "dremel",
              file: "dremel-8250-cheatsheet.html",
              name: "Dremel 8250",
              icon: "🌀",
              kind: "Cheatsheet",
              updated: "2026-06-26",
              desc:
                "Drehzahl nach Material und Aufsatz, Bits mit Erkennungsmerkmalen und " +
                "die Grenzen, die man nicht überschreitet.",
              tags: ["drehzahl", "rpm", "bits", "schleifen", "fräsen"],
              sections: [
                { h: "material", t: "Drehzahl × Material" },
                { h: "bits", t: "Bits & Aufsätze" },
                { h: "aufsatz", t: "Drehzahl × Aufsatz" },
                { h: "basics", t: "Grundlagen & Sicherheit" }
              ]
            },
            {
              id: "schmiermittel",
              file: "schmiermittel-vergleich.html",
              theme: "dark",
              name: "Schmiermittel",
              icon: "🛢️",
              kind: "Vergleich",
              updated: "2026-03-11",
              desc:
                "Öle, Fette, Sprays und Pasten nach Schmierwirkung, Kunststoff­verträglichkeit, " +
                "Wasserresistenz und Temperaturbereich.",
              tags: ["fett", "öl", "ptfe", "silikon", "kriechöl"],
              sections: [
                { h: "oel", t: "Öle" },
                { h: "fett", t: "Fette" },
                { h: "spray", t: "Sprays" },
                { h: "paste", t: "Pasten" },
                { h: "spezial", t: "Spezial" },
                { h: "reiniger", t: "Reiniger" }
              ]
            }
          ]
        },
        {
          id: "druck",
          name: "3D-Druck",
          desc: "Material wählen, Düse wählen, Preis kennen.",
          modules: [
            {
              id: "filament",
              file: "3d-filament-vergleich.html",
              name: "Filament & Düsen",
              icon: "🧵",
              kind: "Vergleich",
              updated: "2026-03-09",
              desc:
                "Filamente nach Festigkeit, Hitzebeständigkeit, Preis und Einsatzgebiet — " +
                "dazu Düsendurchmesser und Infill-Muster im Vergleich.",
              tags: ["pla", "petg", "asa", "nylon", "düse", "infill"],
              sections: [
                { h: "filament", t: "Filamente" },
                { h: "nozzle", t: "Düsen / Nozzles" },
                { h: "infill", t: "Infill-Muster" }
              ]
            },
            {
              id: "rentabilitaet",
              file: "rentabilitaets-simulator.html",
              theme: "dark",
              name: "Rentabilität",
              icon: "📈",
              kind: "Rechner",
              updated: "2026-06-05",
              desc:
                "Stückkosten, Deckungsbeitrag und drei Szenarien für den Fall, dass aus " +
                "dem Drucker ein Geschäft werden soll.",
              tags: ["kalkulation", "marge", "kosten", "business"],
              sections: []
            }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "kueche",
      name: "Küche",
      icon: "🍳",
      file: "hub-kueche.html",
      tagline: "Technik · Fleisch · Garpunkte",
      desc:
        "Handwerk am Herd: die Methoden, die Pfanne, das richtige Fett — und alles, " +
        "was man über ein Stück Fleisch wissen muss, bevor es heiß wird.",
      accent: { l: "#c0442f", d: "#ef7361" },
      areas: [
        {
          id: "grundlagen",
          name: "Grundlagen & Technik",
          desc: "Das Fundament: Methoden, Werkzeug, Temperaturen, Vokabular.",
          modules: [
            {
              id: "koch-basics",
              file: "koch-basics.html",
              theme: "light",
              name: "Küchen-Basics",
              icon: "🥘",
              kind: "Referenz",
              updated: "2026-05-15",
              desc:
                "Garmethoden, Pfannenkunde, Rauchpunkte, Kerntemperaturen, Saucenbasen, " +
                "Maße und die Faustregeln, die fast immer gelten.",
              tags: ["technik", "pfannen", "rauchpunkt", "saucen", "kerntemperatur"],
              sections: [
                { h: "technik", t: "Techniken" },
                { h: "pfannen", t: "Pfannen" },
                { h: "oele", t: "Öle & Fette" },
                { h: "temperatur", t: "Temperaturen" },
                { h: "regeln", t: "Faustregeln" },
                { h: "saucen", t: "Saucen" },
                { h: "masse", t: "Maße & Mengen" },
                { h: "begriffe", t: "Begriffe" }
              ]
            }
          ]
        },
        {
          id: "fleisch",
          name: "Fleisch",
          desc: "Vom Cut zur Garmethode zum Teller.",
          modules: [
            {
              id: "cuts-atlas",
              file: "fleisch-cuts-explorer.html",
              theme: "dark",
              name: "Cuts Atlas",
              icon: "🥩",
              kind: "Atlas",
              updated: "2026-06-12",
              desc:
                "Rind und andere rote Sorten: Lage am Tier, Zartheit, passende Garmethode, " +
                "Garstufe und woran man das Stück erkennt.",
              tags: ["rind", "cuts", "zartheit", "garmethode"],
              sections: [
                { h: "edel", t: "Edelstücke" },
                { h: "steak", t: "Steakklassiker" },
                { h: "special", t: "Specialty Cuts" },
                { h: "schmor", t: "Schmorstücke" },
                { h: "andere", t: "Andere rote Sorten" }
              ]
            },
            {
              id: "steak",
              file: "perfektes-steak.html",
              theme: "dark",
              name: "Perfektes Steak",
              icon: "🔥",
              kind: "Anleitung",
              updated: "2026-05-18",
              desc:
                "Zwei Wege zum Punkt: Butter Basting für dünne Cuts, Reverse Sear für " +
                "dicke — Schritt für Schritt mit Timing.",
              tags: ["steak", "basting", "reverse sear", "garstufe"],
              sections: [
                { h: "basting", t: "Butter Basting" },
                { h: "reverse", t: "Reverse Sear" }
              ]
            }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "homelab",
      name: "Homelab",
      icon: "🖥️",
      file: "hub-homelab.html",
      tagline: "Server · Storage · Netzwerk · Betrieb",
      desc:
        "Die eigene Infrastruktur: Hardware wählen, sauber aufsetzen, absichern " +
        "und so betreiben, dass sie ohne Aufmerksamkeit läuft.",
      accent: { l: "#6248c9", d: "#9a7ff2" },
      areas: [
        {
          id: "server",
          name: "Server & Betrieb",
          desc: "Von der Hardware-Entscheidung bis zur laufenden Wartung.",
          modules: [
            {
              id: "homeserver",
              file: "homeserver-101.html",
              name: "Homeserver 101",
              icon: "🖥️",
              kind: "Referenz",
              updated: "2026-07-09",
              desc:
                "Komplette Referenz für Planung, Aufbau und Betrieb: Hardware, OS, Storage, " +
                "Backup, Netzwerk, Fernzugriff, Sicherheit, Docker und Dienste.",
              tags: ["nas", "proxmox", "docker", "raid", "backup", "vpn", "selfhosting"],
              sections: [
                { h: "start", t: "Start & Regeln" },
                { h: "hardware", t: "Hardware" },
                { h: "os", t: "Betriebssystem" },
                { h: "storage", t: "Storage & RAID" },
                { h: "backup", t: "Backup" },
                { h: "netzwerk", t: "Netzwerk" },
                { h: "zugriff", t: "Fernzugriff" },
                { h: "sicherheit", t: "Sicherheit" },
                { h: "docker", t: "Docker" },
                { h: "dienste", t: "Dienste" },
                { h: "betrieb", t: "Wartung & Betrieb" },
                { h: "hilfe", t: "Hilfe & Glossar" }
              ]
            }
          ]
        }
      ]
    }
  ];

  /* ------------------------------------------------------------------ *
   * Abgeleitete Sichten — überall im Frontend nutzbar.
   * ------------------------------------------------------------------ */
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
    hub.updated = hub.modules
      .map((m) => m.updated)
      .sort()
      .pop();
  });

  const byFile = {};
  modules.forEach((m) => (byFile[m.file] = m));
  const hubByFile = {};
  HUBS.forEach((h) => (hubByFile[h.file] = h));

  window.ARTEFAKTE = {
    hubs: HUBS,
    modules: modules,
    hubById: (id) => HUBS.find((h) => h.id === id) || null,
    moduleByFile: (f) => byFile[f] || null,
    hubByFile: (f) => hubByFile[f] || null,
    sectionCount: modules.reduce((a, m) => a + m.sections.length, 0),
    /* Flacher Suchindex: Hubs, Module, Abschnitte, Tags. */
    searchIndex: function () {
      if (this._idx) return this._idx;
      const out = [];
      HUBS.forEach((h) => {
        out.push({ kind: "hub", title: h.name, sub: h.tagline, href: h.file, hub: h, w: 0 });
      });
      modules.forEach((m) => {
        out.push({
          kind: "modul",
          title: m.name,
          sub: m.hub.name + " · " + m.kind,
          href: m.file,
          hub: m.hub,
          mod: m,
          extra: m.desc + " " + m.tags.join(" "),
          w: 1
        });
        m.sections.forEach((s) => {
          out.push({
            kind: "abschnitt",
            title: s.t,
            sub: m.name + " · " + m.hub.name,
            href: m.file + "#" + s.h,
            hub: m.hub,
            mod: m,
            w: 2
          });
        });
      });
      this._idx = out;
      return out;
    }
  };
})();
